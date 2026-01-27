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

  // Get Form Data
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

  // Create Draft if Needed
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

  // Save Draft
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

  async function startGenerate() {
    // Ensure draft exists and saved
    const art = await saveDraft(); // uses your existing saveDraft()
    const id = art._id;

    // Tell backend to enqueue
    const res = await fetch(`${API_BASE}/ai/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      credentials: "include",
      body: JSON.stringify({ artworkId: id })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to enqueue generation");

    // Poll artwork status
    await pollArtworkUntilDone(id);
  }

  async function pollArtworkUntilDone(id) {
    const genFill = document.getElementById("genFill");
    const genHint = document.getElementById("genHint");
    const stage = document.getElementById("previewStage");

    let tries = 0;
    const maxTries = 120; // ~2 min if interval is 1s
    const intervalMs = 1000;

    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        tries++;

        try {
          const res = await fetch(`${API_BASE}/artworks/${id}`, {
            headers: { Authorization: `Bearer ${token()}` },
            credentials: "include"
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Polling failed");

          const a = data.artwork;
          const pct = Math.max(0, Math.min(100, a.aiProgress || 0));
          const stageText = a.aiStage || "Working…";

          if (genFill) genFill.style.width = pct + "%";
          if (genHint) genHint.textContent = stageText;

          // When generated: show preview image
          if (a.status === "generated" && a.originalUrl) {
            clearInterval(timer);

            if (stage) {
              stage.classList.remove("is-generating");
              stage.innerHTML = `
                <img src="${a.originalUrl}" alt="Generated preview" style="width:100%; height:100%; object-fit:cover; border-radius:16px;" />
              `;
            }

            resolve(a);
            return;
          }

          // Failed
          if (a.status === "failed") {
            clearInterval(timer);
            reject(new Error(a.aiError || "Generation failed"));
            return;
          }

          if (tries >= maxTries) {
            clearInterval(timer);
            reject(new Error("Generation timed out (still running)."));
          }
        } catch (err) {
          clearInterval(timer);
          reject(err);
        }
      }, intervalMs);
    });
  }


  // Hooks

  // Save Button Hook
  saveBtn?.addEventListener("click", async () => {
    try {
      await saveDraft();
    } catch (e) {
      console.warn(e);
      setPill("Draft · Unsaved");
      alert(e.message || "Save failed");
    }
  });

  // Preview Button Hook
  previewBtn?.addEventListener("click", async () => {
    // lightweight preview hook: just save first
    try {
      const art = await saveDraft();
      alert(`Preview ready for: ${art.title || "(untitled)"}\nNext: open a modal/preview page.`);
    } catch (e) {
      alert(e.message || "Preview failed");
    }
  });

  // Generate Button Hook
  const genBtn = document.getElementById("generateBtn");
  genBtn?.addEventListener("click", async () => {
    try {
      // Let your existing UI flip into generating mode (your dreamos-shell already does this on click)
      await startGenerate();

      // When done, you can also switch to your Review panel if you want:
      // document.getElementById("artworkGenerating")?.classList.add("hidden");
      // document.getElementById("artworkReview")?.classList.remove("hidden");

    } catch (e) {
      alert(e.message || "Generation failed");
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
