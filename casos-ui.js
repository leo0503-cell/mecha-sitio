(() => {
  "use strict";
  const datos = window.MECHA_CASOS || [];
  const cfg = window.MECHA || {};
  const tel = /^\d{10,15}$/.test(cfg.whatsapp || "") ? cfg.whatsapp : "524491557494";
  const lista = document.getElementById("casos-lista");
  const filtros = document.getElementById("casos-filtros");
  const q = document.getElementById("casos-q");
  const mas = document.getElementById("casos-mas");
  if (!lista || !datos.length) return;

  const PASO = 6;
  const corto = (c) => c.split(" y ")[0].replace(/^Operación$/, "Automatizaciones");
  const sinAcento = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const cats = [...new Set(datos.map((d) => d[2]))];
  let cat = "", visibles = PASO;

  const chip = (valor, texto) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = texto;
    b.dataset.cat = valor;
    b.setAttribute("aria-pressed", valor === cat);
    filtros.append(b);
  };
  chip("", "Destacados");
  cats.forEach((c) => chip(c, corto(c)));

  function filtrados() {
    const t = sinAcento(q.value.trim());
    if (t) return datos.filter((d) => sinAcento(d.join(" ")).includes(t));
    if (cat) return datos.filter((d) => d[2] === cat);
    return datos.filter((d) => d[3]);
  }

  function pintar() {
    const todos = filtrados();
    lista.replaceChildren(
      ...todos.slice(0, visibles).map(([titulo, frase, categoria]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `https://wa.me/${tel}?text=${encodeURIComponent(
          `Hola, vi la página de Mecha. Me interesa: ${titulo}.\n"${frase}"`,
        )}`;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `<span class="micro"></span><b></b><q></q><i aria-hidden="true">↗</i>`;
        a.querySelector(".micro").textContent = corto(categoria);
        a.querySelector("b").textContent = titulo;
        a.querySelector("q").textContent = frase;
        li.append(a);
        return li;
      }),
    );
    if (!todos.length) {
      const li = document.createElement("li");
      li.className = "casos-vacio";
      li.textContent = "No encontramos ese caso, pero seguro se puede. Escríbenos abajo.";
      lista.append(li);
    }
    const resto = todos.length - visibles;
    mas.hidden = resto <= 0;
    mas.textContent = `Ver ${Math.min(resto, PASO * 2)} más`;
  }

  filtros.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    cat = b.dataset.cat;
    q.value = "";
    visibles = PASO;
    filtros.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    pintar();
  });
  q.addEventListener("input", () => {
    visibles = PASO;
    filtros.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", !q.value && x.dataset.cat === cat));
    pintar();
  });
  mas.addEventListener("click", () => { visibles += PASO * 2; pintar(); });
  pintar();
})();
