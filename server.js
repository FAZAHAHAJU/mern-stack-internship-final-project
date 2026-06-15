// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB Local Database
connectDB();

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for frontend connection
app.use(cors());

// Middleware to parse incoming JSON payloads
app.use(express.json()); 

// Base API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Server Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "UP", message: "Server running smoothly" });
});

// Global Centralized Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error"
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});