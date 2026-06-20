const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { sendTextMessage, sendImageMessage } = require('../utils/whatsapp');

const prisma = new PrismaClient();

// Protect campaign routes
router.use(authMiddleware);

// GET all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to retrieve campaigns.' });
  }
});

// POST /api/campaigns/broadcast - Launch a promo broadcast
router.post('/broadcast', async (req, res) => {
  try {
    const { title, messageText, imageUrl, route, productId } = req.body;

    if (!title || !messageText) {
      return res.status(400).json({ error: 'Title and Message text are required.' });
    }

    // Filter recipients by route if specified
    const filter = {};
    if (route) {
      filter.route_area = route;
    }

    const customers = await prisma.customer.findMany({
      where: filter,
      select: {
        id: true,
        shop_name: true,
        whatsapp: true
      }
    });

    if (customers.length === 0) {
      return res.status(400).json({ error: 'No customers found matching target route/filters.' });
    }

    console.log(`Starting campaign broadcast '${title}' to ${customers.length} shops...`);
    
    let deliveredCount = 0;
    let failedCount = 0;

    for (const customer of customers) {
      // Dynamic personalization replacement
      const bodyText = messageText
        .replace(/{{customer_name}}/g, customer.shop_name)
        .replace(/{{shop_name}}/g, customer.shop_name);

      try {
        if (imageUrl) {
          await sendImageMessage(customer.whatsapp, imageUrl, bodyText);
        } else {
          await sendTextMessage(customer.whatsapp, bodyText);
        }

        deliveredCount++;
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'PRODUCT_BROADCAST',
            status: 'SENT'
          }
        });
      } catch (err) {
        console.error(`Broadcast failed for ${customer.shop_name}:`, err.message);
        failedCount++;
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'PRODUCT_BROADCAST',
            status: 'FAILED',
            error_message: err.message
          }
        });
      }
    }

    // Save Campaign analytics
    const campaign = await prisma.campaign.create({
      data: {
        title,
        type: productId ? 'PRODUCT_LAUNCH' : 'SCHEME',
        sentCount: customers.length,
        deliveredCount,
        failedCount
      }
    });

    res.status(201).json({
      message: 'Campaign broadcast completed successfully.',
      campaign
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Failed to process broadcast campaign.' });
  }
});

// POST /api/campaigns/festival - festival greetings broadcast
router.post('/festival', async (req, res) => {
  try {
    const { title, messageText, imageUrl, route } = req.body;

    if (!title || !messageText) {
      return res.status(400).json({ error: 'Campaign title and Greeting text are required.' });
    }

    const filter = {};
    if (route) {
      filter.route_area = route;
    }

    const customers = await prisma.customer.findMany({
      where: filter,
      select: {
        id: true,
        shop_name: true,
        whatsapp: true
      }
    });

    if (customers.length === 0) {
      return res.status(400).json({ error: 'No customers found for greeting.' });
    }

    let deliveredCount = 0;
    let failedCount = 0;

    for (const customer of customers) {
      const greetingMsg = messageText
        .replace(/{{customer_name}}/g, customer.shop_name)
        .replace(/{{shop_name}}/g, customer.shop_name);

      try {
        if (imageUrl) {
          await sendImageMessage(customer.whatsapp, imageUrl, greetingMsg);
        } else {
          await sendTextMessage(customer.whatsapp, greetingMsg);
        }
        
        deliveredCount++;
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'FESTIVAL',
            status: 'SENT'
          }
        });
      } catch (err) {
        console.error(`Greeting failed for ${customer.shop_name}:`, err.message);
        failedCount++;
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'FESTIVAL',
            status: 'FAILED',
            error_message: err.message
          }
        });
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        type: 'FESTIVAL',
        sentCount: customers.length,
        deliveredCount,
        failedCount
      }
    });

    res.status(201).json({
      message: 'Festival campaign greeting completed successfully.',
      campaign
    });
  } catch (error) {
    console.error('Festival greeting error:', error);
    res.status(500).json({ error: 'Failed to process festival greetings campaign.' });
  }
});

module.exports = router;
