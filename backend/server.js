const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const streakRoutes = require('./routes/streak.routes');
const errorHandler = require('./middleware/errorHandler');
const { seedDatabase } = require('./seed/seedRewards');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Security & Diagnostic Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: '*', // Allow all origins for dev/testing or configure via CORS_ORIGIN
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 2. Health & Diagnostic Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'VELoop Daily Streak Engine',
    version: '1.0.0',
  });
});

// 3. Mount Business API Routes
app.use('/api/daily-streak', streakRoutes);

// 4. Centralized Error Handler
app.use(errorHandler);

// 5. Connect Database & Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`🚀 VELoop Rewards Backend listening on port ${PORT}`);
      console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`⚡ Daily Streak API: http://localhost:${PORT}/api/daily-streak`);
      console.log(`=================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
