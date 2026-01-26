document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:4000";

  const saveBtn = document.getElementById("saveDraftBtn");
  const previewBtn = document.getElementById("previewBtn");
  const pill = document.querySelector(".topRight .pill"); // "Draft · Unsaved"

  // We'll store current draft id here
  let artworkId = localStorage.getItem("origin_current_artwork_id") || null;

  function token() {
    return localStorage.getItem("origin_access");
  }

  function setPill(text) {
    if (pill) pill.textContent = text;
  }

  function getFormData() {
    const tagsRaw = (document.getElementById("tags")?.value || "").trim();
    const tags = tagsRaw
      ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    return {
      output: document.getElementById("output")?.value || "square",
      description: document.getElementById("description")?.value || "",
      title: document.getElementById("title")?.value || "",
      year: document.getElementById("year")?.value || "",
      collection: document.getElementById("collection")?.value || "",
      notes: document.getElementById("notes")?.value || "",
      tags
    };
  }

  async function createDraftIfNeeded() {
    if (artworkId) return artworkId;

    const res = await fetch(`${API_BASE}/artworks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      credentials: "include",
      body: JSON.stringify(getFormData())
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create draft");

    artworkId = data.artwork._id;
    localStorage.setItem("origin_current_artwork_id", artworkId);
    return artworkId;
  }

  async function saveDraft() {
    setPill("Draft · Saving…");

    const id = await createDraftIfNeeded();

    const res = await fetch(`${API_BASE}/artworks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      credentials: "include",
      body: JSON.stringify(getFormData())
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save draft");

    setPill("Draft · Saved");
    return data.artwork;
  }

  // Hooks
  saveBtn?.addEventListener("click", async () => {
    try {
      await saveDraft();
    } catch (e) {
      console.warn(e);
      setPill("Draft · Unsaved");
      alert(e.message || "Save failed");
    }
  });

  previewBtn?.addEventListener("click", async () => {
    // lightweight preview hook: just save first
    try {
      const art = await saveDraft();
      alert(`Preview ready for: ${art.title || "(untitled)"}\nNext: open a modal/preview page.`);
    } catch (e) {
      alert(e.message || "Preview failed");
    }
  });

  // Optional: mark unsaved when typing
  ["output", "description", "title", "year", "collection", "notes", "tags"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => setPill("Draft · Unsaved"));
    el.addEventListener("change", () => setPill("Draft · Unsaved"));
  });

  // If a draft exists, show saved state
  if (artworkId) setPill("Draft · Saved");
});
