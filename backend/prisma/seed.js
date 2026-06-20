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
        name: 'Gayatri Admin',
        role: 'OWNER'
      }
    });
    console.log(`✅ Admin user seeded: ${admin.email} (Password: password123)`);
  } else {
    console.log('ℹ️ Admin user already exists. Skipping...');
  }

  // 2. Seed Customers (Medical Shops)
  const today = new Date();
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
    });

    if (!existingCust) {
      const created = await prisma.customer.create({
        data: cust
      });
      console.log(`✅ Customer seeded: ${created.shop_name} (${created.whatsapp})`);
    } else {
      console.log(`ℹ️ Customer already exists: ${cust.shop_name}. Skipping...`);
    }
  }

  // 3. Seed Products
  const products = [
    {
      name: 'Paracetamol 650mg',
      generic_name: 'Paracetamol IP 650mg',
      company: 'Micro Labs Ltd',
      pack_size: '15 Tablets',
      mrp: 30.50,
      pts: 18.00,
      tax_percent: 12.0,
      stock_qty: 150,
      expiry_date: new Date(today.getFullYear() + 1, today.getMonth() + 2, today.getDate()),
      category: 'Tablet',
      offer_scheme: 'Buy 10 Get 1 Free'
    },
    {
      name: 'Azithral 500mg',
      generic_name: 'Azithromycin IP 500mg',
      company: 'Alembic Pharmaceuticals',
      pack_size: '5 Tablets',
      mrp: 120.00,
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
