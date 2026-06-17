const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF invoice for an accepted order
 * @param {object} order - The order object populated with items and products
 * @param {object} customer - The customer details
 * @returns {Promise<string>} - The local path to the generated PDF
 */
function generateInvoicePDF(order, customer) {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.join(__dirname, '..', '..', 'public', 'processed');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const fileName = `invoice_${order.id}.pdf`;
      const filePath = path.join(dir, fileName);
      
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);
      
      // Header Banner (Teal Gradient / Sleek Dark Theme Accent)
      doc.rect(0, 0, 612, 110).fill('#0f172a'); // Slate 900
      
      doc.fillColor('#14b8a6') // Teal 500
         .font('Helvetica-Bold')
         .fontSize(24)
         .text('GAYATRI PHARMA', 50, 35);
         
      doc.fillColor('#94a3b8') // Slate 400
         .font('Helvetica-Bold')
         .fontSize(9)
         .text('B2B PHARMACEUTICAL DISTRIBUTORS', 50, 62);
         
      doc.fillColor('#ffffff')
         .font('Helvetica')
         .fontSize(10)
         .text('INVOICE / BILL OF SUPPLY', 400, 45, { align: 'right' });
         
      doc.fontSize(8)
         .fillColor('#cbd5e1')
         .text(`Order ID: #${order.id.substring(0, 8).toUpperCase()}`, 400, 60, { align: 'right' })
         .text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 400, 72, { align: 'right' });

      // Spacing below header
      doc.moveDown(4);
      
      // Client & Vendor details column structure
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('BILL TO:', 50, 140);
      doc.font('Helvetica').fontSize(10);
      doc.text(customer.shop_name.toUpperCase(), 50, 160);
      doc.text(`GSTIN: ${customer.gst_number}`, 50, 175);
      doc.text(`WhatsApp: +${customer.whatsapp_number}`, 50, 190);
      
      doc.font('Helvetica-Bold').fontSize(12).text('FROM / VENDOR:', 350, 140);
      doc.font('Helvetica').fontSize(10);
      doc.text('GAYATRI PHARMA PRIVATE LTD', 350, 160);
      doc.text('GSTIN: 24GAYATRI1234F1Z9', 350, 175);
      doc.text('Support: support@gayatripinar.com', 350, 190);
      
      // Divider
      doc.moveTo(50, 215).lineTo(562, 215).strokeColor('#e2e8f0').stroke();
      
      // Items table headers
      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(10);
      doc.text('No.', 50, 230);
      doc.text('Medicine / Generic Name', 80, 230);
      doc.text('Applied Scheme', 280, 230);
      doc.text('Price (₹)', 390, 230, { width: 50, align: 'right' });
      doc.text('Qty', 460, 230, { width: 40, align: 'right' });
      doc.text('Subtotal (₹)', 510, 230, { width: 50, align: 'right' });
      
      // Divider
      doc.moveTo(50, 245).lineTo(562, 245).strokeColor('#94a3b8').stroke();
      
      let currentY = 255;
      doc.font('Helvetica').fontSize(9).fillColor('#0f172a');
      
      order.items.forEach((item, index) => {
        // Handle multiline or overflow text
        const medName = item.product.medicine_name;
        const genName = item.product.generic_name;
        
        doc.text(String(index + 1), 50, currentY);
        
        // Medicine description
        doc.font('Helvetica-Bold').text(medName, 80, currentY);
        doc.font('Helvetica-Oblique').fillColor('#64748b').text(genName, 80, currentY + 11);
        doc.font('Helvetica').fillColor('#0f172a');
        
        // Scheme
        doc.text(item.applied_scheme || 'N/A', 280, currentY);
        
        // Price
        doc.text(item.price_at_purchase.toFixed(2), 390, currentY, { width: 50, align: 'right' });
        
        // Qty
        doc.text(String(item.quantity), 460, currentY, { width: 40, align: 'right' });
        
        // Subtotal
        const itemSubtotal = item.price_at_purchase * item.quantity;
        doc.text(itemSubtotal.toFixed(2), 510, currentY, { width: 50, align: 'right' });
        
        currentY += 28;
      });
      
      // Divider
      doc.moveTo(50, currentY).lineTo(562, currentY).strokeColor('#e2e8f0').stroke();
      
      currentY += 15;
      
      // Total amount
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('GRAND TOTAL:', 350, currentY);
      doc.text(`₹${order.total_amount.toFixed(2)}`, 480, currentY, { width: 80, align: 'right' });
      
      currentY += 25;
      
      // Terms / Footer info
      doc.rect(50, currentY, 512, 60).fill('#f8fafc');
      doc.fillColor('#475569')
         .font('Helvetica-Bold')
         .fontSize(8)
         .text('Terms & Conditions:', 60, currentY + 10);
      doc.font('Helvetica')
         .text('1. Payment is outstanding as per ledger limits. Please clear invoices within due dates.\n2. Products supplied are subject to drug regulation compliance.\n3. Thank you for placing your B2B order with Gayatri Pharma!', 60, currentY + 22, { lineGap: 3 });
         
      doc.end();
      
      writeStream.on('finish', () => {
        resolve(`/processed/${fileName}`);
      });
      
      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateInvoicePDF
};
