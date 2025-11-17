// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userName: { type: String, required: true, unique: true, trim: true },
    avatar: { 
      type: String, 
      default: "https://www.futwiz.com/assets/img/fifa18/careerfaces/158023.png" 
    },
    // 💖 Lista de deseos
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    // ⭐ Favoritos
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    // 🏁 Completados
    completedGames: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    // ⏱ Horas jugadas
    playedHours: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { timestamps: true }
);

// 🔹 Campo virtual para confirmar contraseña
userSchema.virtual("confirmPassword")
  .get(function () {
    return this._confirmPassword;
  })
  .set(function (value) {
    this._confirmPassword = value;
  });

// 🔐 Encriptar contraseña (solo si cambia o es nueva)
userSchema.pre("save", async function (next) {
  // Validar confirmPassword
  if (this.isNew) {
    if (this.password !== this._confirmPassword) {
      const err = new Error("La contraseña y la confirmación no coinciden.");
      return next(err);
    }
  }

  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
