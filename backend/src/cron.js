const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { sendTextMessage } = require('./utils/whatsapp');

const prisma = new PrismaClient();

// Task A: Send Birthday Greetings
async function runBirthdayCheck() {
  console.log('[Cron] Running Task A: Birthday Greetings Check...');
  try {
    const today = new Date();
    const todayMonth = today.getMonth(); // 0-11
    const todayDate = today.getDate();   // 1-31

    const customers = await prisma.customer.findMany();
    const birthdayCustomers = customers.filter(c => {
      const bdate = new Date(c.birthday);
      return bdate.getMonth() === todayMonth && bdate.getDate() === todayDate;
    });

    console.log(`[Cron] Found ${birthdayCustomers.length} customer(s) with birthday today.`);
    
    for (const customer of birthdayCustomers) {
      const greeting = `Happy Birthday Sir 🎂\n\nThank you for your continued support.\n\nRegards,\nGayatri Pharma`;
      try {
        await sendTextMessage(customer.whatsapp, greeting);
        console.log(`[Cron] Sent birthday greeting to ${customer.shop_name} (${customer.whatsapp})`);
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'BIRTHDAY',
            status: 'SENT'
          }
        });
      } catch (err) {
        console.error(`[Cron] Failed to send birthday greeting to ${customer.shop_name}:`, err.message);
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'BIRTHDAY',
            status: 'FAILED',
            error_message: err.message
          }
        });
      }
    }
  } catch (error) {
    console.error('[Cron] Error in Birthday Greetings Task:', error);
  }
}

// Task B: Drug License Expiry Alerts (today + 15 days)
async function runLicenseExpiryCheck() {
  console.log('[Cron] Running Task B: Drug License Expiry Check...');
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 15);
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const expiringCustomers = await prisma.customer.findMany({
      where: {
        drug_license_expiry: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    console.log(`[Cron] Found ${expiringCustomers.length} customer(s) whose drug license expires in 15 days.`);

    for (const customer of expiringCustomers) {
      const alertMessage = `Dear Customer,\n\nYour Drug License is expiring in 15 days.\n\nKindly renew it to avoid business interruption.\n\nRegards,\nGayatri Pharma`;
      try {
        await sendTextMessage(customer.whatsapp, alertMessage);
        console.log(`[Cron] Sent license expiry alert to ${customer.shop_name} (${customer.whatsapp})`);
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'REMINDER',
            status: 'SENT'
          }
        });
      } catch (err) {
        console.error(`[Cron] Failed to send license expiry alert to ${customer.shop_name}:`, err.message);
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'REMINDER',
            status: 'FAILED',
            error_message: err.message
          }
        });
      }
    }
  } catch (error) {
    console.error('[Cron] Error in License Expiry Task:', error);
  }
}

// Task C: Payment Reminders (Customers with outstanding dues > 0)
async function runPaymentReminderCheck() {
  console.log('[Cron] Running Task C: Outstanding Payment Reminders...');
  try {
    const debtors = await prisma.customer.findMany({
      where: {
        outstanding_balance: { gt: 0 }
      }
    });

    console.log(`[Cron] Found ${debtors.length} customer(s) with outstanding dues.`);

    for (const customer of debtors) {
      const reminderMsg = `Dear ${customer.shop_name},\n\nOutstanding Amount:\n₹${customer.outstanding_balance.toFixed(2)}\n\nKindly arrange payment at your earliest convenience.\n\nThank You\nGayatri Pharma`;
      try {
        await sendTextMessage(customer.whatsapp, reminderMsg);
        console.log(`[Cron] Sent payment reminder to ${customer.shop_name} (${customer.whatsapp})`);
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'REMINDER',
            status: 'SENT'
          }
        });
      } catch (err) {
        console.error(`[Cron] Failed to send payment reminder to ${customer.shop_name}:`, err.message);
        
        await prisma.dispatchLog.create({
          data: {
            customer_id: customer.id,
            type: 'REMINDER',
            status: 'FAILED',
            error_message: err.message
          }
        });
      }
    }
  } catch (error) {
    console.error('[Cron] Error in Payment Reminder Task:', error);
  }
}

// Function to schedule cron jobs
function scheduleJobs() {
  // Run daily at 00:01 AM: "1 0 * * *"
  cron.schedule('1 0 * * *', async () => {
    console.log('[Cron] Starting scheduled tasks...');
    await runBirthdayCheck();
    await runLicenseExpiryCheck();
    await runPaymentReminderCheck();
    console.log('[Cron] Scheduled tasks completed.');
  });
  
  console.log('[Cron] Node-cron scheduler started. Tasks will run daily at 00:01 AM.');
}

// CLI trigger support
if (process.argv.includes('--run-now')) {
  console.log('[Cron] Running tasks immediately for testing...');
  (async () => {
    await runBirthdayCheck();
    await runLicenseExpiryCheck();
    await runPaymentReminderCheck();
    console.log('[Cron] Immediate run completed.');
    process.exit(0);
  })();
} else {
  scheduleJobs();
}

module.exports = {
  runBirthdayCheck,
  runLicenseExpiryCheck,
  runPaymentReminderCheck
};
