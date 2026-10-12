/* ============================================================
   ANIMACIONES AL HACER SCROLL
   - Aparición con IntersectionObserver (una sola vez por elemento).
   - Contadores de las cards de datos.
   - No toca el HTML: asigna las animaciones por selector (GROUPS).
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Sin soporte o con movimiento reducido: el contenido queda estático y visible.
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  /* ----------------------------------------------------------
     CONFIGURACIÓN
     dir:     "up" | "left" | "right" | "alternate" (izquierda, derecha, ...)
     stagger: ms de diferencia entre elementos de este grupo que entran
              al viewport a la vez (p. ej. 4 cards en una misma fila).
     chips:   numera los <li> internos para el escalonado del Stack.
     ---------------------------------------------------------- */
  var GROUPS = [
    // Hero: entra al cargar (ya está a la vista)
    { sel: ".hero-text", dir: "left" },
    { sel: ".hero-photo", dir: "right" },

    // Datos: de abajo hacia arriba, con conteo
    { sel: ".fact", dir: "up", stagger: 120 },

    // Títulos y subtítulos de sección
    { sel: ".band > .h-sec, .band > .lede", dir: "up" },

    // Sobre mí: columna izquierda por la izquierda, derecha por la derecha
    { sel: ".about > div:first-child", dir: "left" },
    { sel: ".about > div:last-child", dir: "right" },

    // Cómo trabajo: alterna izquierda / derecha
    { sel: ".way", dir: "alternate", stagger: 120 },

    // Proyectos: uno por la izquierda, otro por la derecha
    { sel: ".proj", dir: "alternate" },

    // Certificaciones: de abajo hacia arriba, una por una
    { sel: ".tl > li", dir: "up", stagger: 150 },

    // Stack: lenguajes → librerías → herramientas, de abajo hacia arriba
    { sel: ".stack > div", dir: "up", stagger: 300, chips: true },

    // Contacto
    { sel: ".contact > div", dir: "left" },
    { sel: ".links", dir: "right" },
  ];

  /* ----------------------------------------------------------
     CONTADORES
     Fuentes del valor final, en este orden (atributos de <b>):
       data-count-items=".selector"  -> cuántos elementos existen
       data-since="AAAA-MM"          -> años completos desde esa fecha
       data-count="N"                -> valor fijo
     data-suffix="..." se agrega después del número.
     ---------------------------------------------------------- */
  function counterTarget(b) {
    if (b.dataset.countItems) {
      return document.querySelectorAll(b.dataset.countItems).length;
    }
    if (b.dataset.since) {
      var p = b.dataset.since.split("-");
      var now = new Date();
      var months =
        (now.getFullYear() - Number(p[0])) * 12 +
        (now.getMonth() + 1 - Number(p[1]));
      return Math.max(0, Math.floor(months / 12));
    }
    if (b.dataset.count) return Number(b.dataset.count);
    return null;
  }

  function prepareCounters() {
    document.querySelectorAll(".fact b").forEach(function (b) {
      var target = counterTarget(b);
      if (target === null) return;
      b._target = target;
      b._suffix = b.dataset.suffix || "";
      b.textContent = "0" + b._suffix;
    });
  }

  function startCount(b, delay) {
    if (!b || b._target === undefined) return;
    var duration = 1600;
    var t0 = null;

    function frame(ts) {
      if (t0 === null) t0 = ts + delay;
      var p = Math.min(Math.max((ts - t0) / duration, 0), 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      b.textContent = Math.round(b._target * eased) + b._suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------
     REVELADO
     ---------------------------------------------------------- */
  function reveal(el, delay) {
    el.style.setProperty("--d", delay + "ms");
    el.classList.add("is-visible");
    if (el.classList.contains("fact")) {
      startCount(el.querySelector("b"), delay);
    }
  }

  function inDocumentOrder(a, b) {
    return a.target.compareDocumentPosition(b.target) &
      Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      var rank = {};

      entries
        .filter(function (e) {
          // Visible ahora, o ya quedó por encima del viewport
          // (recarga a media página, salto por ancla, scroll rápido).
          return e.isIntersecting || e.boundingClientRect.bottom <= 0;
        })
        .sort(inDocumentOrder)
        .forEach(function (entry) {
          var el = entry.target;
          var delay = 0;

          if (entry.isIntersecting) {
            var g = el.dataset.rg;
            rank[g] = rank[g] === undefined ? 0 : rank[g] + 1;
            delay = rank[g] * Number(el.dataset.stagger);
          }

          reveal(el, delay);
          observer.unobserve(el);
        });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  function init() {
    prepareCounters();

    GROUPS.forEach(function (group, gi) {
      document.querySelectorAll(group.sel).forEach(function (el, i) {
        var dir =
          group.dir === "alternate" ? (i % 2 === 0 ? "left" : "right") : group.dir;

        el.setAttribute("data-reveal", dir);
        el.dataset.rg = gi;
        el.dataset.stagger = group.stagger || 0;

        if (group.chips) {
          el.querySelectorAll("li").forEach(function (li, n) {
            li.style.setProperty("--i", n);
          });
        }

        observer.observe(el);
      });
    });
  }

  init();
})();