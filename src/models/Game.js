// src/models/Game.js
const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    genero: String,
    plataforma: String,
    imagen: String,
    banner: String,
    descripcion: String,
    precio: Number,
    descargas: Number,
    completado: { type: Boolean, default: false },
    calificacion: { type: Number, min: 0, max: 5 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);
