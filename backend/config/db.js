// backend/config/db.js
// This file connects our Express app to MongoDB Atlas

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect using the URI from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process if DB connection fails — app can't run without DB
    process.exit(1);
  }
};

module.exports = connectDB;