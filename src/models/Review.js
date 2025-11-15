// src/models/Review.js
import mongoose from "mongoose";

// Subdocumento para comentarios
const commentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    user: {
      name: { type: String, required: true },
      avatar: { type: String, default: null },
    },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Subdocumento legacy (replies)
const replySchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true
    },

    userId: { type: String, default: null },
    userName: { type: String, required: true, trim: true },
    userAvatar: { type: String, default: null },

    title: { type: String, default: "", trim: true },
    body: { type: String, default: "", trim: true },
    text: { type: String, default: "", trim: true },

    score: { type: Number, min: 0, max: 5 },
    overall: { type: Number, default: 5, min: 0, max: 5 },

    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },

    replies: { type: [replySchema], default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
