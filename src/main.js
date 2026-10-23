import "./style.css";
import { BLOG } from "./data.js";
import { initAnimations, animateFilter, lightboxOpen, lightboxSwap, lightboxClose } from "./animations.js";

const $ = (id) => document.getElementById(id);
const allPhotos = [];

const PLACEHOLDER_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>';

// Builds an <img>; if the file is missing, swaps in a labeled placeholder.
function photo(src) {
  const img = document.createElement("img");
  img.className = "photo";
  img.src = src;
  img.alt = "";
  img.loading = "lazy";
  img.onerror = () => {
    const ph = document.createElement("div");
    ph.className = "placeholder";
    ph.innerHTML = PLACEHOLDER_ICON + "<span>Add photo:<br>" + src + "</span>";
    img.replaceWith(ph);
  };
  return img;
}

// Text can be one string, or a list of strings for several paragraphs.
function fillParagraphs(container, text) {
  [].concat(text || []).forEach((t) => {
    const p = document.createElement("p");
    p.textContent = t;
    container.appendChild(p);
  });
}

function thumb(src, caption) {
  const btn = document.createElement("button");
  const index = allPhotos.push({ src, caption, el: btn }) - 1;
  btn.className = "thumb";
  btn.appendChild(photo(src));
  btn.addEventListener("click", () => openLightbox(index));
  return btn;
}

// Header, hero, about
$("hero-eyebrow").textContent = BLOG.name + " · " + BLOG.company;
$("intro").textContent = BLOG.intro;
$("hero-photo").appendChild(photo(BLOG.heroPhoto));
document.title = BLOG.name + " · OJT Journal";

const about = [
  ["Trainee", BLOG.name],
  ["Course", BLOG.course],
  ["School", BLOG.school],
  ["Company", BLOG.company],
  ["Department", BLOG.department],
  ["Supervisor", BLOG.supervisor],
  ["Start date", new Date(BLOG.startDate).toLocaleDateString(undefined, { dateStyle: "long" })],
  ["Required hours", BLOG.requiredHours + " hours"],
];
$("about-list").innerHTML = about
  .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
  .join("");

// Progress
const done = BLOG.entries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
const req = BLOG.requiredHours;
const pct = Math.min(100, Math.round((done / req) * 100));
$("hours-done").textContent = done;
$("hours-req").textContent = req;
$("hours-left").textContent = Math.max(0, req - done) + " hrs";
$("weeks").textContent = BLOG.entries.length;
$("percent").textContent = pct + "%";
const fill = $("bar-fill");
fill.style.width = pct + "%";
fill.dataset.pct = pct;

// Journal entries (newest first)
let running = 0;
const withTotals = BLOG.entries.map((e) => ({ ...e, total: (running += Number(e.hours) || 0) }));
const timeline = $("timeline");
const gallery = $("gallery-grid");

withTotals.slice().reverse().forEach((e) => {
  const card = document.createElement("article");
  card.className = "entry";
  card.innerHTML = `
    <div class="entry-meta">
      <span class="chip">Week ${e.week}</span>
      <span class="chip">${e.date}</span>
      <span class="chip warm">${e.hours} hrs · ${e.total}/${req} total</span>
    </div>
    <h3></h3>
    <div class="body"></div>
    ${e.learned ? '<p class="learned"><strong>What I learned:</strong> <span></span></p>' : ""}
    <div class="entry-photos"></div>`;
  card.querySelector("h3").textContent = e.title;
  fillParagraphs(card.querySelector(".body"), e.text);
  if (e.learned) card.querySelector(".learned span").textContent = e.learned;

  const photos = card.querySelector(".entry-photos");
  (e.photos || []).forEach((src) => photos.appendChild(thumb(src, `Week ${e.week}: ${e.title}`)));
  timeline.appendChild(card);
});

// Gallery: one group of photos per week, with buttons to filter by week
const filters = document.createElement("div");
filters.className = "week-filters";
gallery.before(filters);

const groups = [];
BLOG.entries.forEach((e) => {
  if (!(e.photos || []).length) return;
  const group = document.createElement("div");
  group.className = "week-group";
  group.innerHTML = `
    <div class="week-head">
      <h3>Week ${e.week}</h3>
      <span class="chip">${e.date}</span>
      <span class="week-count">${e.photos.length} photo${e.photos.length > 1 ? "s" : ""}</span>
    </div>
    <p class="week-title"></p>
    <div class="week-text"></div>
    <div class="week-photos"></div>`;
  group.querySelector(".week-title").textContent = e.title;
  fillParagraphs(group.querySelector(".week-text"), e.text);
  const grid = group.querySelector(".week-photos");
  e.photos.forEach((src) => grid.appendChild(thumb(src, `Week ${e.week}: ${e.title}`)));
  gallery.appendChild(group);
  groups.push({ week: e.week, el: group });
});

function addFilter(label, week) {
  const b = document.createElement("button");
  b.className = "filter-btn";
  b.textContent = label;
  b.addEventListener("click", () => {
    filters.querySelectorAll(".filter-btn").forEach((x) => x.classList.toggle("active", x === b));
    groups.forEach((g) => (g.el.hidden = week !== null && g.week !== week));
    animateFilter(groups.filter((g) => !g.el.hidden).map((g) => g.el));
  });
  filters.appendChild(b);
  return b;
}
addFilter("All weeks", null).classList.add("active");
groups.forEach((g) => addFilter("Week " + g.week, g.week));

$("footer-text").textContent =
  `© ${new Date().getFullYear()} ${BLOG.name} · ${BLOG.school} · ${req}-hour OJT at ${BLOG.company}`;

// Lightbox
const lb = $("lightbox");
const lbImg = $("lb-img");
let current = 0;
function showPhoto(i) {
  current = (i + allPhotos.length) % allPhotos.length;
  lbImg.src = allPhotos[current].src;
  $("lb-caption").textContent = allPhotos[current].caption;
}
function openLightbox(i) {
  showPhoto(i);
  lb.hidden = false;
  lightboxOpen(lb, lbImg, allPhotos[current].el);
}
function step(dir) {
  lightboxSwap(lbImg, dir, () => showPhoto(current + dir));
}
function closeLightbox() {
  if (!lb.hidden) lightboxClose(lb, lbImg, allPhotos[current].el, () => (lb.hidden = true));
}
lb.querySelector(".lb-close").onclick = closeLightbox;
lb.querySelector(".lb-prev").onclick = () => step(-1);
lb.querySelector(".lb-next").onclick = () => step(1);
lb.addEventListener("click", (ev) => { if (ev.target === lb) closeLightbox(); });
document.addEventListener("keydown", (ev) => {
  if (lb.hidden) return;
  if (ev.key === "Escape") closeLightbox();
  if (ev.key === "ArrowLeft") step(-1);
  if (ev.key === "ArrowRight") step(1);
});

initAnimations();
