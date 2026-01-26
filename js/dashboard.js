document.addEventListener("DOMContentLoaded", async () => {
  const emptyWorks = document.getElementById("emptyState");
  const activeWorks = document.getElementById("activeState");

  const quickActionsPanel = document.getElementById("quickActionsPanel");
  const recentActivityPanel = document.getElementById("recentActivityPanel");
  const emptyQuickActionsSlot = document.getElementById("emptyQuickActionsSlot");

  if (!emptyWorks || !activeWorks) return;

  const API_BASE = "http://localhost:4000";

  // Uses localStorage access token (auth-guard should keep this fresh)
  function getAccessToken(){
    return localStorage.getItem("origin_access");
  }

  async function fetchStats(){
    const token = getAccessToken();
    if (!token) throw new Error("Missing token");

    const res = await fetch(`${API_BASE}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load stats");
    return data.stats;
  }

  function setKpiValue(label, value){
    // Finds the KPI by its label text ("Works", "Collections", "Drops") and updates the number above it
    const kpis = document.querySelectorAll(".kpi");
    kpis.forEach(kpi => {
      const lab = kpi.querySelector(".kpi-label");
      const val = kpi.querySelector(".kpi-value");
      if (!lab || !val) return;
      if (lab.textContent.trim().toLowerCase() === label.toLowerCase()) {
        val.textContent = String(value);
      }
    });
  }

  function showState(worksCount){
    const showEmpty = worksCount === 0;

    // Toggle the two states
    emptyWorks.toggleAttribute("hidden", !showEmpty);
    activeWorks.toggleAttribute("hidden", showEmpty);

    // Keep Quick Actions visible in both, hide Recent Activity when empty
    if (quickActionsPanel) quickActionsPanel.toggleAttribute("hidden", false);
    if (recentActivityPanel) recentActivityPanel.toggleAttribute("hidden", showEmpty);

    // Move Quick Actions into empty right column when empty
    if (showEmpty && quickActionsPanel && emptyQuickActionsSlot) {
      emptyQuickActionsSlot.appendChild(quickActionsPanel);
    } else {
      const grid = document.querySelector(".content .grid");
      if (grid && quickActionsPanel) grid.appendChild(quickActionsPanel);
    }

    console.log("[Dashboard] worksCount:", worksCount, "showEmpty:", showEmpty);
  }

  try {
    const stats = await fetchStats();

    // Update KPIs in BOTH empty + active layouts (your markup repeats KPI blocks)
    setKpiValue("Works", stats.works ?? 0);
    setKpiValue("Collections", stats.collections ?? 0);
    setKpiValue("Drops", stats.drops ?? 0);

    showState(stats.works ?? 0);
  } catch (err) {
    console.warn("[Dashboard] Stats load failed:", err.message);

    // If stats fails, safest UX: treat as empty (or you can show an error panel)
    setKpiValue("Works", 0);
    setKpiValue("Collections", 0);
    setKpiValue("Drops", 0);
    showState(0);
  }
});
