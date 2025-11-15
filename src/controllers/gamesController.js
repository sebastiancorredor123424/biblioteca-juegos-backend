const Game = require('../models/Game');

// 📌 Obtener todos los juegos
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find().lean(); // lean() = más rápido
    res.json(games);
  } catch (err) {
    console.error("❌ Error al obtener juegos:", err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// 📌 Obtener un juego por ID
exports.getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).lean();
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    res.json(game);
  } catch (err) {
    console.error("❌ Error al obtener un juego:", err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
