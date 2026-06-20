const dotenv = require('dotenv');
dotenv.config();

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
// In sandbox, we may want to overwrite and send to a specific trial number for debugging
const TRIAL_NUMBER = process.env.TWILIO_TRIAL_PHONE_NUMBER;

/**
 * Format phone number to Twilio WhatsApp standard: whatsapp:+919876543210
 * @param {string} phone - Input phone number
 */
function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return `whatsapp:+${cleaned}`;
}

/**
 * Sends a message via Twilio REST API
 * @param {string} to - Recipient number
 * @param {string} body - Message body text
 * @param {string} [mediaUrl] - Optional media URL (image or invoice PDF)
 * @returns {Promise<object>}
 */
async function sendTwilioMessage(to, body, mediaUrl = null) {
  // Determine final recipient. If trial number exists in env and we are running in local test mode, we can route it there to prevent spamming real clients.
  const formattedTo = formatPhoneNumber(to);
  const targetTo = TRIAL_NUMBER && TRIAL_NUMBER.includes('+') ? TRIAL_NUMBER : formattedTo;

  // Check if Twilio SID and token are configured
  const hasCredentials = ACCOUNT_SID && ACCOUNT_SID.startsWith('AC') && AUTH_TOKEN && AUTH_TOKEN.length > 5;

  if (!hasCredentials) {
    console.log(`[WhatsApp Mock Twilio API]
      To: ${targetTo} (original: ${formattedTo})
      From: ${FROM_NUMBER}
      Body: ${body}
      MediaUrl: ${mediaUrl || 'None'}
    `);
    return {
      success: true,
      mock: true,
      sid: `SMmock_${Date.now()}`
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
  const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');

  // Construct URL-encoded form body
  const params = new URLSearchParams();
  params.append('From', FROM_NUMBER);
  params.append('To', targetTo);
  params.append('Body', body);
  if (mediaUrl) {
    // Make sure mediaUrl is absolute. If it's a relative path, we prepend APP_URL
    let absoluteUrl = mediaUrl;
    if (mediaUrl.startsWith('/')) {
      const appUrl = process.env.APP_URL || 'http://localhost:5000';
      absoluteUrl = `${appUrl}${mediaUrl}`;
    }
    params.append('MediaUrl', absoluteUrl);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Twilio REST API returned an error');
    }

    console.log(`[Twilio Success] Message sent to ${targetTo}. SID: ${data.sid}`);
    return { success: true, sid: data.sid, twilioResponse: data };
  } catch (error) {
    console.error(`[Twilio Error] Failed to send message to ${targetTo}:`, error.message);
    throw error;
  }
}

/**
 * Standard text sender compatibility mapping
 */
async function sendTextMessage(to, text) {
  return sendTwilioMessage(to, text);
}

/**
 * Standard image sender compatibility mapping
 */
async function sendImageMessage(to, imageUrl, caption) {
  return sendTwilioMessage(to, caption, imageUrl);
}

/**
 * Sends a template-style message with image header (mapped to a single twilio message for simplified Phase 1)
 */
async function sendTemplateWithImage(to, templateName, imageUrl, bodyParams = []) {
  // Generate text body from parameters
  let text = `Announcement from Gayatri Pharma:\n`;
  if (templateName === 'PRODUCT_LAUNCH') {
    text += `New Product Launched: ${bodyParams[0]}!\nNow available at discount rates. Contact us to book.`;
  } else {
    text += bodyParams.join('\n');
  }
  return sendTwilioMessage(to, text, imageUrl);
}

module.exports = {
  sendTwilioMessage,
  sendTextMessage,
  sendImageMessage,
  sendTemplateWithImage,
  formatPhoneNumber
};
