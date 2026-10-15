# Portfolio de José Manuel Babaciu Gheorghiu

Web personal. Desarrollador full-stack en Sevilla.

**Verla:** https://josemanuelbg.github.io/Portfolio/

HTML, CSS y JavaScript a secas. **Sin build, sin `npm install`, sin CDN**: las
tipografías, GSAP y Three.js van servidos desde `assets/`, así que la web
funciona sin conexión abriendo `index.html` y no entrega la IP de nadie a
terceros.

## Estructura

```
index.html            La web, de una sola página
privacidad.html       Aviso legal y privacidad
404.html              Página de error
gracias.html          Sin enlazar: preparada por si se añade un formulario
assets/
  datos.js            Textos, proyectos y contacto: lo único editable
  estilos.css         Sistema visual
  app.js              Idioma, selector de público, pintado y animaciones
  fuentes/            Space Grotesk y JetBrains Mono (woff2, latino)
  lib/                GSAP, ScrollTrigger y Three.js autoalojados
  fotos/              Capturas de los proyectos
  img/                Favicon, iconos, retrato y vista previa
docs/                 Brief del proyecto. Solo en local: está en .gitignore
```

## Acabado

Acabado de cristal: paneles translúcidos con borde fino sobre un fondo de
manchas amarillas y grano. El héroe lleva una cortina de puntos en Three.js
que se carga **después** de la primera pintura y se apaga sola con movimiento
reducido, en pantalla estrecha o con ahorro de datos.

| Qué | Peso |
|---|---|
| Carga inicial sin imágenes | 221 KB |
| Captura de Vending Inc. | 117 KB |
| Three.js, solo después | 789 KB |

## Cómo se toca

Todo el contenido está en **`assets/datos.js`**. Cada texto va como
`{ es: "...", en: "..." }`. Para añadir un idioma, añade su clave ahí y mete
el código en `IDIOMAS`: ni `app.js` ni el HTML hay que tocarlos.

## En local

```
python -m http.server 8080
```

Con doble clic en `index.html` también funciona casi todo, pero la escena del
héroe usa un módulo de JavaScript y el navegador lo bloquea sobre `file://`.
Para verla entera, levanta el servidor.

## Desplegar

GitHub Pages sirve la rama `main` desde la raíz. Desplegar es hacer push:

```
git push origin main
```

La web cuelga de `/Portfolio/`, no de la raíz del dominio. Por eso `404.html`
lleva rutas absolutas con ese prefijo y el manifest usa rutas relativas. Si
algún día se mueve a un dominio propio, hay que cambiar las URL absolutas de
`index.html`, `sitemap.xml`, `robots.txt` y `404.html`.

`_headers` no hace nada en GitHub Pages: se conserva por si se pasa a
Cloudflare Pages, donde sí aplicaría la política de seguridad.

## Al tocar el CSS o el JS: subir la versión

Los assets se piden con `?v=N`. Si cambias `estilos.css` o `app.js` y no subes
ese número en todos los HTML, el navegador sirve la versión vieja y parece que
el cambio no ha hecho nada.

```
sed -i 's/?v=1/?v=2/g' *.html
```

## Pendientes

- Foto decente que sustituya al avatar de carnet de `assets/img/retrato.jpg`.
- CV en PDF en `assets/`, y activarlo en `datos.js` (`perfil.cv`).
- Comprar el dominio y actualizar las URL absolutas de `index.html`,
  `sitemap.xml` y `robots.txt`.
- El NIF del aviso legal, antes del primer encargo.
- Pasar a un dominio propio con Cloudflare Pages, donde `_headers` y su
  política de seguridad entrarían en vigor.
