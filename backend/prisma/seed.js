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
        name: 'Gayatri Admin'
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
      console.log(`✅ Customer seeded: ${existing.shop_name} (${existing.email})`);
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
      medicine_name: 'Paracetamol 650mg',
      generic_name: 'Paracetamol IP',
      mrp: 30.50,
      b2b_discount_price: 18.00,
      stock_status: 'IN_STOCK',
      current_stock: 150,
      image_url: '/processed/watermarked_medicine.png', // Fallback to our existing watermark image
      scheme_id: buyXgetYScheme ? buyXgetYScheme.id : null
    },
    {
      medicine_name: 'Amoxicillin 500mg',
      generic_name: 'Amoxicillin Trihydrate',
      mrp: 120.00,
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
