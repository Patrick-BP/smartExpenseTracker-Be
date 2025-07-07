const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('./config');

// Import routes
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const coachRoutes = require('../routes/coach');
const notificationRoutes = require('./routes/notificationRoutes');

// Start recurring transaction scheduler
require('./recurringScheduler');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.corsOptions));
app.use(rateLimit(config.rateLimit));

// Logging middleware
if (config.environment === 'development') {
  app.use(morgan('dev'));
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/health', (req, res) => {
  res.send('App is running on Vercel');
});
// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Smart Expense Tracker API',
    version: '1.0.0',
    status: 'active'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: config.environment === 'development' ? err.message : undefined
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    console.log(`Environment: ${config.environment}`);
  });
}

module.exports = app;