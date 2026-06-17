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
      const bdate = new Date(c.owner_birthday);
      return bdate.getMonth() === todayMonth && bdate.getDate() === todayDate;
    });

    console.log(`[Cron] Found ${birthdayCustomers.length} customer(s) with birthday today.`);
    
    for (const customer of birthdayCustomers) {
      const greeting = `🎉 Happy Birthday to you, dear owner of ${customer.shop_name}! Wishing you a prosperous year ahead. Best regards, Gayatri Pharma. 🎂`;
      try {
        await sendTextMessage(customer.whatsapp_number, greeting);
        console.log(`[Cron] Sent birthday greeting to ${customer.shop_name} (${customer.whatsapp_number})`);
      } catch (err) {
        console.error(`[Cron] Failed to send birthday greeting to ${customer.shop_name}:`, err.message);
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
    
    // Set time range for target date (ignoring exact hours/minutes)
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
      const alertMessage = `⚠️ Dear ${customer.shop_name}, your drug license expires in 15 days (on ${new Date(customer.drug_license_expiry).toLocaleDateString()}). Please renew it to avoid any business interruptions.`;
      try {
        await sendTextMessage(customer.whatsapp_number, alertMessage);
        console.log(`[Cron] Sent license expiry alert to ${customer.shop_name} (${customer.whatsapp_number})`);
      } catch (err) {
        console.error(`[Cron] Failed to send license expiry alert to ${customer.shop_name}:`, err.message);
      }
    }
  } catch (error) {
    console.error('[Cron] Error in License Expiry Task:', error);
  }
}

// Function to schedule cron jobs
function scheduleJobs() {
  // Run daily at 00:01 AM: "1 0 * * *"
  cron.schedule('1 0 * * *', async () => {
    console.log('[Cron] Starting scheduled tasks...');
    await runBirthdayCheck();
    await runLicenseExpiryCheck();
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
    console.log('[Cron] Immediate run completed.');
    process.exit(0);
  })();
} else {
  scheduleJobs();
}

module.exports = {
  runBirthdayCheck,
  runLicenseExpiryCheck
};
