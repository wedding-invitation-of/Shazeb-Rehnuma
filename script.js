/* =====================================================
   ROYAL ISLAMIC WEDDING INVITATION — script.js
   GSAP + ScrollTrigger + Lenis (loaded from CDN in index.html)
   ===================================================== */

/* ---------- EDIT YOUR DETAILS HERE (all placeholders are marked) ---------- */
const CONFIG = {
  groom: "Shazeb",
  bride: "Rehnuma",

  eventName: "Nikah",
  date: "2027-01-01",          // YYYY-MM-DD
  time: "17:00",               // 24h HH:MM
  durationHours: 4,
  utcOffset: "",               // e.g. "+05:30" so the countdown is exact for every guest. "" = guest's local time.

  venue: {                     // PLACEHOLDER — replace with the real venue
    name: "Al-Noor Grand Banquet Hall",
    address: "12 Gulshan Avenue, Block C, Your City, 00000",
    mapQuery: ""               // optional: exact search text or "lat,lng". Empty = name + address
  },

  families: {                  // PLACEHOLDER names — replace
    groom: { family: "The Khan Family",   parents: "Mr. Abdul Karim Khan<br>&amp; Mrs. Ayesha Khan" },
    bride: { family: "The Ansari Family", parents: "Mr. Mohammad Yusuf Ansari<br>&amp; Mrs. Zainab Ansari" }
  },

  locale: "en-GB"
};

(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pending = [];
  const reveal = (el, start, tl) => pending.push({ el, start, tl });
  const T = (speed, vars) => gsap.timeline(vars).timeScale(speed);
  const SPEED = 2.1;   // global animation speed-up (1 = original slow pace)

  /* ---------- 1. Fill content from CONFIG ---------- */
  const pad = n => String(n).padStart(2, "0");
  const [Y, M, D] = CONFIG.date.split("-").map(Number);
  const [hh, mm] = CONFIG.time.split(":").map(Number);
  const start = new Date(`${CONFIG.date}T${CONFIG.time}:00${CONFIG.utcOffset || ""}`);
  const end = new Date(start.getTime() + CONFIG.durationHours * 36e5);
  const noon = new Date(Date.UTC(Y, M - 1, D, 12));
  const fmtTime = (h, m) => `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
  const endH = (hh + CONFIG.durationHours) % 24;

  const bind = {
    groom: CONFIG.groom, bride: CONFIG.bride,
    groomInitial: CONFIG.groom[0], brideInitial: CONFIG.bride[0],
    eventName: CONFIG.eventName,
    dateShort: `${pad(D)} · ${pad(M)} · ${Y}`,
    dateLong: new Intl.DateTimeFormat(CONFIG.locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(noon),
    timeRange: `${fmtTime(hh, mm)} onwards`,
    venueName: CONFIG.venue.name, venueAddress: CONFIG.venue.address,
    groomFamily: CONFIG.families.groom.family, groomParents: CONFIG.families.groom.parents,
    brideFamily: CONFIG.families.bride.family, brideParents: CONFIG.families.bride.parents
  };
  $$("[data-bind]").forEach(el => {
    const v = bind[el.dataset.bind];
    if (v !== undefined) el.innerHTML = v;
  });
  document.title = `${CONFIG.groom} & ${CONFIG.bride} — Wedding Invitation`;

  const q = encodeURIComponent(CONFIG.venue.mapQuery || `${CONFIG.venue.name} ${CONFIG.venue.address}`);
  $("#mapBtn").href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const iso = d => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  $("#calBtn").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(`${CONFIG.eventName} of ${CONFIG.groom} & ${CONFIG.bride}`)}` +
    `&dates=${iso(start)}/${iso(end)}` +
    `&details=${encodeURIComponent("With the blessings of Allah, we joyfully invite you to celebrate our wedding.")}` +
    `&location=${encodeURIComponent(`${CONFIG.venue.name}, ${CONFIG.venue.address}`)}`;

  /* ---------- 2. Decorative builders ---------- */
  $$(".stars").forEach(box => {
    const n = +box.dataset.stars || 12;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "star";
      const sz = rand(6, 15);
      s.style.cssText = `left:${rand(2, 96)}%;top:${rand(2, 70)}%;width:${sz}px;height:${sz}px;opacity:${rand(.25, .7)}`;
      s.innerHTML = '<svg aria-hidden="true"><use href="#star8"/></svg>';
      box.appendChild(s);
    }
  });
  const PETAL = '<svg viewBox="0 0 14 18" aria-hidden="true"><path d="M7 0C12 3 14 10 7 18 0 10 2 3 7 0Z" fill="#7a1d36"/><path d="M7 1.5C10 4.5 11 9 7 14 8 9 8 5 7 1.5Z" fill="#b8395c" opacity=".75"/></svg>';
  $$(".petals").forEach(box => {
    const n = +box.dataset.petals || 8;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = "petal"; p.innerHTML = PETAL;
      p.style.width = rand(9, 17) + "px"; p.style.height = "auto";
      box.appendChild(p);
    }
  });

  /* ---------- 3. Countdown (works with or without GSAP) ---------- */
  const numEls = {}; $$(".cd__num").forEach(el => numEls[el.dataset.unit] = el);
  function setNum(el, text) {
    if (el.dataset.v === text) return;
    const first = el.dataset.v === undefined;
    el.dataset.v = text;
    const nu = document.createElement("span");
    nu.className = "cd__d"; nu.textContent = text;
    const old = el.firstElementChild;
    el.appendChild(nu);
    if (first || RM || !HAS_GSAP) { if (old) old.remove(); return; }
    gsap.fromTo(nu, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7, ease: "power3.out" });
    if (old) gsap.to(old, { yPercent: -70, opacity: 0, duration: .55, ease: "power2.in", onComplete: () => old.remove() });
  }
  function tick() {
    const diff = Math.max(0, start.getTime() - Date.now());
    const s = Math.floor(diff / 1000);
    setNum(numEls.days, pad(Math.floor(s / 86400)));
    setNum(numEls.hours, pad(Math.floor(s % 86400 / 3600)));
    setNum(numEls.minutes, pad(Math.floor(s % 3600 / 60)));
    setNum(numEls.seconds, pad(s % 60));
    if (diff === 0) $("#cdDone").hidden = false;
  }
  tick(); setInterval(tick, 1000);

  /* ---------- fallback: no GSAP (offline / blocked CDN) ---------- */
  if (!HAS_GSAP) {
    $("#intro").remove();
    document.body.classList.remove("is-locked");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- 4. Gold dust (light canvas particles) ---------- */
  class Dust {
    constructor(canvas, { count = 36, size = [.6, 1.9], alpha = [.25, .75], rise = .12 } = {}) {
      this.c = canvas; this.ctx = canvas.getContext("2d");
      this.o = { count, size, alpha, rise }; this.p = []; this.b = []; this.on = false;
      this.resize = this.resize.bind(this); this.frame = this.frame.bind(this);
      addEventListener("resize", this.resize); this.resize();
      for (let i = 0; i < count; i++) this.p.push(this.make(true));
    }
    resize() {
      this.dpr = Math.min(devicePixelRatio || 1, 1.5);
      this.w = this.c.clientWidth; this.h = this.c.clientHeight;
      this.c.width = this.w * this.dpr; this.c.height = this.h * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    make(init) {
      const o = this.o;
      return { x: rand(0, this.w), y: init ? rand(0, this.h) : this.h + 10, r: rand(...o.size), a: rand(...o.alpha),
               v: rand(.4, 1) * o.rise * 60, ph: rand(0, 6.28), sw: rand(4, 16) };
    }
    burst(x, y, n = 70) {
      for (let i = 0; i < n; i++) {
        const a = rand(0, 6.283), sp = rand(60, 260);
        this.b.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, r: rand(.8, 2.6), life: 0, max: rand(1.4, 2.8) });
      }
    }
    start() { if (!this.on) { this.on = true; this.last = performance.now(); gsap.ticker.add(this.frame); } }
    stop() { this.on = false; gsap.ticker.remove(this.frame); this.ctx.clearRect(0, 0, this.w, this.h); }
    frame() {
      const t = performance.now(), dt = Math.min(.05, (t - this.last) / 1000); this.last = t;
      const c = this.ctx; c.clearRect(0, 0, this.w, this.h);
      for (const p of this.p) {
        p.y -= p.v * dt; p.ph += dt * .8; p.x += Math.sin(p.ph) * p.sw * dt;
        if (p.y < -10) Object.assign(p, this.make(false), { x: rand(0, this.w) });
        const a = p.a * (.55 + .45 * Math.sin(p.ph * 2));
        c.fillStyle = `rgba(232,205,140,${a})`;
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      for (let i = this.b.length - 1; i >= 0; i--) {
        const p = this.b[i]; p.life += dt; if (p.life > p.max) { this.b.splice(i, 1); continue; }
        p.vx *= .985; p.vy = p.vy * .985 + 22 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        c.fillStyle = `rgba(247,226,160,${(1 - p.life / p.max) * .9})`;
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
    }
  }
  const introDust = new Dust($("#introDust"), { count: RM ? 14 : 46, alpha: [.3, .85] });
  const pageDust = new Dust($("#dust"), { count: RM ? 0 : (innerWidth < 700 ? 16 : 28), alpha: [.18, .5], size: [.6, 1.6] });

  /* ---------- 5. Smooth scroll: Lenis ↔ ScrollTrigger ---------- */
  let lenis = null;
  if (!RM && window.Lenis) {
    lenis = new Lenis({ duration: 1.35, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ---------- 6. Helpers ---------- */
  function splitWords(el) {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(/\s+/).map(w => `<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`).join(" ");
    return $$(".wi", el);
  }
  function whenVisible(trigger, tween) {
    ScrollTrigger.create({ trigger, start: "top bottom+=100", end: "bottom top-=100", onToggle: s => tween.paused(!s.isActive) });
  }
  function swingAll(root = document) {
    if (RM) return;
    $$(".swing", root).forEach(el => {
      const amp = rand(1.6, 2.8);
      gsap.set(el, { rotation: -amp });
      const tw = gsap.to(el, { rotation: amp, duration: rand(3.4, 4.8), ease: "sine.inOut", yoyo: true, repeat: -1, delay: rand(0, 1.5) });
      whenVisible(el.closest("section,footer,.intro") || el, tw);
    });
  }
  function twinkle() {
    if (RM) return;
    $$(".star").forEach(s => {
      const tw = gsap.to(s, { opacity: rand(.15, .35), duration: rand(2.2, 4.2), ease: "sine.inOut", yoyo: true, repeat: -1, delay: rand(0, 3) });
      whenVisible(s.closest("section,footer"), tw);
    });
    $$(".glow").forEach(g => {
      const tw = gsap.fromTo(g, { opacity: .55, scale: .92 }, { opacity: 1, scale: 1.06, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      whenVisible(g.closest("section,footer,.intro"), tw);
    });
  }
  function fallPetals() {
    if (RM) return;
    $$(".petals").forEach(box => {
      const h = box.parentElement.offsetHeight, w = box.parentElement.offsetWidth, tws = [];
      $$(".petal", box).forEach((p, i) => {
        gsap.set(p, { x: rand(0, w), y: -30, opacity: 0 });
        const dur = rand(14, 22), d = rand(0, 12);
        tws.push(
          gsap.to(p, { y: () => box.parentElement.offsetHeight + 30, duration: dur, ease: "none", repeat: -1, delay: d }),
          gsap.to(p, { keyframes: { opacity: [0, .8, .8, 0] }, duration: dur, ease: "none", repeat: -1, delay: d }),
          gsap.to(p, { x: "+=" + rand(-70, 70), duration: rand(4, 7), ease: "sine.inOut", yoyo: true, repeat: -1 }),
          gsap.to(p, { rotation: rand(200, 420) * (i % 2 ? 1 : -1), duration: dur, ease: "none", repeat: -1, delay: d })
        );
      });
      whenVisible(box.parentElement, { paused: s => tws.forEach(t => t.paused(s)) });
    });
  }

  /* ---------- 7. HERO timeline (paused until intro ends) ---------- */
  const heroNames = $$(".hero .name");
  const clipHide = "inset(-30% 100% -30% -10%)", clipShow = "inset(-30% -10% -30% -10%)";
  let heroTl = null;
  if (!RM) {
    gsap.set(".hero__bg", { opacity: 0 });
    gsap.set(".arch__img", { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set([".arch__glow", ".arch__crescent", ".hero__mosque", ".hero__corner", ".hero .stars", ".hero__rays"], { opacity: 0 });
    gsap.set(".arch__crescent", { y: 24 });
    gsap.set(".hero__garland", { yPercent: -100, opacity: 0 });
    gsap.set(".hero__lantern", { yPercent: -115, opacity: 0 });
    gsap.set([".bismillah .ar", ".bismillah .tr", ".blessing", ".hero__invite"], { opacity: 0, y: 18 });
    gsap.set(heroNames, { clipPath: clipHide, opacity: 0 });
    gsap.set(".amp", { opacity: 0, scale: .8 });
    gsap.set(".hero__date", { opacity: 0, y: 14 });
    gsap.set(".hero__date .line", { scaleX: 0 });
    gsap.set(".hero__date .line:first-child", { transformOrigin: "100% 50%" });

    heroTl = T(SPEED, { paused: true, defaults: { ease: "power2.out" } })
      .to(".hero__bg", { opacity: 1, duration: 2.4, ease: "power1.inOut" }, 0)
      .to(".hero .stars", { opacity: 1, duration: 3 }, .4)
      .to(".hero__rays", { opacity: 1, duration: 4 }, .8)
      .to(".hero__mosque", { opacity: .5, duration: 2.6, stagger: .2 }, .3)
      .to(".hero__garland", { yPercent: 0, opacity: 1, duration: 2.6, ease: "power3.out" }, .3)
      .to(".hero__lantern", { yPercent: 0, opacity: 1, duration: 2.8, ease: "power3.out", stagger: .25 }, .7)
      .to(".hero__corner", { opacity: .9, duration: 2.2 }, 1)
      .to(".bismillah .ar", { opacity: 1, y: 0, duration: 1.8 }, 1.2)
      .to(".bismillah .tr", { opacity: 1, y: 0, duration: 1.6 }, 1.6)
      .to(".arch__glow", { opacity: 1, duration: 2.6 }, 1.6)
      .to(".arch__img", { clipPath: "inset(0% 0% 0% 0%)", duration: 3, ease: "power2.inOut" }, 1.6)
      .to(".arch__crescent", { opacity: 1, y: 0, duration: 2.2 }, 3.4)
      .to(".blessing", { opacity: .95, y: 0, duration: 1.6 }, 3.8)
      .to(heroNames, { clipPath: clipShow, opacity: 1, duration: 2.1, ease: "power2.inOut", stagger: .55 }, 4.2)
      .to(".amp", { opacity: 1, scale: 1, duration: 1.4 }, 4.6)
      .to(".hero__date", { opacity: 1, y: 0, duration: 1.6 }, 5.6)
      .to(".hero__date .line", { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 5.8)
      .to(".hero__invite", { opacity: .9, y: 0, duration: 1.6 }, 6.2);
  }

  /* ---------- 8. INTRO ---------- */
  const intro = $("#intro"), btn = $("#openBtn"), env = $("#env");
  const introNames = $$(".env__names .gold-text, .env__names i");
  function afterIntro() {
    intro.remove();
    document.body.classList.remove("is-locked");
    introDust.stop();
    if (lenis) lenis.start();
    pageDust.start();
    ScrollTrigger.refresh();
    pending.forEach(p => ScrollTrigger.create({ trigger: p.el, start: p.start, once: true, onEnter: () => p.tl.play() }));
    if (RM) return;
  }

  if (RM) {
    introDust.start();
    btn.style.opacity = 1;
    btn.addEventListener("click", () => {
      btn.disabled = true;
      gsap.to(intro, { opacity: 0, duration: .8, onComplete: afterIntro });
    });
  } else {
    gsap.set("#introCrescent", { opacity: 0, scale: .92, y: -8 });
    gsap.set(".intro__lantern", { yPercent: -115, opacity: 0 });
    gsap.set(env, { opacity: 0, scale: .86, y: 26 });
    gsap.set(".env__frame .draw", { strokeDashoffset: 1 });
    gsap.set(".env__corner", { opacity: 0 });
    gsap.set(introNames, { clipPath: clipHide, opacity: 0 });
    gsap.set(btn, { y: 14 });
    gsap.set(".env__lines", { opacity: 0 });
    gsap.set("#introDust", { opacity: 0 });
    introDust.start();

    T(SPEED, { defaults: { ease: "power2.out" } })
      .to("#introDust", { opacity: 1, duration: 2 }, 0)
      .to("#introCrescent", { opacity: 1, scale: 1, y: 0, duration: 2.4 }, .5)
      .to(".intro__lantern", { yPercent: 0, opacity: 1, duration: 2.6, ease: "power3.out", stagger: .25 }, 1.1)
      .add(() => swingAll(intro), 2.4)
      .to(env, { opacity: 1, scale: 1, y: 0, duration: 2.2, ease: "power3.out" }, 1.9)
      .to(".env__frame .draw", { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut", stagger: .25 }, 2.8)
      .to([".env__lines", ".env__corner"], { opacity: 1, duration: 1.6 }, 3.2)
      .to(introNames, { clipPath: clipShow, opacity: 1, duration: 1.9, ease: "power2.inOut", stagger: .35 }, 3.5)
      .to(btn, { opacity: 1, y: 0, duration: 1.4 }, 4.7);

    let opened = false;
    const openInvite = () => {
      if (opened) return; opened = true;
      btn.disabled = true;
      const r = env.getBoundingClientRect(), ir = intro.getBoundingClientRect();
      const open = T(1.6, { defaults: { ease: "power2.out" } });
      open
        .to(btn, { opacity: 0, y: 10, duration: .6 }, 0)
        .to("#envSeal", { scale: .8, opacity: 0, duration: .7, ease: "power2.in" }, .2)
        .to("#envFlap", { rotationX: -180, duration: 1.8, ease: "power2.inOut" }, .8)
        .set("#envFlap", { zIndex: 1 }, 1.6)
        .to("#envGlow", { opacity: 1, scale: 1.12, duration: 1.5 }, 1.4)
        .to("#envLetter", { yPercent: -62, duration: 1.9, ease: "power3.inOut" }, 2)
        .add(() => introDust.burst(r.left + r.width / 2 - ir.left, r.top + r.height * .45 - ir.top, innerWidth < 700 ? 54 : 90), 2.2)
        .to(env, { scale: 1.1, duration: 2.2, ease: "sine.inOut" }, 1.7)
        .to("#envGlow", { opacity: .35, duration: 1.4 }, 3.4)
        .to("#introStage", { scale: 2.3, opacity: 0, duration: 1.7, ease: "power2.in" }, 3.5)
        .to(["#introCrescent", ".intro__lantern"], { opacity: 0, duration: 1.2 }, 3.5)
        .add(() => heroTl && heroTl.play(), 4.1)
        .to(intro, { opacity: 0, duration: 1.4, ease: "power1.inOut" }, 4.1)
        .add(afterIntro, 5.6);
    };
    btn.addEventListener("click", openInvite);
    $("#envSeal").addEventListener("click", openInvite);
  }

  /* ---------- 9. Ambient loops & parallax ---------- */
  swingAll($("#hero")); swingAll($("#countdown")); swingAll($("#footer"));
  twinkle(); fallPetals();

  $$(".px").forEach(el => {
    const d = parseFloat(el.dataset.depth) || .05;
    const host = el.closest("section,footer");
    if (RM) return;
    gsap.fromTo(el, { y: () => -d * host.offsetHeight * .5 }, {
      y: () => d * host.offsetHeight * .5, ease: "none",
      scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: .6, invalidateOnRefresh: true }
    });
  });

  /* ---------- 10. Section reveals (ScrollTrigger) ---------- */
  const trig = (el, start = "top 72%") => ({ trigger: el, start, once: true });
  if (!RM) {
    /* Countdown */
    const cdWords = splitWords($(".cd .h2"));
    gsap.set(cdWords, { yPercent: 115 });
    gsap.set([".cd .eyebrow", ".cd__panel", ".cd__date"], { opacity: 0, y: 36 });
    gsap.set(".cd__card", { opacity: 0, y: 34 });
    gsap.set([".cd__crescent", ".cd__lantern", ".cd__corner"], { opacity: 0 });
    reveal("#countdown", "top 85%", T(2.6, { paused: true, defaults: { ease: "power3.out" } })
      .to(".cd__crescent", { opacity: .9, duration: 2.4 }, 0)
      .to(".cd__lantern", { opacity: .95, duration: 2.2, stagger: .2 }, .2)
      .to(".cd .eyebrow", { opacity: 1, y: 0, duration: 1.4 }, .3)
      .to(cdWords, { yPercent: 0, duration: 1.6, stagger: .12 }, .5)
      .to(".cd__panel", { opacity: 1, y: 0, duration: 1.8 }, 1.1)
      .to(".cd__corner", { opacity: .95, duration: 1.6 }, 1.6)
      .to(".cd__card", { opacity: 1, y: 0, duration: 1.5, stagger: .16 }, 1.5)
      .to(".cd__date", { opacity: .9, y: 0, duration: 1.4 }, 2.6));

    /* Venue */
    gsap.set([".venue .eyebrow", ".vcard__crescent", ".vcard__row", ".vcard__venue", ".vcard__addr", ".vcard__btns .btn", ".venue .divider"], { opacity: 0, y: 24 });
    gsap.set(".vcard__border", { opacity: 0 });
    gsap.set(".vcard__body", { opacity: 0, y: 70 });
    gsap.set("#vcard .archhead img", { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set("#vcard .archhead__t", { opacity: 0 });
    gsap.set(".sec__corner", { opacity: 0 });
    reveal("#vcard", "top 85%", T(2.2, { paused: true, defaults: { ease: "power3.out" } })
      .to(".venue .eyebrow", { opacity: 1, y: 0, duration: 1.2 }, 0)
      .to(".sec__corner", { opacity: .75, duration: 2.4 }, 0)
      .to(".vcard__border", { opacity: 1, duration: 1.2 }, .1)
      .to(".vcard__body", { opacity: 1, y: 0, duration: 1.8 }, .1)
      .to("#vcard .archhead img", { clipPath: "inset(0% 0% 0% 0%)", duration: 2.2, ease: "power2.inOut" }, .7)
      .to("#vcard .archhead__t", { opacity: 1, duration: 1.4 }, 1.7)
      .to(".vcard__crescent", { opacity: 1, y: 0, duration: 1.6 }, 1.2)
      .to(".venue .divider", { opacity: 1, y: 0, duration: 1.2 }, 1.9)
      .to([".vcard__row", ".vcard__venue", ".vcard__addr"], { opacity: 1, y: 0, duration: 1.2, stagger: .18 }, 2.1)
      .to(".vcard__btns .btn", { opacity: 1, y: 0, duration: 1.2, stagger: .2 }, 3));

    /* Families */
    gsap.set("#scrollBanner", { clipPath: "inset(0% 50% 0% 50%)", opacity: 0 });
    gsap.set(".scroll__t", { opacity: 0, y: 10 });
    gsap.set("#famMsg", { opacity: 0, y: 28 });
    gsap.set(".fcard", { opacity: 0, y: 60 });
    gsap.set(".fcard .archhead img", { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set([".fcard .archhead__t", ".fcard__name", ".fcard__lbl", ".fcard__par", ".fcard .divider"], { opacity: 0, y: 14 });
    reveal("#family", "top 80%", T(2.2, { paused: true, defaults: { ease: "power3.out" } })
      .to("#scrollBanner", { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 2.2, ease: "power2.inOut" }, 0)
      .to(".scroll__t", { opacity: 1, y: 0, duration: 1.4 }, 1.3)
      .to("#famMsg", { opacity: 1, y: 0, duration: 1.6 }, 1.5));
    $$(".fcard").forEach((c, i) => {
      reveal(c, "top 88%", T(2.2, { paused: true, defaults: { ease: "power3.out" } })
        .to(c, { opacity: 1, y: 0, duration: 1.7 }, 0)
        .to($(".archhead img", c), { clipPath: "inset(0% 0% 0% 0%)", duration: 2, ease: "power2.inOut" }, .4)
        .to([$(".archhead__t", c), $(".fcard__name", c), $(".divider", c), $(".fcard__lbl", c), $(".fcard__par", c)], { opacity: 1, y: 0, duration: 1.3, stagger: .2 }, 1.1));
    });

    /* Footer */
    gsap.set([".foot__dua", ".foot__with", ".foot__names", ".foot .divider"], { opacity: 0, y: 26 });
    gsap.set([".foot__moon", ".foot__lantern", ".foot__corner", ".foot__petals"], { opacity: 0 });
    gsap.set(".foot .divider", { clipPath: "inset(0% 50% 0% 50%)" });
    reveal("#footer", "top 80%", T(2.2, { paused: true, defaults: { ease: "power3.out" } })
      .to(".foot__moon", { opacity: 1, duration: 2.6 }, 0)
      .to(".foot__lantern", { opacity: 1, duration: 2.4, stagger: .2 }, .2)
      .to(".foot__corner", { opacity: .9, duration: 2 }, .5)
      .to(".foot__petals", { opacity: .16, duration: 2.4 }, .6)
      .to(".foot__dua", { opacity: 1, y: 0, duration: 1.8 }, 1)
      .to(".foot__with", { opacity: 1, y: 0, duration: 1.4 }, 1.9)
      .to(".foot__names", { opacity: 1, y: 0, duration: 1.8 }, 2.3)
      .to(".foot .divider", { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 2, ease: "power2.inOut" }, 3));
  }

  /* ---------- 11. Boot ---------- */
  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pageDust.on && pageDust.stop(); else if (!document.body.classList.contains("is-locked")) pageDust.start();
  });
})();
