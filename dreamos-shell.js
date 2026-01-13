(function initDreamOSShell(){
  const sidebar = document.getElementById("sidebar");
  const burger = document.getElementById("burger");
  const scrim = document.getElementById("scrim");

  if(!sidebar || !burger || !scrim) return;

  function openSidebar(){
    sidebar.classList.add("open");
    scrim.classList.add("show");
    burger.classList.add("active");
    burger.setAttribute("aria-expanded","true");
  }
  function closeSidebar(){
    sidebar.classList.remove("open");
    scrim.classList.remove("show");
    burger.classList.remove("active");
    burger.setAttribute("aria-expanded","false");
  }

  burger.addEventListener("click", ()=>{
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  scrim.addEventListener("click", closeSidebar);

  window.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") closeSidebar();
  });
})();

// Demo flag for now. Swap this with your real count later.
  const worksCount = 0; // 0 = empty state

  const emptyState = document.querySelector(".empty-state");
  const emptyQuickActionsSlot = document.getElementById("emptyQuickActionsSlot");

  const quickActionsPanel = document.getElementById("quickActionsPanel");
  const recentActivityPanel = document.getElementById("recentActivityPanel");

  const showEmpty = worksCount === 0;

  if(showEmpty){
    // Show empty state
    if(emptyState) emptyState.style.display = "block";

    // Hide Recent Activity
    if(recentActivityPanel) recentActivityPanel.style.display = "none";

    // Move Quick Actions panel to the right column of empty state
    if(quickActionsPanel && emptyQuickActionsSlot){
      emptyQuickActionsSlot.appendChild(quickActionsPanel);
    }
  } else {
    // Hide empty state
    if(emptyState) emptyState.style.display = "none";

    // Show Recent Activity
    if(recentActivityPanel) recentActivityPanel.style.display = "";

    // Ensure Quick Actions lives in the normal grid again (left column)
    // (Put it back at the top of the grid, before recent activity)
    const grid = document.querySelector(".grid");
    if(grid && quickActionsPanel){
      grid.insertBefore(quickActionsPanel, recentActivityPanel || null);
    }
  }