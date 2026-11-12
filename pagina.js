// Comportamiento básico para páginas internas (nosotros.html): WhatsApp, menú,
// animación de entrada y aviso de privacidad. El inicio usa main.js.
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const config = window.MECHA || {};
  const phone = /^\d{10,15}$/.test(config.whatsapp || "")
    ? config.whatsapp
    : "524491557494";
  const msg =
    config.mensaje || "Hola, vi la página de Mecha y quiero un diagnóstico.";
  $$("[data-whatsapp]").forEach((a) => {
    a.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    const small = $("small", a);
    if (small && config.whatsappVisible)
      small.textContent = config.whatsappVisible;
  });

  const nav = $("#navegacion");
  const menu = $(".menu-toggle");
  if (nav && menu) {
    const close = () => {
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Abrir menú");
      nav.classList.remove("open");
    };
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.classList.toggle("open", open);
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".header")) close();
    });
  }

  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !quieto) {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.style.setProperty("--reveal-y", "0px");
            obs.unobserve(en.target);
          }
        }),
      { threshold: 0.12 },
    );
    $$(".reveal").forEach((el) => {
      el.style.setProperty("--reveal-y", "18px");
      obs.observe(el);
    });
  }

  const dlg = $("#privacy-dialog");
  const abrir = $("#privacy-open");
  if (dlg && abrir) {
    abrir.addEventListener("click", () => dlg.showModal());
    const cerrar = $(".dialog-close", dlg);
    if (cerrar) cerrar.addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => {
      if (e.target !== dlg) return;
      const b = dlg.getBoundingClientRect();
      if (
        e.clientX < b.left ||
        e.clientX > b.right ||
        e.clientY < b.top ||
        e.clientY > b.bottom
      )
        dlg.close();
    });
  }
})();
