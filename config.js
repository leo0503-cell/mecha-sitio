// Configuración editable de Mecha. No incluyas credenciales en este archivo.
window.MECHA = {
  whatsapp: "524491557494",
  whatsappVisible: "449 155 7494",
  mensaje: "Hola, vi la página de Mecha y quiero un diagnóstico de mi negocio.",
  mostrarPrecios: false,
  // Sustituye null por el texto confirmado, por ejemplo: "<precio confirmado>".
  // Los precios solo aparecen si mostrarPrecios es true y hay un texto válido.
  precios: { diagnostico: null, apps: null, procesos: null, datos: null },
  // Medición de visitas. Con null queda apagada.
  // goatcounter: el nombre de tu cuenta (el "micuenta" de micuenta.goatcounter.com).
  // ga4: el ID de medición de Google Analytics, con forma "G-XXXXXXXXXX".
  // Formulario de contacto → CRM de Mecha. Con null el formulario se oculta.
  leads: "https://mecha-crm.pages.dev/api/lead",
  // Liga de "Agendar diagnóstico" (citas de Google Calendar). Con null no aparece.
  agenda: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0veAaA2gaBzOmVh_d6UluOCZYJzSWx5nGNk08JdRHGGij-q-cUo2esL000GqmsGIt5MteYx5YU",
  medicion: { goatcounter: null, ga4: "G-NHZ0XHEVE7" },
};
