# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Todo en **español de España**: código de cara al usuario, comentarios, commits y respuestas.

## Qué es esto

Portfolio **personal** de José Manuel Babaciu Gheorghiu, desarrollador full-stack
en Sevilla. No es la web de un cliente ni una maqueta comercial.

**Restricción innegociable:** esta web es personal y va desvinculada de
cualquier empleador, marca o cliente. Ni marcas ajenas, ni correos de empresa,
ni localidades de clientes como mercado. El contacto es
`josemanuelbabaciugheorghiu@gmail.com` y la firma es su nombre propio. Los
nombres concretos que hay que evitar están en la memoria privada de la sesión,
no aquí: **este repositorio es público** y nombrarlos sería vincularlos.

Las decisiones del proyecto, con su porqué, están en `docs/brief.md`. **Léelo
antes de cambiar contenido o alcance**: ahí está escrito por qué no hay tabla
de tarifas, qué proyectos se descartaron y cuáles no se pueden enseñar. `docs/`
está en `.gitignore` porque el repositorio es público: el brief vive solo en
local. Si en un clon nuevo no existe, pregunta al usuario antes de inventarte
el alcance.

## Reglas duras

- **Sin build, sin npm, sin framework, sin CDN.** Se abre, se edita y se sube.
  GSAP, Three.js y las dos tipografías están descargados en `assets/`
  precisamente para que `_headers` pueda mantener `default-src 'self'`. Meter
  un tercero obliga a abrir esa línea: no se hace de paso. (GitHub Pages, donde
  está publicada ahora, ignora `_headers`; la regla de cero terceros se mantiene
  igual, y la CSP entrará en vigor si se mueve a Cloudflare.)
- **Nunca inventes un dato.** Ni cifras de experiencia, ni clientes, ni
  testimonios, ni proyectos. Si falta algo va con `class="pendiente"`, que es
  un marcador amarillo visible a propósito. El portfolio anterior afirmaba
  doce proyectos y tres años de experiencia sin respaldo: eso no se hereda.
- **Todo el contenido vive en `assets/datos.js`.** Es el único fichero que se
  toca para cambiar textos, proyectos o contacto. No metas contenido en el
  HTML ni en el CSS.
- **No borres `.nojekyll`.** Sin él, GitHub Pages pasa el repositorio por
  Jekyll, que renderiza todos los `.md` con Liquid y aborta el despliegue
  entero con cualquier `{{` que encuentre. Ya pasó: el `grep "{{"` de la
  sección de comandos de este mismo archivo tumbó el primer build. Con
  `.nojekyll`, Pages sirve los ficheros tal cual, que es lo que queremos.
- **Al tocar `estilos.css` o `app.js`, sube el `?v=N` de todos los HTML.** Si
  no, el navegador sirve la versión vieja y parece que el cambio no hizo nada.
  `sed -i 's/?v=1/?v=2/g' *.html`

## Arquitectura

Una sola página (`index.html`) con anclas, más `404.html`, `gracias.html` (sin
enlazar, preparada por si se añade un formulario) y `privacidad.html`.

### datos.js → app.js → HTML

`assets/datos.js` define `DATOS`, `IDIOMAS` y `IDIOMA_POR_DEFECTO` como globales.
`assets/app.js` los lee y rellena el HTML buscando atributos `data-*`. El HTML
no tiene marcadores de plantilla: trae el contenido en español ya escrito y el
JS lo sustituye.

Cada texto de cara al público es un objeto `{ es: "...", en: "..." }`. El helper
`t(valor)` del `app.js` resuelve el idioma activo y acepta también cadenas
sueltas, para los datos que no se traducen (nombres propios, stacks). **Añadir
un idioma es añadir su clave en `datos.js` y su código en `IDIOMAS`**: ni
`app.js` ni el HTML se tocan.

`pintarTodo()` es el único punto de entrada del repintado. Cambiar de idioma lo
llama entero.

### Las dos dimensiones de estado

Viven en `estado` dentro de `app.js` y se guardan en `localStorage` (siempre
envuelto en `try/catch`: puede fallar en modo privado).

1. **Idioma** (`idioma`). Orden de prioridad: elección manual guardada, luego
   `navigator.languages`, luego español. La elección manual manda siempre.
2. **Público** (`publico`): `neutro`, `negocio` o `tecnico`. Lo elige el
   visitante con el selector del héroe. `neutro` es el estado por defecto y
   **enseña todo**, que es lo correcto para quien llega de un buscador.

El público controla dos cosas: qué juego de textos del héroe se pinta
(`DATOS.heroe[publico]`) y qué secciones se ocultan. Una sección o un enlace de
navegación con `data-solo="negocio"` desaparece solo si el visitante eligió
`tecnico`, y al revés. Volver a pulsar el botón activo devuelve a `neutro`.

### Degradación en cascada

Cada escalón añade y ninguno es imprescindible. Al tocar `app.js`, mantenlo:

1. **Sin JavaScript:** se leen el héroe, los títulos de sección, el contacto y
   el pie, en español. Los listados no salen. Hay un `<noscript>` que lo avisa.
2. **Con JS y sin GSAP:** todo el contenido, apariciones con `IntersectionObserver`.
3. **Con GSAP:** apariciones encadenadas con ScrollTrigger. Al activarse se
   añade la clase `gsap` al `<html>`, que anula la transición CSS de `.revelar`
   para que no pelee con la animación por fotogramas.
3b. **Trampa de GSAP, ya pisada una vez:** nunca uses `gsap.from()` para
   contenido real. Deja el elemento en opacidad 0 nada más declararse, así que
   si el tween no llega a correr (pestaña en segundo plano, `requestAnimationFrame`
   estrangulado, captura automática) media página se queda invisible. Usa
   `fromTo()`, que escribe el estado final, y deja puesta la red de seguridad
   por `setTimeout` que ya hay en `entradaHeroe()` y en `revelar()`.
4. **Con Three.js:** un icosaedro de alambre en el héroe. Se importa de forma diferida
   (789 KB entre sus dos ficheros) y **no se carga** con `prefers-reduced-motion`,
   por debajo de 760 px, con ahorro de datos o con menos de 4 núcleos. Si no
   carga, queda el degradado CSS y no se pierde nada.

   Dos icosaedros concéntricos en `LineSegments`: el exterior en tinta muy
   tenue y el interior en amarillo. Giran despacio y siguen al ratón. Está
   detrás de la ficha, desplazado arriba y a la derecha para no pisar el
   texto. Solo se carga por encima de 1000 px, que es cuando la ficha tiene
   columna propia.

`three.module.min.js` importa `./three.core.min.js`: el import interno está
parcheado respecto al original de cdnjs, que apunta a `three.core.js`.

### La dirección de diseño: ficha técnica impresa

Papel claro, tinta negra y **un solo amarillo, que es superficie y nunca
texto** (sobre papel no llega a 2:1; con tinta negra encima da 11,5:1). La
composición la hace la tipografía: el nombre enorme en dos pesos, columnas
de metadatos en monoespaciada (`.ficha`), secciones numeradas con el título
grande en la columna derecha, reglas finas y una rejilla de doce columnas al
fondo (`.papel-rejilla`).

Lo que **no** hay, a propósito, porque es la plantilla por defecto de
cualquier generador y era lo que había antes: fondo oscuro, tarjetas de
cristal, resplandores, manchas de color, partículas. Si alguien pide "más
vistoso", la respuesta es más idea tipográfica, no más efectos.

Los trabajos son **una lista editorial** (`.obras`), no una rejilla de
tarjetas: filas con índice, nombre grande, tipo, stack y flecha. Con puntero
fino la fila se vuelve amarilla y la portada del proyecto sigue al cursor
(`.obra-vista`, movida con `gsap.quickTo`). Sin puntero fino o por debajo de
860 px la portada va dentro de la fila (`.obra__media`). Las cuatro portadas
de `assets/fotos/portada-*.jpg` son **generadas, no capturas**, y su `alt` lo
dice; se cambian por capturas reales cuando existan.

### CSS

`assets/estilos.css` con tokens en `:root`, sección numerada en el índice de la
cabecera y clases BEM en español (`.cabecera__interior`, `.proyecto__nombre`).

Paleta negro, blanco y amarillo. Hay **dos grises de línea** y la distinción
importa: `--linea` es decorativa (1,42:1) y solo vale para separadores;
`--linea-control` (3,55:1) es la que debe llevar el borde de todo lo que se
pulsa, para cumplir el mínimo de 3:1 de la WCAG 1.4.11. Las cifras de contraste
medidas están anotadas en la cabecera del fichero: **si cambias un color,
vuelve a medirlas**.

## Comandos

```bash
# Servidor local. Hace falta: la escena del héroe es un módulo ES y el
# navegador lo bloquea sobre file://
python -m http.server 8080

# Sintaxis de los dos ficheros JS propios
node --check assets/datos.js && node --check assets/app.js

# Marcadores de plantilla que se hayan quedado sin sustituir
grep -rn "{{" --include="*.html" --include="*.css" --include="*.js" . | grep -v "^./assets/lib/"

# Datos que faltan: el marcador amarillo
grep -rn 'class="pendiente"' *.html assets/app.js

# Desplegar: GitHub Pages sirve la rama main desde la raíz, así que
# desplegar es hacer push. La web queda en https://josemanuelbg.github.io/Portfolio/
# bajo el subdirectorio /Portfolio/: por eso 404.html lleva rutas absolutas
# con ese prefijo y el manifest usa rutas relativas.
git push origin main
```

### Probar en el navegador

No hay Playwright ni Puppeteer, pero Chrome vale en modo headless:

```bash
CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe"

# DOM después de ejecutar el JS: sirve para comprobar que los listados se pintan
"$CHROME" --headless=new --disable-gpu --virtual-time-budget=6000 \
  --dump-dom http://127.0.0.1:8080/ > dom.html

# Captura
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --virtual-time-budget=8000 --window-size=1440,2500 \
  --screenshot="C:\\ruta\\absoluta\\captura.png" http://127.0.0.1:8080/
```

**Cuidado con el ancho:** `--window-size` **no baja de unos 520 px**, así que
una captura pedida a 400 px sale recortada y parece que hay desbordamiento
horizontal cuando no lo hay. Para probar móvil de verdad, mete la página en un
`<iframe>` de 400 px dentro de una página envoltorio y mide desde el padre
(mismo origen, así que se puede entrar al `contentDocument`).

En Windows, `convert` **no es ImageMagick**: para imágenes, usa Pillow desde
Python.

## Pendientes conocidos

Están en el README y marcados en el código. Los que condicionan el trabajo:

- Cuatro capturas de proyecto. Solo hay la real de Vending Inc.; el resto pinta
  un marcador con la medida (1244 × 705 px).
- El retrato es el avatar de GitHub, una foto de carnet de baja resolución.
- CV en PDF: `perfil.cv` vacío hace que se pinte el marcador amarillo.
- Dominio propio. Las URL absolutas de `index.html`, `sitemap.xml` y
  `robots.txt` apuntan a `josemanuelbg.github.io/Portfolio/`. Al cambiar de
  dominio hay que tocar también las rutas absolutas de `404.html`.
- El NIF del aviso legal, antes del primer encargo.
- `docs/` está fuera del repo (`.gitignore`) porque es público y el brief
  explica por qué se descartan proyectos ajenos. No lo saques del ignore.
- El número de forks de agencyos en `datos.js` cambia solo: repasarlo antes de
  enseñar la web.
