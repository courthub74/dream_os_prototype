// // // COLLECTIONS.JS

// js/collections.js

function visibleCardsCount(grid){
  // Count ONLY cards that are actually visible (not hidden/display:none)
  const cards = Array.from(grid.querySelectorAll(".card"));

  return cards.filter(card => {
    if (card.hidden) return false; // hidden attribute
    const cs = getComputedStyle(card);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    // offsetParent is null for display:none (mostly), but can be null for fixed elements too
    if (card.offsetParent === null && cs.position !== "fixed") return false;
    return true;
  }).length;
}

function setCollectionsState(count){
  const emptyState = document.querySelector(".emptyState");
  const grid = document.querySelector(".grid");
  const pill = document.getElementById("collectionsPill");

  if (!emptyState || !grid) return;

  const showEmpty = count === 0;

  emptyState.toggleAttribute("hidden", !showEmpty);
  grid.toggleAttribute("hidden", showEmpty);

  if (pill) pill.textContent = `${count} total`;

  console.log("[Collections] visible count:", count, "showEmpty:", showEmpty);
}

function refreshCollectionsUI(){
  const grid = document.querySelector(".grid");
  if (!grid) return;
  setCollectionsState(visibleCardsCount(grid));
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  // Initial pass
  refreshCollectionsUI();

  // Watch BOTH removals/additions AND “hide/show” changes
  const observer = new MutationObserver(() => refreshCollectionsUI());

  observer.observe(grid, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "hidden"]
  });
});

// Single edit handler
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".cardEditInline, .cardEdit");
  if (!btn) return;

  const card = btn.closest(".card");
  const slug = card?.dataset?.slug || "";
  window.location.href = `edit-collection.html?c=${encodeURIComponent(slug)}`;
});


// function setCollectionsState(count){
//   const emptyState = document.querySelector(".emptyState");
//   const grid = document.querySelector(".grid");
//   const pill = document.querySelector(".pill");

//   if (!emptyState || !grid) return;

//   const showEmpty = count === 0;

//   emptyState.toggleAttribute("hidden", !showEmpty);
//   grid.toggleAttribute("hidden", showEmpty);

//   if (pill) pill.textContent = `${count} total`;

//   // Debug
//   console.log("[Collections] count:", count, "showEmpty:", showEmpty);
//   console.log("[Collections] empty display:", getComputedStyle(emptyState).display);
//   console.log("[Collections] grid display:", getComputedStyle(grid).display);
// }

// function getCollectionsCountFromDOM(){
//   const grid = document.querySelector(".grid");
//   if (!grid) return 0;
//   return grid.querySelectorAll(".card").length;
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const grid = document.querySelector(".grid");
//   if (!grid) return;

//   // Initial render
//   setCollectionsState(getCollectionsCountFromDOM());

//   // Auto-update when cards are added/removed
//   const observer = new MutationObserver(() => {
//     setCollectionsState(getCollectionsCountFromDOM());
//   });

//   observer.observe(grid, { childList: true, subtree: true });
// });

// // Single edit handler (no duplicates)
// document.addEventListener("click", (e) => {
//   const btn = e.target.closest(".cardEditInline, .cardEdit");
//   if (!btn) return;

//   const card = btn.closest(".card");
//   const slug = card?.dataset?.slug || "";

//   window.location.href = `edit-collection.html?c=${encodeURIComponent(slug)}`;
// });
