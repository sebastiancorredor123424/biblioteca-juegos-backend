// src/routes/reviews.js
import express from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Game from "../models/Game.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * Rutas:
 * GET    /               -> todas las reseñas (populate game)
 * GET    /:id            -> reseña por id
 * GET    /game/:gameId   -> reseñas de un juego
 * POST   /               -> crear reseña
 * PUT    /:id            -> actualizar reseña
 * DELETE /:id            -> eliminar reseña (y actualizar Game)
 * POST   /:id/like       -> toggle like por userName
 * POST   /:id/comment    -> agregar comentario
 */

// ---------------------- GET todos ----------------------
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().populate("gameId", "titulo imagen");
    res.json(reviews);
  } catch (err) {
    console.error("Error al obtener reseñas:", err);
    res.status(500).json({ error: "Error al obtener reseñas" });
  }
});

// ---------------------- GET por ID ----------------------
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate("gameId", "titulo imagen");
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });
    res.json(review);
  } catch (err) {
    console.error("Error al obtener reseña:", err);
    res.status(500).json({ error: "Error al obtener reseña" });
  }
});

// ---------------------- GET reseñas por juego ----------------------
router.get("/game/:gameId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.gameId)) {
      return res.status(400).json({ error: "gameId inválido" });
    }

    const reviews = await Review.find({ gameId: req.params.gameId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Error al obtener reseñas del juego:", err);
    res.status(500).json({ error: "Error al obtener reseñas del juego" });
  }
});

// ---------------------- CREAR reseña ----------------------
router.post("/", async (req, res) => {
  try {
    const { gameId, userName, title = "", body = "", score } = req.body;

    // Validar campos obligatorios
    if (!gameId || !userName || score === undefined) {
      return res.status(400).json({
        error: "Faltan campos obligatorios (gameId, userName, score)."
      });
    }

    // Validar formato de ObjectId (24 caracteres hex)
    if (!/^[0-9a-fA-F]{24}$/.test(gameId)) {
      return res.status(400).json({
        error: "gameId inválido (debe ser ObjectId)."
      });
    }

    // Verificar que el juego exista
    const gameExists = await Game.findById(gameId);
    if (!gameExists) {
      return res.status(404).json({
        error: "El juego no existe."
      });
    }

    // Crear reseña
    const review = new Review({
      gameId,
      userName,
      title,
      body,
      score,
      likes: 0,
      replies: [],
    });

    await review.save();

    // Asociar reseña al juego
    await Game.findByIdAndUpdate(gameId, {
      $push: { reviews: review._id }
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Error al crear reseña:", err);
    res.status(500).json({ error: "Error al crear reseña" });
  }
});

// ---------------------- ACTUALIZAR reseña ----------------------
router.put("/:id", async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Reseña no encontrada" });
    res.json(updated);
  } catch (err) {
    console.error("Error al actualizar reseña:", err);
    res.status(500).json({ error: "Error al actualizar reseña" });
  }
});

// ---------------------- ELIMINAR reseña ----------------------
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Reseña no encontrada" });

    try {
      await Game.findByIdAndUpdate(deleted.gameId, {
        $pull: { reviews: deleted._id },
      });
    } catch (err) {
      console.warn("Advertencia: no se pudo quitar la reseña del juego ->", err.message);
    }

    res.json({ message: "Reseña eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar reseña:", err);
    res.status(500).json({ error: "Error al eliminar reseña" });
  }
});

// ---------------------- TOGGLE LIKE ----------------------
router.post("/:id/like", async (req, res) => {
  try {
    const { userName } = req.body;
    if (!userName) return res.status(400).json({ error: "Falta userName en body" });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });

    review.likes = review.likes + 1;
    await review.save();

    res.json({ ok: true, likes: review.likes });
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ error: "Error al procesar like" });
  }
});

// ---------------------- AGREGAR COMENTARIO ----------------------
router.post("/:id/comment", async (req, res) => {
  try {
    const { userName, text } = req.body;
    if (!userName || !text)
      return res.status(400).json({ error: "Faltan campos (userName/text)" });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });

    review.replies.push({
      userName,
      body: text,
      createdAt: Date.now(),
    });

    await review.save();
    res.json({ ok: true, replies: review.replies });
  } catch (err) {
    console.error("Error agregando comentario:", err);
    res.status(500).json({ error: "Error al agregar comentario" });
  }
});

export default router;
