const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
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
    // Only accept images
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Protect all product routes
router.use(authMiddleware);

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { medicine_name: 'asc' }
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

// CREATE new product with image processing
router.post('/', upload.single('image'), async (req, res) => {
  let tempImagePath = null;
  try {
    const { medicine_name, generic_name, mrp, b2b_discount_price, stock_status, in_stock_qty } = req.body;

    if (!medicine_name || !generic_name || !mrp || !b2b_discount_price || !stock_status) {
      // Clean up uploaded file if validation failed
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'All fields (medicine_name, generic_name, mrp, b2b_discount_price, stock_status) are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Product image is required.' });
    }

    tempImagePath = req.file.path;
    const filename = req.file.filename;

    const mrpVal = parseFloat(mrp);
    const b2bVal = parseFloat(b2b_discount_price);
    const qtyVal = in_stock_qty ? parseInt(in_stock_qty, 10) : 0;

    console.log(`Processing image for ${medicine_name}: Raw: ${tempImagePath}`);
    
    // Process image through Python engine
    const processedUrl = await processProductImage(
      tempImagePath,
      filename,
      medicine_name,
      mrpVal,
      b2bVal
    );

    // Save to Database
    const product = await prisma.product.create({
      data: {
        medicine_name,
        generic_name,
        mrp: mrpVal,
        b2b_discount_price: b2bVal,
        stock_status,
        in_stock_qty: qtyVal,
        image_url: processedUrl // Save processed, watermarked URL path
      }
    });

    // Optionally delete raw temporary image
    try {
      fs.unlinkSync(tempImagePath);
    } catch (err) {
      console.warn('Failed to delete temporary raw file:', err.message);
    }

    res.status(201).json(product);
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
    const { medicine_name, generic_name, mrp, b2b_discount_price, stock_status, in_stock_qty } = req.body;
    
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Product not found.' });
    }

    const mrpVal = mrp ? parseFloat(mrp) : existing.mrp;
    const b2bVal = b2b_discount_price ? parseFloat(b2b_discount_price) : existing.b2b_discount_price;
    const medName = medicine_name || existing.medicine_name;
    const genName = generic_name || existing.generic_name;
    const stockVal = stock_status || existing.stock_status;
    const qtyVal = in_stock_qty !== undefined ? parseInt(in_stock_qty, 10) : existing.in_stock_qty;

    let processedUrl = existing.image_url;

    // If new image is uploaded OR details changed and we want to re-generate watermark
    if (req.file) {
      tempImagePath = req.file.path;
      processedUrl = await processProductImage(
        tempImagePath,
        req.file.filename,
        medName,
        mrpVal,
        b2bVal
      );
      
      // Delete temp upload
      try { fs.unlinkSync(tempImagePath); } catch (e) {}
    } else if (medicine_name || mrp || b2b_discount_price) {
      // Re-generate watermark with existing image if prices or name changed
      console.log('Product details updated. To update watermark, upload the image again.');
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        medicine_name: medName,
        generic_name: genName,
        mrp: mrpVal,
        b2b_discount_price: b2bVal,
        stock_status: stockVal,
        in_stock_qty: qtyVal,
        image_url: processedUrl
      }
    });

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

    // Try deleting physical watermarked file
    if (existing.image_url.startsWith('/processed/')) {
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

    res.json({ message: `Product '${existing.medicine_name}' deleted successfully.` });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

module.exports = router;
