import express from "express";
const router = express.Router();
import Game from "../models/Game.js";

// 🟢 Obtener todos los juegos
router.get("/", async (req, res) => {
  try {
    const games = await Game.find().populate("reviews");
    res.json(games);
  } catch (err) {
    console.error("Error al obtener juegos:", err);
    res.status(500).json({ error: "Error al obtener los juegos" });
  }
});

// 🟢 Obtener un juego por ID
router.get("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate("reviews");
    if (!game) return res.status(404).json({ error: "Juego no encontrado" });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el juego" });
  }
});

// 🟡 Crear un nuevo juego
router.post("/", async (req, res) => {
  try {
    const nuevoJuego = new Game(req.body);
    await nuevoJuego.save();
    res.status(201).json(nuevoJuego);
  } catch (err) {
    console.error("Error al crear juego:", err);
    res.status(500).json({ error: "Error al crear el juego" });
  }
});

// 🟠 Actualizar un juego
router.put("/:id", async (req, res) => {
  try {
    const actualizado = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!actualizado)
      return res.status(404).json({ error: "Juego no encontrado" });
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el juego" });
  }
});

// 🔴 Eliminar un juego
router.delete("/:id", async (req, res) => {
  try {
    const eliminado = await Game.findByIdAndDelete(req.params.id);
    if (!eliminado)
      return res.status(404).json({ error: "Juego no encontrado" });
    res.json({ message: "Juego eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el juego" });
  }
});

export default router;
