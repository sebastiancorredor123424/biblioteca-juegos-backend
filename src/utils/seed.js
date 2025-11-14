// src/utils/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('../models/Game');
const juegosSeed = require('../../data/juegos'); // o crea un JSON con los juegos

async function seed(){
  await mongoose.connect(process.env.MONGODB_URI);
  await Game.deleteMany({});
  await Game.insertMany(juegosSeed);
  console.log('Seed completado');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
