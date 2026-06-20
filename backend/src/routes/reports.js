const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Protect dashboard route
router.use(authMiddleware);

// GET /api/reports/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. KPI Cards
    const totalCustomers = await prisma.customer.count();
    const totalProducts = await prisma.product.count();

    const outstandingAgg = await prisma.customer.aggregate({
      _sum: { outstanding_balance: true }
    });
    const outstandingAmount = outstandingAgg._sum.outstanding_balance || 0;

    // Inactive Customers: last_order_date < 30 days ago, or never ordered
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const inactiveCustomers = await prisma.customer.count({
      where: {
        OR: [
          { last_order_date: { lt: thirtyDaysAgo } },
          { last_order_date: null }
        ]
      }
    });

    // Expiring Products (within 90 days)
    const ninetyDaysLater = new Date();
    ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);
    const expiringProductsCount = await prisma.product.count({
      where: {
        expiry_date: {
          gte: today,
          lte: ninetyDaysLater
        }
      }
    });

    // Today's Birthdays
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    const customers = await prisma.customer.findMany({
      select: { id: true, shop_name: true, birthday: true }
    });
    const todaysBirthdays = customers.filter(c => {
      const bdate = new Date(c.birthday);
      return bdate.getMonth() === todayMonth && bdate.getDate() === todayDate;
    }).length;

    // License Expiring (within 15 days)
    const fifteenDaysLater = new Date();
    fifteenDaysLater.setDate(fifteenDaysLater.getDate() + 15);
    const licenseExpiringCount = await prisma.customer.count({
      where: {
        drug_license_expiry: {
          gte: today,
          lte: fifteenDaysLater
        }
      }
    });

    // Campaigns Sent count
    const campaignsAgg = await prisma.campaign.aggregate({
      _sum: { sentCount: true }
    });
    const campaignsSentCount = campaignsAgg._sum.sentCount || 0;

    // 2. Follow-Up Widgets
    // Customers with no orders in 25+ days
    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
    const followUps = await prisma.customer.findMany({
      where: {
        OR: [
          { last_order_date: { lt: twentyFiveDaysAgo } },
          { last_order_date: null }
        ]
      },
      select: {
        id: true,
        shop_name: true,
        last_order_date: true,
        outstanding_balance: true
      },
      orderBy: [
        { last_order_date: 'asc' }
      ],
      take: 10
    });

    // Top outstanding dues customers
    const outstandingDues = await prisma.customer.findMany({
      where: {
        outstanding_balance: { gt: 0 }
      },
      select: {
        id: true,
        shop_name: true,
        outstanding_balance: true
      },
      orderBy: {
        outstanding_balance: 'desc'
      },
      take: 5
    });

    // 3. Granular Expiry Tracker
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const oneEightyDaysLater = new Date();
    oneEightyDaysLater.setDate(oneEightyDaysLater.getDate() + 180);

    const expiring30 = await prisma.product.count({
      where: { expiry_date: { gte: today, lte: thirtyDaysLater } }
    });
    const expiring90 = await prisma.product.count({
      where: { expiry_date: { gte: today, lte: ninetyDaysLater } }
    });
    const expiring180 = await prisma.product.count({
      where: { expiry_date: { gte: today, lte: oneEightyDaysLater } }
    });

    // 4. Sales Trends (Group Invoices by Month)
    const invoices = await prisma.invoice.findMany({
      select: { amount: true, date: true }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendsObj = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      trendsObj[mLabel] = 0;
    }

    invoices.forEach(inv => {
      const invDate = new Date(inv.date);
      const mLabel = `${months[invDate.getMonth()]} ${invDate.getFullYear().toString().slice(-2)}`;
      if (trendsObj[mLabel] !== undefined) {
        trendsObj[mLabel] += inv.amount;
      }
    });

    const salesTrends = Object.keys(trendsObj).map(key => ({
      month: key,
      sales: parseFloat(trendsObj[key].toFixed(2))
    }));

    // 5. Top Products Analysis (Parsed from Invoice Items JSON)
    const productQuantities = {};
    const invoicesWithItems = await prisma.invoice.findMany({
      where: { items: { not: null } },
      select: { items: true }
    });

    invoicesWithItems.forEach(inv => {
      let itemsList = [];
      try {
        itemsList = typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items;
      } catch (e) {}

      if (Array.isArray(itemsList)) {
        itemsList.forEach(item => {
          const name = item.product || item.name;
          const qty = parseInt(item.qty || item.quantity || 0, 10);
          if (name && qty) {
            productQuantities[name] = (productQuantities[name] || 0) + qty;
          }
        });
      }
    });

    const topProducts = Object.keys(productQuantities)
      .map(name => ({
        name,
        qty: productQuantities[name]
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    res.json({
      kpis: {
        totalCustomers,
        totalProducts,
        outstandingAmount: parseFloat(outstandingAmount.toFixed(2)),
        inactiveCustomers,
        expiringProductsCount,
        todaysBirthdays,
        licenseExpiringCount,
        campaignsSentCount
      },
      followUps,
      outstandingDues,
      expiryTracker: {
        expiring30,
        expiring90,
        expiring180
      },
      salesTrends,
      topProducts
    });
  } catch (error) {
    console.error('Dashboard metrics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
});

module.exports = router;
