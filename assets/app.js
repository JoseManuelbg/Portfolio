/* ==========================================================================
   Portfolio de José Manuel — pinta la web a partir de datos.js
   Sin dependencias externas. Todo lo editable está en datos.js.

   Degradación en cascada, en este orden:
     1. Sin JavaScript: se lee el héroe, los títulos de sección, el contacto
        y el pie, en español. Los listados no salen, pero la web se entiende
        y el correo funciona. Hay un <noscript> que lo dice.
     2. Con JavaScript y sin GSAP: todo el contenido, apariciones con
        IntersectionObserver.
     3. Con GSAP: entrada del héroe encadenada y apariciones con ScrollTrigger.
     4. Con Three.js y sin prefers-reduced-motion: escena del héroe.
   Cada escalón añade, ninguno es imprescindible.

   Índice
   01 · Utilidades
   02 · Idioma
   03 · Selector de público
   04 · Cinta de aviso
   05 · Cabecera y menú
   06 · Pintado del contenido
   07 · Cinta deslizante
   08 · Aparición al hacer scroll
   09 · Entrada del héroe
   10 · Escena 3D (diferida)
   11 · Arranque
   ========================================================================== */

(function () {
  "use strict";

  const d = document;
  const $ = (s, ctx = d) => ctx.querySelector(s);
  const $$ = (s, ctx = d) => [...ctx.querySelectorAll(s)];

  /* ---------- 01 · Utilidades ---------- */

  /* Escapa lo que venga de datos.js antes de meterlo en el HTML. */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  /* localStorage puede fallar (modo privado, cookies bloqueadas, iframe).
     Nunca debe tumbar la página, así que todo va envuelto. */
  const almacen = {
    leer(k) { try { return localStorage.getItem(k); } catch { return null; } },
    escribir(k, v) { try { localStorage.setItem(k, v); } catch { /* da igual */ } }
  };

  const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Estado de la página. Se rellena en el arranque. */
  const estado = { idioma: IDIOMA_POR_DEFECTO, publico: "neutro", arrancado: false };

  /* Traduce un valor de datos.js. Acepta { es, en } o una cadena suelta:
     así un dato que no se traduce (un nombre propio) se escribe sin envolver. */
  function t(valor) {
    if (valor == null) return "";
    if (typeof valor === "string") return valor;
    return valor[estado.idioma] ?? valor[IDIOMA_POR_DEFECTO] ?? "";
  }

  /* ---------- 02 · Idioma ---------- */

  /* Orden: lo que eligió el visitante > el idioma del navegador > español.
     La elección manual manda siempre: detectar a secas deja fuera al que
     tiene el móvil en inglés y prefiere leer en español. */
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
      const siguiente = IDIOMAS[(IDIOMAS.indexOf(estado.idioma) + 1) % IDIOMAS.length];
      ponerIdioma(siguiente, true);
    });
  }

  /* ---------- 03 · Selector de público ----------
     Las dos mitades de la web: la de venta y la de portfolio. Por defecto,
     "neutro": se ve todo, que es lo correcto para quien llega de un buscador. */

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

    /* Una sección solo se oculta si el visitante ha elegido el otro bando. */
    $$("[data-solo]").forEach((sec) => {
      const suya = estado.publico === "neutro" || sec.dataset.solo === estado.publico;
      sec.hidden = !suya;
    });

    pintarHeroe();
    pintarNav();

    if (antes !== estado.publico && window.gsap && !sinMovimiento()) {
      window.gsap.fromTo("[data-heroe-texto]",
        { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
  }

  function selector() {
    $$("[data-publico-boton]").forEach((b) => {
      b.addEventListener("click", () => {
        /* Volver a pulsar el que ya está activo devuelve a neutro. */
        const destino = b.dataset.publicoBoton === estado.publico ? "neutro" : b.dataset.publicoBoton;
        ponerPublico(destino, true);
      });
    });
  }

  /* ---------- 04 · Cinta de aviso ---------- */
  function pintarAviso() {
    const aviso = $("[data-aviso]");
    if (!aviso) return;
    const cerrada = almacen.leer("aviso") === "no";
    aviso.hidden = !DATOS.AVISO.visible || cerrada;
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
    const cab = $("[data-cabecera]");
    if (cab) {
      const marcar = () => cab.classList.toggle("cabecera--posada", scrollY > 24);
      marcar();
      addEventListener("scroll", marcar, { passive: true });
    }
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
    $$("[data-nombre]").forEach((el) => { el.textContent = p.nombre; });
    $$("[data-nombre-corto]").forEach((el) => { el.textContent = p.nombreCorto; });
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

    /* CV: si no hay fichero, marcador amarillo bien visible. A propósito. */
    const cv = $("[data-cv]");
    if (cv) {
      const ruta = p.cv[estado.idioma] || p.cv[IDIOMA_POR_DEFECTO] || "";
      if (ruta) {
        cv.outerHTML = `<a class="boton boton--borde" data-cv href="${esc(ruta)}" download>${esc(t(DATOS.textos.botones.cv))}</a>`;
      } else {
        cv.outerHTML = `<span class="pendiente" data-cv>${esc(t(DATOS.textos.cvPendiente))}</span>`;
      }
    }
  }

  function pintarHeroe() {
    const h = DATOS.heroe[estado.publico] || DATOS.heroe.neutro;
    const tit = $("[data-heroe-titulo]");
    const ent = $("[data-heroe-entrada]");
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
    $$("[data-nav-clave]").forEach((el) => {
      const clave = el.dataset.navClave;
      if (n[clave]) el.textContent = t(n[clave]);
    });
  }

  function pintarSecciones() {
    const s = DATOS.textos.secciones;
    $$("[data-texto]").forEach((el) => {
      const clave = el.dataset.texto;
      if (s[clave]) el.textContent = t(s[clave]);
    });
    const b = DATOS.textos.botones;
    $$("[data-boton]").forEach((el) => {
      const clave = el.dataset.boton;
      if (b[clave]) el.textContent = t(b[clave]);
    });
    const btnIdioma = $("[data-idioma]");
    if (btnIdioma) {
      btnIdioma.textContent = t(DATOS.textos.idioma);
      btnIdioma.setAttribute("aria-label", t(DATOS.textos.idiomaEtiqueta));
    }
  }

  function pintarProyectos() {
    const cont = $("[data-proyectos]");
    if (!cont || !DATOS.proyectos) return;
    const b = DATOS.textos.botones;

    cont.innerHTML = DATOS.proyectos.map((p) => {
      const stack = (p.stack || [])
        .map((x) => `<li class="etiqueta">${esc(x)}</li>`).join("");
      const metricas = (t(p.metricas) || [])
        .map((x) => `<li>${esc(x)}</li>`).join("");
      const enlaces = [
        p.web ? `<a class="boton boton--lleno" href="${esc(p.web)}" target="_blank" rel="noopener">${esc(t(b.web))} <span class="oculto-visual">${esc(p.nombre)}</span></a>` : "",
        p.repo ? `<a class="boton boton--borde" href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(t(b.repo))} <span class="oculto-visual">${esc(p.nombre)}</span></a>` : ""
      ].join("");

      /* Con captura, la captura. Sin ella, un marcador con la medida escrita
         dentro: así se ve de un vistazo lo que falta y no se publica con un
         hueco silencioso. Nunca una imagen de relleno que parezca real. */
      const medio = p.imagen
        ? `<img class="proyecto__imagen" src="${esc(p.imagen)}" alt="${esc(t(p.imagenAlt))}" loading="lazy" decoding="async" width="1244" height="705">`
        : `<div class="marcador-foto">
             <div>
               <p class="marcador-foto__etiqueta">Captura pendiente</p>
               <p class="marcador-foto__medida">${esc(p.nombre)} · 1244 × 705 px</p>
             </div>
           </div>`;

      return `
      <article class="vidrio proyecto revelar">
        <div class="proyecto__medio">${medio}</div>
        <div class="proyecto__cuerpo">
          <div class="proyecto__cabecera">
            <h3 class="proyecto__nombre">${esc(p.nombre)}</h3>
            <p class="proyecto__tipo">${esc(t(p.tipo))}</p>
          </div>
          <p class="proyecto__resumen">${esc(t(p.resumen))}</p>
          <ul class="etiquetas">${stack}</ul>
          <ul class="metricas">${metricas}</ul>
          <p class="grupo-botones">${enlaces}</p>
        </div>
      </article>`;
    }).join("");
  }

  function pintarServicios() {
    const cont = $("[data-servicios]");
    if (!cont || !DATOS.servicios) return;
    cont.innerHTML = DATOS.servicios.map((s) => `
      <article class="vidrio tarjeta revelar">
        <h3 class="tarjeta__titulo">${esc(t(s.nombre))}</h3>
        <p>${esc(t(s.descripcion))}</p>
      </article>`).join("");
  }

  function pintarProceso() {
    const cont = $("[data-proceso]");
    if (!cont || !DATOS.proceso) return;
    cont.innerHTML = DATOS.proceso.map((p, i) => `
      <li class="vidrio paso revelar">
        <span class="paso__numero" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="paso__titulo">${esc(t(p.titulo))}</h3>
        <p>${esc(t(p.descripcion))}</p>
      </li>`).join("");
  }

  function pintarStack() {
    const cont = $("[data-stack]");
    if (!cont || !DATOS.stack) return;
    cont.innerHTML = DATOS.stack.map((g) => `
      <div class="vidrio stack__grupo revelar">
        <h3 class="stack__titulo">${esc(t(g.grupo))}</h3>
        <ul class="etiquetas">${(g.items || []).map((x) => `<li class="etiqueta">${esc(x)}</li>`).join("")}</ul>
      </div>`).join("");
  }

  /* ---------- 07 · Cinta deslizante ----------
     Solo hechos de esta misma web. La lista se duplica para que el bucle no
     tenga costura; la animación es CSS y se para con movimiento reducido. */
  function pintarCinta() {
    const cont = $("[data-cinta]");
    if (!cont || !DATOS.cinta) return;
    const items = t(DATOS.cinta) || [];
    if (!items.length) return;
    const fila = items.map((x) => `<li>${esc(x)}</li>`).join("");
    cont.innerHTML =
      `<ul class="cinta__fila">${fila}</ul><ul class="cinta__fila" aria-hidden="true">${fila}</ul>`;
  }

  /* Un único punto de entrada: cambiar de idioma repinta todo de golpe. */
  function pintarTodo() {
    pintarAviso();
    pintarPerfil();
    pintarHeroe();
    pintarNav();
    pintarSecciones();
    pintarProyectos();
    pintarServicios();
    pintarProceso();
    pintarStack();
    pintarCinta();
    /* En el primer pintado, las apariciones se animan. En los siguientes
       (cambio de idioma) el contenido se enseña ya, que si no parpadea
       media página a mitad de lectura. */
    if (estado.arrancado) $$(".revelar").forEach((el) => el.classList.add("revelar--visible"));
    else revelar();
  }

  /* ---------- 08 · Aparición al hacer scroll ----------
     Con GSAP, encadenado por grupos. Sin GSAP, IntersectionObserver. Con
     movimiento reducido, todo visible de entrada y ninguna animación. */
  function revelar() {
    const els = $$(".revelar:not(.revelar--visible)");
    if (!els.length) return;

    if (sinMovimiento()) {
      els.forEach((el) => el.classList.add("revelar--visible"));
      return;
    }

    if (window.gsap && window.ScrollTrigger) {
      /* Le quita la transición del CSS a .revelar: si se deja, la animación
         por fotogramas de GSAP pelea con ella y se ve a tirones. */
      d.documentElement.classList.add("gsap");
      window.gsap.registerPlugin(window.ScrollTrigger);

      /* Se anima por contenedor, no de uno en uno: así las tarjetas de una
         misma rejilla entran escalonadas y no a destiempo. */
      const grupos = new Map();
      els.forEach((el) => {
        const padre = el.parentElement || d.body;
        if (!grupos.has(padre)) grupos.set(padre, []);
        grupos.get(padre).push(el);
      });

      grupos.forEach((hijos) => {
        window.gsap.to(hijos, {
          opacity: 1, y: 0, duration: 0.75, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: hijos[0], start: "top 88%", once: true },
          onStart: () => hijos.forEach((el) => el.classList.add("revelar--visible"))
        });
      });

      /* Red de seguridad: a los 4 s, lo que esté dentro de la pantalla y siga
         invisible se enseña. Solo lo visible, para no quemar las apariciones
         de lo que queda más abajo. */
      setTimeout(() => {
        els.forEach((el) => {
          if (el.classList.contains("revelar--visible")) return;
          if (el.getBoundingClientRect().top > innerHeight) return;
          el.classList.add("revelar--visible");
          try { window.gsap.set(el, { opacity: 1, y: 0, clearProps: "all" }); } catch { /* da igual */ }
        });
      }, 4000);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("revelar--visible"));
      return;
    }
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("revelar--visible");
        obs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`;
      obs.observe(el);
    });

    /* Red de seguridad: a los 3 s, lo que siga invisible se enseña y punto. */
    setTimeout(() => els.forEach((el) => el.classList.add("revelar--visible")), 3000);
  }

  /* ---------- 09 · Entrada del héroe ----------
     Lo primero que ve el visitante. Corto y de una vez: nada de esperar
     tres segundos a que aparezca un titular. */
  function entradaHeroe() {
    if (!window.gsap || sinMovimiento()) return;
    const piezas = [
      "[data-experiencia]", "[data-heroe-titulo]", "[data-heroe-entrada]",
      ".selector", ".heroe .grupo-botones"
    ].map((s) => $(s)).filter(Boolean);
    if (!piezas.length) return;

    /* fromTo y no from: `from` deja las piezas en opacidad 0 nada más
       declararse, así que si el tween no llega a correr (pestaña en segundo
       plano, rAF estrangulado, captura automática) medio héroe se queda
       invisible. Con fromTo el estado final está escrito, y además hay una
       red de seguridad que limpia los estilos pase lo que pase. */
    window.gsap.fromTo(piezas,
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.085, clearProps: "all" });

    setTimeout(() => {
      try { window.gsap.set(piezas, { clearProps: "all" }); } catch { /* da igual */ }
    }, 2500);
  }

  /* ---------- 10 · Escena 3D (diferida) ----------
     Three.js pesa ~800 KB entre sus dos ficheros, así que NO entra en la
     carga inicial: se pide después de que la página esté pintada y solo si
     tiene sentido. Mientras tanto (y si no llega nunca) se ven las manchas
     del CSS bajo el velo, que ya sostienen la sección.

     No se carga si: hay prefers-reduced-motion, la pantalla es estrecha,
     el visitante ahorra datos, o la máquina tiene pocos núcleos. */
  function escena3D() {
    const lienzo = $("[data-lienzo]");
    if (!lienzo) return;
    if (sinMovimiento()) return;
    if (innerWidth < 760) return;
    if (navigator.connection && navigator.connection.saveData) return;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return;

    import("./lib/three.module.min.js").then((THREE) => {
      const escena = new THREE.Scene();

      const camara = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
      camara.position.set(0, 0, 30);

      const render = new THREE.WebGLRenderer({
        canvas: lienzo, antialias: true, alpha: true, powerPreference: "low-power"
      });
      render.setPixelRatio(Math.min(devicePixelRatio, 1.75));

      /* --- Cortina de puntos de frente a la cámara ---
         Una rejilla en el plano XY, no un suelo en perspectiva: así los
         puntos se reparten por todo el encuadre en vez de aplastarse en una
         franja. Ondulan en Z, y como el tamaño atenúa con la distancia, el
         vaivén se lee como un brillo que va y viene. */
      const COL = 78, FIL = 44, PASO = 1.05;
      const total = COL * FIL;
      const pos = new Float32Array(total * 3);
      const base = new Float32Array(total * 2);
      let n = 0;
      for (let i = 0; i < COL; i++) {
        for (let j = 0; j < FIL; j++) {
          const x = (i - COL / 2) * PASO + (Math.random() - 0.5) * 0.4;
          const y = (j - FIL / 2) * PASO + (Math.random() - 0.5) * 0.4;
          pos[n * 3] = x; pos[n * 3 + 1] = y; pos[n * 3 + 2] = 0;
          base[n * 2] = x; base[n * 2 + 1] = y;
          n++;
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const malla = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xF2C200, size: 0.19, transparent: true, opacity: 0.9,
        sizeAttenuation: true, depthWrite: false
      }));
      escena.add(malla);

      /* --- Láminas de cristal a la deriva: el mismo material que la interfaz --- */
      const laminas = [];
      const geoLamina = new THREE.PlaneGeometry(1, 1);
      for (let i = 0; i < 7; i++) {
        const m = new THREE.Mesh(geoLamina, new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? 0xF2C200 : 0xFFFFFF,
          transparent: true, opacity: i % 3 === 0 ? 0.05 : 0.035,
          side: THREE.DoubleSide, depthWrite: false, fog: false
        }));
        const ancho = 5 + Math.random() * 11;
        m.scale.set(ancho, ancho * (0.5 + Math.random() * 0.5), 1);
        m.position.set((Math.random() - 0.5) * 48, (Math.random() - 0.3) * 20, -6 - Math.random() * 26);
        m.rotation.set(Math.random() * 0.5, Math.random() * 0.7, Math.random() * Math.PI);
        m.userData.giro = (Math.random() - 0.5) * 0.00045;
        m.userData.flote = 0.0016 + Math.random() * 0.0022;
        m.userData.fase = Math.random() * Math.PI * 2;
        laminas.push(m);
        escena.add(m);
      }

      const raton = { x: 0, y: 0, destinoX: 0, destinoY: 0 };
      addEventListener("pointermove", (ev) => {
        raton.destinoX = (ev.clientX / innerWidth - 0.5) * 2;
        raton.destinoY = (ev.clientY / innerHeight - 0.5) * 2;
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

      /* Se para cuando el héroe no está en pantalla: ni GPU ni batería
         gastadas en algo que nadie ve. */
      let visible = true;
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((e) => { visible = e[0].isIntersecting; },
          { threshold: 0 }).observe(lienzo);
      }

      const atributo = geo.getAttribute("position");
      let ultimo = 0;
      function cuadro(ahora) {
        requestAnimationFrame(cuadro);
        if (!visible || d.hidden) return;
        if (ahora - ultimo < 32) return;      // ~30 fps, de sobra para esto
        ultimo = ahora;
        const t = ahora * 0.00045;

        /* Dos ondas cruzadas con periodos distintos: el patrón no se repite
           a simple vista y no hace falta ruido de verdad, que costaría más. */
        for (let k = 0; k < total; k++) {
          const x = base[k * 2], y = base[k * 2 + 1];
          atributo.array[k * 3 + 2] =
            Math.sin(x * 0.19 + t * 1.5) * 3.4 +
            Math.cos(y * 0.23 - t * 1.1) * 2.6;
        }
        atributo.needsUpdate = true;
        malla.rotation.z = Math.sin(t * 0.22) * 0.045;

        for (const m of laminas) {
          m.rotation.z += m.userData.giro;
          m.position.y += Math.sin(t * 2 + m.userData.fase) * m.userData.flote;
        }

        raton.x += (raton.destinoX - raton.x) * 0.045;
        raton.y += (raton.destinoY - raton.y) * 0.045;
        camara.position.x = raton.x * 2.6;
        camara.position.y = -raton.y * 1.8;
        camara.lookAt(0, 0, 0);

        render.render(escena, camara);
      }
      requestAnimationFrame(cuadro);
      lienzo.classList.add("escena__lienzo--activo");
    }).catch(() => {
      /* Si no carga, la web se queda exactamente igual de usable. */
    });
  }

  /* ---------- 11 · Arranque ---------- */
  estado.idioma = idiomaInicial();
  d.documentElement.lang = estado.idioma;

  cabecera();
  cerrarAviso();
  botonIdioma();
  selector();
  pintarTodo();
  ponerPublico(almacen.leer("publico") || "neutro", false);
  entradaHeroe();
  estado.arrancado = true;

  /* La escena, la última y sin bloquear nada. */
  if (d.readyState === "complete") escena3D();
  else addEventListener("load", escena3D, { once: true });
})();
