// src/models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    userName: { type: String, required: true },
    score: { type: Number, min: 0, max: 5, required: true },
    title: String,
    body: String,
    likes: { type: Number, default: 0 },
    replies: [
      {
        userName: String,
        body: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
