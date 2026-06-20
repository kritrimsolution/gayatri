const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const API_PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${API_PORT}/api`;
const JWT_SECRET = process.env.JWT_SECRET || 'gayatri_pharma_jwt_secret_secure_key_12345!';

// Mock data content for CSV files
const mockProductsCsv = 
`name,generic_name,company,pack_size,mrp,pts,tax_percent,stock_qty,expiry_date,category,offer_scheme
"Azithral 500mg","Azithromycin IP 500mg","Alembic Pharmaceuticals","5 Tablets",120.00,75.00,12.0,100,"2027-10-31","Tablet","Buy 20 Get 2 Free"
"Paracetamol 650mg","Paracetamol IP 650mg","Micro Labs Ltd","15 Tablets",30.50,18.00,12.0,200,"2027-12-31","Tablet","Buy 10 Get 1 Free"
"Cofsil Syrup","Dextromethorphan","Cipla Ltd","100ml",85.00,52.00,12.0,50,"2027-08-31","Syrup",""
"Amoxyclav 625 Duo","Amoxicillin + Clavulanic","Abbott Healthcare","10 Tablets",200.00,135.00,12.0,5,"2027-05-15","Tablet",""`;

const mockCustomersCsv =
`shop_name,owner_name,mobile,whatsapp,address,route_area,gst_number,drug_license_expiry,birthday,credit_limit
"Dhanvantari Medicos","Dr. Ramesh Patel","9876543210","919876543210","12 Main Rd, Sector 4","Ahmedabad East","24AAAAA1111A1Z1","2026-07-05","1988-06-20",50000.00
"Arogya Medical Store","Ketan Mehta","9876543211","919876543211","88 Station Rd","Jamnagar","24BBBBB2222B2Z2","2027-10-15","1990-04-12",80000.00
"Rajkot Medical Agency","Sanjay Shah","9876543212","919876543212","45 Apollo St","Rajkot","24CCCCC3333C3Z3","2028-03-20","1985-07-15",100000.00`;

const mockOutstandingCsv =
`whatsapp,outstanding_balance,last_payment_date
"919876543210",15250.00,"2026-06-01"
"919876543211",24500.00,"2026-05-15"
"919876543212",0.00,"2026-06-10"`;

const mockInvoicesCsv =
`invoice_number,whatsapp,date,amount,status,items
"INV-2026-001","919876543210","2026-06-15",15250.00,"UNPAID","Paracetamol 650mg:10:18.0|Azithral 500mg:5:75.0"
"INV-2026-002","919876543211","2026-06-16",24500.00,"UNPAID","Cofsil Syrup:20:52.0|Amoxyclav 625 Duo:10:135.0"`;

async function uploadCsvFile(endpoint, csvContent, filename, token) {
  const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, csvContent, 'utf8');

  // Build multipart form body
  const payloadHeader = 
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: text/csv\r\n\r\n`;
  
  const payloadFooter = `\r\n--${boundary}--\r\n`;
  const fileBuffer = fs.readFileSync(filePath);
  
  const bodyBuffer = Buffer.concat([
    Buffer.from(payloadHeader, 'utf8'),
    fileBuffer,
    Buffer.from(payloadFooter, 'utf8')
  ]);

  try {
    const res = await fetch(`${API_URL}/integration/import/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: bodyBuffer
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Fetch upload failed');
    }
    console.log(`[PASS] Uploaded ${filename} successfully. Response:`, data);
    return data;
  } catch (err) {
    console.error(`[FAIL] Upload failed for ${filename}:`, err.message);
    throw err;
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

async function runTests() {
  console.log('🧪 Starting Gayatri Pharma Phase 1 Integration Tests...');

  try {
    // Generate a test token for the seed admin
    const testAdmin = await prisma.admin.findFirst();
    if (!testAdmin) {
      throw new Error('No admin user found. Run the seed script first!');
    }

    const token = jwt.sign(
      { id: testAdmin.id, email: testAdmin.email, name: testAdmin.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('🔑 Authenticated admin token generated.');

    // Clear existing invoice/dispatch logs to have clean testing slate
    await prisma.dispatchLog.deleteMany({});
    await prisma.invoice.deleteMany({});
    console.log('🧹 Dispatch logs and Invoices tables cleared for testing.');

    // 1. Test Products CSV Upload
    console.log('\n--- Test 1: Products CSV Import ---');
    const prodRes = await uploadCsvFile('products', mockProductsCsv, 'products_test.csv', token);
    const prodCount = await prisma.product.count();
    console.log(`Verified Product count in database: ${prodCount} rows.`);
    if (prodCount < 4) throw new Error('Product sync verification failed.');

    // 2. Test Customers CSV Upload
    console.log('\n--- Test 2: Customers CSV Import ---');
    const custRes = await uploadCsvFile('customers', mockCustomersCsv, 'customers_test.csv', token);
    const custCount = await prisma.customer.count();
    console.log(`Verified Customer count in database: ${custCount} rows.`);
    if (custCount < 3) throw new Error('Customer sync verification failed.');

    // 3. Test Outstanding CSV Upload
    console.log('\n--- Test 3: Outstanding CSV Import ---');
    const outRes = await uploadCsvFile('outstanding', mockOutstandingCsv, 'outstanding_test.csv', token);
    
    // Check values updated
    const dhanvantari = await prisma.customer.findFirst({ where: { shop_name: 'Dhanvantari Medicos' } });
    console.log(`Dhanvantari Medicos dues: ₹${dhanvantari.outstanding_balance}. Last Payment Date: ${dhanvantari.last_payment_date}`);
    if (dhanvantari.outstanding_balance !== 15250) throw new Error('Outstanding balance update failed.');

    // 4. Test Invoices CSV Upload (Triggers WhatsApp Invoice Alert)
    console.log('\n--- Test 4: Invoices CSV Import (WhatsApp Trigger Check) ---');
    const invRes = await uploadCsvFile('invoices', mockInvoicesCsv, 'invoices_test.csv', token);
    const invCount = await prisma.invoice.count();
    console.log(`Verified Invoice count in database: ${invCount} rows.`);
    if (invCount < 2) throw new Error('Invoice sync verification failed.');

    // Verify WhatsApp Trigger logged in DispatchLog
    const logsCount = await prisma.dispatchLog.count();
    console.log(`Verified Dispatch logs count: ${logsCount} alerts.`);
    if (logsCount === 0) throw new Error('WhatsApp trigger audit logging failed.');

    console.log('\n🌟 [SUCCESS] All Gayatri Pharma integration tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ [FAILED] Test suite encountered errors:', err);
    process.exit(1);
  }
}

runTests();
