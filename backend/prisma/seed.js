const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding (Phase 2)...');

  // 1. Seed Admin
  const adminEmail = 'admin@gayatri.com';
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        password_hash: passwordHash,
        name: 'Gayatri Admin',
        role: 'OWNER'
      }
    });
    console.log(`✅ Admin user seeded: ${admin.email} (Password: password123)`);
  } else {
    console.log('ℹ️ Admin user already exists. Skipping...');
  }

  // 2. Seed Schemes
  const schemes = [
    {
      name: 'Buy 10 Get 1 Free',
      type: 'BUY_X_GET_Y',
      buy_qty: 10,
      get_qty: 1,
      discount_pct: 0
    },
    {
      name: '15% Festive Discount',
      type: 'PERCENTAGE',
      buy_qty: 0,
      get_qty: 0,
      discount_pct: 15.0
    }
  ];

  const seededSchemes = [];
  for (const s of schemes) {
    let existing = await prisma.scheme.findFirst({
      where: { name: s.name }
    });
    if (!existing) {
      existing = await prisma.scheme.create({ data: s });
      console.log(`✅ Scheme seeded: ${s.name}`);
    } else {
      console.log(`ℹ️ Scheme already exists: ${s.name}. Skipping...`);
    }
    seededSchemes.push(existing);
  }

  // 3. Seed Customers (Medical Shops) with Email, Password, and Ledgers
  const today = new Date();
<<<<<<< HEAD
  const passwordHash = await bcrypt.hash('password123', 10);

  const customerDataList = [
    {
      shop_name: 'Gayatri Pharma Admin (Test)',
      whatsapp_number: '919104332333',
      email: 'admin-test@gayatri.com',
      password_hash: passwordHash,
      gst_number: '24GSTADMIN999A1Z1',
      owner_birthday: new Date(1980, today.getMonth(), today.getDate(), 12, 0, 0),
      drug_license_expiry: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()),
      outstanding: 0.00
    },
    {
      shop_name: 'Dhanvantari Medicos',
      whatsapp_number: '919876543210',
      email: 'shop1@gayatri.com',
      password_hash: passwordHash,
      gst_number: '24AAAAA1111A1Z1',
      owner_birthday: new Date(1988, today.getMonth(), today.getDate(), 12, 0, 0),
      drug_license_expiry: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()),
      outstanding: 5400.00
    },
    {
      shop_name: 'Arogya Medical Store',
      whatsapp_number: '919876543211',
      email: 'shop2@gayatri.com',
      password_hash: passwordHash,
      gst_number: '24BBBBB2222B2Z2',
      owner_birthday: new Date(1990, today.getMonth() - 2, today.getDate()),
      drug_license_expiry: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15),
      outstanding: 0.00
    },
    {
      shop_name: 'Gayatri Medical Agency',
      whatsapp_number: '919876543212',
      email: 'shop3@gayatri.com',
      password_hash: passwordHash,
      gst_number: '24CCCCC3333C3Z3',
      owner_birthday: new Date(1985, today.getMonth() + 1, today.getDate()),
      drug_license_expiry: new Date(today.getFullYear() + 1, today.getMonth() + 3, today.getDate()),
      outstanding: 12450.00
    }
  ];

  for (const c of customerDataList) {
    let existing = await prisma.customer.findUnique({
      where: { whatsapp_number: c.whatsapp_number }
=======
  const bdayCustomer = {
    shop_name: 'Dhanvantari Medicos',
    owner_name: 'Dr. Ramesh Patel',
    mobile: '9876543210',
    whatsapp: '919876543210',
    address: '12 Main Rd, Sector 4, Ahmedabad',
    route_area: 'Ahmedabad East',
    gst_number: '24AAAAA1111A1Z1',
    // Set birthday to today (any year, say 1988)
    birthday: new Date(1988, today.getMonth(), today.getDate(), 12, 0, 0),
    drug_license_expiry: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15), // Expiring in 15 days
    credit_limit: 50000,
    outstanding_balance: 15250
  };

  const normalCustomer = {
    shop_name: 'Gayatri Medical Agency',
    owner_name: 'Sanjay Shah',
    mobile: '9876543212',
    whatsapp: '919876543212',
    address: '45 Apollo St, Rajkot',
    route_area: 'Rajkot',
    gst_number: '24CCCCC3333C3Z3',
    birthday: new Date(1985, today.getMonth() + 1, today.getDate()),
    drug_license_expiry: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()),
    credit_limit: 100000,
    outstanding_balance: 0
  };

  const overdueCustomer = {
    shop_name: 'Arogya Medical Store',
    owner_name: 'Ketan Mehta',
    mobile: '9876543211',
    whatsapp: '919876543211',
    address: '88 Station Rd, Jamnagar',
    route_area: 'Jamnagar',
    gst_number: '24BBBBB2222B2Z2',
    birthday: new Date(1990, today.getMonth() - 2, today.getDate()),
    drug_license_expiry: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
    credit_limit: 80000,
    outstanding_balance: 24500
  };

  const customerList = [bdayCustomer, normalCustomer, overdueCustomer];

  for (const cust of customerList) {
    const existingCust = await prisma.customer.findUnique({
      where: { whatsapp: cust.whatsapp }
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
    });

    if (!existing) {
      existing = await prisma.customer.create({
        data: {
          shop_name: c.shop_name,
          whatsapp_number: c.whatsapp_number,
          email: c.email,
          password_hash: c.password_hash,
          gst_number: c.gst_number,
          owner_birthday: c.owner_birthday,
          drug_license_expiry: c.drug_license_expiry
        }
      });
<<<<<<< HEAD
      console.log(`✅ Customer seeded: ${existing.shop_name} (${existing.email})`);
=======
      console.log(`✅ Customer seeded: ${created.shop_name} (${created.whatsapp})`);
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
    } else {
      console.log(`ℹ️ Customer already exists: ${c.shop_name}. Skipping...`);
    }

    // Seed Ledger for customer
    const existingLedger = await prisma.ledger.findUnique({
      where: { customer_id: existing.id }
    });
    if (!existingLedger) {
      await prisma.ledger.create({
        data: {
          customer_id: existing.id,
          total_outstanding_balance: c.outstanding,
          last_payment_date: new Date()
        }
      });
      console.log(`✅ Ledger seeded for: ${existing.shop_name} (Outstanding: ₹${c.outstanding})`);
    }
  }

  // 4. Seed Products linked to schemes
  const buyXgetYScheme = seededSchemes.find(s => s.type === 'BUY_X_GET_Y');
  const pctScheme = seededSchemes.find(s => s.type === 'PERCENTAGE');

  const productsList = [
    {
      name: 'Paracetamol 650mg',
      generic_name: 'Paracetamol IP 650mg',
      company: 'Micro Labs Ltd',
      pack_size: '15 Tablets',
      mrp: 30.50,
<<<<<<< HEAD
      b2b_discount_price: 18.00,
      stock_status: 'IN_STOCK',
      current_stock: 150,
      image_url: '/processed/watermarked_medicine.png', // Fallback to our existing watermark image
      scheme_id: buyXgetYScheme ? buyXgetYScheme.id : null
=======
      pts: 18.00,
      tax_percent: 12.0,
      stock_qty: 150,
      expiry_date: new Date(today.getFullYear() + 1, today.getMonth() + 2, today.getDate()),
      category: 'Tablet',
      offer_scheme: 'Buy 10 Get 1 Free'
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
    },
    {
      name: 'Azithral 500mg',
      generic_name: 'Azithromycin IP 500mg',
      company: 'Alembic Pharmaceuticals',
      pack_size: '5 Tablets',
      mrp: 120.00,
<<<<<<< HEAD
      b2b_discount_price: 75.00,
      stock_status: 'IN_STOCK',
      current_stock: 45,
      image_url: '/processed/watermarked_medicine.png',
      scheme_id: pctScheme ? pctScheme.id : null
    }
  ];

  for (const p of productsList) {
    const existing = await prisma.product.findFirst({
      where: { medicine_name: p.medicine_name }
    });
    if (!existing) {
      await prisma.product.create({ data: p });
      console.log(`✅ Product seeded: ${p.medicine_name}`);
    } else {
      // Update existing product to link scheme
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          scheme_id: p.scheme_id,
          current_stock: p.current_stock,
          image_url: p.image_url
        }
      });
      console.log(`✅ Product updated: ${p.medicine_name} with Scheme & Stock`);
=======
      pts: 75.00,
      tax_percent: 12.0,
      stock_qty: 45,
      expiry_date: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()), // Expiring soon (<90 days)
      category: 'Tablet',
      offer_scheme: 'Buy 20 Get 2 Free'
    },
    {
      name: 'Amoxyclav 625 Duo',
      generic_name: 'Amoxicillin IP + Clavulanic Acid',
      company: 'Abbott Healthcare',
      pack_size: '10 Tablets',
      mrp: 200.00,
      pts: 135.00,
      tax_percent: 12.0,
      stock_qty: 5, // Low stock
      expiry_date: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()),
      category: 'Tablet'
    },
    {
      name: 'Cofsil Cough Syrup',
      generic_name: 'Dextromethorphan + Chlorpheniramine',
      company: 'Cipla Ltd',
      pack_size: '100ml',
      mrp: 85.00,
      pts: 52.00,
      tax_percent: 12.0,
      stock_qty: 60,
      expiry_date: new Date(today.getFullYear(), today.getMonth() + 2, today.getDate() + 10), // Expiring soon (<90 days)
      category: 'Syrup'
    }
  ];

  for (const prod of products) {
    const existingProd = await prisma.product.findFirst({
      where: { name: prod.name }
    });

    if (!existingProd) {
      const created = await prisma.product.create({
        data: prod
      });
      console.log(`✅ Product seeded: ${created.name}`);
    } else {
      console.log(`ℹ️ Product already exists: ${prod.name}. Skipping...`);
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
    }
  }

  console.log('🌱 Seeding process complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
