// ─── Firebase Setup ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDA-h-ci_QC-nbvBXNzW4NMpbFYSJh72R0",
  authDomain: "epi-mess.firebaseapp.com",
  projectId: "epi-mess",
  storageBucket: "epi-mess.firebasestorage.app",
  messagingSenderId: "1003657776517",
  appId: "1:1003657776517:web:68c187cce0503da17748ec"
};

let db = null;
let auth = null;
let currentUser = null;

const fbStatus = document.getElementById("fbStatus");

function setFbStatus(state) {
  const states = {
    connecting: { text: "⬤ Connecting…", color: "#f7c948" },
    online:     { text: "⬤ Firebase Live", color: "#48d18b" },
    offline:    { text: "⬤ Offline Mode", color: "#ff2947" },
  };
  const s = states[state] || states.offline;
  fbStatus.textContent = s.text;
  fbStatus.style.color = s.color;
}

try {
  firebase.initializeApp(firebaseConfig);
  db   = firebase.firestore();
  auth = firebase.auth();

  // Anonymous sign-in so Firestore security rules work
  auth.signInAnonymously()
    .then((cred) => {
      currentUser = cred.user;
      setFbStatus("online");
      initFirestoreListeners();          // start real-time feeds
    })
    .catch((err) => {
      console.warn("Auth failed, continuing without user:", err);
      setFbStatus("online");
      initFirestoreListeners();
    });

  // Listen for auth state changes
  auth.onAuthStateChanged((user) => {
    currentUser = user;
  });

} catch (err) {
  console.warn("Firebase init failed:", err);
  setFbStatus("offline");
}

// ─── Theme ───────────────────────────────────────────────────────────────────
const themeToggle   = document.getElementById("themeToggle");
const body          = document.body;
const menuToggle    = document.querySelector(".menu-toggle");
const navLinks      = document.querySelector(".nav-links");
const navItems      = document.querySelectorAll(".nav-links a");

function setTheme(mode) {
  const isLight = mode === "light";
  body.classList.toggle("light", isLight);
  document.documentElement.classList.toggle("light", isLight);
  themeToggle.textContent = isLight ? "🌙" : "☀️";
  localStorage.setItem("epi-theme", mode);
}
setTheme(localStorage.getItem("epi-theme") || "dark");
themeToggle.addEventListener("click", () =>
  setTheme(body.classList.contains("light") ? "dark" : "light")
);

// ─── Mobile nav ──────────────────────────────────────────────────────────────
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.classList.toggle("active");
});
navItems.forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

// ─── Smooth scroll ───────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
});

// ─── Scroll reveal ───────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      if (entry.target.classList.contains("reveal")) observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ─── Counters ────────────────────────────────────────────────────────────────
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const start  = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / 1200, 1);
      el.textContent = Math.floor(progress * target) + (el.dataset.suffix || "");
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll(".count").forEach((c) => counterObserver.observe(c));

// ─── Hero typing effect ───────────────────────────────────────────────────────
const heroText  = document.getElementById("heroText");
const heroWords = ["Students", "Guests", "Campus Life", "Meal Lovers"];
let heroIndex   = 0;
setInterval(() => {
  heroIndex = (heroIndex + 1) % heroWords.length;
  heroText.style.opacity = 0;
  setTimeout(() => { heroText.textContent = heroWords[heroIndex]; heroText.style.opacity = 1; }, 220);
}, 2400);

// ─── Progress bars ───────────────────────────────────────────────────────────
const progressObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const span = entry.target;
    span.style.width = span.dataset.width + "%";
    progressObserver.unobserve(span);
  });
}, { threshold: 0.45 });
document.querySelectorAll(".progress-bar span").forEach((bar) => progressObserver.observe(bar));

// ─── Meal Booking Form ────────────────────────────────────────────────────────
const bookingForm  = document.getElementById("bookingForm");
const previewText  = document.getElementById("previewText");
const popup        = document.getElementById("bookingPopup");
const popupMessage = document.getElementById("popupMessage");
const closePopup   = document.getElementById("closePopup");
const bookingDate  = document.getElementById("bookingDate");
const mealType     = document.getElementById("mealType");
const mealCount    = document.getElementById("mealCount");

function updatePreview() {
  const date  = bookingDate.value || "selected date";
  const type  = mealType.value   || "meal type";
  const count = mealCount.value  || 1;
  previewText.textContent = `Booking preview: ${count} × ${type.toLowerCase()} on ${date}`;
}
[bookingDate, mealType, mealCount].forEach((f) => {
  f.addEventListener("input",  updatePreview);
  f.addEventListener("change", updatePreview);
});

bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const date  = bookingDate.value || "today";
  const type  = mealType.value   || "your selected meal";
  const count = Number(mealCount.value) || 1;

  const btn = bookingForm.querySelector("button[type=submit]");
  btn.textContent = "Saving…";
  btn.disabled = true;

  try {
    if (db) {
      await db.collection("bookings").add({
        date,
        mealType:  type,
        mealCount: count,
        userId:    currentUser ? currentUser.uid : "guest",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (err) {
    console.warn("Booking save failed:", err);
  }

  btn.textContent = "Confirm Booking";
  btn.disabled = false;

  popupMessage.textContent = `Confirmed: ${count} ${type.toLowerCase()} meal(s) for ${date}.`;
  popup.classList.add("show");
  bookingForm.reset();
  previewText.textContent = "Select your desired date and meal to preview your booking.";
  loadMyBookings();
});
closePopup.addEventListener("click", () => popup.classList.remove("show"));
popup.addEventListener("click", (e) => { if (e.target === popup) popup.classList.remove("show"); });

// ─── Load My Bookings (real-time) ─────────────────────────────────────────────
function loadMyBookings() {
  if (!db) return;
  const list = document.querySelector(".booking-list");
  if (!list) return;

  db.collection("bookings")
    .orderBy("createdAt", "desc")
    .limit(5)
    .onSnapshot((snapshot) => {
      list.innerHTML = "";
      if (snapshot.empty) {
        list.innerHTML = "<li>No bookings yet.</li>";
        return;
      }
      snapshot.forEach((doc) => {
        const d = doc.data();
        const li = document.createElement("li");
        const dateStr = d.date || "—";
        li.textContent = `${dateStr} • ${d.mealType || "—"} • ${d.mealCount || 1} meal(s)`;
        list.appendChild(li);
      });
    }, (err) => console.warn("Bookings listener error:", err));
}

// ─── Firestore Listeners init ─────────────────────────────────────────────────
function initFirestoreListeners() {
  loadMyBookings();
  loadNotifications();
}

// ─── Notifications (real-time from Firestore) ─────────────────────────────────
function loadNotifications() {
  if (!db) return;
  const container = document.querySelector("#notifications .cards-3");
  if (!container) return;

  db.collection("notifications")
    .orderBy("createdAt", "desc")
    .limit(6)
    .onSnapshot((snapshot) => {
      if (snapshot.empty) return;          // keep static fallback if no docs
      container.innerHTML = "";
      snapshot.forEach((doc) => {
        const d = doc.data();
        const icon = d.icon || "🔔";
        const article = document.createElement("article");
        article.className = "glass-card notify-card";
        article.innerHTML = `<h3>${icon} ${d.title || "Update"}</h3><p>${d.message || ""}</p>`;
        container.appendChild(article);
      });
    }, (err) => console.warn("Notifications listener error:", err));
}

// ─── Feedback (save to Firestore) ────────────────────────────────────────────
const feedbackSection = document.getElementById("feedback");
if (feedbackSection) {
  // Inject a quick feedback form below the review slider
  const fbForm = document.createElement("form");
  fbForm.id = "feedbackForm";
  fbForm.className = "glass-card feedback-form";
  fbForm.innerHTML = `
    <h3>Leave Your Feedback</h3>
    <label>Your Name<input type="text" id="fbName" placeholder="e.g. Raj Sharma" required /></label>
    <label>Rating
      <div class="star-row" id="starRow">
        ${[1,2,3,4,5].map(i => `<span class="star" data-val="${i}">☆</span>`).join("")}
      </div>
    </label>
    <input type="hidden" id="fbRating" value="0" />
    <label>Comment<textarea id="fbComment" rows="3" placeholder="Share your experience…" required></textarea></label>
    <button class="btn btn-primary" type="submit">Submit Feedback</button>
    <p class="fb-msg" id="fbMsg"></p>
  `;
  feedbackSection.appendChild(fbForm);

  // Star interaction
  const stars    = fbForm.querySelectorAll(".star");
  const fbRating = document.getElementById("fbRating");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const val = +star.dataset.val;
      fbRating.value = val;
      stars.forEach((s) => s.textContent = +s.dataset.val <= val ? "★" : "☆");
    });
    star.addEventListener("mouseenter", () => {
      const val = +star.dataset.val;
      stars.forEach((s) => s.textContent = +s.dataset.val <= val ? "★" : "☆");
    });
    star.addEventListener("mouseleave", () => {
      const cur = +fbRating.value;
      stars.forEach((s) => s.textContent = +s.dataset.val <= cur ? "★" : "☆");
    });
  });

  fbForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name    = document.getElementById("fbName").value.trim();
    const comment = document.getElementById("fbComment").value.trim();
    const rating  = +fbRating.value;
    const msg     = document.getElementById("fbMsg");

    if (rating === 0) { msg.textContent = "Please select a star rating."; return; }

    const btn = fbForm.querySelector("button[type=submit]");
    btn.textContent = "Submitting…";
    btn.disabled = true;

    try {
      if (db) {
        await db.collection("feedback").add({
          name, comment, rating,
          userId:    currentUser ? currentUser.uid : "guest",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        msg.style.color = "var(--success)";
        msg.textContent = "✅ Thank you! Your feedback has been saved.";
        fbForm.reset();
        fbRating.value = "0";
        stars.forEach((s) => s.textContent = "☆");
      } else {
        msg.textContent = "⚠️ Firebase offline — feedback not saved.";
      }
    } catch (err) {
      console.warn("Feedback save failed:", err);
      msg.style.color = "var(--accent)";
      msg.textContent = "❌ Could not save. Please try again.";
    }
    btn.textContent = "Submit Feedback";
    btn.disabled = false;
  });
}

// ─── Attendance rings ─────────────────────────────────────────────────────────
const weeklyRing  = document.getElementById("ringWeekly");
const monthlyRing = document.getElementById("ringMonthly");
function setRing(ring, percent, color) {
  ring.style.background = `radial-gradient(circle at center, var(--surface-2) 55%, transparent 56%), conic-gradient(${color} 0deg, ${color} ${percent * 3.6}deg, rgba(255,255,255,0.08) 0deg)`;
}
setRing(weeklyRing,  92, "#e4002b");
setRing(monthlyRing, 88, "#ff3355");

// ─── Review slider ────────────────────────────────────────────────────────────
const reviews = document.querySelectorAll(".review");
let reviewIndex = 0;
setInterval(() => {
  reviews.forEach((r) => r.classList.remove("active"));
  reviewIndex = (reviewIndex + 1) % reviews.length;
  reviews[reviewIndex].classList.add("active");
}, 4200);

// ─── Cursor glow ──────────────────────────────────────────────────────────────
const cursorGlow = document.querySelector(".cursor-glow");
document.addEventListener("mousemove", (e) => {
  cursorGlow.style.left = e.clientX + "px";
  cursorGlow.style.top  = e.clientY + "px";
});

// ─── Active nav link on scroll ────────────────────────────────────────────────
const sectionIds = [...document.querySelectorAll("main section[id]")].map((s) => s.id);
const navMap     = new Map([...navItems].map((a) => [a.getAttribute("href").slice(1), a]));
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navItems.forEach((link) => link.classList.remove("active"));
      const current = navMap.get(entry.target.id);
      if (current) current.classList.add("active");
    }
  });
}, { threshold: 0.45 });
sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) sectionObserver.observe(el); });

// ─── Background particles ─────────────────────────────────────────────────────
const particles = document.createElement("div");
particles.className = "particles";
for (let i = 0; i < 34; i++) {
  const p = document.createElement("span");
  p.style.left           = Math.random() * 100 + "%";
  p.style.top            = Math.random() * 100 + "%";
  p.style.animationDelay = (Math.random() * 5) + "s";
  p.style.opacity        = (0.15 + Math.random() * 0.35).toString();
  particles.appendChild(p);
}
document.body.appendChild(particles);
