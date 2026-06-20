const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Protect all schemes routes
router.use(authMiddleware);

// GET all schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await prisma.scheme.findMany({
      orderBy: { start_date: 'desc' }
    });
    res.json(schemes);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ error: 'Failed to retrieve schemes.' });
  }
});

// GET scheme by ID
router.get('/:id', async (req, res) => {
  try {
    const scheme = await prisma.scheme.findUnique({
      where: { id: req.params.id }
    });
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found.' });
    }
    res.json(scheme);
  } catch (error) {
    console.error('Error fetching scheme:', error);
    res.status(500).json({ error: 'Failed to retrieve scheme.' });
  }
});

// CREATE new scheme
router.post('/', async (req, res) => {
  try {
    const { name, description, product_id, min_qty, free_qty, start_date, end_date } = req.body;
    
    if (!name || !description || !start_date || !end_date) {
      return res.status(400).json({ error: 'Name, Description, Start Date, and End Date are required.' });
    }

    const scheme = await prisma.scheme.create({
      data: {
        name,
        description,
        product_id: product_id || null,
        min_qty: parseInt(min_qty || 10, 10),
        free_qty: parseInt(free_qty || 1, 10),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: true
      }
    });

    // Update the associated product's offer_scheme field for catalog synchronization
    if (product_id) {
      const product = await prisma.product.findUnique({ where: { id: product_id } });
      if (product) {
        await prisma.product.update({
          where: { id: product_id },
          data: { offer_scheme: name }
        });
      }
    }

    res.status(201).json(scheme);
  } catch (error) {
    console.error('Error creating scheme:', error);
    res.status(500).json({ error: 'Failed to create scheme.' });
  }
});

// UPDATE scheme
router.put('/:id', async (req, res) => {
  try {
    const { name, description, product_id, min_qty, free_qty, start_date, end_date, status } = req.body;
    
    const existing = await prisma.scheme.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Scheme not found.' });
    }

    const updated = await prisma.scheme.update({
      where: { id: req.params.id },
      data: {
        name: name || undefined,
        description: description || undefined,
        product_id: product_id !== undefined ? product_id : undefined,
        min_qty: min_qty !== undefined ? parseInt(min_qty, 10) : undefined,
        free_qty: free_qty !== undefined ? parseInt(free_qty, 10) : undefined,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    // Sync product scheme link if updated
    if (product_id && product_id !== existing.product_id) {
      await prisma.product.update({
        where: { id: product_id },
        data: { offer_scheme: updated.name }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating scheme:', error);
    res.status(500).json({ error: 'Failed to update scheme.' });
  }
});

// DELETE scheme
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.scheme.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Scheme not found.' });
    }

    // Clear product link before deletion
    if (existing.product_id) {
      await prisma.product.updateMany({
        where: { id: existing.product_id },
        data: { offer_scheme: null }
      });
    }

    await prisma.scheme.delete({
      where: { id: req.params.id }
    });

    res.json({ message: `Scheme '${existing.name}' deleted successfully.` });
  } catch (error) {
    console.error('Error deleting scheme:', error);
    res.status(500).json({ error: 'Failed to delete scheme.' });
  }
});

module.exports = router;
