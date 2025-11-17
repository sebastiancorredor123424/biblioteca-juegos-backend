// src/app.js
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

// Mongoose
mongoose.set("strictQuery", false);

// Middlewares
app.use(helmet());
app.use(morgan("dev"));

// CORS CORRECTO PARA PRODUCTION
app.use(
  cors({
    origin: "https://sebastiancorredor123424.github.io",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Necesario para preflight OPTIONS
app.options("*", cors());

// JSON parser
app.use(express.json({ limit: "5mb" }));

// Rutas API
app.use("/api/games", gamesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) =>
  res.json({ ok: true, message: "Servidor activo", ts: Date.now() })
);

// Rutas no encontradas
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Endpoint API no encontrado" });
  }
  next();
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

// Conexión Mongo + inicio del servidor
async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ Falta la variable de entorno MONGODB_URI");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error de conexión o arranque:", err);
    process.exit(1);
  }
}

start();

export default app;
