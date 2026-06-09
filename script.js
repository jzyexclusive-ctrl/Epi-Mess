// EPI MESS interactive experience
const firebaseConfig = {
  apiKey: "AIzaSyCRRJNVV_JCWL1amTcuqq1Up6sVJuhlnXI",
  authDomain: "portfolio-361f3.firebaseapp.com",
  projectId: "portfolio-361f3",
  storageBucket: "portfolio-361f3.firebasestorage.app",
  messagingSenderId: "485971815698",
  appId: "1:485971815698:web:fcd7d4ab781785910c97cb"
};

let db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
} catch (error) {
  console.warn("Firebase init failed:", error);
}

const themeToggle = document.getElementById("themeToggle");
const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");

function setTheme(mode) {
  const isLight = mode === "light";
  body.classList.toggle("light", isLight);
  themeToggle.textContent = isLight ? "🌙" : "☀️";
  localStorage.setItem("epi-theme", mode);
}
const savedTheme = localStorage.getItem("epi-theme") || "dark";
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const next = body.classList.contains("light") ? "dark" : "light";
  setTheme(next);
});

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.classList.toggle("active");
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      if (entry.target.classList.contains("reveal")) observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const counters = document.querySelectorAll(".count");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value + (el.dataset.suffix || "");
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });

counters.forEach((count) => counterObserver.observe(count));

const heroText = document.getElementById("heroText");
const heroWords = ["Students", "Guests", "Campus Life", "Meal Lovers"];
let heroIndex = 0;
setInterval(() => {
  heroIndex = (heroIndex + 1) % heroWords.length;
  heroText.style.opacity = 0;
  setTimeout(() => {
    heroText.textContent = heroWords[heroIndex];
    heroText.style.opacity = 1;
  }, 220);
}, 2400);

const progressBars = document.querySelectorAll(".progress-bar span");
const progressObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const span = entry.target;
    span.style.width = span.dataset.width + "%";
    progressObserver.unobserve(span);
  });
}, { threshold: 0.45 });
progressBars.forEach((bar) => progressObserver.observe(bar));

const bookingForm = document.getElementById("bookingForm");
const previewText = document.getElementById("previewText");
const popup = document.getElementById("bookingPopup");
const popupMessage = document.getElementById("popupMessage");
const closePopup = document.getElementById("closePopup");
const bookingDate = document.getElementById("bookingDate");
const mealType = document.getElementById("mealType");
const mealCount = document.getElementById("mealCount");

function updatePreview() {
  const date = bookingDate.value || "selected date";
  const type = mealType.value || "meal type";
  const count = mealCount.value || 1;
  previewText.textContent = `Booking preview: ${count} × ${type.toLowerCase()} on ${date}`;
}
[bookingDate, mealType, mealCount].forEach((field) => {
  field.addEventListener("input", updatePreview);
  field.addEventListener("change", updatePreview);
});

bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const date = bookingDate.value || "today";
  const type = mealType.value || "your selected meal";
  const count = Number(mealCount.value) || 1;

  try {
    if (db) {
      await db.collection("bookings").add({
        date,
        mealType: type,
        mealCount: count,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.warn("Booking save failed:", error);
  }

  popupMessage.textContent = `Confirmed: ${count} ${type.toLowerCase()} meal(s) for ${date}.`;
  popup.classList.add("show");
});
closePopup.addEventListener("click", () => popup.classList.remove("show"));
popup.addEventListener("click", (e) => { if (e.target === popup) popup.classList.remove("show"); });

const weeklyRing = document.getElementById("ringWeekly");
const monthlyRing = document.getElementById("ringMonthly");
function setRing(ring, percent, color) {
  ring.style.background = `radial-gradient(circle at center, var(--surface-2) 55%, transparent 56%), conic-gradient(${color} 0deg, ${color} ${percent * 3.6}deg, rgba(255,255,255,0.08) 0deg)`;
}
setRing(weeklyRing, 92, "var(--gold)");
setRing(monthlyRing, 88, "var(--accent)");

const reviews = document.querySelectorAll(".review");
let reviewIndex = 0;
setInterval(() => {
  reviews.forEach((r) => r.classList.remove("active"));
  reviewIndex = (reviewIndex + 1) % reviews.length;
  reviews[reviewIndex].classList.add("active");
}, 4200);

const cursorGlow = document.querySelector(".cursor-glow");
document.addEventListener("mousemove", (e) => {
  cursorGlow.style.left = e.clientX + "px";
  cursorGlow.style.top = e.clientY + "px";
});

const sectionIds = [...document.querySelectorAll("main section[id]")].map((s) => s.id);
const navMap = new Map([...navItems].map((a) => [a.getAttribute("href").slice(1), a]));
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navItems.forEach((link) => link.classList.remove("active"));
      const current = navMap.get(entry.target.id);
      if (current) current.classList.add("active");
    }
  });
}, { threshold: 0.45 });
sectionIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

const particles = document.createElement("div");
particles.className = "particles";
for (let i = 0; i < 34; i++) {
  const p = document.createElement("span");
  p.style.left = Math.random() * 100 + "%";
  p.style.top = Math.random() * 100 + "%";
  p.style.animationDelay = (Math.random() * 5) + "s";
  p.style.opacity = (0.15 + Math.random() * 0.35).toString();
  particles.appendChild(p);
}
document.body.appendChild(particles);
