const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products');
const broadcastRoutes = require('./routes/broadcast');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');

// Initialize Cron Job Scheduler
require('./cron');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static processed/watermarked images and temporary uploads
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root endpoint status check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    module: 'Gayatri Pharma B2B Distribution Platform (Phase 1)',
    version: '1.0.0'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log(`📁 Static files served from backend/public/`);
  console.log(`🔗 Web URL: ${process.env.APP_URL || 'http://localhost:' + PORT}`);
});
