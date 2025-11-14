import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/Game.js"; // tu modelo correcto
import games from "../data/juegos.cjs"; // importar desde tu nuevo archivo .cjs

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    console.log("📄 CONTENIDO DE GAME:");
    console.log(Game);

    // Borrar colección anterior
    await Game.deleteMany({});
    console.log("🧹 Colección de juegos eliminada");

    // Insertar nuevos
    await Game.insertMany(games);
    console.log(`🎮 Se importaron ${games.length} juegos correctamente`);

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error importando juegos:", error);
    mongoose.connection.close();
  }
};

run();
