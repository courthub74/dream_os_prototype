const API_BASE = "http://localhost:4000";

function getAccessToken() {
  return localStorage.getItem("origin_access");
}

function setAccessToken(token) {
  localStorage.setItem("origin_access", token);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("origin_user") || "null");
  } catch {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem("origin_access");
  localStorage.removeItem("origin_user");
}

async function refreshAccessToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include"
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Refresh failed");
  if (!data.accessToken) throw new Error("Missing access token from refresh");
  setAccessToken(data.accessToken);
  return data.accessToken;
}

// Optional helper for authenticated API calls later
async function apiFetch(path, options = {}) {
  let token = getAccessToken();

  // If no token, try refresh once
  if (!token) {
    token = await refreshAccessToken();
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });

  // If expired token, refresh + retry once
  if (res.status === 401) {
    token = await refreshAccessToken();
    headers.Authorization = `Bearer ${token}`;
    res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
  }

  return res;
}

async function requireSessionOrRedirect() {
  try {
    // 1) Ensure token exists (or refresh it)
    const token = getAccessToken() || await refreshAccessToken();

    // 2) Minimal validation by calling /auth/me (optional but strong)
    const res = await apiFetch("/auth/me");
    if (!res.ok) throw new Error("Not authenticated");

    // 3) Populate UI
    const user = getUser();
    if (user?.displayName) {
      const nameEl = document.querySelector(".account-name");
      if (nameEl) nameEl.textContent = user.displayName;
    } else if (user?.email) {
      const nameEl = document.querySelector(".account-name");
      if (nameEl) nameEl.textContent = user.email;
    }

    return token;
  } catch (err) {
    clearAuth();
    window.location.href = "index.html";
  }
}

// Run immediately on protected pages
document.addEventListener("DOMContentLoaded", () => {
  requireSessionOrRedirect();
});
