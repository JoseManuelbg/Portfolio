/* ==========================================================================
   José Manuel Babaciu Gheorghiu — portfolio
   Sevilla (España)

   ESTE ES EL ÚNICO FICHERO QUE HAY QUE TOCAR.

   Cada texto de cara al público va como { es: "...", en: "..." }.
   Para añadir un tercer idioma: añade su clave aquí (por ejemplo `fr`), mete
   el código en IDIOMAS y ya está. No hay que tocar app.js ni el HTML.

   QUÉ ES REAL (y de dónde salió):
     · Nombre, correo y alias — confirmados por él.
     · GitHub, LinkedIn y CodePen — README de su perfil de GitHub.
     · Ubicación y disponibilidad — perfil público de GitHub.
     · Los cinco proyectos, sus stacks y sus enlaces — repos y despliegues
       comprobados uno a uno con la API de GitHub el 2026-09-17.
     · "Programando desde los 15 años" — él (empezó en 4º de la ESO).

   QUÉ ESTÁ PENDIENTE:
     · CV en PDF (cv.es y cv.en vacíos).
     · Foto decente: ahora está el avatar de GitHub, que es de carnet.
     · Dominio propio. Hasta entonces, GitHub Pages bajo /Portfolio/.
     · proyectos[2].metricas: los forks de agencyos cambian solos. Repasar
       el número antes de enseñarla.

   NO hay cinta de aviso (AVISO.visible: false) porque aquí no hay ni un solo
   dato inventado: esta web es suya y todo lo que dice es comprobable.
   ========================================================================== */

const IDIOMAS = ["es", "en"];
const IDIOMA_POR_DEFECTO = "es";

const DATOS = {

  /* Se enciende solo si alguna vez hay algo sin confirmar en la página. */
  AVISO: {
    visible: false,
    texto: {
      es: "Web en obras · Algunos datos están pendientes de confirmar.",
      en: "Work in progress · Some details are still to be confirmed."
    }
  },

  perfil: {
    nombre: "José Manuel Babaciu Gheorghiu",
    /* Nombre corto para la marca de la cabecera y los sitios estrechos. */
    nombreCorto: "José Manuel",
    alias: "JoseManuelbg",
    ubicacion: { es: "Sevilla, España", en: "Seville, Spain" },
    email: "josemanuelbabaciugheorghiu@gmail.com",
    github: "JoseManuelbg",
    linkedin: "josemanuelbg05",
    codepen: "JoseManuelbg",
    /* [PENDIENTE] Cuando exista, poner la ruta relativa: "assets/cv-es.pdf".
       Servido desde aquí, nunca desde Drive. Vacío = se pinta el marcador. */
    cv: { es: "", en: "" },
    /* Provisional: avatar de GitHub, foto de carnet de baja resolución. */
    foto: "assets/img/retrato.jpg",
    fotoAlt: {
      es: "Retrato de José Manuel Babaciu Gheorghiu",
      en: "Portrait of José Manuel Babaciu Gheorghiu"
    }
  },

  /* ---- Héroe: un juego de textos por cada modo del selector -------------- */
  heroe: {
    neutro: {
      titulo: {
        es: "Hago webs que cargan rápido y aplicaciones que aguantan.",
        en: "I build websites that load fast and apps that hold up."
      },
      entrada: {
        es: "Desarrollador full-stack en Sevilla. Dime desde dónde llegas y te enseño lo que te interesa.",
        en: "Full-stack developer in Seville. Tell me where you are coming from and I will show you what matters to you."
      }
    },
    negocio: {
      titulo: {
        es: "Tu negocio, con una web que abre en un segundo.",
        en: "Your business, with a website that opens in a second."
      },
      entrada: {
        es: "Escrita a mano, sin plantillas y sin cookies. Rápida de verdad, y con un solo archivo para cambiar textos y precios tú mismo.",
        en: "Hand-written, no templates and no cookies. Genuinely fast, with a single file so you can change text and prices yourself."
      }
    },
    tecnico: {
      titulo: {
        es: "Full-stack: Spring Boot detrás, React y TypeScript delante.",
        en: "Full-stack: Spring Boot on the back, React and TypeScript up front."
      },
      entrada: {
        es: "Programando desde los 15 años. Todo lo que hay aquí abajo está desplegado o tiene el repositorio abierto: entra y míralo.",
        en: "Coding since I was 15. Everything below is deployed or has its repo open: go in and check it."
      }
    }
  },

  /* ---- Selector de público -----------------------------------------------
     Las dos mitades de la web: la de venta y la de portfolio. La `pista` es
     la línea pequeña de debajo de cada botón. -------------------------- */
  selector: {
    pregunta: { es: "¿Desde dónde llegas?", en: "Where are you coming from?" },
    negocio: { es: "Tengo un negocio", en: "I run a business" },
    negocioPista: { es: "Quiero una web", en: "I want a website" },
    tecnico: { es: "Soy técnico", en: "I am technical" },
    tecnicoPista: { es: "Enséñame el código", en: "Show me the code" }
  },

  /* ---- Cinta deslizante del héroe -----------------------------------------
     Solo hechos comprobables de esta misma web. Nada de reclamos. --------- */
  cinta: {
    es: ["Sin cookies", "Sin rastreadores", "Cero terceros", "Contraste AA",
         "Sin build ni npm", "Tipografías propias", "Funciona sin JavaScript", "Cloudflare Pages"],
    en: ["No cookies", "No trackers", "Zero third parties", "AA contrast",
         "No build, no npm", "Self-hosted fonts", "Works without JavaScript", "Cloudflare Pages"]
  },

  /* ---- Trabajos ----------------------------------------------------------
     `web` es el despliegue y `repo` el código. Si uno está vacío no se pinta
     ese enlace. `metricas` son cifras comprobables, nunca redondeos. ------- */
  proyectos: [
    {
      nombre: "Vending Inc.",
      tipo: { es: "Juego propio", en: "My own game" },
      resumen: {
        es: "Idle de máquinas expendedoras: montas rutas por zonas, fijas precios, lanzas una OPA al rival y compites en ligas semanales.",
        en: "Vending machine idle game: build routes across districts, set prices, launch a takeover bid on your rival and compete in weekly leagues."
      },
      stack: ["JavaScript sin bundler", "Capacitor", "Supabase", "Cloudflare Workers"],
      metricas: {
        es: ["v0.54.0 en revisión en CrazyGames", "254 commits", "5 idiomas", "14 suites de test"],
        en: ["v0.54.0 under review at CrazyGames", "254 commits", "5 languages", "14 test suites"]
      },
      web: "https://vendinggamemobile.josemanuelbabaciugheorghiu.workers.dev",
      repo: "",
      /* Captura real del juego. Las demás están pendientes: mientras `imagen`
         esté vacío se pinta un marcador con la medida que hace falta. */
      imagen: "assets/fotos/vending-inc.jpg",
      imagenAlt: {
        es: "Pantalla de Vending Inc. con el mapa isométrico de la ciudad y la barra de retos",
        en: "Vending Inc. screen showing the isometric city map and the challenge bar"
      }
    },
    {
      nombre: "Mentorly",
      tipo: { es: "Plataforma full-stack", en: "Full-stack platform" },
      resumen: {
        es: "Plataforma de mentoría con API REST en Spring Boot y un front aparte en React, con paneles en tiempo real.",
        en: "Mentoring platform with a Spring Boot REST API and a separate React front end, with real-time dashboards."
      },
      stack: ["Spring Boot", "Java", "React", "Tailwind CSS"],
      metricas: {
        es: ["Front y back en repositorios separados", "Desplegado en Vercel"],
        en: ["Front and back in separate repos", "Deployed on Vercel"]
      },
      web: "https://proyecto2526frontend-jose-manuelbg.vercel.app",
      repo: "https://github.com/JoseManuelbg/MentorlyBackend",
      imagen: "",
      imagenAlt: { es: "", en: "" }
    },
    {
      nombre: "agencyos",
      tipo: { es: "Código abierto", en: "Open source" },
      resumen: {
        es: "Herramienta de operaciones para consultoras: proyectos, tickets, control de horas, equipo, clientes e informes.",
        en: "Operations tool for consulting teams: projects, tickets, time tracking, team, customers and reports."
      },
      stack: ["TypeScript"],
      /* Los forks suben y bajan: repasar el número antes de enseñar la web. */
      metricas: {
        es: ["5 forks", "Licencia abierta"],
        en: ["5 forks", "Open licence"]
      },
      web: "",
      repo: "https://github.com/JoseManuelbg/agencyos",
      imagen: "",
      imagenAlt: { es: "", en: "" }
    },
    {
      nombre: "carquiz",
      tipo: { es: "Front moderno", en: "Modern front end" },
      resumen: {
        es: "Juego de adivinar el modelo y el año de un coche a partir de fotos, con pruebas automáticas.",
        en: "Guess a car model and year from photos, with an automated test suite."
      },
      stack: ["Next.js", "Supabase", "Vitest"],
      metricas: {
        es: ["Desplegado en Vercel", "Repositorio público"],
        en: ["Deployed on Vercel", "Public repository"]
      },
      web: "https://carquiz-two.vercel.app",
      repo: "https://github.com/JoseManuelbg/carquiz",
      imagen: "",
      imagenAlt: { es: "", en: "" }
    },
    {
      nombre: "agent-kit",
      tipo: { es: "Herramientas propias", en: "My own tooling" },
      resumen: {
        es: "Mi plugin de Claude Code: checklists de auditoría antes de lanzar, catálogo de recursos de interfaz, reglas compartidas y subagentes.",
        en: "My Claude Code plugin: pre-launch audit checklists, a UI resource catalogue, shared rules and subagents."
      },
      stack: ["Claude Code", "Markdown", "Shell"],
      metricas: {
        es: ["Se instala con un comando", "Repositorio público"],
        en: ["Installs with one command", "Public repository"]
      },
      web: "",
      repo: "https://github.com/JoseManuelbg/agent-kit",
      imagen: "",
      imagenAlt: { es: "", en: "" }
    }
  ],

  /* ---- Qué hago (modo negocio) ------------------------------------------- */
  servicios: [
    {
      nombre: { es: "Webs para negocios", en: "Business websites" },
      descripcion: {
        es: "Una página o varias, escritas a mano. Sin cookies, sin banners y sin cargar nada de fuera: abre rápido hasta con mala cobertura.",
        en: "One page or several, written by hand. No cookies, no banners, nothing loaded from outside: it opens fast even on a bad signal."
      }
    },
    {
      nombre: { es: "Reservas y pedidos", en: "Bookings and orders" },
      descripcion: {
        es: "Citas que comprueban tu agenda de verdad, carritos que terminan en WhatsApp y paneles para ver lo que entra.",
        en: "Appointments checked against your real calendar, carts that end up in WhatsApp, and dashboards to see what comes in."
      }
    },
    {
      nombre: { es: "Que la puedas cambiar tú", en: "So you can change it yourself" },
      descripcion: {
        es: "Textos, precios y horarios viven en un solo archivo. Te enseño a tocarlo y dejas de depender de mí para una coma.",
        en: "Text, prices and opening hours live in a single file. I teach you to edit it so you do not depend on me for a comma."
      }
    }
  ],

  /* ---- Cómo trabajo (modo negocio) --------------------------------------- */
  proceso: [
    {
      titulo: { es: "Hablamos", en: "We talk" },
      descripcion: {
        es: "Me cuentas qué vendes y a quién. Salgo de ahí con lo que tiene que estar en la web y con lo que sobra.",
        en: "You tell me what you sell and to whom. I come out knowing what belongs on the site and what does not."
      }
    },
    {
      titulo: { es: "Te la enseño antes de cobrarte", en: "You see it before you pay" },
      descripcion: {
        es: "Monto una primera versión con tus datos y te la enseño funcionando. Si no te convence, ahí se queda.",
        en: "I build a first version with your details and show it working. If you are not convinced, that is where it ends."
      }
    },
    {
      titulo: { es: "Ajustamos", en: "We adjust" },
      descripcion: {
        es: "Cambiamos textos, fotos y precios hasta que se parezca a tu negocio de verdad.",
        en: "We change text, photos and prices until it actually looks like your business."
      }
    },
    {
      titulo: { es: "Se publica y es tuya", en: "It goes live and it is yours" },
      descripcion: {
        es: "Dominio, certificado y la web en marcha. Te dejo escrito cómo cambiar lo que quieras sin llamarme.",
        en: "Domain, certificate and the site running. I leave written instructions so you can change things without calling me."
      }
    }
  ],

  /* ---- Stack (modo técnico) ---------------------------------------------- */
  stack: [
    { grupo: { es: "Front", en: "Front end" }, items: ["JavaScript", "TypeScript", "React", "Next.js", "HTML y CSS a mano"] },
    { grupo: { es: "Back", en: "Back end" }, items: ["Node", "Spring Boot", "Java", "API REST"] },
    { grupo: { es: "Datos", en: "Data" }, items: ["MySQL", "SQLite", "Supabase"] },
    { grupo: { es: "Infraestructura", en: "Infrastructure" }, items: ["Cloudflare Pages", "Cloudflare Workers", "Vercel", "Docker"] },
    { grupo: { es: "Forma de trabajar", en: "How I work" }, items: ["Accesibilidad WCAG AA", "Pruebas automáticas", "Git", "Sin dependencias que no hagan falta"] }
  ],

  /* ---- Textos sueltos de secciones ---------------------------------------- */
  textos: {
    nav: {
      trabajos: { es: "Trabajos", en: "Work" },
      servicios: { es: "Qué hago", en: "What I do" },
      proceso: { es: "Cómo trabajo", en: "How I work" },
      stack: { es: "Stack", en: "Stack" },
      contacto: { es: "Contacto", en: "Contact" }
    },
    secciones: {
      trabajosSobre: { es: "Trabajos", en: "Work" },
      trabajosTitulo: { es: "Cinco cosas que he hecho y puedes abrir", en: "Five things I have built that you can open" },
      serviciosSobre: { es: "Qué hago", en: "What I do" },
      serviciosTitulo: { es: "Lo que puedo hacer por tu negocio", en: "What I can do for your business" },
      procesoSobre: { es: "Cómo trabajo", en: "How I work" },
      procesoTitulo: { es: "Cuatro pasos y sin sorpresas", en: "Four steps, no surprises" },
      stackSobre: { es: "Stack", en: "Stack" },
      stackTitulo: { es: "Con qué trabajo", en: "What I work with" },
      contactoSobre: { es: "Contacto", en: "Contact" },
      contactoTitulo: { es: "Escríbeme", en: "Get in touch" },
      contactoEntrada: {
        es: "El correo es la vía rápida: contesto el mismo día.",
        en: "Email is the fastest route: I reply the same day."
      }
    },
    botones: {
      email: { es: "Escríbeme por correo", en: "Email me" },
      verTrabajos: { es: "Ver trabajos", en: "See my work" },
      presupuesto: { es: "Pedir presupuesto", en: "Ask for a quote" },
      web: { es: "Abrir", en: "Open" },
      repo: { es: "Código", en: "Code" },
      cv: { es: "Descargar CV", en: "Download CV" }
    },
    cvPendiente: { es: "CV en PDF: pendiente", en: "CV as PDF: pending" },
    experiencia: {
      es: "Programando desde los 15 años.",
      en: "Coding since I was 15."
    },
    idioma: { es: "English", en: "Español" },
    idiomaEtiqueta: { es: "Cambiar a inglés", en: "Switch to Spanish" }
  }
};
