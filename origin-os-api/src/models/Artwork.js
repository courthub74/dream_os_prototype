const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, default: "" },
    description: { type: String, default: "" },
    year: { type: String, default: "" },

    output: { type: String, enum: ["square", "portrait", "landscape"], default: "square" },
    collection: { type: String, default: "" },

    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },

    status: { type: String, enum: ["draft", "generated", "published", "failed"], default: "draft" },

    // later: storage urls
    originalUrl: { type: String, default: "" },
    thumbUrl: { type: String, default: "" },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model("Artwork", artworkSchema);
