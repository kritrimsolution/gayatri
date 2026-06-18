const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireAdmin, requireClient } = require('../middleware/auth');
const { sendTextMessage, sendDocumentMessage } = require('../utils/whatsapp');
const { generateInvoicePDF } = require('../utils/invoice');

const prisma = new PrismaClient();
const STATIC_BASE = 'http://localhost:5000';

// Apply base authorization to all order routes
router.use(authMiddleware);

// GET all orders (Admins see all; Customers see only their own)
router.get('/', async (req, res) => {
  try {
    const isClient = req.user.role === 'client';
    
    const orders = await prisma.order.findMany({
      where: isClient ? { customer_id: req.user.id } : undefined,
      include: {
        customer: {
          select: {
            id: true,
            shop_name: true,
            whatsapp_number: true,
            email: true,
            gst_number: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                medicine_name: true,
                generic_name: true,
                mrp: true,
                b2b_discount_price: true,
                image_url: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// GET order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // RBAC check: clients can only view their own orders
    if (req.user.role === 'client' && order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to retrieve order.' });
  }
});

// POST a new order (Client-only checkout)
router.post('/', requireClient, async (req, res) => {
  try {
    const { items } = req.body; // Array of { product_id, quantity }
    const customerId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required in the cart.' });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found.' });
    }

    // Process each item and apply schemes
    const calculatedItems = [];
    let grandTotal = 0;

    for (const cartItem of items) {
      const { product_id, quantity } = cartItem;
      const qtyInt = parseInt(quantity, 10);
      
      if (!product_id || isNaN(qtyInt) || qtyInt <= 0) {
        return res.status(400).json({ error: 'Invalid product_id or quantity.' });
      }

      // Fetch product details with scheme
      const product = await prisma.product.findUnique({
        where: { id: product_id },
        include: { scheme: true }
      });

      if (!product) {
        return res.status(404).json({ error: `Product with ID ${product_id} not found.` });
      }

      let priceAtPurchase = product.b2b_discount_price;
      let appliedSchemeName = null;
      let freeQty = 0;

      // Check scheme
      if (product.scheme) {
        const scheme = product.scheme;
        if (scheme.type === 'BUY_X_GET_Y') {
          // E.g. Buy 10 Get 1 Free
          if (qtyInt >= scheme.buy_qty) {
            freeQty = Math.floor(qtyInt / scheme.buy_qty) * scheme.get_qty;
            appliedSchemeName = scheme.name;
          }
        } else if (scheme.type === 'PERCENTAGE') {
          // E.g. 15% discount
          const discountAmt = product.b2b_discount_price * (scheme.discount_pct / 100);
          priceAtPurchase = product.b2b_discount_price - discountAmt;
          appliedSchemeName = `${scheme.name} (${scheme.discount_pct}% OFF)`;
        }
      }

      // Verify stock availability
      const totalUnitsRequested = qtyInt + freeQty;
      if (product.current_stock < totalUnitsRequested) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.medicine_name}. Requested: ${qtyInt} units${freeQty > 0 ? ` plus ${freeQty} free scheme units` : ''}. Available stock: ${product.current_stock}.`
        });
      }

      // Add regular order item
      calculatedItems.push({
        product_id,
        quantity: qtyInt,
        applied_scheme: appliedSchemeName,
        price_at_purchase: priceAtPurchase,
        total_units_to_deduct: qtyInt // Will be used to decrement stock on acceptance
      });
      
      grandTotal += priceAtPurchase * qtyInt;

      // Add free bonus item if scheme applied
      if (freeQty > 0) {
        calculatedItems.push({
          product_id,
          quantity: freeQty,
          applied_scheme: `${product.scheme.name} (Bonus)`,
          price_at_purchase: 0.0,
          total_units_to_deduct: freeQty
        });
      }
    }

    // Save order & items inside a database transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: {
          customer_id: customerId,
          total_amount: grandTotal,
          status: 'PENDING'
        }
      });

      // 2. Create order items
      for (const item of calculatedItems) {
        await tx.orderItem.create({
          data: {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            applied_scheme: item.applied_scheme,
            price_at_purchase: item.price_at_purchase
          }
        });
      }

      return order;
    });

    // Send WhatsApp Order Received Notification
    try {
      const msg = `Dear ${customer.shop_name},\n\nWe have received your B2B order #${newOrder.id.substring(0, 8).toUpperCase()} for a total amount of ₹${grandTotal.toFixed(2)}.\n\nOur distributor team will review and process your order shortly. Thank you!\n- Gayatri Pharma Team`;
      await sendTextMessage(customer.whatsapp_number, msg);
    } catch (wsErr) {
      console.error('Failed to send WhatsApp confirmation:', wsErr.message);
    }

    // Fetch full order details to return
    const finalOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: { items: { include: { product: true } } }
    });

    res.status(201).json(finalOrder);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during order placement.' });
  }
});

// PUT /:id/status - Update order status (Admin only)
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'DELIVERED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status. Must be one of PENDING, ACCEPTED, REJECTED, DELIVERED.' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const oldStatus = order.status;
    if (oldStatus === status) {
      return res.json(order); // No change needed
    }

    const lowStockAlerts = [];

    // Perform database operations in a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. If transitioning from PENDING to ACCEPTED, deduct stock & increment ledger outstanding balance
      if (oldStatus === 'PENDING' && status === 'ACCEPTED') {
        for (const item of order.items) {
          const prod = await tx.product.findUnique({ where: { id: item.product_id } });
          
          if (prod.current_stock < item.quantity) {
            throw new Error(`Insufficient stock to accept order for product ${prod.medicine_name}. Available: ${prod.current_stock}, Required: ${item.quantity}.`);
          }

          const newStock = prod.current_stock - item.quantity;
          const newStatus = newStock <= 0 ? 'OUT_OF_STOCK' : prod.stock_status;

          if (newStock < 250) {
            lowStockAlerts.push({ name: prod.medicine_name, stock: newStock });
          }

          await tx.product.update({
            where: { id: item.product_id },
            data: {
              current_stock: newStock,
              stock_status: newStatus
            }
          });
        }

        // Increment ledger outstanding balance
        await tx.ledger.upsert({
          where: { customer_id: order.customer_id },
          update: {
            total_outstanding_balance: { increment: order.total_amount },
            last_payment_date: new Date()
          },
          create: {
            customer_id: order.customer_id,
            total_outstanding_balance: order.total_amount,
            last_payment_date: new Date()
          }
        });
      }

      // 2. Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status }
      });

      return updated;
    });

    // Trigger low stock alerts to admin asynchronously
    if (lowStockAlerts.length > 0) {
      try {
        const { sendLowStockAlert } = require('../utils/whatsapp');
        for (const alert of lowStockAlerts) {
          sendLowStockAlert(alert.name, alert.stock);
        }
      } catch (err) {
        console.error('Error triggering low stock alerts on order acceptance:', err);
      }
    }

    // WhatsApp Alerts based on status change
    try {
      const customer = order.customer;
      const displayId = order.id.substring(0, 8).toUpperCase();
      
      if (status === 'ACCEPTED') {
        // 1. Generate PDF invoice
        console.log(`Generating PDF invoice for accepted order #${displayId}...`);
        const relativePdfPath = await generateInvoicePDF(order, customer);
        const invoiceFullUrl = `${STATIC_BASE}${relativePdfPath}`;
        
        console.log(`Invoice PDF written to: ${relativePdfPath}. Url: ${invoiceFullUrl}`);

        // 2. Send text message
        const textMsg = `Dear ${customer.shop_name},\n\nYour B2B order #${displayId} has been ACCEPTED by our team!\n\nA PDF copy of your B2B Invoice has been generated and dispatched to your WhatsApp. Your ledger balance has been updated.\n- Gayatri Pharma Team`;
        await sendTextMessage(customer.whatsapp_number, textMsg);

        // 3. Send PDF document message
        await sendDocumentMessage(
          customer.whatsapp_number,
          invoiceFullUrl,
          `Invoice_${displayId}.pdf`,
          `B2B Invoice for Order #${displayId}`
        );
      } else if (status === 'REJECTED') {
        const rejectMsg = `Dear ${customer.shop_name},\n\nYour order #${displayId} has been declined. Please get in touch with our billing department for clarification.\n\n- Gayatri Pharma Team`;
        await sendTextMessage(customer.whatsapp_number, rejectMsg);
      } else if (status === 'DELIVERED') {
        const deliverMsg = `Dear ${customer.shop_name},\n\nYour order #${displayId} has been marked as DELIVERED by our delivery executive. Thank you for your partnership!\n\n- Gayatri Pharma Team`;
        await sendTextMessage(customer.whatsapp_number, deliverMsg);
      }
    } catch (wsError) {
      console.error('WhatsApp status trigger error:', wsError.message);
    }

    // Retrieve order details again to return fresh status
    const finalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    res.json(finalOrder);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update order status.' });
  }
});

module.exports = router;
