const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const Artwork = require("../../models/Artwork");

const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "..", "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const filename = `art_${artwork._id}_${Date.now()}.png`;
const filepath = path.join(uploadsDir, filename);
fs.writeFileSync(filepath, buffer);

// This becomes your stored URL
const originalUrl = `http://localhost:4000/uploads/${filename}`;


// For now: a fake generator. Replace later with OpenAI/Stability call + upload.
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Map your UI outputs to API sizes
function mapSize(output){
  if (output === "portrait") return "1024x1536";
  if (output === "landscape") return "1536x1024";
  return "1024x1024";
}

async function generateWithOpenAI(artwork, report){
  await report(10, "Compiling prompt structure…");

  // For Prompt it will later be manually created.
  const prompt =
  `Title: ${artwork.title || "(untitled)"}
  Year: ${artwork.year || ""}
  Collection: ${artwork.collection || ""}
  Description: ${artwork.description || ""}
  Tags: ${(artwork.tags || []).join(", ")}
  Notes (internal): ${artwork.notes || ""}

  Style: surreal, oil-paint texture, symbolic, high detail, museum lighting.`;

  await report(25, "Calling OpenAI…");

  // Uses the Images API. GPT image models return base64. :contentReference[oaicite:2]{index=2}
  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: mapSize(artwork.output),
    output_format: "png" // supported for GPT image models :contentReference[oaicite:3]{index=3}
  });

  await report(80, "Storing output…");

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data returned from OpenAI");

  const buffer = Buffer.from(b64, "base64");
  return buffer; // you upload/save this and return your own URL
}

const { buildArtworkKey, saveBuffer } = require("../../modules/storage/storage.service");

const key = buildArtworkKey({
  userId,
  artworkId: artwork._id.toString(),
  variant: "original",
  mime: "image/png"
});

const stored = await saveBuffer({ key, buffer, mime: "image/png" });

// then store stored.url + stored.key + stored.bytes on Artwork
await Artwork.updateOne(
  { _id: artworkId, userId },
  {
    $set: {
      status: "generated",
      aiProgress: 100,
      aiStage: "Ready",
      originalUrl: stored.url,
      originalKey: stored.key,
      bytesOriginal: stored.bytes,
      mimeOriginal: "image/png",
      updatedAt: new Date()
    }
  }
);



// async function fakeGenerateAndStore(artwork, report) {
//   // Simulate stages
//   await report(15, "Compiling prompt structure…");
//   await sleep(800);

//   await report(35, "Stitching composition…");
//   await sleep(1000);

//   await report(60, "Rendering light + texture…");
//   await sleep(1200);

//   await report(85, "Finalizing output…");
//   await sleep(900);

//   await report(95, "Saving output…");
//   await sleep(600);

//   // Placeholder output URL (swap with real storage URL later)
//   // You can also save base64 or local file path temporarily, but URLs scale better.
//   const placeholderUrl = "https://placehold.co/1024x1024/png?text=GENERATED";

//   return { originalUrl: placeholderUrl, thumbUrl: placeholderUrl };
// }

function startAiWorker() {
  const connection = new IORedis(process.env.REDIS_URL);

  const worker = new Worker(
    "ai",
    async (job) => {
      const { artworkId, userId } = job.data;

      const artwork = await Artwork.findOne({ _id: artworkId, userId });
      if (!artwork) throw new Error("Artwork not found or not owned by user");

      const report = async (pct, stageText) => {
        await Artwork.updateOne(
          { _id: artworkId, userId },
          {
            $set: {
              status: "draft",
              aiProgress: pct,
              aiStage: stageText,
              aiError: "",
              updatedAt: new Date()
            }
          }
        );
        await job.updateProgress(pct);
      };

      // Mark running
      await Artwork.updateOne(
        { _id: artworkId, userId },
        {
          $set: {
            status: "draft",
            aiProgress: 5,
            aiStage: "Starting generation…",
            aiError: "",
            updatedAt: new Date()
          }
        }
      );

      const out = await fakeGenerateAndStore(artwork, report);

      await Artwork.updateOne(
        { _id: artworkId, userId },
        {
          $set: {
            status: "generated",
            aiProgress: 100,
            aiStage: "Ready",
            originalUrl: out.originalUrl,
            thumbUrl: out.thumbUrl,
            updatedAt: new Date()
          }
        }
      );

      return { ok: true, originalUrl: out.originalUrl };
    },
    { connection }
  );

  worker.on("failed", async (job, err) => {
    try {
      const { artworkId, userId } = job.data || {};
      if (artworkId && userId) {
        await Artwork.updateOne(
          { _id: artworkId, userId },
          {
            $set: {
              status: "failed",
              aiError: err.message || "Generation failed",
              aiStage: "Failed",
              updatedAt: new Date()
            }
          }
        );
      }
    } catch {}
  });

  console.log("✅ AI worker started");
  return worker;
}

module.exports = { startAiWorker };
