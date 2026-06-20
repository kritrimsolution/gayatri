const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'gayatri_pharma_jwt_secret_secure_key_12345!';

// Seeding Admin endpoint - for setup
router.post('/seed', async (req, res) => {
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount > 0) {
      return res.status(400).json({ error: 'Admin table already has accounts. Cannot seed.' });
    }

    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide email, password, and name.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        email,
        password_hash,
        name
      }
    });

    res.status(201).json({ message: 'Admin seeded successfully.', admin: { email: admin.email, name: admin.name } });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: 'Failed to seed admin.' });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
<<<<<<< HEAD
        role: 'admin'
=======
        role: admin.role
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Client (Medical Shop) Login
router.post('/client-login', async (req, res) => {
  try {
    const { username, password } = req.body; // username can be email or whatsapp_number
    if (!username || !password) {
      return res.status(400).json({ error: 'Username (Email/WhatsApp) and password are required.' });
    }

    // Try finding customer by email or by whatsapp_number
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: username },
          { whatsapp_number: username }
        ]
      }
    });

    if (!customer) {
      return res.status(401).json({ error: 'Invalid credentials. Medical shop not registered.' });
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    const token = jwt.sign(
      { 
        id: customer.id, 
        whatsapp_number: customer.whatsapp_number, 
        shop_name: customer.shop_name, 
        email: customer.email,
        role: 'client' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      customer: {
        id: customer.id,
        shop_name: customer.shop_name,
        whatsapp_number: customer.whatsapp_number,
        email: customer.email,
        role: 'client'
      }
    });
  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({ error: 'Internal server error during client login.' });
  }
});

// Admin Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'An admin with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password_hash,
        name
      }
    });

    res.status(201).json({
      message: 'Admin registered successfully.',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register admin.' });
  }
});

module.exports = router;
