import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

// 🔹 Importación de rutas (todas exportan "default")
import gamesRoutes from "./routes/games.js";
import reviewsRoutes from "./routes/reviews.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 4000;

// 🔹 Configuración moderna de Mongoose
mongoose.set("strictQuery", false);

app.use(helmet());
app.use(morgan("dev"));

// ❗ ESTA ERA LA PARTE MAL: CORS estaba demasiado simple
// 🔥 CORS actualizado para que funcione con Railway + GitHub Pages
app.use(cors({
  origin: [
    "https://sebastiancorredor123424.github.io", 
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// 🔥 Manejo global de preflight OPTIONS → evita el error 405
app.options("*", cors());

app.use(express.json({ limit: "5mb" }));

// 🔹 Rutas API
app.use("/api/games", gamesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/users", userRoutes);

// 🔹 Ruta de prueba
app.get("/api/health", (req, res) =>
  res.json({ ok: true, message: "Servidor activo", ts: Date.now() })
);

// 🔹 Conexión a MongoDB
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Conectado a MongoDB");

    // ✅ Escuchar en todas las interfaces, no solo localhost
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error de conexión:", err);
    process.exit(1);
  }
}

start();
