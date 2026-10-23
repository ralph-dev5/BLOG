import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Everyone who turns off motion in their device settings gets the plain page.
export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isPhone = () => window.innerWidth <= 760;

export function initAnimations() {
  if (reduceMotion) return;
  const introDelay = loader();
  heroIntro(introDelay);
  marquee();
  headings();
  progressCard();
  journal();
  photoReveals();
  scrollSkew();
  if (canHover) {
    photoTilt();
    cursor();
  }
}

// ---------- Opening screen: counts up to the required hours, then lifts like a curtain ----------
function loader() {
  const total = Number(document.getElementById("hours-req").textContent) || 488;
  const el = document.createElement("div");
  el.className = "loader";
  el.innerHTML = `
    <div class="loader-inner">
      <div class="loader-count">0</div>
      <div class="loader-label">hours of on-the-job training</div>
    </div>
    <div class="loader-bar"></div>`;
  document.body.append(el);
  document.documentElement.classList.add("is-loading");

  const count = el.querySelector(".loader-count");
  const counter = { value: 0 };
  const tl = gsap.timeline({
    onComplete: () => {
      el.remove();
      document.documentElement.classList.remove("is-loading");
    },
  });
  tl.from(".loader-inner", { yPercent: 40, opacity: 0, duration: 0.6, ease: "power3.out" })
    .to(
      counter,
      {
        value: total,
        duration: 1.8,
        ease: "expo.inOut",
        onUpdate: () => (count.textContent = Math.round(counter.value)),
      },
      0.1
    )
    .fromTo(".loader-bar", { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: "expo.inOut" }, 0.1)
    .to(".loader-inner", { yPercent: -60, opacity: 0, duration: 0.5, ease: "power3.in" }, "+=0.2")
    .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, "-=0.15");
  return tl.duration() - 0.7; // the page starts animating while the curtain lifts
}

// ---------- Giant scrolling text band that speeds up when you scroll ----------
function marquee() {
  const band = document.createElement("div");
  band.className = "marquee";
  band.setAttribute("aria-hidden", "true");
  const total = document.getElementById("hours-req").textContent;
  const chunk = `<span>${total} Hours</span><span class="outline">On-the-Job Training</span><span>✦</span>`;
  band.innerHTML = `<div class="marquee-track">${chunk.repeat(8)}</div>`;
  document.querySelector(".hero").after(band);

  const loop = gsap.to(band.firstChild, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    onUpdate(self) {
      const speed = 1 + Math.min(Math.abs(self.getVelocity()) / 150, 12);
      gsap.to(loop, { timeScale: speed, duration: 0.2, overwrite: true });
      gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.2 });
    },
  });
}

// ---------- Photo grids lean with the speed of your scroll ----------
function scrollSkew() {
  const targets = gsap.utils.toArray(".entry-photos, .week-photos, .marquee");
  if (!targets.length) return;
  const skewTo = gsap.quickTo(targets, "skewY", { duration: 0.5, ease: "power3" });
  ScrollTrigger.create({
    onUpdate: (self) => skewTo(gsap.utils.clamp(-7, 7, self.getVelocity() / -250)),
  });
  ScrollTrigger.addEventListener("scrollEnd", () => skewTo(0));
}

// ---------- Custom cursor that inverts what it passes over and grows on photos ----------
function cursor() {
  const dot = document.createElement("div");
  dot.className = "cursor";
  dot.innerHTML = "<span>View</span>";
  document.body.append(dot);
  const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3" });
  const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3" });
  window.addEventListener("pointermove", (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.addEventListener("pointerover", (e) => {
    const onPhoto = !!e.target.closest(".thumb");
    dot.classList.toggle("is-photo", onPhoto);
    dot.classList.toggle("is-link", !onPhoto && !!e.target.closest("a, button"));
  });
  document.documentElement.addEventListener("pointerleave", () => gsap.to(dot, { opacity: 0, duration: 0.2 }));
  document.documentElement.addEventListener("pointerenter", () => gsap.to(dot, { opacity: 1, duration: 0.2 }));
}

// Wraps every word in a clipping mask so it can slide up into view.
function splitWords(el) {
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) return splitWords(node);
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) return frag.append(part);
      const word = document.createElement("span");
      word.className = "word";
      word.innerHTML = '<span class="word-inner"></span>';
      word.firstChild.textContent = part;
      frag.append(word);
    });
    node.replaceWith(frag);
  });
  return el.querySelectorAll(".word-inner");
}

// ---------- Hero: staggered title, curtain-reveal cover photo, float + parallax ----------
function heroIntro(delay = 0) {
  const photo = document.querySelector(".hero-photo");
  const words = splitWords(document.querySelector(".hero h1"));
  const tilt = isPhone() ? 0 : 1.5;
  gsap.set(photo, { rotation: tilt });

  // Huge outlined "488" drifting behind the hero
  const bigNumber = document.createElement("div");
  bigNumber.className = "hero-number";
  bigNumber.setAttribute("aria-hidden", "true");
  bigNumber.textContent = document.getElementById("hours-req").textContent;
  document.querySelector(".hero").prepend(bigNumber);

  gsap
    .timeline({ delay, defaults: { ease: "power4.out" } })
    .from(".nav", { y: -80, opacity: 0, duration: 0.8 })
    .from(bigNumber, { yPercent: 60, opacity: 0, scale: 0.8, duration: 1.8, ease: "expo.out" }, 0)
    .from(".hero .eyebrow", { y: 20, opacity: 0, duration: 0.6 }, 0.4)
    .from(words, { yPercent: 130, rotation: 10, duration: 1.3, stagger: 0.08, ease: "expo.out" }, 0.6)
    .from([".hero .intro", ".hero .btn"], { y: 30, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.7")
    .fromTo(
      photo,
      { clipPath: "inset(100% 0% 0% 0% round 14px)" },
      { clipPath: "inset(0% 0% 0% 0% round 14px)", duration: 1.4, ease: "expo.inOut", clearProps: "clipPath" },
      0.3
    )
    .from(
      photo.firstElementChild,
      { scale: 2, filter: "blur(16px)", duration: 2.2, ease: "expo.out", clearProps: "transform,filter" },
      "<0.3"
    )
    .add(() => {
      gsap.to(photo, { y: -12, rotation: tilt - 2, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });

  const heroScroll = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(photo, { yPercent: 14, ease: "none", scrollTrigger: heroScroll });
  gsap.to(bigNumber, { xPercent: -25, yPercent: 30, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero-text", { yPercent: -20, opacity: 0.2, ease: "none", scrollTrigger: heroScroll });
}

// ---------- Section titles: words rise in on scroll ----------
function headings() {
  gsap.utils.toArray("main h2").forEach((h) => {
    gsap.from(splitWords(h), {
      yPercent: 130,
      rotation: 8,
      duration: 1.2,
      stagger: 0.08,
      ease: "power4.out",
      scrollTrigger: { trigger: h, start: "top 88%" },
    });
  });
}

// ---------- Progress card: numbers count up, bar fills ----------
function progressCard() {
  const card = document.querySelector(".progress-card");
  const trigger = { trigger: card, start: "top 85%" };

  gsap.from(card, { y: 60, opacity: 0, scale: 0.96, duration: 1, ease: "power3.out", scrollTrigger: trigger });

  ["hours-done", "hours-left", "weeks", "percent"].forEach((id) => {
    const el = document.getElementById(id);
    const match = el.textContent.match(/^(\d+)(.*)$/);
    if (!match) return;
    const [, end, suffix] = match;
    const counter = { value: 0 };
    el.textContent = "0" + suffix;
    gsap.to(counter, {
      value: Number(end),
      duration: 2.2,
      delay: 0.3,
      ease: "power2.out",
      scrollTrigger: trigger,
      onUpdate: () => (el.textContent = Math.round(counter.value) + suffix),
    });
  });

  const fill = document.getElementById("bar-fill");
  gsap.fromTo(
    fill,
    { width: "0%" },
    { width: fill.dataset.pct + "%", duration: 2.2, delay: 0.3, ease: "power2.out", scrollTrigger: trigger }
  );
}

// ---------- Journal: timeline line draws while scrolling, cards slide in ----------
function journal() {
  const timeline = document.querySelector(".timeline");
  const line = document.createElement("div");
  line.className = "timeline-progress";
  timeline.prepend(line);

  gsap.fromTo(
    line,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: timeline, start: "top 70%", end: "bottom 70%", scrub: 0.6 },
    }
  );

  gsap.utils.toArray(".entry").forEach((card) => {
    gsap.from(card, {
      x: 160,
      rotation: 3,
      opacity: 0,
      filter: "blur(14px)",
      duration: 1.1,
      ease: "power3.out",
      clearProps: "filter",
      scrollTrigger: { trigger: card, start: "top 85%" },
    });
  });
}

// ---------- Photos: curtain wipe + zoom-out reveal, in a wave ----------
function photoReveals() {
  const thumbs = gsap.utils.toArray(".thumb");
  gsap.set(thumbs, { clipPath: "inset(100% 0% 0% 0%)" });

  ScrollTrigger.batch(thumbs, {
    start: "top 92%",
    once: true,
    onEnter: (batch) => {
      batch = batch.filter((t) => !t.dataset.revealed);
      if (!batch.length) return;
      batch.forEach((t) => (t.dataset.revealed = "1"));

      // Photos already scrolled past (e.g. after a page refresh) just appear.
      const passed = batch.filter((t) => t.getBoundingClientRect().bottom < 0);
      if (passed.length) gsap.set(passed, { clearProps: "clipPath" });
      batch = batch.filter((t) => !passed.includes(t));
      if (!batch.length) return;

      // Keep the wave short even when many photos enter at once.
      const stagger = Math.min(0.12, 0.6 / batch.length);
      gsap.to(batch, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.2,
        ease: "expo.out",
        stagger,
        clearProps: "clipPath",
      });
      gsap.fromTo(
        batch.map((t) => t.firstElementChild),
        { scale: 2, rotation: 6, filter: "blur(14px) brightness(1.8)" },
        {
          scale: 1,
          rotation: 0,
          filter: "blur(0px) brightness(1)",
          duration: 2,
          ease: "expo.out",
          stagger,
          clearProps: "transform,filter",
        }
      );
    },
  });
}

// ---------- Photos: 3D tilt that follows the mouse, with a moving glare ----------
function photoTilt() {
  gsap.utils.toArray(".thumb").forEach((t) => {
    const rotX = gsap.quickTo(t, "rotationX", { duration: 0.5, ease: "power3" });
    const rotY = gsap.quickTo(t, "rotationY", { duration: 0.5, ease: "power3" });

    t.addEventListener("pointermove", (e) => {
      const r = t.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rotY((px - 0.5) * 18);
      rotX((0.5 - py) * 18);
      t.style.setProperty("--gx", px * 100 + "%");
      t.style.setProperty("--gy", py * 100 + "%");
    });
    t.addEventListener("pointerenter", () => gsap.to(t, { scale: 1.05, duration: 0.4, ease: "power3.out" }));
    t.addEventListener("pointerleave", () => {
      rotX(0);
      rotY(0);
      gsap.to(t, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.45)" });
    });
  });
}

// ---------- Gallery week filter: photos scatter in ----------
export function animateFilter(groups) {
  if (reduceMotion) return;
  const thumbs = groups.flatMap((g) => [...g.querySelectorAll(".thumb")]);
  thumbs.forEach((t) => (t.dataset.revealed = "1"));

  gsap.fromTo(groups, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.08 });
  gsap.fromTo(
    thumbs,
    { clipPath: "inset(0% 0% 0% 0%)", scale: 0.6, opacity: 0, rotation: () => gsap.utils.random(-10, 10) },
    {
      scale: 1,
      opacity: 1,
      rotation: 0,
      duration: 0.9,
      ease: "back.out(1.7)",
      stagger: 0.05,
      clearProps: "clipPath,opacity,scale,rotation",
    }
  );
  ScrollTrigger.refresh();
}

// ---------- Lightbox: photo flies out of its thumbnail and back ----------
function flyOffset(fromEl, img) {
  const from = fromEl?.getBoundingClientRect();
  const to = img.getBoundingClientRect();
  const visible = from && from.width && to.width && from.bottom > 0 && from.top < window.innerHeight;
  if (!visible) return null;
  return {
    x: from.left + from.width / 2 - (to.left + to.width / 2),
    y: from.top + from.height / 2 - (to.top + to.height / 2),
    scale: from.width / to.width,
  };
}

export function lightboxOpen(lb, img, fromEl) {
  if (reduceMotion) return;
  const extras = lb.querySelectorAll("button, #lb-caption");
  gsap.fromTo(lb, { backgroundColor: "rgba(10,14,15,0)" }, { backgroundColor: "rgba(10,14,15,0.92)", duration: 0.5 });
  gsap.fromTo(extras, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.35 });
  gsap.set(img, { opacity: 0 });

  const ready = img.complete && img.naturalWidth ? Promise.resolve() : img.decode().catch(() => {});
  ready.then(() => {
    const offset = flyOffset(fromEl, img);
    if (offset) {
      gsap.fromTo(img, { ...offset, opacity: 1 }, { x: 0, y: 0, scale: 1, duration: 0.8, ease: "expo.out" });
    } else {
      gsap.fromTo(img, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" });
    }
  });
}

export function lightboxSwap(img, dir, swap) {
  if (reduceMotion) return swap();
  gsap.to(img, {
    x: -dir * 120,
    rotationY: -dir * 25,
    opacity: 0,
    duration: 0.25,
    ease: "power2.in",
    onComplete() {
      swap();
      gsap.fromTo(
        img,
        { x: dir * 120, rotationY: dir * 25, opacity: 0 },
        { x: 0, rotationY: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
      );
    },
  });
}

let closing = false;
export function lightboxClose(lb, img, toEl, done) {
  if (reduceMotion) return done();
  if (closing) return;
  closing = true;
  const extras = lb.querySelectorAll("button, #lb-caption");
  const finish = () => {
    done();
    gsap.set([lb, img, ...extras], { clearProps: "all" });
    closing = false;
  };
  const tl = gsap.timeline({ onComplete: finish });
  const offset = flyOffset(toEl, img);
  tl.to(extras, { opacity: 0, duration: 0.2 }, 0)
    .to(lb, { backgroundColor: "rgba(10,14,15,0)", duration: 0.5 }, 0)
    .to(img, offset ? { ...offset, duration: 0.6, ease: "expo.inOut" } : { scale: 0.8, opacity: 0, duration: 0.35 }, 0);
}
