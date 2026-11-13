// Formulario de contacto → CRM de Mecha (POST a config.leads).
(() => {
  "use strict";
  const cfg = window.MECHA || {};
  const form = document.getElementById("lead-form");
  if (!form) return;
  if (!cfg.leads) { form.hidden = true; return; }
  const estado = document.getElementById("lead-estado");
  const agenda = document.getElementById("agenda-link");
  if (agenda && cfg.agenda) { agenda.href = cfg.agenda; agenda.hidden = false; }
  form.querySelector("[data-abrir-privacidad]")?.addEventListener("click", () =>
    document.getElementById("privacy-open")?.click());
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const necesidad = document.getElementById("necesidad")?.value || "";
    if (!d.nombre.trim()) return aviso("Escribe tu nombre.", true);
    if (!d.telefono.trim() && !d.correo.trim()) return aviso("Déjanos un WhatsApp o un correo para contestarte.", true);
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; aviso("Enviando…");
    try {
      const r = await fetch(cfg.leads, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...d, necesidad }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "No se pudo enviar.");
      form.reset();
      aviso("¡Listo! Recibimos tus datos y te escribimos pronto.");
      if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { method: "formulario" });
    } catch (e) {
      aviso(`${e.message} También puedes escribirnos por WhatsApp.`, true);
    } finally { btn.disabled = false; }
  });
  function aviso(t, error) { estado.textContent = t; estado.classList.toggle("error", !!error); }
})();
