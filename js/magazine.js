/**
 * Visor de revista digital interactiva (flipbook) sobre PDF.js.
 * Renderiza páginas del PDF bajo demanda (nunca todas a la vez, sin
 * importar cuántas tenga el archivo), con caché acotada, precarga de
 * páginas cercanas en tiempo ocioso, zoom por transform, pantalla completa
 * y una animación de volteo con CSS 3D. El número total de páginas se lee
 * del propio PDF (`pdfDoc.numPages`) — no hay ningún conteo fijo en el código.
 *
 * Modo de vista:
 * - En pantallas anchas (>900px) se muestran DOS páginas abiertas a la vez
 *   (un "spread"), emparejadas como (1,2) (3,4) (5,6)... y el volteo anima
 *   el spread completo girando sobre su propio centro (el "lomo"), como si
 *   todo el libro rotara sobre esa línea — más simple y confiable de
 *   implementar sin poder probarlo en un navegador real que animar cada
 *   página contra el lomo por separado, y da la misma sensación de "libro
 *   abierto" pedida.
 * - En pantallas angostas (≤900px, mismo quiebre que el resto del sitio)
 *   se cae a una sola página visible, porque dos páginas ahí no cabrían
 *   con texto legible.
 *
 * Decisiones de alcance adicionales:
 * - El zoom es un `transform: scale()` sobre las páginas ya renderizadas,
 *   no un re-render de PDF.js a mayor resolución — evita bloquear el hilo
 *   principal en cada click de zoom.
 * - Sin pinch-to-zoom táctil personalizado (quedó fuera de alcance,
 *   marcado como opcional en el pedido original); no se bloquea el gesto
 *   nativo del navegador.
 */
(function () {
    'use strict';

    const PDFJS_VERSION = '3.11.174';
    const CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/`;

    const ZOOM_MIN = 0.7;
    const ZOOM_MAX = 1.6;
    const ZOOM_STEP = 0.15;
    const MAX_CACHE_PAGES = 16;
    const SWIPE_THRESHOLD = 45;
    const SINGLE_MODE_QUERY = '(max-width: 900px)';

    class MagazineViewer {
        constructor(root) {
            this.root = root;
            this.pdfUrl = root.dataset.pdf;

            this.pageWrap = root.querySelector('.magazine-page-wrap');
            this.pageSlot = root.querySelector('.magazine-page-slot');

            this.leftCanvas = root.querySelector('.magazine-canvas-left');
            this.rightCanvas = root.querySelector('.magazine-canvas-right');

            this.flipLeaf = root.querySelector('.magazine-flip-leaf');
            this.frontLeft = root.querySelector('.magazine-canvas-front-left');
            this.frontRight = root.querySelector('.magazine-canvas-front-right');
            this.backLeft = root.querySelector('.magazine-canvas-back-left');
            this.backRight = root.querySelector('.magazine-canvas-back-right');

            this.statusEl = root.querySelector('.magazine-status');

            this.prevArrow = root.querySelector('.magazine-prev');
            this.nextArrow = root.querySelector('.magazine-next');

            this.firstBtn = root.querySelector('[data-action="first"]');
            this.prevBtn = root.querySelector('[data-action="prev"]');
            this.nextBtn = root.querySelector('[data-action="next"]');
            this.lastBtn = root.querySelector('[data-action="last"]');
            this.zoomInBtn = root.querySelector('[data-action="zoom-in"]');
            this.zoomOutBtn = root.querySelector('[data-action="zoom-out"]');
            this.zoomResetBtn = root.querySelector('[data-action="zoom-reset"]');
            this.fullscreenBtn = root.querySelector('[data-action="fullscreen"]');
            this.thumbsBtn = root.querySelector('[data-action="thumbnails"]');
            this.pageInput = root.querySelector('.magazine-page-input');
            this.totalPagesEl = root.querySelector('.magazine-total-pages');
            this.zoomLevelEl = root.querySelector('.magazine-zoom');
            this.thumbsPanel = root.querySelector('.magazine-thumbnails');

            this.pdfDoc = null;
            this.totalPages = 0;
            this.currentPage = 1; // siempre la primera página del spread actual
            this.zoom = 1;
            this.isFlipping = false;
            this.cache = new Map();
            this.cacheOrder = [];
            this.thumbsBuilt = false;
            this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            this.singleModeQuery = window.matchMedia(SINGLE_MODE_QUERY);
            this.singleMode = this.singleModeQuery.matches;
            this.root.classList.toggle('is-single', this.singleMode);

            this.bindControls();
            this.bindKeyboard();
            this.bindSwipe();
            this.bindFullscreen();
            this.bindPageClick();
            this.bindResponsive();

            this.bindLazyInit();
        }

        // ---------- Carga ----------

        // pdf.js pesa ~1MB y el PDF real varias decenas de MB — no tiene
        // sentido empezar a traerlo si el usuario nunca llega a desplazarse
        // hasta esta tarjeta. Se dispara solo cuando el visor está a punto
        // de entrar en pantalla (con margen, para que ya esté listo o casi).
        bindLazyInit() {
            if (!('IntersectionObserver' in window)) {
                this.loadLibraryThenDocument();
                return;
            }
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    obs.disconnect();
                    this.loadLibraryThenDocument();
                });
            }, { rootMargin: '600px 0px' });
            observer.observe(this.root);
        }

        setStatus(kind, message) {
            if (!this.statusEl) return;
            this.statusEl.hidden = false;
            this.statusEl.classList.toggle('is-error', kind === 'error');
            const icon = kind === 'error'
                ? '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i>'
                : '<span class="magazine-spinner" aria-hidden="true"></span>';
            this.statusEl.innerHTML = `${icon}<p>${message}</p>`;
        }

        hideStatus() {
            if (this.statusEl) this.statusEl.hidden = true;
        }

        async loadLibraryThenDocument() {
            this.setStatus('loading', 'Cargando revista…');
            try {
                await this.ensurePdfJs();
                await this.loadDocument();
            } catch (err) {
                console.error('[magazine] No se pudo inicializar el visor:', err);
                this.setStatus(
                    'error',
                    `No se pudo cargar la revista. Verifica que el archivo exista en: ${this.pdfUrl}`
                );
            }
        }

        ensurePdfJs() {
            if (window.pdfjsLib) return Promise.resolve();
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = CDN_BASE + 'pdf.min.js';
                script.onload = async () => {
                    if (!window.pdfjsLib) {
                        reject(new Error('pdf.js cargó pero pdfjsLib no está definido'));
                        return;
                    }
                    try {
                        // El worker se instancia como Blob same-origin: crearlo
                        // directo desde la URL del CDN falla en algunos
                        // navegadores/contextos (ej. abriendo el sitio con
                        // file:// en vez de un servidor) porque un Worker
                        // "clásico" no puede apuntar a un script de otro
                        // origen. Si esto falla, seguimos con la URL directa
                        // (pdf.js cae a un "fake worker" en el hilo principal,
                        // más lento pero funcional).
                        const workerSrc = await this.fetchAsBlobUrl(CDN_BASE + 'pdf.worker.min.js');
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
                    } catch (e) {
                        console.warn('[magazine] No se pudo preparar el worker como blob, se usa la URL directa:', e);
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = CDN_BASE + 'pdf.worker.min.js';
                    }
                    resolve();
                };
                script.onerror = () => reject(new Error('No se pudo cargar pdf.js desde el CDN'));
                document.head.appendChild(script);
            });
        }

        async fetchAsBlobUrl(url) {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status} al descargar ${url}`);
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }

        async loadDocument() {
            const loadingTask = window.pdfjsLib.getDocument({
                url: this.pdfUrl,
                // Deja que pdf.js pida solo los rangos de bytes que necesita
                // (si el servidor lo soporta, como GitHub Pages) en vez de
                // esperar el archivo completo antes de mostrar nada.
                disableAutoFetch: true,
                disableStream: false,
            });

            // pdf.js sigue reportando progreso de descarga (por los rangos de
            // páginas que se van pidiendo) incluso después de que el documento
            // ya cargó y se ocultó la pantalla de carga. Sin esta bandera, ese
            // progreso tardío volvía a mostrar el overlay de "Cargando... 99%"
            // para siempre, aunque el visor ya funcionara bien detrás.
            let docReady = false;
            let lastPct = -1;
            loadingTask.onProgress = (progress) => {
                if (docReady) return;
                if (progress && progress.total) {
                    const pct = Math.min(99, Math.round((progress.loaded / progress.total) * 100));
                    if (pct !== lastPct) {
                        lastPct = pct;
                        this.setStatus('loading', `Cargando revista… ${pct}%`);
                    }
                }
            };

            // El progreso de descarga puede llegar a 100% mientras pdf.js
            // todavía está interpretando la estructura del archivo (más lento
            // cuanto más pesado el PDF). Sin este aviso, la pantalla de carga
            // se siente "trabada" aunque en realidad sigue trabajando.
            const slowNoticeTimer = setTimeout(() => {
                this.setStatus('loading', 'Casi listo… procesando un archivo grande, un momento más.');
            }, 6000);

            // Salvavidas: si de verdad se cuelga (ej. el worker no arrancó y
            // quedó atascado), no dejar la pantalla de carga trabada para
            // siempre. Se avisa, pero la carga real sigue en curso; si
            // termina después, `hideStatus()` más abajo igual la revela.
            const hardTimeout = new Promise((resolve) => {
                setTimeout(() => resolve('timeout'), 45000);
            });

            try {
                const result = await Promise.race([loadingTask.promise, hardTimeout]);
                if (result === 'timeout') {
                    this.setStatus(
                        'error',
                        'Esto está tardando más de lo normal (el archivo es grande). Puedes esperar un poco más o descargarlo directamente con el botón de abajo.'
                    );
                    this.pdfDoc = await loadingTask.promise; // se sigue esperando en segundo plano
                } else {
                    this.pdfDoc = result;
                }
            } finally {
                clearTimeout(slowNoticeTimer);
                docReady = true;
                loadingTask.onProgress = null;
            }

            this.totalPages = this.pdfDoc.numPages;

            if (this.totalPagesEl) this.totalPagesEl.textContent = String(this.totalPages);
            if (this.pageInput) this.pageInput.max = String(this.totalPages);

            this.hideStatus();
            await this.renderSpread(this.getSpread(this.currentPage));
            this.preloadAround(this.currentPage);
            this.updateControls();
        }

        // ---------- Paginación en spreads (páginas dobles) ----------

        // Portada (página 1) sola, luego pares reales de libro: (2,3) (4,5)
        // (6,7)... Si el total de páginas es par, la última queda sola (como
        // contraportada) porque el conteo de páginas interiores es impar.
        // En modo de una sola página, cada "spread" tiene una única página.
        getSpread(page) {
            if (this.singleMode) return [page];
            if (page <= 1) return [1];

            const idx = Math.floor((page - 2) / 2);
            const left = Math.min(2 + idx * 2, this.totalPages);
            const right = Math.min(left + 1, this.totalPages);
            return left === right ? [left] : [left, right];
        }

        spreadAnchor(page) {
            return this.getSpread(page)[0];
        }

        // ---------- Render de páginas (bajo demanda + caché) ----------

        async getPageCanvas(pageNum, targetHeightCss) {
            const cached = this.cache.get(pageNum);
            if (cached) {
                this.touchCache(pageNum);
                return cached;
            }

            const page = await this.pdfDoc.getPage(pageNum);
            const unscaled = page.getViewport({ scale: 1 });
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            // Un poco de margen extra sobre el dpr real para que el zoom
            // (hasta 1.6x) no se vea pixelado de inmediato, sin pasarse:
            // cada página de este PDF ya pesa varios MB en alta resolución.
            const scale = (targetHeightCss * dpr * 1.15) / unscaled.height;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            this.cacheSet(pageNum, canvas);
            return canvas;
        }

        cacheSet(pageNum, canvas) {
            this.cache.set(pageNum, canvas);
            this.cacheOrder.push(pageNum);
            while (this.cacheOrder.length > MAX_CACHE_PAGES) {
                const evict = this.cacheOrder.shift();
                const spread = this.getSpread(this.currentPage);
                if (!spread.includes(evict)) this.cache.delete(evict);
            }
        }

        touchCache(pageNum) {
            const idx = this.cacheOrder.indexOf(pageNum);
            if (idx > -1) this.cacheOrder.splice(idx, 1);
            this.cacheOrder.push(pageNum);
        }

        preloadAround(anchorPage) {
            const prevSpread = anchorPage > 1 ? this.getSpread(anchorPage - 1) : [];
            const nextSpread = this.getSpread(this.getSpread(anchorPage).slice(-1)[0] + 1);
            const wanted = [...prevSpread, ...nextSpread]
                .filter((p) => p >= 1 && p <= this.totalPages && !this.cache.has(p));

            const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 250));
            const targetHeight = this.pageSlot.clientHeight || 400;

            wanted.forEach((p) => {
                idle(() => {
                    this.getPageCanvas(p, targetHeight).catch(() => {
                        /* precarga silenciosa: si falla, se reintentará al navegar */
                    });
                });
            });
        }

        paintCanvas(target, source) {
            if (!target) return;
            if (!source) {
                target.width = 0;
                target.height = 0;
                return;
            }
            target.width = source.width;
            target.height = source.height;
            target.getContext('2d').drawImage(source, 0, 0);
        }

        // La portada (y a veces la contraportada) se muestra sola aunque el
        // visor esté en modo de dos páginas — oculta la mitad derecha y el
        // lomo solo para ese spread puntual.
        applyLoneState(pages) {
            this.root.classList.toggle('is-lone', !this.singleMode && pages.length === 1);
        }

        async renderSpread(pages) {
            const targetHeight = this.pageSlot.clientHeight || 400;
            const [leftNum, rightNum] = pages;

            this.applyLoneState(pages);

            const leftCanvas = await this.getPageCanvas(leftNum, targetHeight);
            this.paintCanvas(this.leftCanvas, leftCanvas);

            if (rightNum && !this.singleMode) {
                const rightCanvas = await this.getPageCanvas(rightNum, targetHeight);
                this.paintCanvas(this.rightCanvas, rightCanvas);
            } else {
                this.paintCanvas(this.rightCanvas, null);
            }
        }

        // ---------- Navegación ----------

        goNext() {
            const spread = this.getSpread(this.currentPage);
            const last = spread[spread.length - 1];
            this.goTo(last + 1, 1);
        }

        goPrev() {
            const spread = this.getSpread(this.currentPage);
            const first = spread[0];
            if (first <= 1) return;
            this.goTo(first - 1, -1);
        }

        async goTo(pageNum, direction) {
            if (!this.totalPages) return;
            pageNum = Math.min(Math.max(1, pageNum), this.totalPages);
            const targetAnchor = this.spreadAnchor(pageNum);

            if (!this.pdfDoc || targetAnchor === this.currentPage || this.isFlipping) return;

            const dir = direction || (targetAnchor > this.currentPage ? 1 : -1);
            this.isFlipping = true;
            this.updateControls();

            try {
                const targetHeight = this.pageSlot.clientHeight || 400;
                const targetSpread = this.getSpread(targetAnchor);
                const [nextLeftNum, nextRightNum] = targetSpread;

                const nextLeftCanvas = await this.getPageCanvas(nextLeftNum, targetHeight);
                const nextRightCanvas = (nextRightNum && !this.singleMode)
                    ? await this.getPageCanvas(nextRightNum, targetHeight)
                    : null;

                if (this.reducedMotion) {
                    this.paintCanvas(this.leftCanvas, nextLeftCanvas);
                    this.paintCanvas(this.rightCanvas, nextRightCanvas);
                    this.applyLoneState(targetSpread);
                } else {
                    await this.playFlip(nextLeftCanvas, nextRightCanvas, targetSpread, dir);
                }

                this.currentPage = targetAnchor;
                if (this.pageInput) this.pageInput.value = String(targetAnchor);
                this.preloadAround(targetAnchor);
                this.updateActiveThumb();
            } catch (err) {
                console.error('[magazine] Error al cargar la página', pageNum, err);
            } finally {
                this.isFlipping = false;
                this.updateControls();
            }
        }

        // Todo el spread (ambas páginas) gira como una sola pieza sobre su
        // propio centro — el libro completo rotando sobre el lomo.
        playFlip(nextLeftCanvas, nextRightCanvas, targetSpread, direction) {
            return new Promise((resolve) => {
                const leaf = this.flipLeaf;
                if (!leaf) {
                    this.paintCanvas(this.leftCanvas, nextLeftCanvas);
                    this.paintCanvas(this.rightCanvas, nextRightCanvas);
                    resolve();
                    return;
                }

                this.paintCanvas(this.frontLeft, this.leftCanvas);
                this.paintCanvas(this.frontRight, this.singleMode ? null : this.rightCanvas);
                this.paintCanvas(this.backLeft, nextLeftCanvas);
                this.paintCanvas(this.backRight, nextRightCanvas);

                // Si se está entrando o saliendo de una página "sola" (portada
                // o contraportada), no colapsar el lado derecho hasta que la
                // animación termine — si no, la página que aparece/desaparece
                // de ese lado se cortaría a la mitad del volteo.
                if (!this.singleMode) this.root.classList.remove('is-lone');

                leaf.style.transitionDuration = '0ms';
                leaf.style.transform = 'rotateY(0deg)';
                leaf.hidden = false;

                // Fuerza reflow para que el salto a 0deg no se anime, y recién
                // en el siguiente frame arranca la transición real.
                // eslint-disable-next-line no-unused-expressions
                leaf.offsetHeight;
                leaf.style.transitionDuration = '';

                const targetDeg = direction > 0 ? -180 : 180;

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        leaf.style.transform = `rotateY(${targetDeg}deg)`;
                    });
                });

                const finish = () => {
                    leaf.removeEventListener('transitionend', onEnd);
                    clearTimeout(fallbackTimer);
                    this.paintCanvas(this.leftCanvas, nextLeftCanvas);
                    this.paintCanvas(this.rightCanvas, nextRightCanvas);
                    this.applyLoneState(targetSpread);
                    leaf.hidden = true;
                    leaf.style.transform = 'rotateY(0deg)';
                    resolve();
                };

                const onEnd = (e) => {
                    if (e.target === leaf && e.propertyName === 'transform') finish();
                };

                leaf.addEventListener('transitionend', onEnd);
                // Salvavidas por si el navegador no dispara transitionend
                // (pestaña en segundo plano, elemento oculto, etc.).
                const fallbackTimer = setTimeout(finish, 700);
            });
        }

        updateControls() {
            const atFirst = this.currentPage <= 1;
            const spread = this.getSpread(this.currentPage);
            const atLast = spread[spread.length - 1] >= this.totalPages;
            const busy = this.isFlipping || !this.pdfDoc;

            [this.firstBtn, this.prevBtn, this.prevArrow].forEach((btn) => {
                if (btn) btn.disabled = busy || atFirst;
            });
            [this.lastBtn, this.nextBtn, this.nextArrow].forEach((btn) => {
                if (btn) btn.disabled = busy || atLast;
            });

            if (this.zoomInBtn) this.zoomInBtn.disabled = this.zoom >= ZOOM_MAX - 0.001;
            if (this.zoomOutBtn) this.zoomOutBtn.disabled = this.zoom <= ZOOM_MIN + 0.001;
        }

        // ---------- Modo responsive (spread ↔ una sola página) ----------

        bindResponsive() {
            const onChange = () => {
                const wasSingle = this.singleMode;
                this.singleMode = this.singleModeQuery.matches;
                this.root.classList.toggle('is-single', this.singleMode);

                if (wasSingle !== this.singleMode && this.pdfDoc) {
                    // Al cambiar de modo, el "spread" bajo el mismo currentPage
                    // puede incluir/perder una página — re-renderiza tal cual.
                    this.renderSpread(this.getSpread(this.currentPage));
                    this.updateControls();
                }
            };

            if (typeof this.singleModeQuery.addEventListener === 'function') {
                this.singleModeQuery.addEventListener('change', onChange);
            } else if (typeof this.singleModeQuery.addListener === 'function') {
                // Safari antiguo.
                this.singleModeQuery.addListener(onChange);
            }
        }

        // ---------- Zoom ----------

        setZoom(zoom) {
            this.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
            if (this.pageWrap) this.pageWrap.style.transform = `scale(${this.zoom})`;
            if (this.zoomLevelEl) this.zoomLevelEl.textContent = `${Math.round(this.zoom * 100)}%`;
            this.updateControls();
        }

        // ---------- Miniaturas ----------

        buildThumbnails() {
            if (this.thumbsBuilt || !this.thumbsPanel || !this.totalPages) return;
            this.thumbsBuilt = true;

            const frag = document.createDocumentFragment();
            for (let i = 1; i <= this.totalPages; i += 1) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'magazine-thumb';
                btn.setAttribute('aria-label', `Ir a la página ${i}`);
                btn.dataset.page = String(i);
                if (this.getSpread(this.currentPage).includes(i)) btn.classList.add('active');
                frag.appendChild(btn);
            }
            this.thumbsPanel.appendChild(frag);

            this.thumbsPanel.addEventListener('click', (e) => {
                const btn = e.target.closest('.magazine-thumb');
                if (!btn) return;
                this.goTo(parseInt(btn.dataset.page, 10));
            });

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const btn = entry.target;
                    const pageNum = parseInt(btn.dataset.page, 10);
                    obs.unobserve(btn);
                    this.getPageCanvas(pageNum, 68).then((canvas) => {
                        const thumbCanvas = document.createElement('canvas');
                        this.paintCanvas(thumbCanvas, canvas);
                        btn.appendChild(thumbCanvas);
                    }).catch(() => {});
                });
            }, { root: this.thumbsPanel, rootMargin: '200px' });

            this.thumbsPanel.querySelectorAll('.magazine-thumb').forEach((btn) => observer.observe(btn));
        }

        updateActiveThumb() {
            if (!this.thumbsBuilt) return;
            const spread = this.getSpread(this.currentPage);
            this.thumbsPanel.querySelectorAll('.magazine-thumb').forEach((btn) => {
                btn.classList.toggle('active', spread.includes(parseInt(btn.dataset.page, 10)));
            });
        }

        toggleThumbnails() {
            if (!this.thumbsPanel) return;
            const show = this.thumbsPanel.hidden;
            this.thumbsPanel.hidden = !show;
            if (this.thumbsBtn) this.thumbsBtn.setAttribute('aria-pressed', String(show));
            if (show) this.buildThumbnails();
        }

        // ---------- Pantalla completa ----------

        toggleFullscreen() {
            const request = this.root.requestFullscreen || this.root.webkitRequestFullscreen;
            const exit = document.exitFullscreen || document.webkitExitFullscreen;
            const isFs = document.fullscreenElement === this.root || document.webkitFullscreenElement === this.root;

            if (!isFs && request) {
                request.call(this.root);
            } else if (isFs && exit) {
                exit.call(document);
            }
        }

        bindFullscreen() {
            const onChange = () => {
                const isFs = document.fullscreenElement === this.root || document.webkitFullscreenElement === this.root;
                this.root.classList.toggle('is-fullscreen', isFs);
                if (this.fullscreenBtn) {
                    const icon = this.fullscreenBtn.querySelector('i');
                    if (icon) icon.className = isFs ? 'fas fa-compress' : 'fas fa-expand';
                    this.fullscreenBtn.setAttribute('aria-label', isFs ? 'Salir de pantalla completa' : 'Pantalla completa');
                }
                if (!this.pdfDoc) return;
                // Al cambiar de tamaño el slot cambia de alto; re-renderiza el
                // spread actual a la nueva resolución para que no se vea borroso.
                this.getSpread(this.currentPage).forEach((p) => this.cache.delete(p));
                this.renderSpread(this.getSpread(this.currentPage)).catch(() => {});
            };
            document.addEventListener('fullscreenchange', onChange);
            document.addEventListener('webkitfullscreenchange', onChange);
        }

        // ---------- Controles / eventos ----------

        bindControls() {
            const on = (el, fn) => { if (el) el.addEventListener('click', fn); };

            on(this.firstBtn, () => this.goTo(1, -1));
            on(this.prevBtn, () => this.goPrev());
            on(this.prevArrow, () => this.goPrev());
            on(this.nextBtn, () => this.goNext());
            on(this.nextArrow, () => this.goNext());
            on(this.lastBtn, () => this.goTo(this.totalPages, 1));

            on(this.zoomInBtn, () => this.setZoom(this.zoom + ZOOM_STEP));
            on(this.zoomOutBtn, () => this.setZoom(this.zoom - ZOOM_STEP));
            on(this.zoomResetBtn, () => this.setZoom(1));
            on(this.fullscreenBtn, () => this.toggleFullscreen());
            on(this.thumbsBtn, () => this.toggleThumbnails());

            if (this.pageInput) {
                const commit = () => {
                    const val = parseInt(this.pageInput.value, 10);
                    if (Number.isNaN(val)) {
                        this.pageInput.value = String(this.currentPage);
                        return;
                    }
                    this.goTo(val);
                };
                this.pageInput.addEventListener('change', commit);
                this.pageInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        commit();
                    }
                });
            }
        }

        bindPageClick() {
            if (!this.pageSlot) return;
            this.pageSlot.addEventListener('click', () => {
                // Un swipe también dispara "click" al soltar (mismo elemento en
                // pointerdown/up); si bindSwipe ya navegó, no navegar de nuevo.
                if (this.suppressNextClick) {
                    this.suppressNextClick = false;
                    return;
                }
                const ratio = this.lastPointerRatio;
                if (ratio == null) return;
                if (ratio < 0.3) this.goPrev();
                else if (ratio > 0.7) this.goNext();
            });
        }

        bindKeyboard() {
            // Delegado en el propio visor: solo actúa si el foco está dentro,
            // así no se roban atajos del resto de la página.
            this.root.addEventListener('keydown', (e) => {
                // No interceptar mientras se escribe en el campo "ir a página"
                // (ahí ArrowLeft/ArrowRight deben mover el cursor, no la página).
                const tag = e.target && e.target.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA') return;

                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.goPrev();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.goNext();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.goTo(1, -1);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.goTo(this.totalPages, 1);
                        break;
                    case '+':
                        e.preventDefault();
                        this.setZoom(this.zoom + ZOOM_STEP);
                        break;
                    case '-':
                        e.preventDefault();
                        this.setZoom(this.zoom - ZOOM_STEP);
                        break;
                    case 'f':
                    case 'F':
                        e.preventDefault();
                        this.toggleFullscreen();
                        break;
                    default:
                        break;
                }
            });
        }

        bindSwipe() {
            if (!this.pageSlot) return;
            let startX = 0;
            let dragging = false;
            this.lastPointerRatio = null;
            this.suppressNextClick = false;

            this.pageSlot.addEventListener('pointerdown', (e) => {
                dragging = true;
                startX = e.clientX;
            });

            this.pageSlot.addEventListener('pointerup', (e) => {
                const rect = this.pageSlot.getBoundingClientRect();
                this.lastPointerRatio = (e.clientX - rect.left) / rect.width;

                if (!dragging) return;
                dragging = false;
                const delta = e.clientX - startX;
                if (Math.abs(delta) > SWIPE_THRESHOLD) {
                    this.suppressNextClick = true;
                    if (delta < 0) this.goNext();
                    else this.goPrev();
                }
            });

            this.pageSlot.addEventListener('pointercancel', () => {
                dragging = false;
            });
        }
    }

    function init() {
        document.querySelectorAll('[data-magazine]').forEach((root) => {
            // eslint-disable-next-line no-new
            new MagazineViewer(root);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
