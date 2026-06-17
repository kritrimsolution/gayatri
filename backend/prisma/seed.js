const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

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

  // 2. Seed Customers (Medical Shops)
  const today = new Date();
  
  // Birthday customer: Birthday is today (ignoring year)
  const bdayCustomer = {
    shop_name: 'Dhanvantari Medicos',
    whatsapp_number: '919876543210',
    gst_number: '24AAAAA1111A1Z1',
    // Set birthday to today (any year, say 1988)
    owner_birthday: new Date(1988, today.getMonth(), today.getDate(), 12, 0, 0),
    drug_license_expiry: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
  };

  // License expiring customer: Expiry is in exactly 15 days
  const expiryDate = new Date();
  expiryDate.setDate(today.getDate() + 15);
  const expiringCustomer = {
    shop_name: 'Arogya Medical Store',
    whatsapp_number: '919876543211',
    gst_number: '24BBBBB2222B2Z2',
    owner_birthday: new Date(1990, today.getMonth() - 2, today.getDate()),
    drug_license_expiry: expiryDate
  };

  // Normal customer: No triggers today
  const normalCustomer = {
    shop_name: 'Gayatri Medical Agency',
    whatsapp_number: '919876543212',
    gst_number: '24CCCCC3333C3Z3',
    owner_birthday: new Date(1985, today.getMonth() + 1, today.getDate()),
    drug_license_expiry: new Date(today.getFullYear() + 1, today.getMonth() + 3, today.getDate())
  };

  const customerList = [bdayCustomer, expiringCustomer, normalCustomer];

  for (const cust of customerList) {
    const existingCust = await prisma.customer.findUnique({
      where: { whatsapp_number: cust.whatsapp_number }
    });

    if (!existingCust) {
      const created = await prisma.customer.create({
        data: cust
      });
      console.log(`✅ Customer seeded: ${created.shop_name} (${created.whatsapp_number})`);
    } else {
      console.log(`ℹ️ Customer already exists: ${cust.shop_name}. Skipping...`);
    }
  }

  // 3. Seed Products
  const products = [
    {
      medicine_name: 'Paracetamol 650mg',
      generic_name: 'Paracetamol IP',
      mrp: 30.50,
      b2b_discount_price: 18.00,
      stock_status: 'IN_STOCK',
      in_stock_qty: 150,
      image_url: '' // Will be updated if watermarked, but start blank or mock URL
    },
    {
      medicine_name: 'Amoxicillin 500mg',
      generic_name: 'Amoxicillin Trihydrate',
      mrp: 120.00,
      b2b_discount_price: 75.00,
      stock_status: 'IN_STOCK',
      in_stock_qty: 45,
      image_url: ''
    }
  ];

  for (const prod of products) {
    const existingProd = await prisma.product.findFirst({
      where: { medicine_name: prod.medicine_name }
    });

    if (!existingProd) {
      const created = await prisma.product.create({
        data: prod
      });
      console.log(`✅ Product seeded: ${created.medicine_name}`);
    } else {
      console.log(`ℹ️ Product already exists: ${prod.medicine_name}. Skipping...`);
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
