// src/controllers/reviewsController.js
const Review = require('../models/Review');
const Game = require('../models/Game');

// Listar reseñas
exports.listReviews = async (req, res) => {
  try {
    const { gameId } = req.query;
    const filter = {};
    if (gameId) filter.gameId = gameId;

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('❌ Error en listReviews:', err);
    res.status(500).json({ error: 'Error al listar reseñas' });
  }
};

// Crear reseña
exports.createReview = async (req, res) => {
  try {
    const {
      gameId,
      userName,
      score,
      title = "",
      body = "",
    } = req.body;

    if (!gameId || !userName || score === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (gameId, userName, score)' });
    }

    const r = new Review({
      gameId,
      userName,
      score,
      title,
      body,
      likes: 0,
      replies: [],
    });

    await r.save();

    // agregar referencia al juego
    try {
      await Game.findByIdAndUpdate(gameId, {
        $push: { reviews: r._id },
      });
    } catch (err) {
      console.warn('⚠️ No se pudo agregar la reseña a Game.reviews ->', err.message);
    }

    // recalcular promedio del juego
    try {
      const reviews = await Review.find({ gameId });
      const avg = reviews.length
        ? reviews.reduce((s, x) => s + x.score, 0) / reviews.length
        : 0;

      await Game.findByIdAndUpdate(gameId, { calificacion: avg });
    } catch (err) {
      console.warn('⚠️ No se pudo recalcular promedio del juego ->', err.message);
    }

    res.status(201).json(r);
  } catch (err) {
    console.error('❌ Error en createReview:', err);
    res.status(400).json({ error: 'Error al crear reseña' });
  }
};

// Actualizar reseña
exports.updateReview = async (req, res) => {
  try {
    const r = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!r) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json(r);
  } catch (err) {
    console.error('❌ Error en updateReview:', err);
    res.status(400).json({ error: 'Error al actualizar reseña' });
  }
};

// Eliminar reseña
exports.deleteReview = async (req, res) => {
  try {
    const r = await Review.findByIdAndDelete(req.params.id);

    if (r) {
      // quitar referencia del juego
      try {
        await Game.findByIdAndUpdate(r.gameId, { $pull: { reviews: r._id } });
      } catch (err) {
        console.warn('⚠️ No se pudo eliminar la referencia de Game.reviews ->', err.message);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Error en deleteReview:', err);
    res.status(400).json({ error: 'Error al eliminar reseña' });
  }
};
