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
    const r = new Review(req.body);
    await r.save();

    // recalcular promedio del juego
    const reviews = await Review.find({ gameId: r.gameId });
    const avg = reviews.length
      ? reviews.reduce((s, x) => s + x.score, 0) / reviews.length
      : 0;

    await Game.findByIdAndUpdate(r.gameId, { calificacion: avg });

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
    await Review.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Error en deleteReview:', err);
    res.status(400).json({ error: 'Error al eliminar reseña' });
  }
};
