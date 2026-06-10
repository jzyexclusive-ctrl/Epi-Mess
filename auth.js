const API_BASE = "http://localhost:5000";

let currentUser = null;
let currentUserRole = "guest";
let token = localStorage.getItem("epiToken");

const isLoginPage = window.location.pathname.endsWith("login.html");
const isAdminPage = window.location.pathname.endsWith("admin.html");
const isClientPage = window.location.pathname.endsWith("client.html");

function showMessage(el, text, color) {
  if (!el) return;
  el.textContent = text;
  if (color) el.style.color = color;
}

function setToken(value) {
  token = value;
  if (value) {
    localStorage.setItem("epiToken", value);
  } else {
    localStorage.removeItem("epiToken");
  }
}

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ success: false, message: "Invalid server response." }));
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }
  return data;
}

async function verifySession() {
  if (!token) {
    currentUser = null;
    currentUserRole = "guest";
    return;
  }

  try {
    const data = await apiFetch("/auth/me");
    currentUser = data.user;
    currentUserRole = data.user.role;
  } catch (err) {
    setToken(null);
    currentUser = null;
    currentUserRole = "guest";
  }
}

function getRoleRedirect(role) {
  return role === "admin" ? "admin.html" : "client.html";
}

function updateRolePage() {
  const roleTitle = document.getElementById("roleTitle");
  const roleInfo = document.getElementById("roleInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  if (roleTitle) {
    roleTitle.textContent = isAdminPage ? "Admin Access" : "Client Access";
  }

  if (roleInfo) {
    roleInfo.textContent = currentUser
      ? `Signed in as ${currentUser.email || "user"} (${currentUserRole}).`
      : "Please sign in to access your dashboard.";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      setToken(null);
      window.location.href = "login.html";
    });
  }
}

function handlePageRedirects() {
  if (isLoginPage) {
    if (currentUser) {
      window.location.href = getRoleRedirect(currentUserRole);
    }
    return;
  }

  if (isAdminPage || isClientPage) {
    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    const expectedRole = isAdminPage ? "admin" : "client";
    if (currentUserRole !== expectedRole) {
      setToken(null);
      window.location.href = "login.html";
      return;
    }

    updateRolePage();
  }
}

function attachAuthEvents() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginStatus = document.getElementById("loginStatus");
  const registerStatus = document.getElementById("registerStatus");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      showMessage(loginStatus, "Signing in…", "var(--gold)");

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const adminPasscode = document.getElementById("loginAdminPasscode")?.value || undefined;

      try {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password, adminPasscode }),
        });

        setToken(data.token);
        currentUser = data.user;
        currentUserRole = data.user.role;
        showMessage(loginStatus, "Login successful — redirecting...", "var(--success)");
        setTimeout(() => {
          window.location.href = getRoleRedirect(currentUserRole);
        }, 400);
      } catch (err) {
        showMessage(loginStatus, err.message || "Login failed.", "var(--accent)");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      showMessage(registerStatus, "Creating account…", "var(--gold)");

      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const role = document.getElementById("registerRole").value;
      const adminPasscode = document.getElementById("registerAdminPasscode")?.value || undefined;

      try {
        const data = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, role, adminPasscode }),
        });

        setToken(data.token);
        currentUser = data.user;
        currentUserRole = data.user.role;
        showMessage(registerStatus, "Account created — redirecting...", "var(--success)");
        setTimeout(() => {
          window.location.href = getRoleRedirect(currentUserRole);
        }, 400);
      } catch (err) {
        showMessage(registerStatus, err.message || "Account creation failed.", "var(--accent)");
      }
    });
  }
}

(async () => {
  await verifySession();
  handlePageRedirects();
  attachAuthEvents();
})();
