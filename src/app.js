import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

// Rutas
import gamesRoutes from "./routes/games.js";
import reviewsRoutes from "./routes/reviews.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 4000;

/* =====================================================
   🔒 CORS CONFIG — Funciona con GitHub Pages correctamente
====================================================== */
app.use(
  cors({
    origin: [
      "https://sebastiancorredor123424.github.io", 
      "https://sebastiancorredor123424.github.io/biblioteca-juegos-frontend",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =====================================================
   🔧 Middlewares básicos
====================================================== */
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

/* =====================================================
   📌 Rutas API
====================================================== */
app.use("/api/games", gamesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/users", userRoutes);

/* =====================================================
   ❤️ Health check
====================================================== */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Servidor activo",
    ts: Date.now(),
  });
});

/* =====================================================
   ❌ Manejo de rutas inválidas
====================================================== */
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Endpoint API no encontrado" });
  }
  res.status(404).send("Página no encontrada");
});

/* =====================================================
   🔥 Manejo de errores globales
====================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

/* =====================================================
   🚀 Conexión a Mongo + Servidor
====================================================== */
async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error("❌ ERROR: Falta la variable MONGODB_URI en Railway");
      process.exit(1);
    }

    console.log("📡 Conectando a MongoDB...");
    await mongoose.connect(mongoUri);

    console.log("✅ Conectado a MongoDB Atlas");

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error al iniciar backend:", err);
    process.exit(1);
  }
}

start();

export default app;
