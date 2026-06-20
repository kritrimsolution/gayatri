const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { sendTextMessage } = require('../utils/whatsapp');

const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// Protect all integration routes
router.use(authMiddleware);

/**
 * Robust CSV parser that handles commas inside quoted fields.
 */
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0 || !lines[0].trim()) return [];
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ''));
    
    if (values.length >= headers.length) {
      const obj = {};
      headers.forEach((h, index) => {
        obj[h] = values[index];
      });
      results.push(obj);
    }
  }
  return results;
}

/**
 * Standard Date parser for safety
 */
function parseCsvDate(dateStr) {
  if (!dateStr) return new Date();
  // Try standard parse
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  // Try DD-MM-YYYY format
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // If year is 4 digits, check if first part is day or year
    if (parts[2].length === 4) {
      d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      if (!isNaN(d.getTime())) return d;
    }
  }
  return new Date(); // fallback
}

// 1. POST /api/integration/import/products
router.post('/import/products', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file.' });
  }

  const filePath = path.resolve(req.file.path);
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(text);
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      const name = row.name || row.Product_Name || row.medicine_name;
      const generic_name = row.generic_name || row.generic || row.Composition;
      const company = row.company || row.Company || 'Generic';
      const pack_size = row.pack_size || row.Pack_Size || '10 Tab';
      const mrp = parseFloat(row.mrp || row.MRP || 0);
      const pts = parseFloat(row.pts || row.PTS || row.b2b_discount_price || 0);
      const tax_percent = parseFloat(row.tax_percent || row.Tax || 12.0);
      const stock_qty = parseInt(row.stock_qty || row.Stock || row.in_stock_qty || 0, 10);
      const expiry_date = parseCsvDate(row.expiry_date || row.Expiry || row.expiry);
      const category = row.category || row.Category || 'Tablet';
      const offer_scheme = row.offer_scheme || row.offer || row.Scheme || '';

      if (!name || !generic_name) continue;

      const existing = await prisma.product.findFirst({
        where: { name }
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            generic_name,
            company,
            pack_size,
            mrp,
            pts,
            tax_percent,
            stock_qty,
            expiry_date,
            category,
            offer_scheme
          }
        });
        updatedCount++;
      } else {
        await prisma.product.create({
          data: {
            name,
            generic_name,
            company,
            pack_size,
            mrp,
            pts,
            tax_percent,
            stock_qty,
            expiry_date,
            category,
            offer_scheme
          }
        });
        createdCount++;
      }
    }

    res.json({
      message: 'Products CSV Sync completed successfully.',
      created: createdCount,
      updated: updatedCount,
      totalProcessed: rows.length
    });
  } catch (error) {
    console.error('Products sync error:', error);
    res.status(500).json({ error: `Sync failed: ${error.message}` });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

// 2. POST /api/integration/import/customers
router.post('/import/customers', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file.' });
  }

  const filePath = path.resolve(req.file.path);
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(text);
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      const shop_name = row.shop_name || row.Shop_Name || row.name;
      const owner_name = row.owner_name || row.Owner || '';
      const mobile = row.mobile || row.Mobile || '';
      let whatsapp = row.whatsapp || row.WhatsApp || row.whatsapp_number;
      const address = row.address || row.Address || '';
      const route_area = row.route_area || row.Route || row.area || 'Rajkot';
      const gst_number = row.gst_number || row.GST || '';
      const drug_license_expiry = parseCsvDate(row.drug_license_expiry || row.Drug_License_Expiry || row.license_expiry);
      const birthday = parseCsvDate(row.birthday || row.Birthday || row.owner_birthday);
      const credit_limit = parseFloat(row.credit_limit || row.Credit_Limit || 0);

      if (!shop_name || !whatsapp) continue;

      // Clean whatsapp digits (ensure it includes country code prefix)
      whatsapp = whatsapp.replace(/\D/g, '');
      if (whatsapp.length === 10) {
        whatsapp = '91' + whatsapp;
      }

      const existing = await prisma.customer.findUnique({
        where: { whatsapp }
      });

      if (existing) {
        await prisma.customer.update({
          where: { id: existing.id },
          data: {
            shop_name,
            owner_name,
            mobile,
            address,
            route_area,
            gst_number,
            drug_license_expiry,
            birthday,
            credit_limit
          }
        });
        updatedCount++;
      } else {
        await prisma.customer.create({
          data: {
            shop_name,
            owner_name,
            mobile,
            whatsapp,
            address,
            route_area,
            gst_number,
            drug_license_expiry,
            birthday,
            credit_limit
          }
        });
        createdCount++;
      }
    }

    res.json({
      message: 'Customers CSV Sync completed successfully.',
      created: createdCount,
      updated: updatedCount,
      totalProcessed: rows.length
    });
  } catch (error) {
    console.error('Customers sync error:', error);
    res.status(500).json({ error: `Sync failed: ${error.message}` });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

// 3. POST /api/integration/import/outstanding
router.post('/import/outstanding', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file.' });
  }

  const filePath = path.resolve(req.file.path);
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(text);
    let updatedCount = 0;

    for (const row of rows) {
      let whatsapp = row.whatsapp || row.WhatsApp || row.phone;
      const outstanding_balance = parseFloat(row.outstanding_balance || row.Outstanding || row.balance || 0);
      const last_payment_date = row.last_payment_date || row.Last_Payment_Date ? parseCsvDate(row.last_payment_date || row.Last_Payment_Date) : null;

      if (!whatsapp) continue;

      whatsapp = whatsapp.replace(/\D/g, '');
      if (whatsapp.length === 10) {
        whatsapp = '91' + whatsapp;
      }

      const customer = await prisma.customer.findUnique({
        where: { whatsapp }
      });

      if (customer) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            outstanding_balance,
            last_payment_date
          }
        });
        updatedCount++;
      }
    }

    res.json({
      message: 'Outstanding Balance Sync completed.',
      updated: updatedCount,
      totalProcessed: rows.length
    });
  } catch (error) {
    console.error('Outstanding sync error:', error);
    res.status(500).json({ error: `Sync failed: ${error.message}` });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

// 4. POST /api/integration/import/invoices
router.post('/import/invoices', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file.' });
  }

  const filePath = path.resolve(req.file.path);
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(text);
    let createdCount = 0;
    let updatedCount = 0;
    let alertsSent = 0;

    for (const row of rows) {
      const invoice_number = row.invoice_number || row.Invoice_Number || row.Invoice_No || row.invoice_no;
      let whatsapp = row.whatsapp || row.WhatsApp || row.phone || row.Customer_Phone;
      const date = parseCsvDate(row.date || row.Invoice_Date || row.invoice_date);
      const amount = parseFloat(row.amount || row.Amount || row.total || 0);
      const status = (row.status || row.Status || 'UNPAID').toUpperCase();
      const rawItems = row.items || row.Items || null;

      if (!invoice_number || !whatsapp) continue;

      whatsapp = whatsapp.replace(/\D/g, '');
      if (whatsapp.length === 10) {
        whatsapp = '91' + whatsapp;
      }

      // Look up customer
      const customer = await prisma.customer.findUnique({
        where: { whatsapp }
      });

      if (!customer) continue; // Skip if customer doesn't exist

      // Parse items summary JSON if possible, otherwise store raw items
      let itemsJson = null;
      if (rawItems) {
        try {
          itemsJson = JSON.parse(rawItems);
        } catch (e) {
          // If not valid JSON, treat as list separated by pipe or comma
          const parts = rawItems.split(/[|;]/).map(item => {
            const detail = item.split(':');
            return {
              product: detail[0] || item,
              qty: parseInt(detail[1] || 1, 10),
              price: parseFloat(detail[2] || 0)
            };
          });
          itemsJson = parts;
        }
      }

      const existing = await prisma.invoice.findUnique({
        where: { invoice_number }
      });

      let invoiceRecord;
      if (existing) {
        invoiceRecord = await prisma.invoice.update({
          where: { invoice_number },
          data: {
            amount,
            date,
            status,
            items: itemsJson || undefined
          }
        });
        updatedCount++;
      } else {
        invoiceRecord = await prisma.invoice.create({
          data: {
            invoice_number,
            customer_id: customer.id,
            amount,
            date,
            status,
            items: itemsJson
          }
        });
        createdCount++;
        
        // Update customer's last order date
        await prisma.customer.update({
          where: { id: customer.id },
          data: { last_order_date: date }
        });

        // Trigger WhatsApp alert for new UNPAID invoices
        if (status === 'UNPAID') {
          const formattedDate = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          const textMsg = `Dear ${customer.shop_name}, new invoice #${invoice_number} of ₹${amount.toFixed(2)} was generated on ${formattedDate}. Kindly arrange payment at your earliest convenience. Thank you. - Gayatri Pharma`;
          try {
            await sendTextMessage(customer.whatsapp, textMsg);
            alertsSent++;
            await prisma.dispatchLog.create({
              data: {
                customer_id: customer.id,
                type: 'REMINDER',
                status: 'SENT'
              }
            });
          } catch (whatsappErr) {
            console.error(`Failed to send invoice alert to ${customer.shop_name}:`, whatsappErr.message);
            await prisma.dispatchLog.create({
              data: {
                customer_id: customer.id,
                type: 'REMINDER',
                status: 'FAILED',
                error_message: whatsappErr.message
              }
            });
          }
        }
      }
    }

    res.json({
      message: 'Invoices CSV Sync completed successfully.',
      created: createdCount,
      updated: updatedCount,
      alertsSent,
      totalProcessed: rows.length
    });
  } catch (error) {
    console.error('Invoices sync error:', error);
    res.status(500).json({ error: `Sync failed: ${error.message}` });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

module.exports = router;
