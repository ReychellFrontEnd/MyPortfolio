# Portafolio Multimedia — Reychell Perdomo

Sitio estático (HTML/CSS/JS puro, sin build ni dependencias de Node) para el portafolio de
Reychell Perdomo, estudiante de Tecnólogo en Multimedia (ITLA). Pensado para publicarse en
**GitHub Pages** con un dominio personalizado.

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
`Reflexión` (`#reflexion`) → `Contacto` (`#contacto`).

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
- Filtro nuevo: `data-filter="3d"` / `data-category="3d"` (antes solo existían branding,
  illustration, web, animation).
- `@media (hover: none)` hace que el overlay (Ver/Descargar) quede siempre visible en pantallas
  táctiles, ya que ahí no existe `:hover` — aplica a **todas** las project-card (incluyendo los
  paneles del tríptico), corrigiendo que en móvil antes no se podía acceder a esos botones.

### Gotcha de CSS: `.reveal.is-visible` vs. el hover de las tarjetas

`.reveal`/`.reveal.is-visible` (el scroll-reveal) y cada `.identity-card:hover` /
`.project-card:hover` / `.reflection-card:hover` / `.contact-info:hover` tienen la **misma
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
- Se eliminó `backdrop-filter` de las tarjetas repetidas (identity/project/reflection-card, inputs,
  modal-details) por costo de rendimiento; se conserva solo en elementos "de chrome" (navbar, menú
  móvil, modal) donde aporta jerarquía real.
- Se eliminó la animación infinita de fondo en `.dark-section::before` (rotaba cada 20s sin parar)
  y el efecto "barrido" de gradiente en hover de botones/filtros — eran puramente decorativos y
  costosos; el feedback ahora es `transform`/`box-shadow` con `:active` para respuesta instantánea
  al presionar.
- **Scroll-reveal**: elementos con clase `reveal` (tarjetas de Identidad/Proyectos/Reflexión) se
  animan una sola vez vía `IntersectionObserver` (`js/script.js`) al entrar en pantalla, sin
  listeners de `scroll`.
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
- Todos los íconos puramente decorativos (`<i class="fa...">`) llevan `aria-hidden="true"`; los
  enlaces de redes sociales (aún apuntan a `#`, son placeholders) tienen `aria-label` con el nombre
  de la red.
- Los botones de filtro de proyectos exponen `aria-pressed`, sincronizado en cada click.
- Foco de teclado visible y consistente en toda la interfaz vía `--focus-ring` (regla global
  `:focus-visible`), en vez de depender del contorno por defecto del navegador (que estaba
  deshabilitado sin reemplazo antes de esta auditoría).

## Sección Contacto

`.contact-info` y `.contact-form` ahora son tarjetas reales (fondo, borde, radio, sombra y
`translateY` al hover) — antes eran texto/formulario sueltos directamente sobre el fondo de la
página, lo que el usuario describió como "descuidado". Cada dato de contacto usa `.contact-icon`
(insignia circular, mismo patrón visual que `.identity-icon`/`.reflection-icon`) en vez de un
ícono suelto. El email es un link `mailto:` real. Los inputs del formulario usan un fondo más
oscuro que la tarjeta que los contiene (`rgba(8,14,32,0.55)` vs. `rgba(16,30,66,0.65)` de la
tarjeta) para leerse como campos hundidos, no confundirse con el fondo de la tarjeta.

## Revista digital interactiva (flipbook)

Proyecto 8 dentro de Proyectos: `.project-card.project-magazine` (mismo ancho/tamaño de tarjeta
que `.project-triptych` — 70%, máx. 780px, centrado — a pedido explícito del usuario). La franja
inferior (`.project-details`) es deliberadamente delgada: solo `<h3>` con el nombre y un `<p>` con
el año, sin curso/herramientas como las demás tarjetas.

- **PDF real usado**: `assets/proyectos/ReVibe_ReychellPerdomo_20241104(1).pdf` (el usuario lo
  confirmó explícitamente). El paréntesis en el nombre va codificado como `%28`/`%29` en el
  `data-pdf` y en el `href` de descarga. Ese PDF tiene **64 páginas** según se verificó con
  `pypdf` — el pedido original mencionaba "87 páginas", pero el número de páginas nunca está
  hardcodeado en el código: `js/magazine.js` lee `pdfDoc.numPages` del archivo real, así que
  cualquier PDF que se ponga en esa ruta funciona sin tocar el JS.
- **Arquitectura**: `PDF.js` (cargado perezosamente desde cdnjs solo cuando existe un
  `[data-magazine]` en la página, no en el `<head>`) renderiza páginas a un `<canvas>` **bajo
  demanda**, con caché acotada (`MAX_CACHE_PAGES` en `js/magazine.js`) y precarga de las páginas
  vecinas en `requestIdleCallback`. Nunca se renderizan todas las páginas a la vez.
- **Volteo de página**: implementado a mano con CSS 3D (`.magazine-flip-leaf`, dos caras con
  `backface-visibility: hidden`, una pre-rotada 180° en reposo — técnica estándar de "flip card"),
  no con una librería de flipbook de terceros (el usuario pidió inspirarse en el visor "FlipBook"
  de dFlip/dearFlip que usa intec.edu.do, pero se implementó el efecto propio, no esa librería).
- **Spread de 2 páginas abiertas** (`.magazine-spread`: `.magazine-page-left` + `.magazine-spine`
  + `.magazine-page-right`) en pantallas >900px, para que se sienta como un libro real — a pedido
  explícito del usuario tras la primera versión (que solo mostraba una página). Empareja páginas
  como (1,2) (3,4) (5,6)... (`getSpread()` en `js/magazine.js`); es una simplificación deliberada
  frente a la convención real de libro (portada sola + interior en pares) para no arriesgar bugs de
  paridad sin poder probarlo en un navegador real. El volteo anima **todo el spread como una sola
  pieza**, rotando sobre su propio centro (el lomo) — más simple y confiable que animar cada página
  contra el lomo por separado. En `≤900px` (mismo quiebre que el resto del sitio) cae a una sola
  página (`root.classList('is-single')`, ver `SINGLE_MODE_QUERY` en el JS), reevaluado en vivo con
  un listener de `matchMedia` — no hace falta recargar la página para que cambie de modo.
  Ver el comentario al inicio de `js/magazine.js` para el resto de las decisiones de alcance (sin
  pinch-to-zoom táctil, zoom por `transform: scale()` en vez de re-render de PDF.js, etc.).
- **Bug encontrado y corregido (pantalla de carga trabada en 100%)**: el progreso de descarga podía
  llegar a 100% mientras pdf.js seguía interpretando el archivo (o mientras el Worker fallaba en
  silencio), dejando el spinner pegado para siempre. Se corrigió con: (1) el Worker de pdf.js se
  carga como Blob same-origin (`fetchAsBlobUrl`) en vez de apuntar directo a la URL del CDN — un
  `new Worker()` con script de otro origen puede fallar según navegador/contexto (ej. abriendo el
  sitio con `file://` en vez de un servidor); (2) un aviso de "casi listo" a los 6s si sigue
  cargando; (3) un salvavidas de 45s que muestra un mensaje accionable sin abortar la carga real
  (si termina después, el visor igual aparece). **Recomendación para probarlo**: abrir el sitio con
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
- **El PDF pesa 88 MB** — es, con diferencia, el mayor factor de qué tan rápido carga. Ya se
  ajustó lo que se puede desde el código (`disableAutoFetch: true` para no traer el archivo
  completo de una, `devicePixelRatio` tope 1.5 y menos margen de resolución al renderizar). Lo que
  de verdad reduciría el tiempo de carga es exportar el PDF más liviano desde InDesign (preset
  "Smallest File Size" o bajar la resolución de las imágenes) — no se tocó el PDF en sí porque es
  contenido del usuario y recomprimirlo a ciegas arriesga perder calidad visual.
- **Pendiente**: el usuario mencionó una revista de 87 páginas; el archivo real que indicó tiene
  64. Si en algún momento aparece un PDF distinto de 87 páginas, basta con reemplazar el archivo en
  `assets/proyectos/` y actualizar el `data-pdf`/`href` en `index.html` — no hace falta tocar
  `js/magazine.js`.

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
