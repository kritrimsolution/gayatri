const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { sendTextMessage } = require('../utils/whatsapp');

const prisma = new PrismaClient();

// Protect all invoice routes
router.use(authMiddleware);

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const { status, customerId } = req.query;
    
    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (customerId) {
      where.customer_id = customerId;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            shop_name: true,
            whatsapp: true,
            outstanding_balance: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    
    // Calculate total unpaid summary
    const unpaidAgg = await prisma.invoice.aggregate({
      where: { status: 'UNPAID' },
      _sum: { amount: true }
    });
    const totalUnpaid = unpaidAgg._sum.amount || 0;

    res.json({
      invoices,
      totalUnpaid: parseFloat(totalUnpaid.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to retrieve invoices.' });
  }
});

// GET invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: {
          select: {
            shop_name: true,
            whatsapp: true,
            outstanding_balance: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    res.status(500).json({ error: 'Failed to retrieve invoice details.' });
  }
});

// POST /api/invoices/:id/send-reminder
router.post('/:id/send-reminder', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { customer: true }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ error: 'Invoice is already paid. No reminder needed.' });
    }

    const formattedDate = new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const textMsg = `Dear ${invoice.customer.shop_name},\n\nThis is a friendly reminder that invoice #${invoice.invoice_number} of ₹${invoice.amount.toFixed(2)} generated on ${formattedDate} is currently pending payment.\n\nYour total outstanding balance is ₹${invoice.customer.outstanding_balance.toFixed(2)}.\n\nKindly arrange payment. Thank you.\n- Gayatri Pharma`;

    try {
      await sendTextMessage(invoice.customer.whatsapp, textMsg);
      
      await prisma.dispatchLog.create({
        data: {
          customer_id: invoice.customer.id,
          type: 'REMINDER',
          status: 'SENT'
        }
      });
      
      res.json({ message: 'Payment reminder sent successfully.' });
    } catch (whatsappErr) {
      console.error(`Failed to send reminder for invoice #${invoice.invoice_number}:`, whatsappErr.message);
      
      await prisma.dispatchLog.create({
        data: {
          customer_id: invoice.customer.id,
          type: 'REMINDER',
          status: 'FAILED',
          error_message: whatsappErr.message
        }
      });
      
      res.status(500).json({ error: `Failed to dispatch WhatsApp message: ${whatsappErr.message}` });
    }
  } catch (error) {
    console.error('Reminder dispatch error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
