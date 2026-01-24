// COLLECTIONS.JS

// Empty state handler
// js/collections.js
document.addEventListener("DOMContentLoaded", () => {
  const emptyState = document.querySelector(".emptyState");
  const grid = document.querySelector(".grid");
  const pill = document.querySelector(".pill");
  
  if (!emptyState || !grid) return;

  // --- Later: replace this section with real fetch ---
  // async function loadCollections() {
  //   const res = await fetch("/api/collections");
  //   const collections = await res.json();
  //   return collections.length;
  // }
  
  // For now: count cards that exist in the DOM
  const collectionsCount = grid.querySelectorAll(".card").length;
  
  console.log("Collections count:", collectionsCount); // Debug log
  
  // Toggle empty vs grid
  if (collectionsCount === 0) {
    emptyState.hidden = false;
    grid.hidden = true;
  } else {
    console.log("There is a Collection added");
    emptyState.hidden = true;
    grid.hidden = false;
  }
  
  // Update pill
  if (pill) {
    pill.textContent = `${collectionsCount} total`;
  }
});

// Function to update UI elements based on collection count
function updateCollectionsUI(){
  const emptyState = document.querySelector(".emptyState");
  const grid = document.querySelector(".grid");
  const pill = document.querySelector(".pill");
  if (!emptyState || !grid) return;

  const count = grid.querySelectorAll(".card").length;

  emptyState.hidden = count !== 0 ? true : false;
  grid.hidden = count === 0 ? true : false;

  if (pill) pill.textContent = `${count} total`;
}

// Run once on load
document.addEventListener("DOMContentLoaded", updateCollectionsUI);

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  const observer = new MutationObserver(() => updateCollectionsUI());
  observer.observe(grid, { childList: true, subtree: true });

  updateCollectionsUI();
});


// Edit collection button handler
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".cardEditInline, .cardEdit");
  if (!btn) return;
  
  const card = btn.closest(".card");
  const slug = card?.dataset?.slug || "";
  window.location.href = `edit-collection.html?c=${encodeURIComponent(slug)}`;
});

// Edit collection button handler
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".cardEditInline, .cardEdit");
  if (!btn) return;
  
  const card = btn.closest(".card");
  const slug = card?.dataset?.slug || "";
  window.location.href = `edit-collection.html?c=${encodeURIComponent(slug)}`;
});
// Edit collection button handler
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".cardEditInline"); // matches your HTML
  if (!btn) return;

  const card = btn.closest(".card");
  const slug = card?.dataset?.slug || "";
  window.location.href = `edit-collection.html?c=${encodeURIComponent(slug)}`;
});


// // For now: count cards that exist in the DOM
// const collectionsCount = grid.querySelectorAll(".card").length;

// // Pill Update Handler
// const pill = document.querySelector('.pill');
// pill.textContent = `${collectionsCount} total`;

// For Later Fetching Collections
// const collections = await fetch('/api/collections');
// const collectionsCount = collections.length;


// Edit collection button handler
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".cardEdit");
  if(!btn) return;

  const card = btn.closest(".card");
  const slug = card?.dataset?.slug || "";
  window.location.href = `edit-collection.html?c=${encodeURIComponent(slug)}`;
});


