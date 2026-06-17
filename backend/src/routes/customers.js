const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Protect all customer routes with JWT authentication
router.use(authMiddleware);

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

module.exports = router;
