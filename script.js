/*
  Double E Auto Service
  Minimal JavaScript:
  - Mobile hamburger menu toggle + close behaviors
  - Smooth scrolling fallback (for browsers that don't support CSS smooth scrolling)
  - Booking form: lightweight validation + opens a pre-filled email (no backend)
*/

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // -----------------------------
  // Sticky nav: mobile menu logic
  // -----------------------------
  const header = $(".site-header");
  const nav = header ? header.querySelector(".nav") : null;
  const toggle = $("[data-nav-toggle]");
  const menu = $("[data-nav-menu]");

  function setMenuOpen(isOpen) {
    if (!nav || !toggle || !menu) return;
    nav.classList.toggle("nav--open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  function isMenuOpen() {
    return !!(nav && nav.classList.contains("nav--open"));
  }

  if (toggle && menu && nav) {
    toggle.addEventListener("click", () => setMenuOpen(!isMenuOpen()));

    // Close when a nav link is clicked (best UX on mobile)
    $$(".nav__link", menu).forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    // Close when clicking outside the menu
    document.addEventListener("click", (e) => {
      if (!isMenuOpen()) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (menu.contains(target) || toggle.contains(target)) return;
      setMenuOpen(false);
    });

    // Close with Escape key for accessibility
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) setMenuOpen(false);
    });
  }

  // -----------------------------
  // Smooth scrolling fallback
  // (CSS handles most browsers)
  // -----------------------------
  const supportsSmoothScroll =
    "scrollBehavior" in document.documentElement.style;

  if (!supportsSmoothScroll) {
    $$( 'a[href^="#"]' ).forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href.length < 2) return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // -----------------------------
  // Footer year
  // -----------------------------
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // -----------------------------
  // Booking form
  // - Validates required fields
  // - Opens email draft (mailto) pre-filled with details
  // -----------------------------
  const form = $("#booking-form");
  const status = $("#form-status");

  const SHOP_EMAIL = "k-kuo@sbcglobal.net";
  const SUBJECT = "Appointment Request — Double E Auto Service";

  function setError(name, message) {
    const el = document.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = message || "";
  }

  function clearErrors() {
    ["name", "phone", "email", "date", "issue"].forEach((k) => setError(k, ""));
  }

  function valueOf(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return String(el.value || "").trim();
  }

  function isValidEmail(email) {
    // Simple, lightweight email check (not overly strict)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();
      if (status) status.textContent = "";

      const name = valueOf("name");
      const phone = valueOf("phone");
      const email = valueOf("email");
      const date = valueOf("date");
      const issue = valueOf("issue");

      let ok = true;
      if (!name) {
        setError("name", "Please enter your name.");
        ok = false;
      }
      if (!phone) {
        setError("phone", "Please enter your phone number.");
        ok = false;
      }
      if (!email) {
        setError("email", "Please enter your email.");
        ok = false;
      } else if (!isValidEmail(email)) {
        setError("email", "Please enter a valid email address.");
        ok = false;
      }
      if (!date) {
        setError("date", "Please choose a preferred date.");
        ok = false;
      }
      if (!issue) {
        setError("issue", "Please describe the vehicle issue.");
        ok = false;
      }

      if (!ok) {
        if (status) status.textContent = "Please fix the highlighted fields.";
        return;
      }

      // Build a clean email body
      const body = [
        "Hello Double E Auto Service,",
        "",
        "I'd like to request an appointment.",
        "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Preferred date: ${date}`,
        "",
        "Vehicle issue:",
        issue,
        "",
        "Thank you!",
      ].join("\n");

      const mailto = `mailto:${encodeURIComponent(SHOP_EMAIL)}?subject=${encodeURIComponent(
        SUBJECT
      )}&body=${encodeURIComponent(body)}`;

      // Trigger the user’s email client (fastest no-backend option)
      window.location.href = mailto;

      if (status) {
        status.textContent =
          "Opening your email app to send the appointment request…";
      }
    });
  }
})();

