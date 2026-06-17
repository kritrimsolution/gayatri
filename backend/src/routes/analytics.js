const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

// Protect all analytics routes - only admins can access ledger/analytics
router.use(authMiddleware);
router.use(requireAdmin);

// GET B2B distributor dashboard analytics
router.get('/', async (req, res) => {
  try {
    // 1. Fetch Outstanding Balances for all medical shops
    const ledgerBalances = await prisma.ledger.findMany({
      include: {
        customer: {
          select: {
            id: true,
            shop_name: true,
            whatsapp_number: true,
            email: true
          }
        }
      },
      orderBy: { total_outstanding_balance: 'desc' }
    });

    // 2. Fetch Top Customers by Order Volume (sum of total_amount)
    const topCustomersRaw = await prisma.order.groupBy({
      by: ['customer_id'],
      where: { status: 'ACCEPTED' },
      _sum: { total_amount: true },
      orderBy: { _sum: { total_amount: 'desc' } },
      take: 5
    });

    const customerIds = topCustomersRaw.map(tc => tc.customer_id);
    const customersInfo = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, shop_name: true }
    });

    const topCustomers = topCustomersRaw.map(tc => {
      const cust = customersInfo.find(c => c.id === tc.customer_id);
      return {
        customer_id: tc.customer_id,
        shop_name: cust ? cust.shop_name : 'Unknown Shop',
        total_spent: tc._sum.total_amount || 0.0
      };
    });

    // 3. Fetch Fast-Moving Items (sum of quantities from order items)
    const fastMovingRaw = await prisma.orderItem.groupBy({
      by: ['product_id'],
      where: { order: { status: 'ACCEPTED' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const productIds = fastMovingRaw.map(fm => fm.product_id);
    const productsInfo = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, medicine_name: true, generic_name: true }
    });

    const fastMovingItems = fastMovingRaw.map(fm => {
      const prod = productsInfo.find(p => p.id === fm.product_id);
      return {
        product_id: fm.product_id,
        medicine_name: prod ? prod.medicine_name : 'Unknown Product',
        generic_name: prod ? prod.generic_name : '',
        total_units_sold: fm._sum.quantity || 0
      };
    });

    res.json({
      ledgerBalances,
      topCustomers,
      fastMovingItems
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics data.' });
  }
});

module.exports = router;
