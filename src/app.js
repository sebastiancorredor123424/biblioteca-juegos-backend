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

mongoose.set("strictQuery", false);

app.use(helmet());
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

// Rutas API
app.use("/api/games", gamesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/users", userRoutes);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Servidor activo", ts: Date.now() });
});

// Conexión MongoDB
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error de conexión:", err);
    process.exit(1);
  }
}

start();
