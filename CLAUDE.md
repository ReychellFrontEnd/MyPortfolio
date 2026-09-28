# Portafolio Multimedia — Reychell Perdomo

Sitio estático (HTML/CSS/JS puro, sin build ni dependencias de Node) para el portafolio de
Reychell Perdomo, estudiante de Tecnólogo en Multimedia (ITLA). Pensado para publicarse en
**GitHub Pages** con un dominio personalizado.

## Mapa rápido (dónde está cada cosa)

| Si vas a tocar… | Lee primero | Archivos |
| --- | --- | --- |
| Navbar, logo, menú móvil | [Navbar y logo](#navbar-y-logo) | `index.html`, `css/style.css`, `js/script.js` |
| Agregar/editar un proyecto | [Descargas de proyectos](#descargas-de-proyectos) | `index.html` (grid `.projects-grid`) |
| Robot Steampunk (3 renders) | [Proyecto "Robot Steampunk"](#proyecto-robot-steampunk-tríptico-de-ancho-completo) | `index.html`, `css/style.css` (breakpoint 900px) |
| Artículo de periódico (franja panorámica) | [Proyecto "Artículo de periódico editorial"](#proyecto-artículo-de-periódico-editorial-franja-alargada-fuera-de-la-cuadrícula) | `index.html`, `css/style.css` (`.project-newspaper`) |
| Revista ReVibe / flipbook | [Revista digital interactiva](#revista-digital-interactiva-flipbook) | `js/magazine.js`, `css/magazine.css` |
| Guía navegable (scroll + enlaces reales del PDF) | [Guía navegable interactiva](#guía-navegable-interactiva-pdf-con-scroll-propio--projects-duo) | `js/magazine.js` (`GuideViewer`), `css/magazine.css` (`.guide-*`, `.projects-duo`) |
| Formulario de contacto | [Formulario de contacto → email](#formulario-de-contacto--email) | `index.html`, `js/script.js` |
| Colores, sombras, animaciones | [Sistema de diseño y motion](#sistema-de-diseño-y-motion-auditoría-2026-08-26) | `css/style.css` (`:root`) |
| Accesibilidad / teclado / ARIA | [Accesibilidad](#accesibilidad-auditoría-2026-08-26) | `index.html`, `js/script.js` |
| Velocidad de carga | [Rendimiento general del sitio](#rendimiento-general-del-sitio) | `index.html` (`loading="lazy"`), `js/magazine.js` |
| Dominio, DNS, Pages | [Publicación en GitHub Pages](#publicación-en-github-pages-con-dominio-personalizado) | `CNAME`, `.nojekyll` |

**Trampas que ya costaron un bug** (detalle en las secciones enlazadas):
1. No mover `.reveal` hacia el final de `css/style.css` → rompe el hover de las tarjetas.
2. No volver al endpoint de Formspree por solo-email (`formspree.io/<correo>`) → devuelve 404.
3. El honeypot `_gotcha` debe seguir excluido del selector de validación en `js/script.js`.
4. Rutas de assets siempre con `/` y respetando mayúsculas → GitHub Pages es case-sensitive.
5. La extensión de `download="..."` debe coincidir con el archivo real y ser única por proyecto.

**Estado actual**: 10 tarjetas de proyecto (6 normales en la cuadrícula + 4 fuera de ella: tríptico,
artículo de periódico, revista y guía navegable — estas dos últimas en paralelo dentro de
`.projects-duo`), 4 filtros (`illustration`, `vector-arts`, `3d`, `editorial`) más "Todos" —
`branding`, `web` y `animation` se quitaron (2026-09-28) porque ya no clasificaban a ningún
proyecto real; ver [Descargas de proyectos](#descargas-de-proyectos) para qué proyecto lleva cada
categoría. Publicado en `reychellperdomo.lat` vía GitHub Pages (`ReychellFrontEnd/MyPortfolio`, rama
`main`).

**Probar local**: `python -m http.server` en la raíz y abrir `http://localhost:8000` — **no** abrir
`index.html` con doble clic: bajo `file://` el visor de revista descarga los 88 MB del PDF completo
antes de mostrar algo.

## Estructura

```
index.html          Toda la maquetación (una sola página, secciones con anclas #id)
css/style.css        Estilos (variables de color en :root, mobile-first breakpoints en 992/768/576px)
css/magazine.css      Estilos del visor de revista (flipbook), aparte para no inflar style.css
js/script.js          Navbar responsive, filtro de proyectos, modal de vista previa, envío del formulario
js/magazine.js         Visor de revista tipo flipbook (PDF.js + volteo con CSS 3D)
assets/img/           Imagen de perfil (Image.jpeg)
assets/proyectos/     Logo, banner del hero, imágenes de proyectos y el PDF de la revista (ReVibe)
.nojekyll              Evita que GitHub Pages procese el sitio con Jekyll
.gitignore              Ignora basura de SO/editor (no hay build ni node_modules real todavía)
```

No hay paso de build: los archivos se sirven tal cual. Para probar localmente basta abrir
`index.html` en el navegador o correr un servidor estático (`python -m http.server`) en la raíz
del proyecto.

## Secciones de la página

`Inicio` (`#inicio`) → `Identidad` (`#identidad`) → `Proyectos` (`#proyectos`) →
`Visión` (`#vision`) → `Contacto` (`#contacto`).

- La sección se llamaba **"Reflexión"** (`#reflexion`) y tenía 3 tarjetas de reflexión
  (Aprendizajes Clave, Fortalezas y Debilidades, Proyección Futura) más una tarjeta final de
  "Visión Profesional". A pedido explícito del usuario (2026-09-28) se renombró a **"Visión"** y
  se quitaron las 3 tarjetas de reflexión — solo queda el párrafo de visión, sin su subtítulo
  ("Visión Profesional" ya no aparece ahí porque ahora lo dice el propio título de la sección:
  "Visión <span>Profesional</span>"). Las clases `.reflection-card`/`.reflection-icon` (y todo su
  CSS) se eliminaron por quedar sin uso; el contenedor y la tarjeta que sí sobreviven se
  renombraron a `.vision-container`/`.vision-statement`. No reintroducir las 3 tarjetas de
  reflexión sin que el usuario lo pida de nuevo.

- La sección **"Evolución artística y técnica"** se eliminó por pedido explícito (2026-08-25),
  junto con todo su CSS (`.evolution-*`, `.timeline-*`, `.skill-bars`, `.comparison-*`,
  `.real-image-*`) y el JS que animaba las barras de progreso. No debe reintroducirse sin que el
  usuario lo pida de nuevo.
- El **hero** (`#inicio`) ya no tiene el layout de texto+foto de antes: ahora solo muestra la
  imagen de marca `assets/proyectos/PORTAFOLIO_Rey.png` (banner con el título "Portafolio
  Reychell Perdomo" ya diseñado) centrada sobre el fondo oscuro (`--gradient-dark`). El archivo se
  renombró desde `PORTAFOLIO Rey.png` (sin espacio) para evitar problemas de URL al publicar.

## Navbar y logo

El navbar (`.navbar`, `.nav-container`, `.logo`, `.nav-menu`) se rediseñó para imitar el
estilo de referencia `assets/proyectos/ejemplonavbar.png`: el logo es un círculo aislado a la
izquierda (72px de diámetro en escritorio, 56px en móvil — se agrandó a pedido del usuario) y el
menú de enlaces vive en una píldora aparte con fondo en gradiente (`--gradient-primary`),
separada del logo. En móvil (`≤768px`) el menú colapsa al comportamiento de hamburguesa ya
existente en `js/script.js` (sin cambios de lógica, solo de estilos).

Si se agregan o quitan secciones, actualizar en paralelo:
1. El `<li>` en `.nav-menu` (index.html)
2. El `id` de la sección correspondiente
3. Nada más en JS — el resaltado de enlace activo y el scroll suave ya funcionan por selector
   genérico (`a[href^="#"]`, `section[id]`).

## Descargas de proyectos

**Categorías actuales** (`data-filter`/`data-category`, 2026-09-28 — reclasificación a pedido
explícito del usuario):

| Categoría | Proyectos |
| --- | --- |
| `illustration` (Ilustración) | "8 Deaths of Spider-Man" (portada de cómic), Poster "Dark" |
| `vector-arts` (Vector Arts) | Los dos posters vectorizados (evolución tecnológica, Café Santo Domingo) |
| `editorial` | Pliego de revista de videojuegos, Infografía creativa, Artículo de periódico, Revista ReVibe, Guía navegable |
| `3d` | Robot Steampunk (tríptico) |

No reasignar un proyecto a `branding`, `web` o `animation` sin antes volver a agregar el botón de
filtro correspondiente — se quitaron los tres (2026-09-28) porque ningún proyecto real los usaba.

Cada tarjeta de proyecto tiene un botón "Ver" (abre el modal con la imagen) y un botón
"Descargar" (`<a download>`). Reglas para no romper esto al añadir proyectos nuevos:

- La extensión del atributo `download="..."` **debe coincidir con el tipo real del archivo**
  (ej. si el origen es `.jpg`, el nombre de descarga también debe terminar en `.jpg`). Antes de
  esta limpieza, varios enlaces prometían un `.pdf` para archivos que en realidad eran `.jpg`;
  quedó corregido en todos los proyectos existentes.
- Cada `download="..."` debe ser único entre proyectos (dos proyectos apuntaban antes al mismo
  nombre de archivo de descarga).
- Usar siempre `/` como separador de ruta (`assets/proyectos/...`), nunca `\`. Las rutas con
  backslash funcionan por accidente en Windows/`file://` pero **rompen el sitio en GitHub Pages**
  (Linux, case-sensitive, y `\` no es separador de ruta en una URL).
- El atributo `download` requiere que el archivo se sirva desde el mismo origen (no funciona con
  imágenes de otro dominio) — todas las imágenes de proyectos son locales, así que esto ya está
  garantizado.
- **Proyectos cuyo archivo fuente es un PDF sin imagen propia** (ej. "Artículo de periódico
  editorial"): la tarjeta necesita igual una `<img>` para `.project-image` (la cuadrícula no
  soporta un PDF como fondo). El patrón ya existente (usado también por "Poster vectorizado",
  proyecto 3) es que el `data-src` del botón "Ver" y el `src` de la miniatura pueden apuntar a un
  **JPG** mientras el enlace "Descargar" apunta al **PDF real** — no tienen que coincidir entre sí,
  solo cada uno con su propio `download="..."`/tipo. Para "Artículo de periódico" la miniatura
  (`Newspaperarticle_Desktop_ReychellPerdomo_thumb.jpg`) se generó renderizando la única página del
  PDF (`Newspaperarticle_Desktop_ReychellPerdomo.pdf`, un spread de 2 páginas de periódico
  maquetado como una sola página ancha, 1584×1224pt) a 150dpi con `pymupdf` — si el usuario
  reemplaza ese PDF por otro, hay que regenerar el `_thumb.jpg` a mano (no hay ningún paso de build
  que lo haga automáticamente).

### Proyecto "Artículo de periódico editorial" (franja alargada, fuera de la cuadrícula)

Igual que el tríptico de abajo, este proyecto **no vive dentro de `.projects-grid`**: es un
hermano suyo con clase `project-newspaper` (además de `project-card reveal`), `data-category`
`editorial`. La razón: el spread de periódico es panorámico (proporción real 1584×1224pt, ~22:17)
y dentro de una celda normal de `.project-image` (250px de alto, `object-fit: cover`) se recortaba
tanto que el titular quedaba ilegible incluso antes de abrir el modal — el usuario pidió
explícitamente que se viera "más alargado y centrado" para que fuera "apreciable y legible desde
afuera" (sin tener que hacer clic en "Ver").

- `.project-newspaper` reutiliza el mismo ancho que `.project-triptych`/`.project-magazine` (70%,
  máx. 780px, centrado con `margin: auto`) — ver `css/style.css`.
- `.project-newspaper .project-image` cambia `height: 250px` (fijo) por
  `aspect-ratio: 22 / 17` (la proporción exacta del PDF) + `object-fit: contain`, así el spread se
  ve completo, sin recortar ningún borde, a cualquier ancho de card. Si en el futuro se reemplaza
  el PDF/JPG por uno de otra proporción, `contain` sigue sin recortar (solo aparecerán franjas del
  fondo `rgba(8, 14, 32, 0.55)` a los lados o arriba/abajo) — no hace falta tocar el CSS.
- Responsive: en `≤900px` (mismo breakpoint que el tríptico) pasa a `width: 100%` para ocupar todo
  el ancho de la sección, igual que en escritorio pero sin el límite de 780px.
- El texto de `.project-details` se centra (mismo patrón que tríptico/revista).

### Proyecto "Robot Steampunk" (tríptico de ancho completo)

Es el único proyecto que muestra **varias fotos de un mismo trabajo** (3 renders 3D del mismo
robot). Se probó primero como carrusel deslizable dentro de una tarjeta normal, pero el usuario lo
rechazó ("no me gusta el carrusel") y pidió en su lugar una franja **de ancho completo** con los 3
renders **lado a lado, siempre visibles** (como `|||`) — así quedó implementado, no queda rastro
del carrusel (ni en CSS ni en JS).

- Estructura: `.project-card.project-triptych` (vive **fuera** de `.projects-grid`, como hermano
  después de ese `<div>`, dentro del mismo `.container` de Proyectos — por eso puede ocupar todo el
  ancho de la sección) → `.triptych-row` (flex) → 3× `.triptych-panel`, cada uno con su propia
  `<img>` + `.project-overlay`/`.project-info` + botones Ver/Descargar (reutilizan
  `.view-btn`/`.download-btn`, así que el modal y las descargas funcionan igual que en cualquier
  otro proyecto, **sin JS propio** — no hay controlador de carrusel en `js/script.js`).
- Sigue llevando la clase `project-card` (para que el filtro de proyectos lo detecte con
  `document.querySelectorAll('.project-card')`) y `data-category="3d"`.
- Responsive: `.triptych-row` es `flex-direction: row` (los 3 lado a lado) en escritorio/tablet, y
  pasa a `column` (apilados, cada uno a `height: 300px`) en `≤900px` — ver ese breakpoint en
  `css/style.css`.
- Filtro `data-filter="3d"` / `data-category="3d"` (ver categorías vigentes en
  [Descargas de proyectos](#descargas-de-proyectos)).
- `@media (hover: none)` hace que el overlay (Ver/Descargar) quede siempre visible en pantallas
  táctiles, ya que ahí no existe `:hover` — aplica a **todas** las project-card (incluyendo los
  paneles del tríptico), corrigiendo que en móvil antes no se podía acceder a esos botones.

### Gotcha de CSS: `.reveal.is-visible` vs. el hover de las tarjetas

`.reveal`/`.reveal.is-visible` (el scroll-reveal) y cada `.identity-card:hover` /
`.project-card:hover` / `.contact-info:hover` tienen la **misma
especificidad** (dos clases). Cuando dos reglas empatan en especificidad, gana la que aparece
**después** en la hoja de estilos. Por eso `.reveal`/`.reveal.is-visible` se define muy arriba en
`css/style.css` (justo después de `.container`), **antes** de cualquier regla de hover de tarjetas
— si se moviera más abajo (como estaba al principio, cerca de "Responsive"), su
`transform: translateY(0)` ganaría por orden de aparición y el `translateY(-6px)` del hover de las
tarjetas dejaría de verse en cuanto la tarjeta quedara revelada. No mover `.reveal` hacia el final
del archivo sin volver a probar el hover de las tarjetas.

## Formulario de contacto → email

`#contactForm` (sección Contacto) envía por `fetch` (AJAX, sin recargar la página) a un formulario
real creado en el panel de Formspree, registrado con el correo **reychellperdomo@gmail.com** (sin
punto — verificar siempre este dato antes de asumirlo):

```html
<form id="contactForm" action="https://formspree.io/f/mgawgrwg" method="POST">
```

- **Historial importante**: la primera versión usaba el endpoint "clásico" sin cuenta
  (`https://formspree.io/<email>`). Se verificó con `curl` que Formspree lo **deprecó** — responde
  `404 FORM_NOT_FOUND` ("This form isn't set up yet"). Por eso ahora se usa un form ID real
  (`/f/mgawgrwg`), creado desde el dashboard de Formspree. **No revertir** al formato de solo-email;
  no funciona.
- Este endpoint (`/f/mgawgrwg`) ya está verificado con una petición de prueba real (`200 OK`,
  `{"ok":true}`) — no requiere ningún paso de confirmación adicional, los envíos llegan directo.
- Los campos tienen `name="name"`, `name="email"`, `name="subject"`, `name="message"` — Formspree
  arma el cuerpo del correo con esos valores. Hay un campo oculto `_subject` que fija el asunto del
  correo, y un honeypot anti-spam `name="_gotcha"`.
  - **Ojo con el honeypot en la validación JS**: `_gotcha` es `type="text"` oculto por CSS
    (`style="display:none"`), no `type="hidden"` — si el selector de validación en
    `js/script.js` solo excluye `input:not([type="hidden"])`, el honeypot cuela como campo
    obligatorio vacío y el formulario siempre dice "Faltan datos" aunque todo esté lleno. El
    selector correcto (ya aplicado) es:
    `input:not([type="hidden"]):not([name="_gotcha"]), textarea`.
- El JS (`js/script.js`, sección "Formulario de contacto") valida que los campos no estén vacíos,
  muestra un mensaje de éxito o error debajo del formulario, y restaura el botón de envío en
  cualquier caso (`try/catch/finally`).
- Si en el futuro se necesita cambiar de formulario/cuenta de Formspree, solo hay que actualizar el
  `action` del `<form>` — el resto del JS no depende del endpoint.

## Sistema de diseño y motion (auditoría 2026-08-26)

El CSS tiene un sistema de tokens en `:root`: escala de espaciado (`--space-1..8`), curva de
transición única (`--ease-standard`, sin rebote) con tres duraciones (`--duration-fast/base/slow`),
sombras reducidas en opacidad/difusión respecto a la versión original, y `--focus-ring` para el
foco de teclado en toda la interfaz. Toda animación usa `transform`/`opacity` (o color/background,
nunca propiedades que disparen layout) para que sea barata en el compositor.

- **`prefers-reduced-motion`**: `--duration-*` colapsan a `1ms` y hay una regla global que fija
  `animation-duration`/`transition-duration` a `1ms !important` — es el único uso de `!important`
  en el archivo, y es intencional (garantiza que ninguna otra regla reactive el movimiento para
  quien lo desactivó). El JS también respeta esta preferencia: `.reveal` se marca visible de
  inmediato en vez de animar, y el scroll a anclas usa `behavior: 'auto'`.
- **`--gradient-cta`** (`pink-ballad → cold-current`) es la variante para superficies con texto o
  íconos **blancos** encima (navbar, `.btn-primary`, `.view-btn`, filtros activos, hover de
  descarga/redes/cerrar-modal). `--gradient-primary` (`orchid-smoke → pink-ballad`) se reserva para
  acentos puramente decorativos (líneas bajo títulos) porque su extremo `orchid-smoke` **no**
  cumple 4.5:1 de contraste con texto blanco — no reintroducir `--gradient-primary` detrás de texto
  sin volver a verificar el contraste.
- El estado activo/hover de `.nav-link` oscurece (no aclara) el fondo — aclarar rompería el
  contraste del texto blanco en algunos puntos del degradado.
- Se eliminó `backdrop-filter` de las tarjetas repetidas (identity/project-card, inputs,
  modal-details) por costo de rendimiento; se conserva solo en elementos "de chrome" (navbar, menú
  móvil, modal) donde aporta jerarquía real.
- Se eliminó la animación infinita de fondo en `.dark-section::before` (rotaba cada 20s sin parar)
  y el efecto "barrido" de gradiente en hover de botones/filtros — eran puramente decorativos y
  costosos; el feedback ahora es `transform`/`box-shadow` con `:active` para respuesta instantánea
  al presionar.
- **Scroll-reveal**: elementos con clase `reveal` (tarjetas de Identidad/Proyectos, el párrafo de
  Visión) se animan una sola vez vía `IntersectionObserver` (`js/script.js`) al entrar en pantalla,
  sin listeners de `scroll`.
- **Navbar sin listener de scroll**: `#scrollSentinel` (100px de alto, invisible, justo al inicio
  de `<main>`) se observa con `IntersectionObserver`; cuando deja de intersectar, el navbar gana
  `.scrolled`. El scrollspy (enlace activo según sección visible) usa el mismo patrón por sección,
  con `rootMargin: '-45% 0px -45% 0px'`.

## Accesibilidad (auditoría 2026-08-26)

- Landmarks: `<main id="main-content">` envuelve todo el contenido entre navbar y footer; hay un
  enlace "Saltar al contenido principal" (`.skip-link`) visible solo al enfocarlo con teclado.
- El botón de menú móvil es un `<button>` real (antes era un `<div>`) con
  `aria-expanded`/`aria-controls="navMenu"`, sincronizado desde `setMenuOpen()` en `js/script.js`.
  Se cierra con Escape (devuelve el foco al botón) o al hacer clic fuera del menú.
- El modal de vista previa (`#projectModal`) tiene `role="dialog"`, `aria-modal="true"`, un botón
  de cierre real (antes era un `<span>`, no accesible por teclado) y **atrapa el foco con Tab**
  mientras está abierto; al cerrar, el foco vuelve al botón "Ver" que lo abrió.
- Los inputs del formulario de contacto tienen `<label class="sr-only">` enlazadas por `id`/`for`
  (antes solo tenían `placeholder`, que no es un nombre accesible confiable). Los errores de
  validación usan la clase `.input-error` (antes se ponía `style.borderColor` inline por JS).
- Todos los íconos puramente decorativos (`<i class="fa...">`) llevan `aria-hidden="true"`.
- Los enlaces de redes sociales en Contacto (Behance/LinkedIn/GitHub/Instagram, `.social-links`)
  eran placeholders que apuntaban a `#` sin destino real — se quitaron del todo (HTML y su CSS en
  `css/style.css`) a pedido explícito del usuario (2026-09-28). No reintroducirlos sin que el
  usuario pida agregar enlaces reales.
- Los botones de filtro de proyectos exponen `aria-pressed`, sincronizado en cada click.
- Foco de teclado visible y consistente en toda la interfaz vía `--focus-ring` (regla global
  `:focus-visible`), en vez de depender del contorno por defecto del navegador (que estaba
  deshabilitado sin reemplazo antes de esta auditoría).

## Sección Contacto

`.contact-info` y `.contact-form` ahora son tarjetas reales (fondo, borde, radio, sombra y
`translateY` al hover) — antes eran texto/formulario sueltos directamente sobre el fondo de la
página, lo que el usuario describió como "descuidado". Cada dato de contacto usa `.contact-icon`
(insignia circular, mismo patrón visual que `.identity-icon`) en vez de un
ícono suelto. El email es un link `mailto:` real. Los inputs del formulario usan un fondo más
oscuro que la tarjeta que los contiene (`rgba(8,14,32,0.55)` vs. `rgba(16,30,66,0.65)` de la
tarjeta) para leerse como campos hundidos, no confundirse con el fondo de la tarjeta.

## Revista digital interactiva (flipbook)

Proyecto 9 dentro de Proyectos: `.project-card.project-magazine`, hoy en paralelo con la guía
navegable dentro de `.projects-duo` (ver sección siguiente) — antes de eso vivía sola con el mismo
ancho que `.project-triptych` (70%, máx. 780px, centrado). La franja inferior (`.project-details`)
es deliberadamente delgada: solo `<h3>` con el nombre y un `<p>` con el año, sin curso/herramientas
como las demás tarjetas.

- **PDF real usado**: `assets/proyectos/ReVibe_ReychellPerdomo_20241104.pdf` — el número de páginas
  nunca está hardcodeado en el código: `js/magazine.js` lee `pdfDoc.numPages` del archivo real, así
  que cualquier PDF que se ponga en esa ruta funciona sin tocar el JS.
  - **Historial de archivos** (por si aparece otro reemplazo en el futuro): el archivo original
    tenía "(1)" en el nombre (`ReVibe_ReychellPerdomo_20241104(1).pdf`, 19MB, 64 páginas, con un
    artefacto visible tipo "brillo/plástico" superpuesto en varias páginas — se notaba comparando
    la portada y la contraportada). El usuario subió una exportación de **mejor calidad**
    (2026-09-28) con el mismo nombre pero sin el "(1)" — 88MB, **33 páginas**, sin ese artefacto.
    Se verificó abriendo ambos archivos con `pymupdf` antes de reemplazar: portada y contraportada
    coinciden en diseño entre ambas versiones (mismo documento, no es un PDF distinto), pero la
    cantidad de páginas cambió de 64 a 33 — no se investigó por qué (podría ser una revisión más
    corta a propósito, o páginas dobles contadas distinto en el nuevo export); si en algún momento
    falta contenido que antes estaba, ese es el primer lugar donde mirar. El archivo viejo se borró
    del repo (quedaba sin usar).
  - **Rendimiento tras el reemplazo**: la nueva exportación pesa ~2.7MB por página en promedio
    (antes ~300KB/página) — bastante más pesada por página aunque el archivo total creció "solo"
    ~4.6x porque tiene menos páginas. `getPageCanvas()` en `js/magazine.js` ya usaba un tope de
    `devicePixelRatio` (para no pedirle a pdf.js más resolución de la que la pantalla puede
    mostrar) — se bajó ese tope de 1.5 a 1.3 y el margen de zoom de 1.15 a 1.1 (2026-09-28) para
    compensar el costo extra de decodificar/pintar páginas más pesadas; no reduce cuánto hay que
    *descargar* por página (eso lo fija el propio archivo), pero sí el trabajo de render/paint en
    el hilo principal por cada página. `disableAutoFetch: true` (ya existente) sigue siendo lo que
    evita bajar el archivo completo de una — pdf.js pide por rangos de bytes solo lo que hace
    falta para la página que se está mostrando.
- **Arquitectura**: `PDF.js` (cargado perezosamente desde cdnjs solo cuando existe un
  `[data-magazine]` en la página, no en el `<head>`) renderiza páginas a un `<canvas>` **bajo
  demanda**, con caché acotada (`MAX_CACHE_PAGES` en `js/magazine.js`) y precarga de las páginas
  vecinas en `requestIdleCallback`. Nunca se renderizan todas las páginas a la vez.
- **Volteo de página**: implementado a mano con CSS 3D (`.magazine-flip-leaf`, dos caras con
  `backface-visibility: hidden`, una pre-rotada 180° en reposo — técnica estándar de "flip card"),
  no con una librería de flipbook de terceros (el usuario pidió inspirarse en el visor "FlipBook"
  de dFlip/dearFlip que usa intec.edu.do, pero se implementó el efecto propio, no esa librería).
- **Spread de 2 páginas abiertas** (`.magazine-spread`: `.magazine-page-left` + `.magazine-spine`
  + `.magazine-page-right`) en pantallas >900px, para que se sienta como un libro real. Emparejado
  con la convención real de un libro/revista: **la portada (página 1) va sola**, y desde ahí en
  adelante pares (2,3) (4,5) (6,7)... — si el total de páginas es par, la última queda sola como
  contraportada (`getSpread()` en `js/magazine.js`, con la lógica documentada ahí mismo). Aunque el
  visor esté en modo de dos páginas, cualquier spread "solo" (portada/contraportada) colapsa la
  mitad derecha dinámicamente vía la clase `is-lone` (`applyLoneState()`), que se aplica al cargar,
  al navegar (al terminar el volteo, no a mitad de animación — si no, la página entrante/saliente
  se vería cortada) y al cambiar de modo responsive.
  El volteo anima **todo el spread como una sola pieza**, rotando sobre su propio centro (el lomo)
  — más simple y confiable que animar cada página contra el lomo por separado. En `≤900px` (mismo
  quiebre que el resto del sitio) cae a una sola página (`root.classList('is-single')`, ver
  `SINGLE_MODE_QUERY` en el JS), reevaluado en vivo con un listener de `matchMedia` — no hace falta
  recargar la página para que cambie de modo.
  Ver el comentario al inicio de `js/magazine.js` para el resto de las decisiones de alcance (sin
  pinch-to-zoom táctil, zoom por `transform: scale()` en vez de re-render de PDF.js, etc.).
- **Bug encontrado y corregido (pantalla de carga trabada en 100%)**: el progreso de descarga podía
  llegar a 100% mientras pdf.js seguía interpretando el archivo (o mientras el Worker fallaba en
  silencio), dejando el spinner pegado para siempre. Se corrigió con: (1) el Worker de pdf.js se
  carga como Blob same-origin (`fetchAsBlobUrl`) en vez de apuntar directo a la URL del CDN — un
  `new Worker()` con script de otro origen puede fallar según navegador/contexto (ej. abriendo el
  sitio con `file://` en vez de un servidor); (2) un aviso de "casi listo" a los 6s si sigue
  cargando (`slowNoticeTimer`); (3) un salvavidas que muestra un mensaje accionable sin abortar la
  carga real (si termina después, el visor igual aparece) — el plazo se **adelantó de 45s a 20s**
  (`hardTimeout` en `loadDocument()`, commit `dac6d90`) porque 45s se sentía como sitio roto. Al
  dispararse, también pone `docReady = true` y `onProgress = null` para que un evento de progreso
  tardío no pise ese mensaje con un porcentaje viejo. **Recomendación para probarlo**: abrir el sitio con
  un servidor local (`python -m http.server`), no con doble clic al archivo — `file://` no soporta
  range-requests y obliga a descargar el PDF completo antes de mostrar nada.
- **Segundo bug encontrado y corregido (pantalla de carga trabada en 99%, ya en producción)**: aun
  con el fix anterior, el overlay de carga volvía a aparecer solo y se quedaba fijo en 99% —
  aunque el visor funcionaba bien detrás (las páginas cargaban y se podía navegar). Causa real:
  `loadingTask.onProgress` de pdf.js sigue disparándose después de que el documento ya cargó (por
  las páginas que se van pidiendo con rangos de bytes), y cada disparo volvía a llamar
  `setStatus('loading', ...)`, reabriendo el overlay indefinidamente (nunca llega a 100% porque el
  código lo tope a 99 a propósito, y nada más volvía a llamar `hideStatus()`). Arreglado con una
  bandera `docReady` que el callback de progreso revisa antes de actuar, más
  `loadingTask.onProgress = null` en cuanto el documento ya cargó — así ningún progreso tardío
  puede reabrir la pantalla de carga.
- **Estados**: carga inicial (spinner + progreso si el navegador lo reporta), error si el PDF no
  existe o falla (nunca pantalla en blanco — mensaje que incluye la ruta exacta esperada), botones
  primera/anterior/siguiente/última con `disabled` en los extremos, zoom con límites (70%–160%).
- **Teclado**: flechas/Home/End/+/-/F, delegado en el propio contenedor del visor (no en
  `document`) para no robar atajos al resto de la página — solo actúa si el foco está dentro. El
  `.magazine-page-slot` tiene `tabindex="0"` para poder enfocarlo con un clic y que el teclado
  funcione de inmediato después. Los atajos se desactivan mientras se escribe en el input de "ir a
  página" (si no, ArrowLeft/ArrowRight moverían la página en vez del cursor del número).
- **Swipe y clic en los bordes conviven en el mismo elemento** (`.magazine-page-slot`): un swipe
  también dispara un `click` nativo al soltar, así que hay una bandera (`suppressNextClick`) para
  que no naveguen dos veces por el mismo gesto.
- **Miniaturas**: se construyen recién la primera vez que se abre el panel (no al cargar la
  página), y cada miniatura se renderiza solo cuando entra en el viewport del panel
  (`IntersectionObserver`), a baja resolución.
- Filtro nuevo: `data-filter="editorial"` / `data-category="editorial"`.
- **El PDF pesa 88 MB** (de nuevo, tras el reemplazo de 2026-09-28 por la versión de mejor calidad
  — ver "Historial de archivos" más arriba en esta sección) — es, con diferencia, el mayor factor
  de qué tan rápido carga. Ya se ajustó lo que se puede desde el código (`disableAutoFetch: true`
  para no traer el archivo completo de una, `devicePixelRatio` tope **1.3** — bajado de 1.5 el
  2026-09-28 — y margen de resolución reducido al renderizar). Lo que de verdad reduciría el
  tiempo de carga es exportar el PDF más liviano desde InDesign (preset "Smallest File Size" o
  bajar la resolución de las imágenes) — no se tocó el PDF en sí porque es contenido del usuario y
  recomprimirlo a ciegas arriesga perder calidad visual (más aún tratándose de la versión que el
  usuario subió explícitamente **por su mejor calidad**).
- El PDF actual tiene **33 páginas** (`pdfDoc.numPages`, nunca hardcodeado) — si en algún momento
  aparece un PDF con otra cantidad de páginas, basta con reemplazar el archivo en
  `assets/proyectos/` y actualizar el `data-pdf`/`href` en `index.html` — no hace falta tocar
  `js/magazine.js`.

## Guía navegable interactiva (PDF con scroll propio) + `.projects-duo`

Proyecto 10 dentro de Proyectos: `.project-card.project-guide`, colocado **en paralelo** con la
revista (proyecto 9) a pedido explícito del usuario — ambas tarjetas viven dentro de un mismo
contenedor `.projects-duo` (flex, `gap: 1.5rem`) en vez de cada una ocupando su propia franja de
ancho completo. En `≤900px` (mismo breakpoint que el resto del sitio) `.projects-duo` pasa a
`flex-direction: column` y cada tarjeta ocupa el 100% del ancho, una debajo de la otra.

- **Reparto 60/40, no 50/50** (a pedido explícito del usuario — "que la tarjeta de la revista sea
  más ancha... sin perder el estilo... que siga en paralelo"): `.projects-duo .project-magazine`
  usa `flex: 3 1 0` y `.projects-duo .project-guide` usa `flex: 2 1 0`. La razón del reparto
  desigual (no solo "porque lo pidió así"): la revista muestra un **spread de dos páginas** (el
  doble de ancho "natural" que una sola página) mientras que la guía solo muestra una página a la
  vez — con 50/50 el spread quedaba más apretado que la guía para el mismo espacio recibido.
  También se bajó la altura base de `.magazine-page-slot` de 400px a 360px (**solo la regla base,
  no las de los media queries ≤900px/≤480px**, que ya tenían su propio valor menor y siguen
  ganando ahí por especificidad) para que el ancho "natural" del spread quepa mejor en la columna
  más angosta que le toca ahora. Y se agregó `object-fit: contain` a `.magazine-canvas`: si aun así
  el contenedor quedara más angosto que ese ancho natural (ventanas de escritorio angostas, entre
  ~900 y ~1100px), `max-width: 100%` recorta el ancho pero **no** el alto (`height: 100%` fijo) —
  sin `object-fit`, eso se ve como el spread apachurrado/distorsionado horizontalmente; con
  `object-fit: contain` en cambio se ve más chico pero con la proporción correcta, nunca deformado.

- **PDF real usado**: `assets/proyectos/Practicaguianavegable_ReychellPerdomo.pdf` — 4 páginas
  carta (612×792pt), un documento de práctica de InDesign sobre el álbum "Hit Me Hard and Soft" de
  Billie Eilish, con botones de navegación dibujados en el diseño ("IR AL CONTENIDO", ">>>",
  "VOLVER AL INICIO"). **Ojo**: esos botones son solo gráficos — se verificó con `pymupdf` y con
  `pdfjs-dist` en Node que el PDF **no** tiene enlaces internos de tipo "ir a la página X" (`dest`)
  asociados a ellos. Los únicos enlaces reales que trae el archivo son 3 URLs externas (tienda de
  Billie Eilish en las páginas 2, y Spotify en la página 3) — son esos los que el visor reproduce
  como clicables, no una simulación de los botones de diseño.
- **Por qué un visor distinto al de la revista**: el pedido fue explícito — "que sea posible
  scrollear en el pdf desde afuera" (sin abrir ningún modal) — y "colocalo en paralelo con la
  revista". Un flipbook con volteo de página no es lo mismo que poder desplazarse; por eso
  `GuideViewer` (en `js/magazine.js`, junto a `MagazineViewer`) apila **todas** las páginas
  verticalmente dentro de `.guide-scroll` (un `<div>` con `overflow-y: auto` propio, así el scroll
  ocurre directamente en la tarjeta) en vez de mostrar una página/spread a la vez.
- **Carga: página 1 de inmediato, el resto en paralelo en segundo plano** (auditoría de
  rendimiento, 2026-09-28, dos vueltas):
  1. Primera versión: renderizaba las 4 páginas en serie antes de ocultar el spinner grande — como
     cada página pesa varios MB de imagen embebida, eso significaba esperar el peso completo del
     archivo (~18 MB) solo para ver la página 1.
  2. Segunda versión: se corrigió para que `loadDocument()` renderizara **solo la página 1** de
     inmediato (ocultando el spinner ahí mismo) y dejara las páginas 2+ como "placeholders" que
     solo se renderizaban al acercarse al área visible del scroll (`IntersectionObserver`,
     `rootMargin: '300px 0px'`) — pero para un documento corto (4 páginas) esto tuvo un efecto
     secundario: cada página recién empezaba a pedirse cuando el usuario llegaba desplazándose
     hasta ella, así que las últimas (3, 4) tardaban notoriamente más en aparecer que las
     primeras — el usuario reportó exactamente eso.
  3. **Versión actual**: la página 1 se sigue renderizando primero y de inmediato (mismo
     comportamiento, el spinner grande se oculta ahí), pero las páginas 2+ ya no esperan a que el
     usuario se acerque — se piden **todas a la vez, en paralelo** apenas termina la página 1
     (`Promise.all` sobre `renderPageInto()` para cada una, sin `IntersectionObserver` de por
     medio). El navegador las descarga en paralelo (HTTP/2 multiplexa varias peticiones a la vez
     sobre la misma conexión), así que para cuando el usuario llega a la página 3 o 4
     desplazándose, ya están listas o casi. Los placeholders (`createPlaceholder()`, alto
     reservado vía CSS `aspect-ratio` calculado de `page.view`, para que el scroll no salte) se
     mantienen igual — solo cambió CUÁNDO se dispara el render real de cada uno.
  El código sigue leyendo `pdfDoc.numPages` del archivo real (no hay ningún "4" hardcodeado); si
  el usuario reemplaza este PDF por uno bastante más largo en el futuro, "renderizar todo en
  paralelo apenas carga" dejaría de tener sentido (sería la misma sobrecarga que la primera
  versión, solo que en paralelo) — en ese caso, conviene volver a un render bajo demanda por
  cercanía de scroll (como tiene la revista con su caché acotada), no simplemente aumentar el
  número de páginas que se piden de una.
- **Enlaces reales del PDF, reproducidos como zonas clicables**: `page.getAnnotations()` (PDF.js)
  expone las anotaciones `subtype: 'Link'` con `url`. Cada una se posiciona con el `rect` que trae
  el propio PDF, convertido a **porcentaje** del ancho/alto de esa página (no a píxeles), usando
  `page.view` (el mediabox, `[x0,y0,x1,y1]` en puntos) como referencia — el origen de coordenadas
  de un PDF crece hacia arriba, el de CSS hacia abajo, así que el cálculo de `top` invierte el eje Y
  (`(view[3] - rectY1) / alturaPágina`). Al ser porcentajes, la posición sigue siendo correcta sin
  recalcular nada si la tarjeta cambia de tamaño (responsive, zoom del navegador, etc.). Los
  enlaces abren en pestaña nueva (`target="_blank" rel="noopener noreferrer"`), con
  `aria-label` que incluye el hostname (ej. "Abrir enlace externo (open.spotify.com)").
  **No** se asume que el PDF tenga siempre enlaces (ni de qué tipo) — el código filtra por
  `annotation.url` presente y no falla si no hay ninguno.
- **Descarga**: igual que la revista, un botón `.magazine-download` en la barra de controles
  (`href` al PDF real + `download="Guia_Navegable_ReychellPerdomo.pdf"`), fuera del visor en sí —
  no depende de que PDF.js/el documento hayan cargado.
- **Carga perezosa compartida con la revista**: ambos visores usan la misma función de módulo
  `ensurePdfJs()` en `js/magazine.js` (antes era un método de instancia de `MagazineViewer`, se
  extrajo a nivel de módulo con una promesa memoizada) — si las dos tarjetas entran en pantalla
  casi al mismo tiempo (muy probable, están una al lado de la otra), pdf.js se pide **una sola vez**
  en vez de dos veces en paralelo. Cada visor sigue disparando su propia carga de PDF (documentos
  distintos) recién cuando su propia tarjeta está a punto de entrar en pantalla
  (`IntersectionObserver`, `rootMargin: '600px 0px'`, mismo patrón que la revista).
- **Indicador de página** (`Página X de N`): no hay controles de "siguiente/anterior" como en la
  revista — el número de página actual se actualiza solo, observando con `IntersectionObserver`
  (`root: .guide-scroll`, `threshold: 0.5`) cuál `.guide-page` está más visible mientras el usuario
  se desplaza.

## Rendimiento general del sitio

- **Imágenes de proyectos: copia optimizada para mostrar en la página, original intacto solo para
  descargar** (auditoría 2026-09-28) — varias fotos de proyectos se subieron directo desde su
  fuente (renders 3D, exportes de InDesign) sin redimensionar: `Desktop_Infografia_ReychellPerdomo.jpg`
  pesaba **12 MB** (6600×5100px) para mostrarse en una tarjeta de 250px de alto. Se generó una copia
  `*_web.jpg` de cada imagen pesada (redimensionada a ~1600–2000px de lado largo, JPEG calidad
  82–85, los renders PNG con canal alfa 100% opaco pasaron a JPEG sin pérdida visible) y **solo el
  `<img src>` y el `data-src` del botón "Ver" apuntan a esa copia** — el `href download` de cada
  proyecto sigue apuntando al archivo original sin tocar, así que descargar el proyecto sigue
  entregando la calidad completa. Mismo patrón que ya se usaba para "Artículo de periódico
  editorial" y "Poster vectorizado" (ver [Descargas de proyectos](#descargas-de-proyectos)), ahora
  aplicado también a: Infografía (12 MB → 460 KB), Poster "Dark" (1.5 MB → 212 KB), ilustración
  Spider-Man (1.2 MB → 372 KB) y los 3 renders del Robot Steampunk (2–3.3 MB cada uno → 100–184 KB,
  además convertidos de PNG a JPEG). **Si se reemplaza alguno de estos archivos en el futuro**, hay
  que regenerar su `_web.jpg` a mano (redimensionar + recomprimir) — no hay ningún paso de build
  que lo haga solo; los scripts usados fueron ad-hoc con Pillow, no quedaron guardados en el repo.
- **El visor de revista (PDF.js) ya no carga hasta que hace falta**: antes se inicializaba
  apenas cargaba la página (aunque el usuario nunca bajara hasta Proyectos), descargando ~1MB de
  PDF.js de una vez. Ahora `bindLazyInit()` en `js/magazine.js` usa un `IntersectionObserver`
  (`rootMargin: '600px'`) y solo dispara `loadLibraryThenDocument()` cuando la tarjeta está a
  punto de entrar en pantalla.
- **Imágenes de proyectos con `loading="lazy" decoding="async"`**: todas las fotos de
  `.project-card` (los 6 proyectos + los 3 renders del robot) — antes se descargaban todas de
  inmediato aunque estuvieran muy abajo en la página; ahora, además de diferirse, ya pesan poco
  gracias al punto anterior (`*_web.jpg`). El logo del navbar y el banner del hero se dejaron sin
  `lazy` a propósito porque están arriba del todo (cargarlos diferido solo los retrasaría sin
  necesidad).
- **Font Awesome y Google Fonts ya no bloquean el primer render**: se cambiaron de
  `rel="stylesheet"` directo a `rel="preload"` + `onload` que cambia el `rel` a `stylesheet` (con
  `<noscript>` de respaldo si JS está desactivado). Es seguro aquí porque el hero es una sola
  imagen sin texto — nada por encima del pliegue depende de esas fuentes/íconos para verse bien de
  inmediato.
- `will-change: transform` en `.magazine-flip-leaf` para que el navegador prepare la capa antes de
  animar el volteo (menos probabilidad de "tirón" en el primer frame de la animación).
- Antes de esto ya estaba resuelto (ver más arriba, auditoría 2026-08-26): sin listeners de
  `scroll`, animaciones limitadas a `transform`/`opacity`, `backdrop-filter` solo en navbar/menú
  móvil/modal, fondo animado infinito eliminado.

## Publicación en GitHub Pages con dominio personalizado

Preparado para que la subida a GitHub no rompa nada:

- Todas las rutas de assets son relativas y usan `/` (case-sensitive, como Linux).
- `.nojekyll` en la raíz evita que GitHub Pages intente procesar el sitio con Jekyll.
- El favicon usa el logo SVG existente (`assets/proyectos/LogoPersonalReychellPerdomo.svg`) en vez
  de un `favicon.ico` que no existía en el proyecto.
- **Dominio personalizado: `reychellperdomo.lat`**. Ya existe el archivo `CNAME` en la raíz del
  repo con ese dominio (commit `6149a79`). Repositorio real:
  `https://github.com/ReychellFrontEnd/MyPortfolio` (dueño/organización `ReychellFrontEnd`, no
  `ReychellPerdomo`) → el dominio de Pages por defecto es `reychellfrontend.github.io`.
- **Importante — el dominio ya tenía un sitio en vivo**: `reychellperdomo.lat` estaba (y puede que
  siga estando, según DNS) sirviendo un **WordPress en Hostinger** (tema Astra) en el momento de
  conectar el dominio a GitHub Pages. El usuario confirmó explícitamente que quería reemplazarlo.
  Si en el futuro el dominio "deja de funcionar" o vuelve a mostrar el WordPress, revisar primero
  si el DNS se revirtió antes de asumir que es un bug del portafolio.
- **DNS necesario en Hostinger** (nameservers `ns1/ns2.hostinginbox.com`) para que el dominio
  apunte a GitHub Pages en vez de al hosting de Hostinger:
  - Registro `A` en `@` (raíz) → las 4 IPs de GitHub Pages: `185.199.108.153`, `185.199.109.153`,
    `185.199.110.153`, `185.199.111.153` (reemplazando cualquier `A` existente, ej. `50.31.174.166`
    que apuntaba al WordPress).
  - (Opcional, IPv6) `AAAA` en `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`,
    `2606:50c0:8002::153`, `2606:50c0:8003::153`.
  - `CNAME` en `www` → `reychellfrontend.github.io.` (con el punto final).
  - Esto no se pudo hacer desde aquí (requiere entrar al panel de Hostinger) — quedó como
    instrucción para el usuario.
- Después de que el DNS propague y GitHub verifique el dominio (Settings → Pages), activar
  "Enforce HTTPS" — tarda un rato en aparecer disponible tras la verificación (GitHub emite el
  certificado TLS automáticamente).

## Notas de la sesión (2026-08-25/26)

- Correo de destino del formulario confirmado por el usuario: **`reychellperdomo@gmail.com`** (sin
  punto entre "reychell" y "perdomo" — la dueña del portafolio), no el correo de quien opera esta
  sesión de Claude Code. Corregido en `index.html` (texto visible de contacto) después de que el
  usuario detectara que se había escrito con un punto de más.
- El usuario pidió explícitamente **no publicar/subir nada** — todos los cambios quedan solo en
  el working directory local para que los revise y pruebe manualmente antes de subirlos a GitHub.
