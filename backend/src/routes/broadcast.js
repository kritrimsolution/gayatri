const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { sendTemplateWithImage, sendImageMessage } = require('../utils/whatsapp');

const prisma = new PrismaClient();

// Protect broadcast routes - require admin role
router.use(authMiddleware);
router.use(requireAdmin);

// POST /api/broadcast
router.post('/', async (req, res) => {
  try {
    const { templateName, imageUrl, bodyParams, messageText } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required for broadcast.' });
    }

    // Resolve local path to absolute URL if necessary
    let fullImageUrl = imageUrl;
    if (imageUrl.startsWith('/')) {
      const appUrl = process.env.APP_URL || 'http://localhost:5000';
      fullImageUrl = `${appUrl}${imageUrl}`;
    }

    // Fetch all customers with whatsapp_numbers
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        shop_name: true,
        whatsapp_number: true
      }
    });

    if (customers.length === 0) {
      return res.status(400).json({ error: 'No customers found in database to broadcast to.' });
    }

    console.log(`Starting bulk broadcast to ${customers.length} customers using image: ${fullImageUrl}`);
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Send messages sequentially or in parallel. 
    // Since it's B2B and we want to prevent rate limits, sequential is safer.
    for (const customer of customers) {
      try {
        let response;
        if (templateName) {
          // Dynamic parameters for the template. If bodyParams is provided, use it,
          // otherwise insert shop name as a placeholder variable.
          const params = bodyParams && bodyParams.length > 0 
            ? bodyParams 
            : [customer.shop_name];

          response = await sendTemplateWithImage(
            customer.whatsapp_number,
            templateName,
            fullImageUrl,
            params
          );
        } else {
          // Fallback to direct image sending with text as caption
          const caption = messageText || `GP Broadcast: Special offer for ${customer.shop_name}! Check out our prices.`;
          response = await sendImageMessage(
            customer.whatsapp_number,
            fullImageUrl,
            caption
          );
        }

        results.push({
          customerId: customer.id,
          shopName: customer.shop_name,
          whatsappNumber: customer.whatsapp_number,
          status: 'success',
          messageId: response.message_id || 'mock-id'
        });
        successCount++;
      } catch (err) {
        console.error(`Broadcast failed for ${customer.shop_name}:`, err.message);
        results.push({
          customerId: customer.id,
          shopName: customer.shop_name,
          whatsappNumber: customer.whatsapp_number,
          status: 'failed',
          error: err.message
        });
        failureCount++;
      }
    }

    res.json({
      message: `Broadcast completed.`,
      summary: {
        totalTargeted: customers.length,
        successCount,
        failureCount
      },
      details: results
    });
  } catch (error) {
    console.error('Broadcast endpoint error:', error);
    res.status(500).json({ error: 'Failed to complete broadcast operation.' });
  }
});

module.exports = router;
