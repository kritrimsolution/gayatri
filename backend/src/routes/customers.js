const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

// Protect all customer routes with JWT authentication and require admin role
router.use(authMiddleware);
router.use(requireAdmin);

// GET ADMIN SETTINGS
router.get('/admin-settings', async (req, res) => {
  try {
    const { getSettings } = require('../utils/settings');
    const settings = getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve admin settings.' });
  }
});

// UPDATE ADMIN SETTINGS
router.post('/admin-settings', async (req, res) => {
  try {
    const { updateSettings } = require('../utils/settings');
    const { admin_mobile_number } = req.body;
    if (!admin_mobile_number) {
      return res.status(400).json({ error: 'Admin mobile number is required.' });
    }
    const cleanNumber = admin_mobile_number.replace(/\D/g, '');
    const updated = updateSettings({ admin_mobile_number: cleanNumber });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update admin settings.' });
  }
});

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { shop_name: 'asc' }
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
});

// GET customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to retrieve customer.' });
  }
});

// CREATE new customer
router.post('/', async (req, res) => {
  try {
    const { shop_name, whatsapp_number, gst_number, drug_license_expiry, owner_birthday } = req.body;
    
    if (!shop_name || !whatsapp_number || !gst_number || !drug_license_expiry || !owner_birthday) {
      return res.status(400).json({ error: 'All customer fields are required.' });
    }

    // Check if number already exists
    const existing = await prisma.customer.findUnique({
      where: { whatsapp_number }
    });
    if (existing) {
      return res.status(400).json({ error: 'WhatsApp number is already registered to another medical shop.' });
    }

    const customer = await prisma.customer.create({
      data: {
        shop_name,
        whatsapp_number,
        gst_number,
        drug_license_expiry: new Date(drug_license_expiry),
        owner_birthday: new Date(owner_birthday)
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer.' });
  }
});

// UPDATE customer
router.put('/:id', async (req, res) => {
  try {
    const { shop_name, whatsapp_number, gst_number, drug_license_expiry, owner_birthday } = req.body;
    
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Check if number exists on another customer
    if (whatsapp_number && whatsapp_number !== existingCustomer.whatsapp_number) {
      const duplicate = await prisma.customer.findUnique({
        where: { whatsapp_number }
      });
      if (duplicate) {
        return res.status(400).json({ error: 'WhatsApp number is already registered to another medical shop.' });
      }
    }

    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        shop_name: shop_name || undefined,
        whatsapp_number: whatsapp_number || undefined,
        gst_number: gst_number || undefined,
        drug_license_expiry: drug_license_expiry ? new Date(drug_license_expiry) : undefined,
        owner_birthday: owner_birthday ? new Date(owner_birthday) : undefined
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer.' });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    await prisma.customer.delete({
      where: { id: req.params.id }
    });

    res.json({ message: `Customer '${existingCustomer.shop_name}' deleted successfully.` });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer.' });
  }
});

// SEND BIRTHDAY GREETING MANUALLY
router.post('/:id/send-birthday-wish', async (req, res) => {
  try {
    const { sendTextMessage } = require('../utils/whatsapp');
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const greeting = `🎉 Happy Birthday to you, dear owner of ${customer.shop_name}! Wishing you a prosperous year ahead. Best regards, Gayatri Pharma. 🎂`;
    await sendTextMessage(customer.whatsapp_number, greeting);

    res.json({ message: `Birthday greeting successfully sent to ${customer.shop_name}!` });
  } catch (error) {
    console.error('Error sending manual birthday wish:', error);
    res.status(500).json({ error: error.message || 'Failed to send birthday greeting.' });
  }
});

// SEND LICENSE EXPIRY ALERT MANUALLY
router.post('/:id/send-license-alert', async (req, res) => {
  try {
    const { sendTextMessage } = require('../utils/whatsapp');
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const expiryDate = new Date(customer.drug_license_expiry).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const alertMessage = `⚠️ Dear ${customer.shop_name}, your drug license expires on ${expiryDate}. Please renew it to avoid any business interruptions.`;
    await sendTextMessage(customer.whatsapp_number, alertMessage);

    res.json({ message: `Drug license expiry alert successfully sent to ${customer.shop_name}!` });
  } catch (error) {
    console.error('Error sending manual license alert:', error);
    res.status(500).json({ error: error.message || 'Failed to send license alert.' });
  }
});

module.exports = router;
