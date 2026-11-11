// Sección de estadísticas: las tarjetas aparecen tipo pop-up, los anillos se
// dibujan y los números cuentan hacia arriba cuando entran en pantalla.
(() => {
  "use strict";
  const seccion = document.getElementById("panorama");
  if (!seccion) return;
  const sinMovimiento = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.body.classList.contains("motion-paused");
  if (sinMovimiento()) return;

  const piezas = [...seccion.querySelectorAll(".pop")];
  // El retraso escalonado se calcula entre hermanos, no en toda la sección.
  piezas.forEach((el) => {
    const hermanos = [...el.parentElement.children].filter((h) =>
      h.classList.contains("pop"),
    );
    el.style.setProperty("--i", hermanos.indexOf(el));
  });
  seccion.classList.add("pop-ready");

  const contar = (el) => {
    const meta = Number(el.dataset.count);
    const inicio = performance.now();
    const duracion = 1300;
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      el.textContent = Math.round(meta * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(paso);
    };
    el.textContent = "0";
    requestAnimationFrame(paso);
  };

  const mostrar = (el) => {
    el.classList.add("in");
    el.querySelectorAll("[data-count]").forEach(contar);
  };
  // Revisión por posición además del observador: si el navegador no avisa
  // (pestaña en segundo plano, observador limitado), el contenido aparece igual.
  let pendientes = piezas.slice();
  const revisar = () => {
    const alto = innerHeight;
    pendientes = pendientes.filter((el) => {
      const r = el.getBoundingClientRect();
      const visible = r.top < alto * 0.88 && r.bottom > 0;
      if (visible) mostrar(el);
      return !visible;
    });
    if (!pendientes.length) {
      removeEventListener("scroll", revisar);
      removeEventListener("resize", revisar);
    }
  };
  addEventListener("scroll", revisar, { passive: true });
  addEventListener("resize", revisar);
  revisar();
})();
