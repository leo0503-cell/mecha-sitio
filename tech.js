(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const canPoint = () => fine.matches && innerWidth > 760;
  const loader = $(".site-loader");
  const skip = $(".loader-skip");
  let released = false;
  const started = performance.now();
  let motion =
    !media.matches && !document.body.classList.contains("motion-paused");
  const animations = new Set();
  const play = (el, frames, options) => {
    if (!motion || !el || !el.animate) return;
    const animation = el.animate(frames, options);
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
    animation.oncancel = () => animations.delete(animation);
  };
  function releaseLoader() {
    if (released) return;
    released = true;
    loader.classList.add("done");
    loader.setAttribute("aria-hidden", "true");
    skip.tabIndex = -1;
    document.body.classList.add("scene-ready");
    const next = () => {
      loader.hidden = true;
      if (document.activeElement === skip)
        $(".hero-cta").focus({ preventScroll: true });
    };
    setTimeout(next, motion ? 720 : 0);
    play(
      $(".header"),
      [
        { transform: "translateY(-18px)", opacity: 0.55 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 750, easing: "cubic-bezier(.16,.8,.2,1)" },
    );
    play(
      $(".hero-copy"),
      [
        { transform: "translateY(28px) rotateX(4deg)", opacity: 0.65 },
        { transform: "translateY(0) rotateX(0)", opacity: 1 },
      ],
      { duration: 1000, easing: "cubic-bezier(.16,.8,.2,1)" },
    );
    play(
      $(".robot-stage"),
      [
        { transform: "translateY(35px) scale(.96)", opacity: 0.55 },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ],
      { duration: 1250, easing: "cubic-bezier(.16,.8,.2,1)" },
    );
  }
  skip.addEventListener("click", releaseLoader);
  if (!motion) releaseLoader();
  else {
    const poster = new Image();
    poster.src = $("#hero-video").poster;
    Promise.allSettled([document.fonts.ready, poster.decode()]).then(() =>
      setTimeout(
        releaseLoader,
        Math.max(0, 650 - (performance.now() - started)),
      ),
    );
    setTimeout(releaseLoader, 2200);
  }

  const canvas = $("#hero-network");
  const context = canvas.getContext("2d", { alpha: true });
  const stage = $(".robot-stage");
  const cursor = $(".tech-cursor");
  const aura = $(".cursor-aura");
  const label = $(".cursor-label");
  const reading = $(".reading-line>i");
  const signals = $$(".hero-signal>span");
  let width = innerWidth,
    height = innerHeight,
    dpr = 1,
    sceneVisible = true,
    raf = 0,
    lastPaint = 0;
  let pointerX = width / 2,
    pointerY = height / 2,
    cursorX = pointerX,
    cursorY = pointerY,
    pointerSeen = false;
  let scenePhase = 0,
    readingDirty = true;
  const points = Array.from({ length: 64 }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / 64,
      r = Math.sqrt(1 - y * y),
      a = i * 2.399963229728653;
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r, hot: i % 9 === 0 };
  });
  function requestTick() {
    if (!raf && motion && !document.hidden) raf = requestAnimationFrame(tick);
  }
  let canvasListo = false;
  function resize() {
    // En celular la barra del navegador aparece/desaparece al scrollear y
    // dispara resize; redimensionar el canvas ahí congela el scroll.
    const nuevoAlto = $(".hero-sticky").getBoundingClientRect().height;
    if (canvasListo && innerWidth === width && Math.abs(nuevoAlto - height) < 140) {
      readingDirty = true;
      requestTick();
      return;
    }
    canvasListo = true;
    width = innerWidth;
    height = nuevoAlto;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0);
    readingDirty = true;
    if (!canPoint()) {
      cursor.classList.remove("visible");
      aura.classList.remove("on");
      stage.style.setProperty("--stage-x", "0deg");
      stage.style.setProperty("--stage-y", "0deg");
    }
    if (!motion) drawNetwork(performance.now());
    requestTick();
  }
  function drawNetwork(time) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    const narrow = width < 761;
    const angle = time * 0.000045,
      yaw = angle + (pointerX / width - 0.5) * 0.12;
    const radius = Math.min(
      width * (narrow ? 0.47 : 0.25),
      height * (narrow ? 0.21 : 0.38),
    );
    const cx = width * (narrow ? 0.7 : 0.73),
      cy = height * (narrow ? 0.69 : 0.49);
    const list = points.slice(0, narrow ? 36 : 64).map((p) => {
      const x = p.x * Math.cos(yaw) - p.z * Math.sin(yaw),
        z = p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
      const perspective = 3 / (3 + z);
      return {
        x: cx + x * radius * perspective,
        y: cy + p.y * radius * perspective,
        z,
        hot: p.hot,
      };
    });
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i],
          b = list[j],
          distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > radius * 0.43) continue;
        const alpha = (1 - distance / (radius * 0.43)) * 0.18;
        context.strokeStyle = `rgba(${a.hot ? "255,97,82" : "180,182,194"},${alpha})`;
        context.lineWidth = 0.65;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    list.forEach((p) => {
      const alpha = 0.2 + (1 - p.z) * 0.15;
      context.fillStyle = p.hot
        ? `rgba(255,97,82,${alpha + 0.2})`
        : `rgba(190,193,204,${alpha})`;
      context.beginPath();
      context.arc(p.x, p.y, p.hot ? 2 : 1, 0, Math.PI * 2);
      context.fill();
    });
  }
  function updateReading() {
    const total = document.documentElement.scrollHeight - innerHeight;
    const amount = total > 0 ? Math.max(0, Math.min(1, scrollY / total)) : 0;
    reading.style.transform = `scaleX(${amount})`;
    const hero = $(".hero-journey");
    scenePhase = Math.max(
      0,
      Math.min(
        1,
        -hero.getBoundingClientRect().top /
          Math.max(1, hero.offsetHeight - $(".hero-sticky").offsetHeight),
      ),
    );
    signals.forEach((s, i) =>
      s.classList.toggle(
        "active",
        i === (scenePhase < 0.34 ? 0 : scenePhase < 0.68 ? 1 : 2),
      ),
    );
    readingDirty = false;
  }
  function tick(time) {
    raf = 0;
    if (!motion || document.hidden) return;
    let keep = false;
    if (readingDirty) updateReading();
    if (canPoint() && pointerSeen) {
      cursorX += (pointerX - cursorX) * 0.19;
      cursorY += (pointerY - cursorY) * 0.19;
      cursor.style.transform = `translate(${cursorX - 18}px,${cursorY - 18}px)`;
      aura.style.transform = `translate(${pointerX - 200}px,${pointerY - 200}px)`;
      if (Math.abs(pointerX - cursorX) + Math.abs(pointerY - cursorY) > 0.15)
        keep = true;
      if (sceneVisible) {
        stage.style.setProperty(
          "--stage-x",
          `${-(pointerY / innerHeight - 0.5) * 4}deg`,
        );
        stage.style.setProperty(
          "--stage-y",
          `${(pointerX / width - 0.5) * 6}deg`,
        );
      }
    }
    if (sceneVisible) {
      if (time - lastPaint > (canPoint() ? 32 : 66)) {
        drawNetwork(time);
        lastPaint = time;
      }
      keep = true;
    }
    if (keep) requestTick();
  }
  const sceneObserver = new IntersectionObserver(
    (entries) => {
      sceneVisible = entries[0].isIntersecting;
      requestTick();
    },
    { threshold: 0 },
  );
  sceneObserver.observe($(".hero-sticky"));
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "scroll",
    () => {
      readingDirty = true;
      if (!motion) updateReading();
      else requestTick();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else requestTick();
  });
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch" || !motion || !canPoint()) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerSeen) {
        cursorX = pointerX;
        cursorY = pointerY;
        pointerSeen = true;
      }
      cursor.classList.add("visible");
      aura.classList.add("on");
      requestTick();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    cursor.classList.remove("visible");
    aura.classList.remove("on");
    pointerSeen = false;
  });
  document.addEventListener(
    "pointerover",
    (event) => {
      if (!canPoint() || !motion) return;
      const target = event.target.closest("a,button,summary,select,input");
      cursor.classList.toggle("target", !!target);
      label.textContent = target
        ? target.matches("summary")
          ? "EXPLORAR"
          : target.matches("select,input")
            ? "ELEGIR"
            : target.matches('a[target="_blank"]')
              ? "ABRIR"
              : "VER"
        : "";
    },
    { passive: true },
  );
  document.addEventListener(
    "pointerdown",
    () => cursor.classList.add("pressed"),
    { passive: true },
  );
  document.addEventListener(
    "pointerup",
    () => cursor.classList.remove("pressed"),
    { passive: true },
  );
  $$(".service-art,.symptom-panel,.plan").forEach(
    (el) => (el.dataset.tilt = el.classList.contains("plan") ? "2" : "6"),
  );
  $$("[data-tilt]").forEach((el) => {
    let bounds;
    el.addEventListener("pointerenter", () => {
      if (motion && canPoint()) bounds = el.getBoundingClientRect();
    });
    el.addEventListener(
      "pointermove",
      (event) => {
        if (!motion || !canPoint() || !bounds) return;
        const x = Math.max(
          0,
          Math.min(1, (event.clientX - bounds.left) / bounds.width),
        );
        const y = Math.max(
          0,
          Math.min(1, (event.clientY - bounds.top) / bounds.height),
        );
        const strength = Number(el.dataset.tilt) || 4;
        el.classList.add("is-tilting");
        el.style.setProperty("--tilt-x", `${(0.5 - y) * strength}deg`);
        el.style.setProperty("--tilt-y", `${(x - 0.5) * strength}deg`);
        el.style.setProperty("--light-x", `${x * 100}%`);
        el.style.setProperty("--light-y", `${y * 100}%`);
      },
      { passive: true },
    );
    el.addEventListener("pointerleave", () => {
      el.classList.remove("is-tilting");
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
      bounds = null;
    });
  });
  $$(".magnetic").forEach((el) => {
    let bounds;
    el.addEventListener("pointerenter", () => {
      if (motion && canPoint()) bounds = el.getBoundingClientRect();
    });
    el.addEventListener(
      "pointermove",
      (event) => {
        if (motion && canPoint() && bounds)
          el.style.translate = `${(event.clientX - bounds.left - bounds.width / 2) * 0.08}px ${(event.clientY - bounds.top - bounds.height / 2) * 0.12}px`;
      },
      { passive: true },
    );
    el.addEventListener("pointerleave", () => {
      el.style.translate = "0px 0px";
      bounds = null;
    });
    el.addEventListener("click", (event) => {
      if (!motion) return;
      const box = el.getBoundingClientRect(),
        ripple = document.createElement("i");
      ripple.className = "interaction-ripple";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.setProperty(
        "--ripple-x",
        `${event.detail ? event.clientX - box.left : box.width / 2}px`,
      );
      ripple.style.setProperty(
        "--ripple-y",
        `${event.detail ? event.clientY - box.top : box.height / 2}px`,
      );
      el.append(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), {
        once: true,
      });
      setTimeout(() => ripple.remove(), 800);
    });
  });
  const enterObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        enterObserver.unobserve(entry.target);
        play(
          entry.target,
          [
            { transform: "translateY(26px) rotateX(3deg)", opacity: 0.65 },
            { transform: "translateY(0) rotateX(0)", opacity: 1 },
          ],
          { duration: 850, easing: "cubic-bezier(.16,.8,.2,1)" },
        );
      }),
    { threshold: 0.12 },
  );
  $$(
    ".service-row,.data-core-strip,.lab-copy,.demo-stage,.process-list article,.collaboration-title,.contact h2",
  ).forEach((el) => enterObserver.observe(el));
  document.addEventListener("mecha:motion", (event) => {
    motion = !event.detail.paused;
    if (!motion) {
      releaseLoader();
      animations.forEach((a) => a.cancel());
      cancelAnimationFrame(raf);
      raf = 0;
      stage.style.setProperty("--stage-x", "0deg");
      stage.style.setProperty("--stage-y", "0deg");
      cursor.classList.remove("visible");
      aura.classList.remove("on");
      updateReading();
    } else requestTick();
  });
  resize();
  updateReading();
  requestTick();
})();
