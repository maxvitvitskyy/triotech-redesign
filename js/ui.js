/* ============================================================================
   Triotech — дрібна логіка редизайну.
   Поява блоків, рік у підвалі, кнопка заявки в шапці.
   ============================================================================ */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    /* --- рік у підвалі --- */
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* --- будь-яка кнопка [data-quote] відкриває модалку --- */
    var popup = document.querySelector(".popup");
    var overlay = document.querySelector(".overlay");
    if (popup && overlay) {
      document.addEventListener("click", function (e) {
        var trigger = e.target.closest("[data-quote]");
        if (!trigger) return;
        popup.classList.add("popup__show");
        overlay.classList.add("active-overlay");
        document.documentElement.classList.add("block");
        var first = popup.querySelector("input, textarea");
        if (first) setTimeout(function () { first.focus(); }, 260);
      });
    }

    /* --- матове скло на гранях трикутника ---
       Всередину кожної грані кладемо копію фонового фото геро, розмиваємо її
       і ставимо рівно там, де стоїть оригінал. Виходить справжнє розмиття
       того, що «за склом», і воно працює скрізь однаково — на відміну від
       backdrop-filter, який Safari поруч із обрізаною формою не малює. */
    (function () {
      var hero = document.querySelector(".start__bg img");
      var panes = document.querySelectorAll(".triad-nav__glass");
      if (!hero || !panes.length) return;

      function place() {
        if (!hero.naturalWidth) return;
        var box = hero.getBoundingClientRect();
        // фото вставлене з object-fit:cover — рахуємо, якою воно намальоване
        var scale = Math.max(box.width / hero.naturalWidth, box.height / hero.naturalHeight);
        var w = hero.naturalWidth * scale;
        var h = hero.naturalHeight * scale;
        var x = box.left + (box.width - w) / 2;
        var y = box.top + (box.height - h) / 2;

        Array.prototype.forEach.call(panes, function (pane) {
          var img = pane.querySelector(".triad-nav__blur");
          if (!img) {
            img = document.createElement("img");
            img.className = "triad-nav__blur";
            img.alt = "";
            img.setAttribute("aria-hidden", "true");
            img.src = hero.currentSrc || hero.src;
            pane.insertBefore(img, pane.firstChild);
          }
          var pr = pane.getBoundingClientRect();
          img.style.width = w + "px";
          img.style.height = h + "px";
          img.style.left = (x - pr.left) + "px";
          img.style.top = (y - pr.top) + "px";
        });
      }

      if (hero.complete) place(); else hero.addEventListener("load", place);
      window.addEventListener("resize", place);
      window.addEventListener("orientationchange", place);
      setTimeout(place, 300);   // після того, як шрифти змінять розкладку
    })();

    /* --- тап по розмитому тлу закриває мобільне меню --- */
    (function () {
      var scrim = document.querySelector(".nav-scrim");
      var header = document.querySelector(".header");
      if (!scrim || !header) return;
      scrim.addEventListener("click", function () {
        header.classList.remove("header--open");
        document.documentElement.classList.remove("block");
        var burger = document.querySelector(".hamburger");
        if (burger) burger.classList.remove("hamburger--active");
      });
    })();

    /* --- знак-трикутник на головній ---
       Жодна грань не активна за замовчуванням. Наводиш на грань або на
       відповідну картку внизу — саме її сектор і засвічується. Класи ті
       самі, що й на сторінках галузей, тож стилі спільні. */
    (function () {
      var triad = document.querySelector(".primary__triad");
      if (!triad) return;

      var edges = triad.querySelectorAll(".triad-edge");
      var faces = {};
      Array.prototype.forEach.call(triad.querySelectorAll(".triad-nav__item"), function (item, i) {
        var key = (/triad-nav__item--([a-z]+)/.exec(item.className) || [])[1];
        if (key) faces[key] = { item: item, edge: edges[i] };
      });

      function keyOf(href) {
        var m = /(Military|OilGas|Industrial)/i.exec(href || "");
        return m ? m[1].toLowerCase() : null;
      }

      function light(key, on) {
        var f = faces[key];
        if (!f) return;
        f.item.classList.toggle("is-active", on);
        if (f.edge) f.edge.classList.toggle("is-lit", on);
      }

      function bind(el, key) {
        if (!key || !faces[key]) return;
        el.addEventListener("mouseenter", function () { light(key, true); });
        el.addEventListener("mouseleave", function () { light(key, false); });
        el.addEventListener("focusin", function () { light(key, true); });
        el.addEventListener("focusout", function () { light(key, false); });
      }

      Object.keys(faces).forEach(function (key) {
        bind(faces[key].item, key);
      });
      Array.prototype.forEach.call(document.querySelectorAll(".primary__item"), function (card) {
        var link = card.querySelector(".primary__cover") || card.querySelector(".primary__link");
        bind(card, keyOf(link && link.getAttribute("href")));
      });
    })();

    /* --- поява блоків при прокрутці --- */
    var targets = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!targets.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    /* Поява трохи раніше, ніж блок повністю зайде в екран — так рух
       відчувається природним, а не «наздоганяє» прокрутку. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });

    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) {   // вже у полі зору при відкритті
        el.classList.add("is-in");
        return;
      }
      io.observe(el);
    });
  });
})();
