// src/app.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

// Rutas (asegúrate de que existen)
import gamesRoutes from "./routes/games.js";
import reviewsRoutes from "./routes/reviews.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Mejor práctica mongoose
mongoose.set("strictQuery", false);

// Middlewares básicos
app.use(helmet());
app.use(morgan("dev"));

// CORS: si usas tokens en localStorage, origin: '*' está bien.
// Si usas cookies/credenciales, reemplaza '*' por tu origen (ej: 'https://sebastiancorredor123424.github.io')
// y añade { credentials: true }.
app.use(cors({ origin: "*" }));

// Parseo JSON (limite razonable)
app.use(express.json({ limit: "5mb" }));

// --- RUTAS DEL API ---
app.use("/api/games", gamesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/users", userRoutes);

// Ruta de prueba / health check
app.get("/api/health", (req, res) =>
  res.json({ ok: true, message: "Servidor activo", ts: Date.now() })
);

// Manejo de rutas no encontradas (devuelve JSON en vez de HTML)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Endpoint API no encontrado" });
  }
  // para otras rutas (si sirves un front desde el backend) -> next()
  next();
});

// Manejo básico de errores (para devolver JSON en vez de HTML)
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

// Conexión a MongoDB y arranque del servidor
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
