// server.js — Updated for Deployment

require('dotenv').config();

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create uploads folder automatically if missing
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ─── MIDDLEWARE ────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://voluble-tarsier-28342e.netlify.app'
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// ─── ROUTES ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🧠 NoteMind AI Backend is running!',
    status: 'OK',
  });
});

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Note routes
app.use('/api/notes', require('./routes/noteRoutes'));

// ─── START SERVER ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ✅ NoteMind AI Server is running!
  🌐 Local:    http://localhost:${PORT}
  🔐 Auth:     http://localhost:${PORT}/api/auth
  📄 Notes:    http://localhost:${PORT}/api/notes
  `);
});