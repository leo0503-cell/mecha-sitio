// En celular el navegador no descarga el video hasta que se reproduce, y sin
// datos el robot no puede seguir el scroll. Se reproduce un instante (sin
// sonido) y se pausa, solo para que cargue.
(() => {
  "use strict";
  const video = document.getElementById("hero-video");
  if (!video || !matchMedia("(pointer: coarse)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const preparar = () => {
    if (video.readyState >= 2) return;
    const intento = video.play();
    if (intento && intento.then)
      intento.then(() => video.pause()).catch(() => {});
  };
  preparar();
  addEventListener("touchstart", preparar, { once: true, passive: true });
})();
