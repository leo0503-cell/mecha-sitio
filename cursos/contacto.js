const cotizacion = document.querySelector("#cotizacion");

cotizacion.addEventListener("submit", (event) => {
  event.preventDefault();
  const datos = new FormData(cotizacion);
  const mensaje = [
    "Hola, Mecha. Vi la página de cursos y quiero solicitar una cotización.",
    `Modalidad: ${datos.get("formato")}`,
    `Personas: ${datos.get("participantes")}`,
  ];
  const objetivo = datos.get("objetivo").trim();
  if (objetivo) mensaje.push(`Objetivo: ${objetivo}`);

  window.location.assign(
    `https://wa.me/524491557494?text=${encodeURIComponent(mensaje.join("\n"))}`,
  );
});

cotizacion.hidden = false;
