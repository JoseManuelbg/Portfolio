/* ==========================================================================
   Portfolio de José Manuel — pinta la web a partir de datos.js
   Sin dependencias externas. Todo lo editable está en datos.js.

   Degradación en cascada:
     1. Sin JavaScript: héroe, títulos, contacto y pie, en español.
     2. Con JS y sin GSAP: todo el contenido, apariciones con IntersectionObserver.
     3. Con GSAP: entrada del héroe por líneas, apariciones con ScrollTrigger y
        la portada que sigue al cursor en la lista de trabajos.
     4. Con Three.js y sin movimiento reducido: icosaedro de alambre en el héroe.

   Índice
   01 · Utilidades
   02 · Idioma
   03 · Selector de público
   04 · Cinta de aviso
   05 · Cabecera y menú
   06 · Pintado del contenido
   07 · Banda amarilla
   08 · Aparición al hacer scroll
   09 · Entrada del héroe
   10 · Portada que sigue al cursor
   11 · Escena 3D (diferida)
   12 · Arranque
   ========================================================================== */

(function () {
  "use strict";

  const d = document;
  const $ = (s, ctx = d) => ctx.querySelector(s);
  const $$ = (s, ctx = d) => [...ctx.querySelectorAll(s)];

  /* ---------- 01 · Utilidades ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const almacen = {
    leer(k) { try { return localStorage.getItem(k); } catch { return null; } },
    escribir(k, v) { try { localStorage.setItem(k, v); } catch { /* da igual */ } }
  };

  const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const punteroFino = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

  const estado = { idioma: IDIOMA_POR_DEFECTO, publico: "neutro", arrancado: false };

  function t(valor) {
    if (valor == null) return "";
    if (typeof valor === "string") return valor;
    return valor[estado.idioma] ?? valor[IDIOMA_POR_DEFECTO] ?? "";
  }

  /* ---------- 02 · Idioma ---------- */
  function idiomaInicial() {
    const guardado = almacen.leer("idioma");
    if (guardado && IDIOMAS.includes(guardado)) return guardado;
    const navegador = (navigator.languages || [navigator.language || ""])
      .map((l) => String(l).slice(0, 2).toLowerCase())
      .find((l) => IDIOMAS.includes(l));
    return navegador || IDIOMA_POR_DEFECTO;
  }

  function ponerIdioma(idioma, guardar) {
    estado.idioma = IDIOMAS.includes(idioma) ? idioma : IDIOMA_POR_DEFECTO;
    if (guardar) almacen.escribir("idioma", estado.idioma);
    d.documentElement.lang = estado.idioma;
    pintarTodo();
  }

  function botonIdioma() {
    const btn = $("[data-idioma]");
    if (!btn) return;
    btn.addEventListener("click", () => {
      ponerIdioma(IDIOMAS[(IDIOMAS.indexOf(estado.idioma) + 1) % IDIOMAS.length], true);
    });
  }

  /* ---------- 03 · Selector de público ---------- */
  function ponerPublico(publico, guardar) {
    const antes = estado.publico;
    estado.publico = ["negocio", "tecnico"].includes(publico) ? publico : "neutro";
    if (guardar) almacen.escribir("publico", estado.publico);
    d.documentElement.dataset.publico = estado.publico;

    $$("[data-publico-boton]").forEach((b) => {
      const activo = b.dataset.publicoBoton === estado.publico;
      b.classList.toggle("selector__boton--activo", activo);
      b.setAttribute("aria-pressed", String(activo));
    });
    $$("[data-solo]").forEach((sec) => {
      sec.hidden = !(estado.publico === "neutro" || sec.dataset.solo === estado.publico);
    });

    pintarHeroe();
    pintarNav();
    if (antes !== estado.publico && window.gsap && !sinMovimiento()) {
      window.gsap.fromTo("[data-heroe-texto]", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", clearProps: "all" });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
  }

  function selector() {
    $$("[data-publico-boton]").forEach((b) => {
      b.addEventListener("click", () => {
        ponerPublico(b.dataset.publicoBoton === estado.publico ? "neutro" : b.dataset.publicoBoton, true);
      });
    });
  }

  /* ---------- 04 · Cinta de aviso ---------- */
  function pintarAviso() {
    const aviso = $("[data-aviso]");
    if (!aviso) return;
    aviso.hidden = !DATOS.AVISO.visible || almacen.leer("aviso") === "no";
    const texto = $("span", aviso);
    if (texto) texto.textContent = t(DATOS.AVISO.texto);
  }
  function cerrarAviso() {
    d.addEventListener("click", (ev) => {
      if (!ev.target.closest("[data-cerrar-aviso]")) return;
      almacen.escribir("aviso", "no");
      const aviso = $("[data-aviso]");
      if (aviso) aviso.hidden = true;
    });
  }

  /* ---------- 05 · Cabecera y menú ---------- */
  function cabecera() {
    const btn = $("[data-menu-boton]"), nav = $("[data-nav]");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      const abierto = nav.classList.toggle("nav--desplegado");
      btn.setAttribute("aria-expanded", String(abierto));
    });
    nav.addEventListener("click", (ev) => {
      if (!ev.target.closest("a")) return;
      nav.classList.remove("nav--desplegado");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- 06 · Pintado del contenido ---------- */
  function pintarPerfil() {
    const p = DATOS.perfil;
    const apellidos = p.nombre.replace(p.nombreCorto, "").trim();
    $$("[data-nombre]").forEach((el) => { el.textContent = p.nombre; });
    $$("[data-nombre-corto]").forEach((el) => { el.textContent = p.nombreCorto; });
    $$("[data-apellidos]").forEach((el) => { el.textContent = apellidos; });
    $$("[data-ubicacion]").forEach((el) => { el.textContent = t(p.ubicacion); });
    $$("[data-anio]").forEach((el) => { el.textContent = new Date().getFullYear(); });
    $$("[data-experiencia]").forEach((el) => { el.textContent = t(DATOS.textos.experiencia); });
    $$("[data-email]").forEach((el) => {
      el.href = "mailto:" + p.email;
      if (el.hasAttribute("data-email-texto")) el.textContent = p.email;
    });
    $$("[data-github]").forEach((el) => { el.href = "https://github.com/" + p.github; });
    $$("[data-linkedin]").forEach((el) => { el.href = "https://www.linkedin.com/in/" + p.linkedin + "/"; });
    $$("[data-codepen]").forEach((el) => { el.href = "https://codepen.io/" + p.codepen; });
    const foto = $("[data-foto]");
    if (foto) foto.alt = t(p.fotoAlt);

    const cv = $("[data-cv]");
    if (cv) {
      const ruta = p.cv[estado.idioma] || p.cv[IDIOMA_POR_DEFECTO] || "";
      cv.outerHTML = ruta
        ? `<a data-cv href="${esc(ruta)}" download>${esc(t(DATOS.textos.botones.cv))}</a>`
        : `<span class="pendiente" data-cv>${esc(t(DATOS.textos.cvPendiente))}</span>`;
    }

    const ficha = $("[data-ficha]");
    if (ficha && DATOS.ficha) {
      ficha.innerHTML = DATOS.ficha.map((f) => `
        <div class="ficha__fila"><dt>${esc(t(f.clave))}</dt><dd>${esc(t(f.valor))}</dd></div>`).join("");
    }
  }

  function pintarHeroe() {
    const h = DATOS.heroe[estado.publico] || DATOS.heroe.neutro;
    const tit = $("[data-heroe-titulo]"), ent = $("[data-heroe-entrada]");
    if (tit) tit.textContent = t(h.titulo);
    if (ent) ent.textContent = t(h.entrada);
    const preg = $("[data-selector-pregunta]");
    if (preg) preg.textContent = t(DATOS.selector.pregunta);
    $$("[data-selector-texto]").forEach((el) => {
      const clave = el.dataset.selectorTexto;
      if (DATOS.selector[clave]) el.textContent = t(DATOS.selector[clave]);
    });
  }

  function pintarNav() {
    const n = DATOS.textos.nav;
    $$("[data-nav-clave]").forEach((el) => { if (n[el.dataset.navClave]) el.textContent = t(n[el.dataset.navClave]); });
  }

  function pintarSecciones() {
    const s = DATOS.textos.secciones;
    $$("[data-texto]").forEach((el) => { if (s[el.dataset.texto]) el.textContent = t(s[el.dataset.texto]); });
    const b = DATOS.textos.botones;
    $$("[data-boton]").forEach((el) => { if (b[el.dataset.boton]) el.textContent = t(b[el.dataset.boton]); });
    const btnIdioma = $("[data-idioma]");
    if (btnIdioma) {
      btnIdioma.textContent = t(DATOS.textos.idioma);
      btnIdioma.setAttribute("aria-label", t(DATOS.textos.idiomaEtiqueta));
    }
    const cuenta = $("[data-cuenta-proyectos]");
    if (cuenta && DATOS.proyectos) cuenta.textContent = "/ " + String(DATOS.proyectos.length).padStart(2, "0");
  }

  /* Lista editorial: cada proyecto es una fila. El enlace principal es la web
     si existe y, si no, el repositorio. Con los dos, el repositorio va en un
     enlace secundario debajo. */
  function pintarProyectos() {
    const cont = $("[data-proyectos]");
    if (!cont || !DATOS.proyectos) return;
    const b = DATOS.textos.botones;
    cont.innerHTML = DATOS.proyectos.map((p, i) => {
      const principal = p.web || p.repo || "#contacto";
      const externo = /^https?:/.test(principal) ? ' target="_blank" rel="noopener"' : "";
      const metricas = (t(p.metricas) || []).map((x) => `<li>${esc(x)}</li>`).join("");
      const medio = p.imagen
        ? `<img class="obra__media" src="${esc(p.imagen)}" alt="${esc(t(p.imagenAlt))}" loading="lazy" decoding="async" width="1244" height="705">`
        : "";
      const secundario = (p.web && p.repo)
        ? `<p class="obra__secundario"><a class="enlace-flecha" href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(t(b.repo))}<span class="oculto-visual"> · ${esc(p.nombre)}</span></a></p>`
        : "";
      return `
      <li class="obra revelar">
        <a class="obra__enlace" href="${esc(principal)}"${externo} data-imagen="${esc(p.imagen || "")}">
          <span class="obra__indice">${String(i + 1).padStart(2, "0")}</span>
          <span class="obra__nombre">${esc(p.nombre)}</span>
          <span class="obra__tipo">${esc(t(p.tipo))}</span>
          <span class="obra__stack">${esc((p.stack || []).join(" / "))}</span>
          <span class="obra__flecha" aria-hidden="true">↗</span>
          ${medio}
          <span class="obra__detalle">
            <span class="obra__resumen">${esc(t(p.resumen))}</span>
            <ul class="obra__metricas">${metricas}</ul>
          </span>
        </a>
        ${secundario}
      </li>`;
    }).join("");
  }

  function pintarServicios() {
    const cont = $("[data-servicios]");
    if (!cont || !DATOS.servicios) return;
    cont.innerHTML = DATOS.servicios.map((s) => `
      <article class="columna revelar"><h3>${esc(t(s.nombre))}</h3><p>${esc(t(s.descripcion))}</p></article>`).join("");
  }

  function pintarProceso() {
    const cont = $("[data-proceso]");
    if (!cont || !DATOS.proceso) return;
    cont.innerHTML = DATOS.proceso.map((p, i) => `
      <li class="paso revelar">
        <span class="paso__numero" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="paso__titulo">${esc(t(p.titulo))}</h3>
        <p>${esc(t(p.descripcion))}</p>
      </li>`).join("");
  }

  function pintarStack() {
    const cont = $("[data-stack]");
    if (!cont || !DATOS.stack) return;
    cont.innerHTML = DATOS.stack.map((g) => `
      <div class="stack__grupo revelar">
        <h3 class="stack__titulo">${esc(t(g.grupo))}</h3>
        <ul class="stack__items">${(g.items || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      </div>`).join("");
  }

  /* ---------- 07 · Banda amarilla ---------- */
  function pintarCinta() {
    const cont = $("[data-cinta]");
    if (!cont || !DATOS.cinta) return;
    const fila = (t(DATOS.cinta) || []).map((x) => `<li>${esc(x)}</li>`).join("");
    cont.innerHTML = `<ul class="cinta__fila">${fila}</ul><ul class="cinta__fila" aria-hidden="true">${fila}</ul>`;
  }

  function pintarTodo() {
    pintarAviso(); pintarPerfil(); pintarHeroe(); pintarNav(); pintarSecciones();
    pintarProyectos(); pintarServicios(); pintarProceso(); pintarStack(); pintarCinta();
    if (estado.arrancado) $$(".revelar").forEach((el) => el.classList.add("revelar--visible"));
    else revelar();
    vistaFlotante();
  }

  /* ---------- 08 · Aparición al hacer scroll ---------- */
  function revelar() {
    const els = $$(".revelar:not(.revelar--visible)");
    if (!els.length) return;
    if (sinMovimiento()) { els.forEach((el) => el.classList.add("revelar--visible")); return; }

    if (window.gsap && window.ScrollTrigger) {
      d.documentElement.classList.add("gsap");
      window.gsap.registerPlugin(window.ScrollTrigger);
      const grupos = new Map();
      els.forEach((el) => {
        const padre = el.parentElement || d.body;
        if (!grupos.has(padre)) grupos.set(padre, []);
        grupos.get(padre).push(el);
      });
      grupos.forEach((hijos) => {
        window.gsap.to(hijos, {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: hijos[0], start: "top 90%", once: true },
          onStart: () => hijos.forEach((el) => el.classList.add("revelar--visible"))
        });
      });
      /* Red de seguridad: lo que esté en pantalla y siga invisible a los 4 s, se enseña. */
      setTimeout(() => {
        els.forEach((el) => {
          if (el.classList.contains("revelar--visible") || el.getBoundingClientRect().top > innerHeight) return;
          el.classList.add("revelar--visible");
          try { window.gsap.set(el, { clearProps: "all" }); } catch { /* da igual */ }
        });
      }, 4000);
      return;
    }

    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("revelar--visible")); return; }
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revelar--visible"); obs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    els.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`; obs.observe(el); });
    setTimeout(() => els.forEach((el) => el.classList.add("revelar--visible")), 3000);
  }

  /* ---------- 09 · Entrada del héroe ----------
     Por líneas, como una ficha que se imprime. fromTo y no from: con `from`
     las piezas quedan en opacidad 0 si el tween no llega a correr. */
  function entradaHeroe() {
    if (!window.gsap || sinMovimiento()) return;
    const lineas = $$(".heroe__linea");
    if (!lineas.length) return;
    window.gsap.fromTo(lineas, { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.75, ease: "power3.out", stagger: 0.07, clearProps: "all" });
    setTimeout(() => { try { window.gsap.set(lineas, { clearProps: "all" }); } catch { /* da igual */ } }, 2500);
  }

  /* ---------- 10 · Portada que sigue al cursor ----------
     Solo con puntero fino, pantalla ancha, GSAP y sin movimiento reducido. En
     el resto de casos la portada ya está dentro de la fila (CSS). */
  let vista = null, moverX = null, moverY = null;
  function vistaFlotante() {
    if (!window.gsap || sinMovimiento() || !punteroFino() || innerWidth < 861) return;
    if (!vista) {
      vista = d.createElement("div");
      vista.className = "obra-vista"; vista.setAttribute("aria-hidden", "true");
      vista.innerHTML = '<img alt="" decoding="async">';
      d.body.appendChild(vista);
      moverX = window.gsap.quickTo(vista, "left", { duration: 0.35, ease: "power3.out" });
      moverY = window.gsap.quickTo(vista, "top", { duration: 0.35, ease: "power3.out" });
      addEventListener("pointermove", (ev) => { moverX(ev.clientX); moverY(ev.clientY); }, { passive: true });
    }
    const img = $("img", vista);
    $$(".obra__enlace").forEach((a) => {
      a.addEventListener("pointerenter", (ev) => {
        const src = a.dataset.imagen;
        if (!src) return;
        if (img.getAttribute("src") !== src) img.src = src;
        window.gsap.set(vista, { left: ev.clientX, top: ev.clientY });
        window.gsap.to(vista, { opacity: 1, rotate: -2, duration: 0.25, overwrite: true });
      });
      a.addEventListener("pointerleave", () => {
        window.gsap.to(vista, { opacity: 0, rotate: 2, duration: 0.2, overwrite: true });
      });
    });
  }

  /* ---------- 11 · Escena 3D (diferida) ----------
     Un icosaedro de alambre, negro con una arista interior amarilla, que gira
     despacio y sigue al ratón. Three.js pesa ~800 KB: se pide después de la
     primera pintura y no se carga con movimiento reducido, en pantalla
     estrecha, con ahorro de datos o con pocos núcleos. */
  function escena3D() {
    const lienzo = $("[data-lienzo]");
    if (!lienzo || sinMovimiento() || innerWidth < 1001) return;
    if (navigator.connection && navigator.connection.saveData) return;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return;

    import("./lib/three.module.min.js").then((THREE) => {
      const escena = new THREE.Scene();
      const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
      camara.position.set(0, 0, 7.2);
      const render = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true, powerPreference: "low-power" });
      render.setPixelRatio(Math.min(devicePixelRatio, 2));

      const grupo = new THREE.Group();
      const exterior = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.1, 1)),
        new THREE.LineBasicMaterial({ color: 0x0E0E0E, transparent: true, opacity: 0.28 }));
      const interior = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.15, 0)),
        new THREE.LineBasicMaterial({ color: 0xF2C200, transparent: true, opacity: 0.95 }));
      grupo.add(exterior, interior);
      escena.add(grupo);

      const raton = { x: 0, y: 0, dx: 0, dy: 0 };
      addEventListener("pointermove", (ev) => {
        raton.dx = (ev.clientX / innerWidth - 0.5) * 2;
        raton.dy = (ev.clientY / innerHeight - 0.5) * 2;
      }, { passive: true });

      function medir() {
        const caja = lienzo.getBoundingClientRect();
        if (!caja.width || !caja.height) return;
        render.setSize(caja.width, caja.height, false);
        camara.aspect = caja.width / caja.height;
        camara.updateProjectionMatrix();
      }
      medir();
      addEventListener("resize", medir, { passive: true });

      let visible = true;
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(lienzo);
      }
      let ultimo = 0;
      function cuadro(ahora) {
        requestAnimationFrame(cuadro);
        if (!visible || d.hidden || ahora - ultimo < 32) return;
        ultimo = ahora;
        raton.x += (raton.dx - raton.x) * 0.04;
        raton.y += (raton.dy - raton.y) * 0.04;
        grupo.rotation.y += 0.0032;
        grupo.rotation.x = 0.35 + raton.y * 0.25;
        grupo.rotation.z = raton.x * 0.18;
        interior.rotation.y -= 0.006;
        render.render(escena, camara);
      }
      requestAnimationFrame(cuadro);
      lienzo.classList.add("escena__lienzo--activo");
    }).catch(() => { /* si no carga, la ficha se sostiene sola */ });
  }

  /* ---------- 12 · Arranque ---------- */
  estado.idioma = idiomaInicial();
  d.documentElement.lang = estado.idioma;
  cabecera(); cerrarAviso(); botonIdioma(); selector();
  pintarTodo();
  ponerPublico(almacen.leer("publico") || "neutro", false);
  entradaHeroe();
  estado.arrancado = true;
  if (d.readyState === "complete") escena3D();
  else addEventListener("load", escena3D, { once: true });
})();
