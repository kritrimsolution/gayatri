const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { processProductImage } = require('../utils/image');

const prisma = new PrismaClient();

// Configure multer for temporary uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', '..', 'public', 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `raw_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Protect all product routes with JWT authentication
router.use(authMiddleware);

<<<<<<< HEAD
// Only admins can modify products (POST, PUT, DELETE)
router.use((req, res, next) => {
  if (req.method !== 'GET') {
    return requireAdmin(req, res, next);
  }
  next();
});

// GET all products
=======
// GET all products with optional filters/search
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    const where = {};
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { generic_name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to retrieve product.' });
  }
});

// CREATE new product with image watermarking
router.post('/', upload.single('image'), async (req, res) => {
  let tempImagePath = null;
  try {
    const { 
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
    } = req.body;

    if (!name || !generic_name || !company || !mrp || !pts || !expiry_date || !category) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Name, Composition, Company, MRP, PTS, Expiry, and Category are required.' });
    }

    const mrpVal = parseFloat(mrp);
    const ptsVal = parseFloat(pts);
    const taxVal = parseFloat(tax_percent || 12.0);
    const stockVal = parseInt(stock_qty || 0, 10);
    const expiryVal = new Date(expiry_date);

    let processedUrl = null;
    if (req.file) {
      tempImagePath = req.file.path;
      const filename = req.file.filename;
      
      console.log(`Processing image for ${name}: Raw: ${tempImagePath}`);
      
      // Process image through Python engine
      try {
        processedUrl = await processProductImage(
          tempImagePath,
          filename,
          name,
          mrpVal,
          ptsVal
        );
        
        // Clean up temporary upload file
        fs.unlinkSync(tempImagePath);
        tempImagePath = null;
      } catch (err) {
        console.warn('Failed to watermark image, using raw image:', err.message);
        processedUrl = `/uploads/${filename}`; // fallback to raw
      }
    }

    // Save to Database
    const product = await prisma.product.create({
      data: {
        name,
        generic_name,
        company,
        pack_size: pack_size || '10 Tab',
        mrp: mrpVal,
<<<<<<< HEAD
        b2b_discount_price: b2bVal,
        stock_status,
        current_stock: qtyVal,
        image_url: processedUrl // Save processed, watermarked URL path
=======
        pts: ptsVal,
        tax_percent: taxVal,
        stock_qty: stockVal,
        expiry_date: expiryVal,
        category,
        image_url: processedUrl,
        offer_scheme
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
      }
    });

    // Dynamic launch broadcast caption
    const broadcastText = `🔥 New Product Available!\n\nProduct: ${name}\nComposition: ${generic_name}\nCompany: ${company}\nPack: ${pack_size || '10 Tab'}\n\nMRP: ₹${mrpVal.toFixed(2)}\nPTS (Trade Price): ₹${ptsVal.toFixed(2)}\n${offer_scheme ? `Special Scheme: ${offer_scheme}\n` : ''}\nContact Gayatri Pharma to book orders.`;

<<<<<<< HEAD
    // Low stock alert check
    if (qtyVal < 250) {
      try {
        const { sendLowStockAlert } = require('../utils/whatsapp');
        sendLowStockAlert(product.medicine_name, qtyVal);
      } catch (err) {
        console.error('Error triggering low stock alert on creation:', err);
      }
    }

    res.status(201).json(product);
=======
    res.status(201).json({
      product,
      broadcastText
    });
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
  } catch (error) {
    console.error('Error creating product:', error);
    if (tempImagePath && fs.existsSync(tempImagePath)) {
      try { fs.unlinkSync(tempImagePath); } catch (e) {}
    }
    res.status(500).json({ error: error.message || 'Failed to create product.' });
  }
});

// UPDATE product
router.put('/:id', upload.single('image'), async (req, res) => {
  let tempImagePath = null;
  try {
    const { 
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
    } = req.body;
    
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Product not found.' });
    }

    const mrpVal = mrp ? parseFloat(mrp) : existing.mrp;
<<<<<<< HEAD
    const b2bVal = b2b_discount_price ? parseFloat(b2b_discount_price) : existing.b2b_discount_price;
    const medName = medicine_name || existing.medicine_name;
    const genName = generic_name || existing.generic_name;
    const stockVal = stock_status || existing.stock_status;
    const qtyVal = in_stock_qty !== undefined ? parseInt(in_stock_qty, 10) : existing.current_stock;
=======
    const ptsVal = pts ? parseFloat(pts) : existing.pts;
    const taxVal = tax_percent ? parseFloat(tax_percent) : existing.tax_percent;
    const stockVal = stock_qty !== undefined ? parseInt(stock_qty, 10) : existing.stock_qty;
    const expiryVal = expiry_date ? new Date(expiry_date) : existing.expiry_date;
    const medName = name || existing.name;
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc

    let processedUrl = existing.image_url;

    if (req.file) {
      tempImagePath = req.file.path;
      
      try {
        processedUrl = await processProductImage(
          tempImagePath,
          req.file.filename,
          medName,
          mrpVal,
          ptsVal
        );
        fs.unlinkSync(tempImagePath);
        tempImagePath = null;
      } catch (err) {
        console.warn('Failed to watermark image, using raw:', err.message);
        processedUrl = `/uploads/${req.file.filename}`;
      }
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: medName,
        generic_name: generic_name || existing.generic_name,
        company: company || existing.company,
        pack_size: pack_size || existing.pack_size,
        mrp: mrpVal,
<<<<<<< HEAD
        b2b_discount_price: b2bVal,
        stock_status: stockVal,
        current_stock: qtyVal,
        image_url: processedUrl
=======
        pts: ptsVal,
        tax_percent: taxVal,
        stock_qty: stockVal,
        expiry_date: expiryVal,
        category: category || existing.category,
        image_url: processedUrl,
        offer_scheme: offer_scheme !== undefined ? offer_scheme : existing.offer_scheme
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
      }
    });

    // Low stock alert check
    if (qtyVal < 250) {
      try {
        const { sendLowStockAlert } = require('../utils/whatsapp');
        sendLowStockAlert(updated.medicine_name, qtyVal);
      } catch (err) {
        console.error('Error triggering low stock alert on update:', err);
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    if (tempImagePath && fs.existsSync(tempImagePath)) {
      try { fs.unlinkSync(tempImagePath); } catch (e) {}
    }
    res.status(500).json({ error: error.message || 'Failed to update product.' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Try deleting physical image file
    if (existing.image_url && existing.image_url.startsWith('/processed/')) {
      const filePath = path.join(__dirname, '..', '..', 'public', existing.image_url);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('Failed to delete physical image file:', err.message);
      }
    }

    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: `Product '${existing.name}' deleted successfully.` });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

module.exports = router;
