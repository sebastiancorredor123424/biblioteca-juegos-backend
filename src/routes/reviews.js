// src/routes/reviews.js
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Game = require("../models/Game");
const { v4: uuidv4 } = require("uuid");

/**
 * Rutas:
 * GET    /               -> todas las reseñas (populate game)
 * GET    /:id            -> reseña por id
 * GET    /game/:gameId   -> reseñas de un juego
 * POST   /               -> crear reseña
 * PUT    /:id            -> actualizar reseña
 * DELETE /:id            -> eliminar reseña (y actualizar Game)
 * POST   /:id/like       -> toggle like por userName
 * POST   /:id/dislike    -> agregar dislike (simple)
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
    // Acepta distintos campos, adapta según tu modelo Review
    const {
      gameId,
      userId = null,
      userName,
      userAvatar = null,
      title,
      text,
      scores = null, // objeto con graficos, jugabilidad, etc.
      overall = 5,
    } = req.body;

    if (!gameId || !userName || !title || !text) {
      return res.status(400).json({ error: "Faltan campos obligatorios (gameId, userName, title, text)." });
    }

    const review = new Review({
      gameId,
      userId,
      userName,
      userAvatar,
      title,
      text,
      scores,
      overall,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      comments: [],
      createdAt: Date.now(),
    });

    await review.save();

    // Asociar reseña al juego si existe el modelo Game y campo reviews
    try {
      await Game.findByIdAndUpdate(gameId, { $push: { reviews: review._id } });
    } catch (err) {
      // no fatal: seguir devolviendo la review aunque no se haya actualizado Game
      console.warn("Advertencia: no se pudo actualizar Game.reviews ->", err.message);
    }

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

    // Quitar referencia del juego (no fatal si falla)
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
// Body: { userName }
// Si userName ya está en likedBy => quitar like, si no => agregar y aumentar likes.
router.post("/:id/like", async (req, res) => {
  try {
    const { userName } = req.body;
    if (!userName) return res.status(400).json({ error: "Falta userName en body" });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });

    review.likedBy = review.likedBy || [];
    const has = review.likedBy.includes(userName);

    if (has) {
      review.likedBy = review.likedBy.filter((u) => u !== userName);
      review.likes = Math.max(0, (review.likes || 0) - 1);
    } else {
      review.likedBy.push(userName);
      review.likes = (review.likes || 0) + 1;
      // opcional: si el usuario estaba en dislikes podrías reducirlo (no implementado)
    }

    await review.save();
    res.json({ ok: true, likes: review.likes, likedBy: review.likedBy });
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ error: "Error al procesar like" });
  }
});

// ---------------------- DISLIKE simple ----------------------
// Body optional. Incrementa dislikes (no toggle).
router.post("/:id/dislike", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });

    review.dislikes = (review.dislikes || 0) + 1;
    await review.save();
    res.json({ ok: true, dislikes: review.dislikes });
  } catch (err) {
    console.error("Error adding dislike:", err);
    res.status(500).json({ error: "Error al procesar dislike" });
  }
});

// ---------------------- AGREGAR COMENTARIO ----------------------
// Body: { userName, text, userAvatar? }
router.post("/:id/comment", async (req, res) => {
  try {
    const { userName, text, userAvatar = null } = req.body;
    if (!userName || !text) return res.status(400).json({ error: "Faltan campos (userName/text)" });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Reseña no encontrada" });

    const comment = {
      id: uuidv4(),
      user: { name: userName, avatar: userAvatar },
      text,
      createdAt: Date.now(),
    };

    review.comments = review.comments || [];
    review.comments.push(comment);

    await review.save();

    res.json({ ok: true, comment, comments: review.comments });
  } catch (err) {
    console.error("Error agregando comentario:", err);
    res.status(500).json({ error: "Error al agregar comentario" });
  }
});

module.exports = router;
