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
})();
