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

    /* --- поява блоків при прокрутці --- */
    var targets = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!targets.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    targets.forEach(function (el) { io.observe(el); });
  });
})();
