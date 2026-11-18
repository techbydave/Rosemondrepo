/* RON Family Agape Counselling Solutions — interactions */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.documentElement.classList.remove("no-js");

  /* ---------- Split headline into words ---------- */
  $$(".split").forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "w";
            const inner = document.createElement("span");
            inner.textContent = part;
            inner.style.setProperty("--i", i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      if (e.target.matches(".cards")) staggerCards();
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .triad, .cards").forEach((el) => io.observe(el));

  /* ---------- Counters ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) { el.textContent = end + suffix; return; }
      const start = performance.now();
      const dur = 1600;
      const tick = (t) => {
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(end * eased) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Nav: scrolled state, hide on scroll down, progress, active link ---------- */
  const nav = $(".nav");
  const bar = $(".progress span");
  const toTop = $(".to-top");
  const stepsLine = $(".steps__line span");
  const steps = $$(".step");
  const stepsList = $(".steps");
  const sections = $$("main section[id]");
  const links = $$(".nav__links a");
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("is-scrolled", y > 30);
    const menuOpen = $(".nav__toggle").getAttribute("aria-expanded") === "true";
    nav.classList.toggle("is-hidden", !menuOpen && y > lastY && y > 500);
    toTop.classList.toggle("is-visible", y > 900);
    lastY = y;

    // Active link
    let current = "";
    sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s.id; });
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current));

    // Steps progress
    if (stepsList) {
      const r = stepsList.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight * 0.75 - r.top) / (r.height + innerHeight * 0.25), 0), 1);
      if (stepsLine) stepsLine.parentElement.style.setProperty("--p", p.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle("is-lit", p >= i / steps.length + 0.02));
    }
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $(".nav__toggle");
  const menu = $("#mobile-menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) nav.classList.add("is-scrolled");
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Service filters ---------- */
  const filters = $$(".filter");
  const pill = $(".filters__pill");
  const cards = $$(".card");
  const movePill = (btn) => {
    if (!pill || !btn) return;
    pill.style.width = btn.offsetWidth + "px";
    pill.style.transform = `translate(${btn.offsetLeft - 6}px, ${btn.offsetTop - 6}px)`;
  };
  function staggerCards() {
    cards.filter((c) => !c.classList.contains("is-hidden")).forEach((c, n) => {
      c.classList.remove("is-entering");
      void c.offsetWidth;
      c.style.setProperty("--n", n);
      c.classList.add("is-entering");
    });
  }
  // Hide cards until their grid scrolls into view
  if (!reduceMotion) cards.forEach((c) => (c.style.opacity = "0"));
  const cardsWrap = $(".cards");
  if (cardsWrap) {
    cardsWrap.addEventListener("animationstart", (e) => { if (e.target.classList.contains("card")) e.target.style.opacity = ""; });
    cardsWrap.addEventListener("animationend", (e) => { if (e.target.classList.contains("card")) e.target.classList.remove("is-entering"); });
  }

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", String(b === btn)); });
      movePill(btn);
      const f = btn.dataset.filter;
      cards.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
      staggerCards();
    });
  });
  const initPill = () => movePill($(".filter.is-active"));
  addEventListener("resize", initPill);
  document.fonts ? document.fonts.ready.then(initPill) : setTimeout(initPill, 300);
  initPill();

  /* ---------- Pointer effects: card tilt + glow, magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
        card.style.setProperty("--rx", (0.5 - y) * 7 + "deg");
        card.style.setProperty("--ry", (x - 0.5) * 9 + "deg");
      });
      card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
    });

    $$(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", e.clientX - r.left + "px");
        btn.style.setProperty("--my", e.clientY - r.top + "px");
        if (btn.classList.contains("magnetic")) {
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
          btn.style.transform = `translate(${dx}px, ${dy}px)`;
        }
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });

    // Gentle parallax on hero visual
    const visual = $(".orb");
    const hero = $(".hero");
    hero && visual && hero.addEventListener("pointermove", (e) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      visual.style.transform = `translate(${x * -18}px, ${y * -18}px)`;
    });
  }

  /* ---------- Accordion: one open at a time ---------- */
  const accs = $$(".acc");
  accs.forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) accs.forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* ---------- Open now (Toronto time) ---------- */
  // Minutes from midnight, by weekday (0 = Sunday)
  const HOURS = { 0: null, 1: null, 2: [1080, 1260], 3: [1080, 1260], 4: [1080, 1260], 5: [1020, 1170], 6: [600, 1080] };
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const fmt = (m) => {
    const h = Math.floor(m / 60), mm = m % 60;
    const ap = h >= 12 ? "pm" : "am";
    const hh = h % 12 || 12;
    return hh + (mm ? ":" + String(mm).padStart(2, "0") : "") + " " + ap;
  };
  const torontoNow = () => {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday").slice(0, 3));
      return { day, min: (+get("hour") % 24) * 60 + +get("minute") };
    } catch (_) {
      const d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  };
  const updateOpen = () => {
    const { day, min } = torontoNow();
    const today = HOURS[day];
    const open = !!today && min >= today[0] && min < today[1];
    let label, sub;
    if (open) {
      label = "Open now";
      sub = "until " + fmt(today[1]);
    } else {
      label = "Closed now";
      let next = null;
      for (let i = 0; i < 8; i++) {
        const d = (day + i) % 7;
        const h = HOURS[d];
        if (h && (i > 0 || min < h[0])) { next = { d, h, i }; break; }
      }
      sub = next ? "Opens " + (next.i === 0 ? "today" : next.i === 1 ? "tomorrow" : DAYS[next.d]) + " " + fmt(next.h[0]) : "";
    }
    const dot = $("[data-open-dot]");
    dot && dot.classList.toggle("is-open", open);
    const l = $("[data-open-label]"); if (l) l.textContent = label;
    const s = $("[data-open-sub]"); if (s) s.textContent = sub;
    const p = $("[data-open-pill]");
    if (p) { p.textContent = open ? "Open now" : sub || "Closed"; p.classList.toggle("is-open", open); }
    $$("[data-hours] li").forEach((li) => li.classList.toggle("is-today", +li.dataset.day === day));
  };
  updateOpen();
  setInterval(updateOpen, 60000);

  /* ---------- Booking form → email ---------- */
  const form = $("#book-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      ["name", "email"].forEach((n) => {
        const input = form.elements[n];
        const field = input.closest(".field");
        const valid = n === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) : input.value.trim().length > 1;
        field.classList.toggle("is-invalid", !valid);
        if (!valid) ok = false;
      });
      const status = $(".form__status", form);
      if (!ok) { status.textContent = "Please add your name and a valid email."; return; }
      const v = (n) => form.elements[n].value.trim();
      const body = [
        "Hello Rosemond,",
        "",
        "I would like to request a free consultation.",
        "",
        "Name: " + v("name"),
        "Email: " + v("email"),
        v("phone") ? "Phone: " + v("phone") : null,
        "Interested in: " + v("service"),
        "Preferred time: " + v("time"),
        v("message") ? "\nMessage:\n" + v("message") : null,
        "",
        "Thank you.",
      ].filter((x) => x !== null).join("\n");
      const subject = "Free consultation request — " + v("name");
      window.location.href = "mailto:Ronfamily.agape@outlook.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.textContent = "Your email app should open with your request. Just press send.";
    });
    $$("input", form).forEach((i) => i.addEventListener("input", () => i.closest(".field").classList.remove("is-invalid")));
  }

  /* ---------- Year ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
