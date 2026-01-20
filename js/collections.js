// COLLECTIONS.JS

// Edit collection button handler
 document.addEventListener("click", (e) => {
    const btn = e.target.closest(".cardEdit");
    if(!btn) return;

    const card = btn.closest(".card");
    const slug = card?.dataset?.slug || "";
    window.location.href = `edit-collection.html?c=${encodeURIComponent(slug)}`;
  });
