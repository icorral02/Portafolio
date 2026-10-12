/* ============================================================
   LÓGICA PRINCIPAL Y ANIMACIONES (Versión jQuery)
   ============================================================ */

// $(function() { ... }) es la versión corta de $(document).ready() en jQuery.
// Asegura que el código se ejecute solo cuando el HTML esté completamente cargado.
$(function () {
  "use strict";

  /* --- MIGRACIÓN DEL SCRIPT INTEGRADO EN EL HTML --- */

  // 1. Actualizar el año en el footer usando .text()
  $("#year").text(new Date().getFullYear());

  // 2. Cerrar el menú móvil al elegir una sección usando el manejador .on()
  $("#menu .nav-link").on("click", function () {
    var $menu = $("#menu");
    // .hasClass() reemplaza a classList.contains()
    if ($menu.hasClass("show")) {
      bootstrap.Collapse.getOrCreateInstance($menu[0]).hide();
    }
  });

  /* --- ANIMACIONES AL HACER SCROLL --- */

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  var GROUPS = [
    { sel: ".hero-text", dir: "left" },
    { sel: ".hero-photo", dir: "right" },
    { sel: ".fact", dir: "up", stagger: 120 },
    { sel: ".band > .h-sec, .band > .lede", dir: "up" },
    { sel: ".about > div:first-child", dir: "left" },
    { sel: ".about > div:last-child", dir: "right" },
    { sel: ".way", dir: "alternate", stagger: 120 },
    { sel: ".proj", dir: "alternate" },
    { sel: ".tl > li", dir: "up", stagger: 150 },
    { sel: ".stack > div", dir: "up", stagger: 300, chips: true },
    { sel: ".contact > div", dir: "left" },
    { sel: ".links", dir: "right" },
  ];

  // Evalúa de dónde sacar el número para el contador
  function counterTarget($b) {
    // .data() lee los atributos data-* de HTML5
    if ($b.data("count-items")) {
      return $($b.data("count-items")).length; // .length cuenta los elementos encontrados
    }
    if ($b.data("since")) {
      var p = $b.data("since").split("-");
      var now = new Date();
      var months =
        (now.getFullYear() - Number(p[0])) * 12 +
        (now.getMonth() + 1 - Number(p[1]));
      return Math.max(0, Math.floor(months / 12));
    }
    if ($b.data("count")) return Number($b.data("count"));
    return null;
  }

  function prepareCounters() {
    // .each() reemplaza a .forEach()
    $(".fact b").each(function () {
      var $b = $(this); // $(this) envuelve el elemento actual en jQuery
      var target = counterTarget($b);

      if (target === null) return;

      // Guardamos la información en el elemento usando .data()
      $b.data("target", target);
      var suffix = $b.data("suffix") || "";
      $b.data("suffix", suffix);

      $b.text("0" + suffix);
    });
  }

  function startCount($b, delay) {
    var target = $b.data("target");
    if (target === undefined) return;
    var suffix = $b.data("suffix");

    // Esperamos el delay y luego usamos la función .animate() de jQuery.
    // En lugar de requestAnimationFrame puro, animamos un objeto ficticio y
    // usamos la propiedad "step" para actualizar el texto en cada fotograma.
    setTimeout(function () {
      $({ count: 0 }).animate(
        { count: target },
        {
          duration: 1600,
          easing: "swing", // Efecto de aceleración/desaceleración propio de jQuery
          step: function () {
            $b.text(Math.round(this.count) + suffix);
          },
          complete: function () {
            $b.text(target + suffix);
          },
        },
      );
    }, delay);
  }

  function reveal(el, delay) {
    var $el = $(el);

    // .css() asigna variables CSS (reemplaza a style.setProperty)
    $el.css("--d", delay + "ms");
    $el.addClass("is-visible");

    // .hasClass() en lugar de classList.contains()
    if ($el.hasClass("fact")) {
      // .find() busca dentro de los hijos del elemento
      startCount($el.find("b"), delay);
    }
  }

  // Mantenemos IntersectionObserver como API nativa, pero operamos con jQuery adentro
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
          return e.isIntersecting || e.boundingClientRect.bottom <= 0;
        })
        .sort(inDocumentOrder)
        .forEach(function (entry) {
          var el = entry.target;
          var $el = $(el);
          var delay = 0;

          if (entry.isIntersecting) {
            var g = $el.data("rg");
            rank[g] = rank[g] === undefined ? 0 : rank[g] + 1;
            delay = rank[g] * Number($el.data("stagger"));
          }

          reveal(el, delay);
          observer.unobserve(el);
        });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );

  function init() {
    prepareCounters();

    // $.each sirve para iterar arrays en jQuery
    $.each(GROUPS, function (gi, group) {
      // $(group.sel) encuentra todos los elementos; .each() los recorre
      $(group.sel).each(function (i) {
        var $el = $(this);
        var dir =
          group.dir === "alternate"
            ? i % 2 === 0
              ? "left"
              : "right"
            : group.dir;

        // .attr() modifica atributos directamente; .data() guarda información virtual
        $el.attr("data-reveal", dir);
        $el.data("rg", gi);
        $el.data("stagger", group.stagger || 0);

        if (group.chips) {
          $el.find("li").each(function (n) {
            $(this).css("--i", n);
          });
        }

        // Pasamos "this" (el elemento nativo) al observer porque este no entiende objetos jQuery
        observer.observe(this);
      });
    });
  }

  init();
});
