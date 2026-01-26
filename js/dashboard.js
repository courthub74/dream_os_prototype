// DASHBOARD JAVASCRIPT
// This script manages the visibility of dashboard sections based on user data.
document.addEventListener("DOMContentLoaded", () => {
  const emptyWorks = document.getElementById("emptyState");
  const activeWorks = document.getElementById("activeState");

  const quickActionsPanel = document.getElementById("quickActionsPanel");
  const recentActivityPanel = document.getElementById("recentActivityPanel");
  const emptyQuickActionsSlot = document.getElementById("emptyQuickActionsSlot");

  if (!emptyWorks || !activeWorks) return;

  // TEMP test value
  const worksCount = 0;

  const showEmpty = worksCount === 0;

  // Toggle the two states
  emptyWorks.toggleAttribute("hidden", !showEmpty);
  activeWorks.toggleAttribute("hidden", showEmpty);

  // Toggle other "active dashboard" panels that live outside #activeState
  if (quickActionsPanel) quickActionsPanel.toggleAttribute("hidden", false); // keep visible in both modes
  if (recentActivityPanel) recentActivityPanel.toggleAttribute("hidden", showEmpty); // hide when empty

  // Optional: move Quick Actions into the empty right column when empty
  if (showEmpty && quickActionsPanel && emptyQuickActionsSlot) {
    emptyQuickActionsSlot.appendChild(quickActionsPanel);
  } else {
    // Put it back in the normal grid above recent activity
    const grid = document.querySelector(".content .grid");
    if (grid && quickActionsPanel) {
      grid.appendChild(quickActionsPanel);
    }
  }

  // Debug: prove what the browser is doing
  console.log("[Dashboard] worksCount:", worksCount, "showEmpty:", showEmpty);
  console.log("empty hidden:", emptyWorks.hidden, "display:", getComputedStyle(emptyWorks).display);
  console.log("active hidden:", activeWorks.hidden, "display:", getComputedStyle(activeWorks).display);
});



