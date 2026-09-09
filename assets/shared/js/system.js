(() => {
  "use strict";

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setupReveal() {
    const items = [...document.querySelectorAll("[data-reveal]")];
    if (!items.length || prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    items.forEach((item) => observer.observe(item));
  }

  function setupDrawer() {
    const handle = document.querySelector("[data-drawer-handle]");
    const drawer = document.querySelector("[data-drawer]");
    const close = drawer?.querySelector("[data-drawer-close]");
    const prelim = document.querySelector("#preliminares");
    const finalRegion = document.querySelector(".final-region");

    if (!handle || !drawer || !prelim || !finalRegion) return;

    const openDrawer = () => {
      if (typeof drawer.showModal === "function") drawer.showModal();
      else drawer.setAttribute("open", "");
      document.body.classList.add("is-locked");
    };

    const closeDrawer = () => {
      if (typeof drawer.close === "function") drawer.close();
      else drawer.removeAttribute("open");
      document.body.classList.remove("is-locked");
      handle.focus({ preventScroll: true });
    };

    handle.addEventListener("click", openDrawer);
    close?.addEventListener("click", closeDrawer);
    drawer.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDrawer();
    });
    drawer.addEventListener("click", (event) => {
      if (event.target === drawer) closeDrawer();
    });
    drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      if (drawer.open) drawer.close();
      document.body.classList.remove("is-locked");
    }));

    let ticking = false;
    const updateHandle = () => {
      const afterPrelim = window.scrollY > (prelim.offsetTop + prelim.offsetHeight - 24);
      const beforeFinal = window.scrollY + (window.innerHeight * .55) < finalRegion.offsetTop;
      handle.hidden = !(afterPrelim && beforeFinal);
      ticking = false;
    };
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHandle);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateHandle();
  }

  function setupActiveNavigation() {
    const links = [...document.querySelectorAll("[data-nav-link]")];
    if (!links.length || !("IntersectionObserver" in window)) return;

    const linkById = new Map(links.map((link) => [link.getAttribute("href")?.slice(1), link]));
    const sections = [...linkById.keys()].map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      links.forEach((link) => link.removeAttribute("aria-current"));
      linkById.get(active.target.id)?.setAttribute("aria-current", "true");
    }, { rootMargin: "-30% 0px -58% 0px", threshold: [0, .15, .35, .6] });

    sections.forEach((section) => observer.observe(section));
  }

  function setupYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function setupMobileSignatureFix() {
    const signature = document.querySelector(".signature-band");
    if (!signature) return;

    const mobile = window.matchMedia("(max-width: 819px)");
    const apply = () => {
      if (mobile.matches) {
        signature.style.position = "static";
        signature.style.bottom = "auto";
        signature.style.zIndex = "auto";
      } else {
        signature.style.removeProperty("position");
        signature.style.removeProperty("bottom");
        signature.style.removeProperty("z-index");
      }
    };

    apply();
    mobile.addEventListener?.("change", apply);
  }

  /* barra de progresso de leitura — guia vertical que mostra "até onde vai".
     Começa preenchida à metade (via CSS --progress:50%) e completa com o scroll.
     Entra com ~0.5s de atraso para não competir na primeira impressão. */
  function setupReadProgress() {
    const bar = document.querySelector(".read-progress");
    if (!bar) return;
    const fill = bar.querySelector(".read-progress__fill");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;
    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? doc.scrollTop / max : 0;
      // mapeia 0→1 de scroll para 50%→100% de preenchimento: metade já visível de início
      const pct = 50 + ratio * 50;
      if (fill) fill.style.setProperty("--progress", pct.toFixed(1) + "%");
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      (reduce ? update : requestAnimationFrame)(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // atraso antes de aparecer
    window.setTimeout(() => bar.classList.add("is-armed"), reduce ? 0 : 500);
  }

  root.classList.add("js");
  setupReveal();
  setupDrawer();
  setupActiveNavigation();
  setupYear();
  setupMobileSignatureFix();
  setupReadProgress();
})();
