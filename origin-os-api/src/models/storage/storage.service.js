const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

function extFromMime(mime) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "bin";
}

function safeId() {
  return crypto.randomBytes(8).toString("hex");
}

function getDriver() {
  return (process.env.STORAGE_DRIVER || "local").toLowerCase();
}

// ---------- R2 client (S3-compatible) ----------
function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
  });
}

function r2PublicUrl(key) {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) throw new Error("Missing R2_PUBLIC_BASE_URL");
  return `${base.replace(/\/$/, "")}/${key}`;
}

function localPublicUrl(key) {
  // key should be like: users/.../original.png
  const base = process.env.PUBLIC_BASE_URL || "http://localhost:4000";
  return `${base.replace(/\/$/, "")}/uploads/${key}`;
}

function localPathForKey(key) {
  const root = process.env.LOCAL_UPLOAD_DIR || "uploads";
  return path.join(process.cwd(), root, key);
}

// ---------- Public: build key convention ----------
function buildArtworkKey({ userId, artworkId, variant = "original", mime = "image/png" }) {
  const ext = extFromMime(mime);
  return `users/${userId}/artworks/${artworkId}/${variant}.${ext}`;
}

// ---------- Save buffer ----------
async function saveBuffer({ key, buffer, mime }) {
  const driver = getDriver();

  if (driver === "local") {
    const filePath = localPathForKey(key);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return {
      key,
      url: localPublicUrl(key),
      bytes: buffer.length
    };
  }

  if (driver === "r2") {
    const client = r2Client();
    const Bucket = process.env.R2_BUCKET;
    if (!Bucket) throw new Error("Missing R2_BUCKET");

    await client.send(
      new PutObjectCommand({
        Bucket,
        Key: key,
        Body: buffer,
        ContentType: mime || "application/octet-stream"
      })
    );

    return {
      key,
      url: r2PublicUrl(key),
      bytes: buffer.length
    };
  }

  throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
}

// ---------- Delete ----------
async function deleteObject({ key }) {
  const driver = getDriver();

  if (driver === "local") {
    const filePath = localPathForKey(key);
    try { fs.unlinkSync(filePath); } catch {}
    return { ok: true };
  }

  if (driver === "r2") {
    const client = r2Client();
    const Bucket = process.env.R2_BUCKET;
    await client.send(new DeleteObjectCommand({ Bucket, Key: key }));
    return { ok: true };
  }

  throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
}

module.exports = {
  buildArtworkKey,
  saveBuffer,
  deleteObject
};
