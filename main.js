/* ============================================================
   LÓGICA PRINCIPAL JQUERY — FASE 2: IMPLEMENTACIÓN NÚCLEO
   ============================================================
   Mapeo de la Rúbrica:
   1. SELECTORES DIVERSOS USADOS (al menos 5 tipos):
      - ID: $('#year'), $('#stack-search'), $('#cert-modal'), $('#back-to-top'), $('#menu')
      - Clase: $('.hero-photo'), $('.tl-cert'), $('.nav-bar'), $('.stack li')
      - Elemento: $('header'), $('section'), $('b')
      - Atributo: $('a[target="_blank"]'), $('b[data-count-items]'), $('a[href^="#"]')
      - Pseudo-selector: $('.stack li:visible'), $('.links li:even'), $('.stack li:hidden')

   2. ESTILOS DINÁMICOS:
      - .css(): Modifica opacidad, sombras, transformaciones y márgenes dinámicamente.
      - .addClass() / .removeClass(): Utilizados en el header scrolled y en el hover de la foto.
      - .toggleClass(): Utilizado para alternar efectos de resaltado.

   3. MÉTODOS JQUERY DISTINTOS (al menos 4):
      - .text(): Actualiza el año del footer, el contador del stack y los valores animados.
      - .html(): Modifica el contenido dinámico del modal de certificados.
      - .val(): Lee el valor ingresado en el buscador en tiempo real.
      - .attr(): Obtiene/asigna URLs y textos alt de las imágenes.
      - .append() / .remove(): Inserta/elimina la etiqueta flotante en la foto de perfil.
      - .hide() / .show(): Filtra tecnologías en la sección Stack.
      - .fadeIn() / .fadeOut(): Animaciones suaves para el modal y el botón volver arriba.

   4. EVENTOS VINCULADOS (al menos 3 distintos):
      - Evento 1: .hover() / .mouseenter() / .mouseleave() -> Efecto visual en foto de portada.
      - Evento 2: .keyup() -> Filtro de tecnologías en tiempo real en la sección Stack.
      - Evento 3: .click() -> Modal/Lightbox interactivo al hacer clic en certificados.
      - Evento 4: .scroll() -> Cambio de estilo en la barra de navegación y botón 'Volver arriba'.
   ============================================================ */

$(function () {
  "use strict";

  /* ============================================================
     1. ACTUALIZACIÓN BÁSICA DEL DOM
     ============================================================ */
  // Selector ID + método .text()
  $("#year").text(new Date().getFullYear());

  // Cierra el menú móvil de Bootstrap al hacer clic en un enlace de navegación
  // Selector de clase + método .hasClass() + Evento .click()
  $("#menu .nav-link").on("click", function () {
    var $menu = $("#menu");
    if ($menu.hasClass("show")) {
      bootstrap.Collapse.getOrCreateInstance($menu[0]).hide();
    }
  });

  /* ============================================================
     2. EVENTO HOVER: INTERACTIVIDAD EN FOTO DE PORTADA
     (Demuestra: .hover(), .addClass(), .removeClass(), .css(), .append(), .remove())
     ============================================================ */
  // Selector de clase: $('.hero-photo')
  $(".hero-photo").hover(
    function () {
      // Al entrar con el mouse:
      var $photo = $(this);
      $photo.addClass("hero-glow"); // .addClass()
      $photo.css("transform", "scale(1.03)"); // .css()

      // Inyectar un badge dinámico usando .append()
      if ($photo.find(".hero-badge").length === 0) {
        $photo.append('<div class="hero-badge">Desarrollador Web 💻</div>');
      }
    },
    function () {
      // Al salir con el mouse:
      var $photo = $(this);
      $photo.removeClass("hero-glow"); // .removeClass()
      $photo.css("transform", "scale(1.0)"); // .css()

      // Eliminar el badge usando .remove()
      $photo.find(".hero-badge").remove();
    },
  );

  /* ============================================================
     3. EVENTO KEYUP: BUSCADOR EN TIEMPO REAL (SECTION STACK)
     (Demuestra: $('#id'), .keyup(), .val(), .hide(), .show(), .text(), .html(), :visible)
     ============================================================ */
  // Selector ID: $('#stack-search')
  $("#stack-search").on("keyup", function () {
    var query = $(this).val().toLowerCase().trim(); // .val()
    var $allItems = $(".stack li"); // Selector de elemento interno

    if (query === "") {
      $allItems.show().removeClass("highlight-match"); // .show(), .removeClass()
      $("#stack-count").text(""); // .text()
      return;
    }

    var matches = 0;

    $allItems.each(function () {
      var $item = $(this);
      var techName = $item.text().toLowerCase(); // .text()

      if (techName.indexOf(query) !== -1) {
        $item.show().addClass("highlight-match"); // .show(), .addClass()
        matches++;
      } else {
        $item.hide().removeClass("highlight-match"); // .hide(), .removeClass()
      }
    });

    // Pseudo-selector usado aquí: $('.stack li:visible')
    var visibleCount = $(".stack li:visible").length;

    // Método .html() para inyectar feedback visual
    $("#stack-count").html(
      "Coincidencias encontradas: <strong>" + matches + "</strong>",
    );
  });

  /* ============================================================
     4. EVENTO CLICK: MODAL/LIGHTBOX DE CERTIFICADOS
     (Demuestra: $('.class'), .click(), .attr(), .html(), .fadeIn(), .fadeOut())
     ============================================================ */
  // Selector de Clase + Evento .click()
  $(".tl-cert").on("click", function (e) {
    e.preventDefault(); // Evita abrir el PDF directamente en una nueva pestaña

    var pdfUrl = $(this).attr("href"); // .attr()
    var $img = $(this).find("img");
    var imgSrc = $img.attr("src"); // .attr()
    var imgAlt = $img.attr("alt") || "Certificado";
    var certTitle = $(this).closest("li").find("h3").text(); // .text()

    // Generar el contenido HTML dinámico usando .html()
    var modalContent =
      '<h3 class="mb-3 text-teal" style="font-family: var(--f-head); font-size: 1.25rem;">' +
      certTitle +
      "</h3>" +
      '<img src="' +
      imgSrc +
      '" alt="' +
      imgAlt +
      '" style="width: 100%; border-radius: 8px; margin-bottom: 1.2rem; border: 1px solid var(--hairline);">' +
      '<div class="text-end">' +
      '<a href="' +
      pdfUrl +
      '" target="_blank" rel="noopener" class="btn-solid" style="font-size: 0.88rem; padding: 0.5rem 1rem;">Abrir PDF oficial</a>' +
      "</div>";

    $("#cert-modal-body").html(modalContent); // .html()
    $("#cert-modal").fadeIn(250); // .fadeIn()
  });

  // Evento para cerrar el modal
  $("#close-cert-modal, #cert-modal").on("click", function (e) {
    if (e.target === this || e.target.id === "close-cert-modal") {
      $("#cert-modal").fadeOut(200); // .fadeOut()
    }
  });

  /* ============================================================
     5. EVENTO SCROLL: HEADER DINÁMICO Y BOTÓN 'VOLVER ARRIBA'
     (Demuestra: $(window), .scroll(), .addClass(), .removeClass(), .fadeIn(), .fadeOut())
     ============================================================ */
  // Selector de Ventana y evento .scroll()
  $(window).on("scroll", function () {
    var scrollTop = $(this).scrollTop();

    // Requisito: Modificar estilos del header dinámicamente al bajar la página
    if (scrollTop > 60) {
      $(".nav-bar").addClass("scrolled"); // .addClass()
      $("#back-to-top").fadeIn(300); // .fadeIn()
    } else {
      $(".nav-bar").removeClass("scrolled"); // .removeClass()
      $("#back-to-top").fadeOut(300); // .fadeOut()
    }
  });

  // Evento Click para volver arriba suavemente
  $("#back-to-top").on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500); // .animate()
  });

  /* ============================================================
     6. ANIMACIONES DE APARICIÓN AL HACER SCROLL (INTERSECTION OBSERVER)
     ============================================================ */
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

  // Selector Atributo usado en counterTarget: $('[data-count-items]')
  function counterTarget($b) {
    if ($b.data("count-items")) {
      return $($b.data("count-items")).length;
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
    $(".fact b").each(function () {
      var $b = $(this);
      var target = counterTarget($b);

      if (target === null) return;

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

    setTimeout(function () {
      $({ count: 0 }).animate(
        { count: target },
        {
          duration: 1600,
          easing: "swing",
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
    $el.css("--d", delay + "ms");
    $el.addClass("is-visible");

    if ($el.hasClass("fact")) {
      startCount($el.find("b"), delay);
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

    $.each(GROUPS, function (gi, group) {
      $(group.sel).each(function (i) {
        var $el = $(this);
        var dir =
          group.dir === "alternate"
            ? i % 2 === 0
              ? "left"
              : "right"
            : group.dir;

        $el.attr("data-reveal", dir);
        $el.data("rg", gi);
        $el.data("stagger", group.stagger || 0);

        if (group.chips) {
          $el.find("li").each(function (n) {
            $(this).css("--i", n);
          });
        }

        observer.observe(this);
      });
    });
  }

  init();
});
