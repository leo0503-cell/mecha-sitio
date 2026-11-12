(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const config = window.MECHA || {};
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let pausedByUser = false;
  let reduced = motionPreference.matches;
  const phone = /^\d{10,15}$/.test(config.whatsapp || "")
    ? config.whatsapp
    : "524491557494";
  const messageLink = (message) =>
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const baseMessage =
    config.mensaje || "Hola, vi la página de Mecha y quiero un diagnóstico.";
  $$("[data-whatsapp]").forEach((a) => {
    a.href = messageLink(baseMessage);
    const small = $("small", a);
    if (small && config.whatsappVisible)
      small.textContent = config.whatsappVisible;
  });
  const briefLink = $("#brief-link");
  const need = $("#necesidad");
  function updateBrief() {
    briefLink.href = messageLink(
      need.value
        ? `${baseMessage}\nMi prioridad es: ${need.value}.`
        : baseMessage,
    );
  }
  need.addEventListener("change", updateBrief);
  updateBrief();
  $$("[data-plan]").forEach((a) =>
    a.addEventListener("click", () => {
      const choices = {
        "Diagnóstico de IA": "Consultoría o capacitación en IA para mi equipo",
        "Apps a la medida": "Una app a la medida para mi negocio",
        "Procesos automatizados": "Automatizar procesos que hoy se hacen a mano",
        "Datos con dirección": "Organizar y analizar mis datos",
      };
      need.value = choices[a.dataset.plan] || "";
      updateBrief();
    }),
  );
  $$("[data-price]").forEach((el) => {
    const value = config.precios?.[el.dataset.price];
    if (
      config.mostrarPrecios === true &&
      typeof value === "string" &&
      value.trim() &&
      !/[<>]/.test(value)
    ) {
      el.textContent = value;
      el.hidden = false;
    }
  });
  const nav = $("#navegacion");
  const menuButton = $(".menu-toggle");
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    nav.classList.remove("open");
  };
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("open", open);
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header")) closeMenu();
  });

  const journey = $(".hero-journey");
  const sticky = $(".hero-sticky");
  const video = $("#hero-video");
  const chapters = $$("[data-chapter]");
  const chapterLabel = $("#chapter-label");
  const counter = $(".chapter-count");
  const progressBar = $("#film-progress");
  const labels = ["La chispa", "El sistema", "La dirección"];
  const motionButton = $(".motion-toggle");
  let activeChapter = -1,
    progress = 0,
    targetTime = 0,
    frameRequested = false;
  const motionOff = () => reduced || pausedByUser;
  function selectChapter(index) {
    if (index === activeChapter) return;
    activeChapter = index;
    chapters.forEach((chapter, i) => {
      chapter.classList.toggle("active", i === index);
      chapter.inert = i !== index;
    });
    chapterLabel.textContent = labels[index];
    counter.textContent = `0${index + 1} / 03`;
  }
  function seekFilm() {
    if (
      motionOff() ||
      document.hidden ||
      !Number.isFinite(video.duration) ||
      video.seeking ||
      video.readyState < 2
    )
      return;
    if (Math.abs(video.currentTime - targetTime) > 0.035) {
      try {
        video.currentTime = Math.min(
          targetTime,
          Math.max(0, video.duration - 0.045),
        );
      } catch {
        /* Poster remains available while metadata loads. */
      }
    }
  }
  function renderScroll() {
    frameRequested = false;
    if (motionOff()) return;
    const rect = journey.getBoundingClientRect();
    const distance = Math.max(1, journey.offsetHeight - sticky.offsetHeight);
    progress = Math.max(0, Math.min(1, -rect.top / distance));
    progressBar.style.transform = `scaleX(${progress})`;
    selectChapter(progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2);
    if (Number.isFinite(video.duration)) targetTime = progress * video.duration;
    $(".hero-visual").style.setProperty(
      "--robot-scale",
      String(1 + progress * 0.1),
    );
    $(".hero-visual").style.setProperty("--robot-y", `${-progress * 20}px`);
    if (rect.bottom > 0 && rect.top < innerHeight) seekFilm();
  }
  function scheduleScroll() {
    if (!frameRequested && !motionOff()) {
      frameRequested = true;
      requestAnimationFrame(renderScroll);
    }
  }
  function updateMotion() {
    document.body.classList.toggle("motion-paused", motionOff());
    document.dispatchEvent(
      new CustomEvent("mecha:motion", { detail: { paused: motionOff() } }),
    );
    motionButton.setAttribute("aria-pressed", String(motionOff()));
    motionButton.textContent = motionOff()
      ? "Activar movimiento ↗"
      : "Pausar movimiento Ⅱ";
    video.pause();
    if (motionOff()) {
      selectChapter(0);
      progressBar.style.transform = "scaleX(0)";
    } else scheduleScroll();
  }
  motionButton.addEventListener("click", () => {
    if (reduced && !pausedByUser) {
      reduced = false;
      pausedByUser = false;
    } else pausedByUser = !pausedByUser;
    updateMotion();
  });
  motionPreference.addEventListener("change", (event) => {
    reduced = event.matches;
    updateMotion();
  });
  video.addEventListener("loadedmetadata", scheduleScroll);
  video.addEventListener("loadeddata", scheduleScroll);
  video.addEventListener("seeked", seekFilm);
  video.addEventListener("error", () => {
    video.hidden = true;
    $(".hero-visual").style.backgroundImage =
      "url('assets/mecha-hero-v2.webp')";
    $(".hero-visual").style.backgroundSize = "contain";
    $(".hero-visual").style.backgroundPosition = "center";
    $(".hero-visual").style.backgroundRepeat = "no-repeat";
  });
  window.addEventListener("scroll", scheduleScroll, { passive: true });
  window.addEventListener("resize", scheduleScroll, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleScroll();
  });
  updateMotion();
  selectChapter(0);

  function animatePanel(el) {
    if (motionOff()) return;
    el.classList.remove("panel-change");
    void el.offsetWidth;
    el.classList.add("panel-change");
  }
  function connectTabs(buttons, activate) {
    buttons.forEach((button, i) => {
      button.addEventListener("click", () => activate(i));
      button.addEventListener("keydown", (event) => {
        let target;
        if (event.key === "ArrowRight" || event.key === "ArrowDown")
          target = (i + 1) % buttons.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
          target = (i + buttons.length - 1) % buttons.length;
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = buttons.length - 1;
        if (target !== undefined) {
          event.preventDefault();
          activate(target);
          buttons[target].focus();
        }
      });
    });
  }
  const symptoms = [
    {
      category: "IA + seguimiento",
      title: "Cada conversación merece una respuesta.",
      description:
        "Conectamos un asistente a tu WhatsApp para resolver preguntas frecuentes, organizar oportunidades y pasar la conversación a tu equipo cuando haga falta.",
      need: "Responder y dar seguimiento por WhatsApp",
    },
    {
      category: "Automatización + operación",
      title: "Tu tiempo vale más que copiar y pegar.",
      description:
        "Diseñamos flujos para preparar cotizaciones con tus datos, organizar citas y enviar recordatorios. Tu equipo conserva el control de lo que se aprueba y se envía.",
      need: "Automatizar cotizaciones o agenda",
    },
    {
      category: "Marketing + estrategia",
      title: "Una presencia que tenga algo que decir.",
      description:
        "Damos dirección a tu contenido, tu página y tus campañas. Con una marca consistente, objetivos claros y seguimiento de las oportunidades que llegan.",
      need: "Mejorar mi marketing y mi página web",
    },
    {
      category: "Datos + decisiones",
      title: "La información necesita una buena pregunta.",
      description:
        "Ordenamos tus fuentes y construimos el análisis para entender qué pasa en tu marketing, ventas u operación. Cada tablero parte de una decisión que necesitas tomar.",
      need: "Organizar y analizar mis datos",
    },
  ];
  const symptomTabs = $$("[data-symptom]");
  function activateSymptom(index) {
    symptomTabs.forEach((b, i) => {
      b.setAttribute("aria-selected", String(i === index));
      b.tabIndex = i === index ? 0 : -1;
    });
    const item = symptoms[index];
    $("#symptom-category").textContent = item.category;
    $("#symptom-title").textContent = item.title;
    $("#symptom-description").textContent = item.description;
    $("#symptom-panel").setAttribute("aria-labelledby", `symptom-tab-${index}`);
    $("#symptom-cta").onclick = () => {
      need.value = item.need;
      updateBrief();
    };
    animatePanel($("#symptom-panel"));
  }
  connectTabs(symptomTabs, activateSymptom);
  activateSymptom(0);
  const dataAreas = [
    {
      eyebrow: "Del clic a la conversación",
      question: "¿Qué está trayendo las oportunidades correctas?",
      nodes: [
        ["↗", "Campaña", "Origen"],
        ["↔", "Conversación", "Interés"],
        ["✓", "Oportunidad", "Siguiente paso"],
      ],
      sources: "Campañas, sitio web y seguimiento de prospectos.",
      analysis: "Origen de las conversaciones y avance hacia una oportunidad.",
      decision: "Dónde enfocar el contenido y la inversión en pauta.",
    },
    {
      eyebrow: "De la conversación al seguimiento",
      question: "¿En qué parte se está quedando la venta?",
      nodes: [
        ["↔", "Prospecto", "Primer contacto"],
        ["↗", "Cotización", "Propuesta"],
        ["✓", "Seguimiento", "Avance"],
      ],
      sources: "Registro de prospectos, cotizaciones y seguimiento comercial.",
      analysis:
        "Etapas del proceso, conversaciones pendientes y motivos de cierre.",
      decision: "Qué oportunidades atender y qué parte del proceso mejorar.",
    },
    {
      eyebrow: "Del proceso a la mejora",
      question: "¿Qué tarea necesita dejar de hacerse a mano?",
      nodes: [
        ["↓", "Solicitud", "Entrada"],
        ["✳", "Proceso", "Trabajo"],
        ["✓", "Entrega", "Resultado"],
      ],
      sources: "Hojas de cálculo, formularios, agenda y registros operativos.",
      analysis:
        "Tareas repetidas, puntos de espera y calidad de la información.",
      decision:
        "Qué automatizar primero y cómo comprobar que está funcionando.",
    },
  ];
  const areaTabs = $$("[data-area]");
  function activateArea(index) {
    areaTabs.forEach((b, i) => {
      b.setAttribute("aria-selected", String(i === index));
      b.tabIndex = i === index ? 0 : -1;
    });
    const area = dataAreas[index];
    $("#data-eyebrow").textContent = area.eyebrow;
    $("#data-question").textContent = area.question;
    $("#data-sources").textContent = area.sources;
    $("#data-analysis").textContent = area.analysis;
    $("#data-decision").textContent = area.decision;
    $$("#flow-map>div").forEach((node, i) => {
      $("i", node).textContent = area.nodes[i][0];
      $("b", node).textContent = area.nodes[i][1];
      $("span", node).textContent = area.nodes[i][2];
    });
    $("#data-panel").setAttribute("aria-labelledby", `data-tab-${index}`);
    animatePanel($("#data-panel"));
  }
  connectTabs(areaTabs, activateArea);
  const demos = [
    {
      origin: "Desde una campaña de tu marca ↗",
      incoming: "Hola, vi su publicación. ¿Me pueden dar información?",
      outgoing:
        "¡Claro! Cuéntame qué necesitas y te ayudo a encontrar el siguiente paso.",
      event: "El marketing abre la conversación.",
      title: "Una buena entrada.",
      text: "Una campaña o una página bien pensada lleva el interés al canal donde puedes atenderlo.",
    },
    {
      origin: "Atención con la información de tu negocio",
      incoming: "Busco una opción para mi negocio. ¿Cómo funciona?",
      outgoing:
        "Te explico las opciones con la información de nuestro catálogo. ¿Qué necesitas resolver?",
      event: "La IA organiza la solicitud.",
      title: "Una respuesta con contexto.",
      text: "El asistente responde con la información que tú autorizas y reúne los datos necesarios para avanzar.",
    },
    {
      origin: "El equipo entra cuando se necesita",
      incoming: "Quiero una propuesta para mi caso.",
      outgoing:
        "Voy a pasar tu solicitud al equipo con el contexto de lo que platicamos para que te ayuden.",
      event: "La oportunidad queda lista para tu equipo.",
      title: "El contexto viaja contigo.",
      text: "Tu equipo recibe la conversación organizada para preparar la propuesta o confirmar el siguiente paso.",
    },
    {
      origin: "La información regresa al sistema",
      incoming: "¿Cómo sabemos qué funcionó?",
      outgoing:
        "Conectamos el origen, el avance y el resultado de la oportunidad para revisarlo en el análisis.",
      event: "Los datos orientan la siguiente acción.",
      title: "Cada recorrido deja aprendizaje.",
      text: "La medición ayuda a detectar qué canal trae oportunidades y dónde conviene mejorar el proceso.",
    },
  ];
  $$("[data-demo]").forEach((button) =>
    button.addEventListener("click", () => {
      const index = Number(button.dataset.demo),
        demo = demos[index];
      $$("[data-demo]").forEach((b, i) =>
        b.setAttribute("aria-pressed", String(i === index)),
      );
      $(".chat-origin").textContent = demo.origin;
      $(".incoming").textContent = demo.incoming;
      $(".outgoing").textContent = demo.outgoing;
      const event = $(".chat-event");
      event.replaceChildren(
        Object.assign(document.createElement("span"), { textContent: "↗" }),
        document.createTextNode(demo.event),
      );
      $("#demo-title").textContent = demo.title;
      $("#demo-text").textContent = demo.text;
      animatePanel($("#demo-chat"));
    }),
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.setProperty("--reveal-y", "0px");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    $$(".reveal").forEach((el) => {
      if (!motionOff()) el.style.setProperty("--reveal-y", "18px");
      observer.observe(el);
    });
  }
  const privacy = $("#privacy-dialog");
  $("#privacy-open").addEventListener("click", () => privacy.showModal());
  $(".dialog-close").addEventListener("click", () => privacy.close());
  privacy.addEventListener("click", (event) => {
    if (event.target === privacy) {
      const box = privacy.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      )
        privacy.close();
    }
  });
})();
