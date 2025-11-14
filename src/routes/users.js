import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ============================
   🟢 REGISTRO DE USUARIO
============================ */
router.post("/register", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    const existe = await User.findOne({ correo });
    if (existe) return res.status(400).json({ error: "⚠️ Correo ya registrado." });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ nombre, correo, password: hash });
    await user.save();

    res.json({ message: "✅ Usuario creado con éxito", user });
  } catch (err) {
    console.error("❌ Error al registrar usuario:", err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

/* ============================
   🟠 LOGIN DE USUARIO
============================ */
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const user = await User.findOne({ correo });
    if (!user) return res.status(404).json({ error: "❌ Usuario no encontrado." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "❌ Contraseña incorrecta." });

    const token = jwt.sign({ id: user._id }, "secreto", { expiresIn: "1h" });

    res.json({ message: "✅ Inicio de sesión exitoso", token, user });
  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

/* ============================
   💖 WISHLIST (CRUD)
============================ */

// Obtener wishlist
router.get("/:id/wishlist", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("wishlist");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(user.wishlist || []);
  } catch (err) {
    console.error("❌ Error al obtener wishlist:", err);
    res.status(500).json({ error: "Error al obtener wishlist" });
  }
});

// Agregar a wishlist
router.post("/:id/wishlist", async (req, res) => {
  try {
    const { gameId } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (!Array.isArray(user.wishlist)) user.wishlist = [];

    if (!user.wishlist.some((g) => g.toString() === gameId.toString())) {
      user.wishlist.push(gameId);
      await user.save();
    }

    res.json({ message: "Juego añadido a la wishlist", wishlist: user.wishlist });
  } catch (err) {
    console.error("❌ Error al agregar juego:", err);
    res.status(500).json({ error: "Error al agregar juego a wishlist" });
  }
});

// Eliminar de wishlist
router.delete("/:id/wishlist/:gameId", async (req, res) => {
  try {
    const { id, gameId } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (!Array.isArray(user.wishlist)) user.wishlist = [];

    user.wishlist = user.wishlist.filter((j) => j.toString() !== gameId.toString());
    await user.save();

    res.json({ message: "Juego eliminado de la wishlist", wishlist: user.wishlist });
  } catch (err) {
    console.error("❌ Error al eliminar juego:", err);
    res.status(500).json({ error: "Error al eliminar de wishlist" });
  }
});

/* ============================
   ⭐ FAVORITOS (CRUD)
============================ */

// Obtener favoritos
router.get("/:id/favorites", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(user.favorites || []);
  } catch (err) {
    console.error("❌ Error al obtener favoritos:", err);
    res.status(500).json({ error: "Error al obtener favoritos" });
  }
});

// Marcar / desmarcar favorito
router.post("/:id/favorites", async (req, res) => {
  try {
    const { gameId } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (!Array.isArray(user.favorites)) user.favorites = [];

    const exists = user.favorites.some((g) => g.toString() === gameId.toString());

    if (exists) {
      user.favorites = user.favorites.filter((id) => id.toString() !== gameId.toString());
    } else {
      user.favorites.push(gameId);
    }

    await user.save();

    res.json({
      ok: true,
      favorite: !exists,
      favorites: user.favorites,
    });
  } catch (err) {
    console.error("❌ Error al modificar favoritos:", err);
    res.status(500).json({ error: "Error al modificar favoritos" });
  }
});

/* ============================
   ✔ JUEGOS COMPLETADOS
   (usamos completedGames en el schema)
============================ */

// Obtener completados
router.get("/:id/completed", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(user.completedGames || []);
  } catch (err) {
    console.error("❌ Error al obtener completados:", err);
    res.status(500).json({ error: "Error al obtener completados" });
  }
});

// Marcar / desmarcar completado
router.post("/:id/completed", async (req, res) => {
  try {
    const { gameId } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // asegurar que exista el array (compatibilidad con datos antiguos)
    if (!Array.isArray(user.completedGames)) user.completedGames = [];

    const exists = user.completedGames.some((g) => g.toString() === gameId.toString());

    if (exists) {
      user.completedGames = user.completedGames.filter((g) => g.toString() !== gameId.toString());
    } else {
      user.completedGames.push(gameId);
    }

    await user.save();

    res.json({
      ok: true,
      completed: !exists,
      list: user.completedGames,
    });
  } catch (err) {
    console.error("❌ Error al modificar completados:", err);
    res.status(500).json({ error: "Error al modificar completados" });
  }
});

/* ============================
   ⏱ HORAS JUGADAS (MAP)
============================ */

// Obtener horas de un juego
router.get("/:id/hours/:gameId", async (req, res) => {
  try {
    const { id, gameId } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Si playedHours viene como objeto (datos antiguos), convertir a Map
    if (user.playedHours && !(user.playedHours instanceof Map)) {
      user.playedHours = new Map(Object.entries(user.playedHours || {}));
    }

    const hours = user.playedHours?.get(gameId) || 0;

    res.json({ hours });
  } catch (err) {
    console.error("❌ Error obteniendo horas:", err);
    res.status(500).json({ error: "Error al obtener horas jugadas" });
  }
});

// Guardar horas
router.post("/:id/hours", async (req, res) => {
  try {
    const { gameId, hoursPlayed } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // asegurar Map
    if (!user.playedHours) user.playedHours = new Map();
    if (!(user.playedHours instanceof Map)) {
      user.playedHours = new Map(Object.entries(user.playedHours || {}));
    }

    user.playedHours.set(gameId.toString(), Number(hoursPlayed));

    await user.save();

    res.json({ ok: true, hours: Number(hoursPlayed) });
  } catch (err) {
    console.error("❌ Error guardando horas:", err);
    res.status(500).json({ error: "Error al guardar horas jugadas" });
  }
});

export default router;
