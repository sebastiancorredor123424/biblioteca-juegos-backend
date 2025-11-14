const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 💖 Lista de deseos (wishlist)
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],

    // ⭐ Juegos favoritos
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],

    // 🏁 Juegos completados (NUEVO)
    completedGames: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],

    // ⏱️ Horas jugadas por juego
    playedHours: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { timestamps: true }
);

// 🔐 Encriptar contraseña antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
