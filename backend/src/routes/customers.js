const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Protect all customer routes with JWT authentication
router.use(authMiddleware);

// GET all customers with search and route filters
router.get('/', async (req, res) => {
  try {
    const { search, route } = req.query;
    
    // Construct filter condition
    const where = {};
    
    if (route) {
      where.route_area = route;
    }
    
    if (search) {
      where.OR = [
        { shop_name: { contains: search, mode: 'insensitive' } },
        { owner_name: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search } },
        { gst_number: { contains: search, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
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
    const { 
      shop_name, 
      owner_name, 
      mobile, 
      whatsapp, 
      address, 
      route_area, 
      gst_number, 
      drug_license_expiry, 
      birthday, 
      credit_limit,
      outstanding_balance
    } = req.body;
    
    if (!shop_name || !whatsapp || !gst_number || !drug_license_expiry || !birthday) {
      return res.status(400).json({ error: 'Shop Name, WhatsApp, GST, License Expiry, and Birthday are required.' });
    }

    // Format and clean whatsapp digits
    let cleanedWhatsapp = whatsapp.replace(/\D/g, '');
    if (cleanedWhatsapp.length === 10) {
      cleanedWhatsapp = '91' + cleanedWhatsapp;
    }

    // Check if number already exists
    const existing = await prisma.customer.findUnique({
      where: { whatsapp: cleanedWhatsapp }
    });
    if (existing) {
      return res.status(400).json({ error: 'WhatsApp number is already registered to another medical shop.' });
    }

    const customer = await prisma.customer.create({
      data: {
        shop_name,
        owner_name,
        mobile,
        whatsapp: cleanedWhatsapp,
        address,
        route_area: route_area || 'Rajkot',
        gst_number,
        drug_license_expiry: new Date(drug_license_expiry),
        birthday: new Date(birthday),
        credit_limit: parseFloat(credit_limit || 0),
        outstanding_balance: parseFloat(outstanding_balance || 0)
      }
    });

    // Generate B2B invite link/credentials placeholder (Phase 2 preview invite)
    const inviteLink = `http://localhost:3000/customer/setup?id=${customer.id}`;
    const inviteText = `Welcome to Gayatri Pharma! Your B2B account is registered. We will send you offers and outstanding alerts on WhatsApp. Portal access is coming soon in Phase 2! Link: ${inviteLink}`;

    res.status(201).json({
      customer,
      inviteLink,
      inviteText
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer.' });
  }
});

// UPDATE customer
router.put('/:id', async (req, res) => {
  try {
    const { 
      shop_name, 
      owner_name, 
      mobile, 
      whatsapp, 
      address, 
      route_area, 
      gst_number, 
      drug_license_expiry, 
      birthday, 
      credit_limit,
      outstanding_balance
    } = req.body;
    
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    let cleanedWhatsapp = whatsapp;
    if (whatsapp) {
      cleanedWhatsapp = whatsapp.replace(/\D/g, '');
      if (cleanedWhatsapp.length === 10) {
        cleanedWhatsapp = '91' + cleanedWhatsapp;
      }

      // Check if number exists on another customer
      if (cleanedWhatsapp !== existingCustomer.whatsapp) {
        const duplicate = await prisma.customer.findUnique({
          where: { whatsapp: cleanedWhatsapp }
        });
        if (duplicate) {
          return res.status(400).json({ error: 'WhatsApp number is already registered to another medical shop.' });
        }
      }
    }

    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        shop_name: shop_name || undefined,
        owner_name: owner_name || undefined,
        mobile: mobile || undefined,
        whatsapp: cleanedWhatsapp || undefined,
        address: address || undefined,
        route_area: route_area || undefined,
        gst_number: gst_number || undefined,
        drug_license_expiry: drug_license_expiry ? new Date(drug_license_expiry) : undefined,
        birthday: birthday ? new Date(birthday) : undefined,
        credit_limit: credit_limit !== undefined ? parseFloat(credit_limit) : undefined,
        outstanding_balance: outstanding_balance !== undefined ? parseFloat(outstanding_balance) : undefined
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
