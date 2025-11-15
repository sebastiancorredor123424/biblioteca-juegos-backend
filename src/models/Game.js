// src/models/Game.js
import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    genero: { type: String },
    plataforma: { type: String },
    imagen: { type: String },
    banner: { type: String },
    descripcion: { type: String },
    precio: { type: Number },
    descargas: { type: Number },
    completado: { type: Boolean, default: false },
    calificacion: { type: Number, min: 0, max: 5 },

    // 🔧 FIX: validación segura para evitar CastError en reviews
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
        validate: {
          validator: (v) => mongoose.Types.ObjectId.isValid(v),
          message: "ID de review inválido",
        },
      },
    ],
  },
  { timestamps: true }
);

const Game = mongoose.model("Game", gameSchema);

export default Game;
