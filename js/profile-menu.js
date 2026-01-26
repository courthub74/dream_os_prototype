// profile-menu.js
document.addEventListener("DOMContentLoaded", () => {
  const accountFooter = document.querySelector(".account-footer");
  if (!accountFooter) return;

  const accountBtn = accountFooter.querySelector("#accountBtn");
  const accountMenu = accountFooter.querySelector("#accountMenu");
  if (!accountBtn || !accountMenu) return;

  const API_BASE = "http://localhost:4000";

  function closeAccountMenu() {
    accountMenu.classList.remove("show");
    accountBtn.setAttribute("aria-expanded", "false");
  }

  function openAccountMenu() {
    accountMenu.classList.add("show");
    accountBtn.setAttribute("aria-expanded", "true");
  }

  function toggleAccountMenu() {
    const isOpen = accountMenu.classList.contains("show");
    isOpen ? closeAccountMenu() : openAccountMenu();
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch {}

    localStorage.removeItem("origin_access");
    localStorage.removeItem("origin_user");

    // If your login file path differs, adjust:
    window.location.href = "index.html";
  }

  // Button toggles menu
  accountBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleAccountMenu();
  });

  // Menu click: navigate OR logout
  accountMenu.addEventListener("click", async (e) => {
    e.stopPropagation();

    const btn = e.target.closest("button");
    if (!btn) return;

    // Logout action
    if (btn.dataset.action === "logout") {
      closeAccountMenu();
      await logout();
      return;
    }

    // Normal navigation
    const go = btn.dataset.go;
    if (go) {
      closeAccountMenu();
      window.location.href = go;
    }
  });

  // Click outside closes
  document.addEventListener("click", (e) => {
    if (!accountMenu.classList.contains("show")) return;
    if (accountFooter.contains(e.target)) return;
    closeAccountMenu();
  });

  // Escape closes (only once)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAccountMenu();
  });
});
