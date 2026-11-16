// Contacto por ciudad; abrir WhatsApp solo prepara el mensaje, no lo envía.
(() => {
  "use strict";
  const config = window.MECHA || {};
  const city = document.body.dataset.city;
  const phone = String(config.whatsapp || "524491557494").replace(/\D/g, "");
  const message = `Hola, vi la página de Mecha para ${city}. Quiero platicar sobre una necesidad de mi negocio.`;
  for (const link of document.querySelectorAll("[data-whatsapp]")) {
    link.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
  for (const link of document.querySelectorAll("[data-agenda]")) {
    if (
      config.agenda &&
      /^https:\/\/calendar\.google\.com\//.test(config.agenda)
    ) {
      link.href = config.agenda;
      link.hidden = false;
    }
  }

  // La información permanece visible y accesible sin animaciones ni JavaScript.
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const toggle = document.querySelector(".motion-toggle");
  const video = document.querySelector(".local-robot");
  const visual = document.querySelector(".robot-visual");
  const progress = document.querySelector(".reading-progress i");
  const animations = new Set();
  let paused = false;
  let running = false;
  let videoVisible = false;
  let frame = 0;

  function playVideo() {
    if (!video) return;
    if (!running || !videoVisible) {
      video.pause();
      return;
    }
    if (!video.getAttribute("src")) {
      video.src = matchMedia("(max-width: 760px)").matches
        ? video.dataset.mobileSrc
        : video.dataset.desktopSrc;
    }
    const playback = video.play();
    if (playback) playback.catch(() => {}); // El póster conserva la composición.
  }

  function updateMotion() {
    running = !paused && !preference.matches && !document.hidden;
    document.body.classList.toggle("motion-running", running);
    if (toggle) {
      toggle.hidden = false;
      toggle.disabled = preference.matches;
      toggle.setAttribute("aria-pressed", String(paused || preference.matches));
      toggle.textContent = preference.matches
        ? "Movimiento reducido"
        : paused
          ? "Activar movimiento ↗"
          : "Pausar movimiento Ⅱ";
    }
    if (!running) {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      visual?.style.removeProperty("--tilt-x");
      visual?.style.removeProperty("--tilt-y");
      document.querySelectorAll(".button").forEach((button) => {
        button.style.removeProperty("--magnetic-x");
        button.style.removeProperty("--magnetic-y");
      });
    }
    playVideo();
  }

  function enter(element, delay = 0) {
    if (!running || typeof element.animate !== "function") return;
    const animation = element.animate(
      [
        { opacity: 0.12, transform: "translateY(28px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 850,
        delay,
        easing: "cubic-bezier(.16,.8,.2,1)",
        fill: "backwards",
      },
    );
    animations.add(animation);
    const cleanup = () => animations.delete(animation);
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  }

  toggle?.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
  });
  preference.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", updateMotion);
  updateMotion();

  // Observadores sin bucles de dibujo: el vídeo y los ciclos paran fuera de vista.
  if ("IntersectionObserver" in window) {
    const visibility = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
          if (entry.target === visual) {
            videoVisible = entry.isIntersecting;
            playVideo();
          }
        }
      },
      { threshold: 0.05 },
    );
    document
      .querySelectorAll(".robot-visual, .local-ticker, .system")
      .forEach((el) => visibility.observe(el));

    const reveals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          enter(entry.target, Number(entry.target.dataset.enterDelay || 0));
          reveals.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(
        ".section-heading, .service, .example > div, .example-flow > div, .steps > li, .faq > div, .contact-layout > div",
      )
      .forEach((el, index) => {
        el.dataset.enterDelay = String((index % 3) * 65);
        reveals.observe(el);
      });
  } else {
    videoVisible = true;
    playVideo();
  }
  document
    .querySelectorAll(".hero > div:first-child > *, .robot-panel, .site-header")
    .forEach((el, index) => enter(el, Math.min(index * 70, 350)));

  function updateProgress() {
    frame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    const value =
      distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0;
    if (progress) progress.style.transform = `scaleX(${value})`;
  }
  function requestProgress() {
    if (!frame) frame = requestAnimationFrame(updateProgress);
  }
  addEventListener("scroll", requestProgress, { passive: true });
  addEventListener("resize", requestProgress, { passive: true });
  updateProgress();

  // Profundidad y botones magnéticos solo con mouse, sin intervenir el scroll táctil.
  visual?.addEventListener("pointermove", (event) => {
    if (!running || !finePointer.matches) return;
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    visual.style.setProperty("--tilt-x", `${-y * 7}deg`);
    visual.style.setProperty("--tilt-y", `${x * 9}deg`);
  });
  visual?.addEventListener("pointerleave", () => {
    visual.style.removeProperty("--tilt-x");
    visual.style.removeProperty("--tilt-y");
  });
  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (!running || !finePointer.matches) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty(
        "--magnetic-x",
        `${((event.clientX - rect.left) / rect.width - 0.5) * 7}px`,
      );
      button.style.setProperty(
        "--magnetic-y",
        `${((event.clientY - rect.top) / rect.height - 0.5) * 7}px`,
      );
    });
    button.addEventListener("pointerleave", () => {
      button.style.removeProperty("--magnetic-x");
      button.style.removeProperty("--magnetic-y");
    });
  });
})();
