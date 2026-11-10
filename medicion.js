// Medición de visitas. Apagada mientras config.js no tenga un identificador.
// GoatCounter: cuenta visitas sin cookies. GA4: de Google, usa cookies.
(() => {
  "use strict";
  const m = (window.MECHA || {}).medicion || {};
  const goat = /^[a-z0-9-]{2,60}$/.test(m.goatcounter || "")
    ? m.goatcounter
    : null;
  const ga4 = /^G-[A-Z0-9]{6,14}$/.test(m.ga4 || "") ? m.ga4 : null;
  if (!goat && !ga4) return;

  const cargar = (src, datos = {}) => {
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    Object.assign(s.dataset, datos);
    document.head.appendChild(s);
  };
  if (goat)
    cargar("https://gc.zgo.at/count.js", {
      goatcounter: `https://${goat}.goatcounter.com/count`,
    });
  if (ga4) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ga4);
    cargar(`https://www.googletagmanager.com/gtag/js?id=${ga4}`);
  }

  // Cada clic a WhatsApp cuenta como evento, con el botón de origen.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="https://wa.me/"]');
    if (!a) return;
    const origen = a.id || (a.closest("section") || {}).id || "otro";
    if (goat && window.goatcounter && window.goatcounter.count)
      window.goatcounter.count({
        path: `whatsapp-${origen}`,
        title: "Clic a WhatsApp",
        event: true,
      });
    if (ga4) window.gtag("event", "clic_whatsapp", { origen });
  });

  // El aviso deja de decir que no hay analítica.
  const p = document.getElementById("privacy-medicion");
  if (p)
    p.textContent =
      "Este sitio no incluye formularios que almacenen tus datos. Medimos las visitas y los clics a WhatsApp" +
      (ga4
        ? " con Google Analytics, que usa cookies."
        : " de forma agregada, sin cookies y sin identificarte.") +
      " Las selecciones del recorrido se usan únicamente en tu navegador.";
})();
