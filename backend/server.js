// server.js — Updated for Phase 3

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// ─── MIDDLEWARE ────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',  // Vite's default port
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static files
// e.g. http://localhost:5000/uploads/filename.pdf
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

// Note routes ← NEW
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