// //   EMPTY STATE VS ACTIVE STATE TOGGLING
//   document.addEventListener("DOMContentLoaded", () => {
//     // const emptyState = document.getElementById("emptyState");
//     const emptyWorks = document.getElementById("emptyState");
//     // const activeState = document.getElementById("activeState");
//     const activeWorks = document.getElementById("activeState");


//     // Test Print 
//     console.log("Dashboard JS loaded");
//     console.log("Empty Works Element:", emptyWorks);
//     console.log("Active Works Element:", activeWorks);  

//     // Temporary: replace with real count from your backend later
//     const worksCount = 5; // TODO: set from fetched data

//     // Test Print
//     console.log("Works Count:", worksCount);

//     if (worksCount === 0) {
//       emptyWorks.hidden = false;
//       activeWorks.hidden = true;
//     } else {
//       emptyWorks.hidden = true;
//       activeWorks.hidden = false;
//     }

//     // Optional: wire up data-go buttons
//     document.body.addEventListener("click", (e) => {
//       const btn = e.target.closest("[data-go]");
//       if (!btn) return;
//       window.location.href = btn.getAttribute("data-go");
//     });
//   });

// document.addEventListener("DOMContentLoaded", () => {
//   const emptyWorks = document.getElementById("emptyState");
//   const activeWorks = document.getElementById("activeState");
//   if (!emptyWorks || !activeWorks) return;

//   const worksCount = 0; // test

//   const showEmpty = worksCount === 0;

//   emptyWorks.toggleAttribute("hidden", !showEmpty);
//   activeWorks.toggleAttribute("hidden", showEmpty);

//   console.log("[Dashboard] worksCount:", worksCount);
//   console.log("[Dashboard] showEmpty:", showEmpty);
//   console.log("[Dashboard] empty display:", getComputedStyle(emptyWorks).display);
// });



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



