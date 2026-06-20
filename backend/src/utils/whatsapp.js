const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

<<<<<<< HEAD
const PROVIDER = process.env.WHATSAPP_PROVIDER || 'meta'; // 'meta' or 'twilio'

// Meta Configs
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERSION = process.env.WHATSAPP_VERSION || 'v20.0';
=======
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
// In sandbox, we may want to overwrite and send to a specific trial number for debugging
const TRIAL_NUMBER = process.env.TWILIO_TRIAL_PHONE_NUMBER;
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc

// Twilio Configs
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

/**
 * Upload a local file to a temporary public hosting service (tmpfiles.org)
 * so that Twilio's cloud server can download it.
 * @param {string} localFilePath - Path to the file on the local server disk
 * @returns {Promise<string|null>} - Direct download URL of the uploaded file
 */
async function uploadLocalFileToPublic(localFilePath) {
  try {
    const fileBuffer = fs.readFileSync(localFilePath);
    const filename = path.basename(localFilePath);
    const isPdf = filename.endsWith('.pdf');
    
    // Create Blob and package in FormData
    const fileBlob = new Blob([fileBuffer], { type: isPdf ? 'application/pdf' : 'image/png' });
    const formData = new FormData();
    formData.append('file', fileBlob, filename);

    console.log(`[Temp Public Upload] Uploading ${filename} to tmpfiles.org...`);
    const res = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const json = await res.json();
    if (json && json.data && json.data.url) {
      // Direct raw link uses the /dl/ subpath
      const publicUrl = json.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
      console.log(`[Temp Public Upload] Success! Public URL: ${publicUrl}`);
      return publicUrl;
    }
    throw new Error('Unexpected API response structure');
  } catch (error) {
    console.error(`[Temp Public Upload Error] Failed to upload ${localFilePath}:`, error.message);
    return null;
  }
}

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
<<<<<<< HEAD
 * Send a WhatsApp Message via Twilio Gateway API
 * @param {string} to - Recipient phone number
 * @param {string} text - Message body
 * @param {string} [mediaUrl] - Optional URL of an image or PDF document to attach
 * @returns {Promise<object>} - Response from Twilio REST API
 */
async function sendTwilioRequest(to, text, mediaUrl = null) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log(`[WhatsApp Mock API - Twilio Fallback] Sent message to ${to}. Text: "${text}". Media: ${mediaUrl || 'None'}`);
    return {
      success: true,
      mock: true,
      message_id: `mock_twilio_${Date.now()}`
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const cleanPhone = formatPhoneNumber(to);
  const formattedTo = `whatsapp:+${cleanPhone}`;

  let activeMediaUrl = mediaUrl;
  let textWithLink = text;

  // Twilio's cloud platform cannot access local files (localhost / private IPs).
  // If we detect a local URL, upload it to a public hosting service for delivery.
  if (mediaUrl) {
    const isLocal = /localhost|127\.0\.0\.1|::1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\./i.test(mediaUrl);
    if (isLocal) {
      console.log(`[Twilio Local Link] Local URL detected: ${mediaUrl}. Converting to public URL for delivery...`);
      
      const filename = mediaUrl.substring(mediaUrl.lastIndexOf('/') + 1);
      let localFilePath = path.join(__dirname, '../../public/processed', filename);
      if (!fs.existsSync(localFilePath)) {
        localFilePath = path.join(__dirname, '../../public/uploads', filename);
      }
      if (!fs.existsSync(localFilePath)) {
        localFilePath = path.join(__dirname, '../../public', filename);
      }

      let uploadedUrl = null;
      if (fs.existsSync(localFilePath)) {
        uploadedUrl = await uploadLocalFileToPublic(localFilePath);
      }

      if (uploadedUrl) {
        activeMediaUrl = uploadedUrl;
      } else {
        // Fallback placeholders if upload failed
        if (mediaUrl.toLowerCase().includes('.pdf')) {
          activeMediaUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        } else {
          activeMediaUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800';
        }
      }
    }
  }

  const bodyData = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM,
    To: formattedTo,
    Body: textWithLink
  });

  if (activeMediaUrl) {
    bodyData.append('MediaUrl', activeMediaUrl);
  }

  try {
    const authString = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyData.toString()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Twilio API returned an error');
    }
    console.log(`[Twilio WhatsApp Success] Sent to ${formattedTo}. Message SID: ${data.sid}`);
    return { success: true, message_id: data.sid, ...data };
  } catch (error) {
    console.error(`[Twilio WhatsApp Error] Failed to send to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Send a text message
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} text - Message content
 */
async function sendTextMessage(to, text) {
  if (PROVIDER === 'twilio') {
    return sendTwilioRequest(to, text);
  }
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(to),
    type: 'text',
    text: { preview_url: false, body: text }
  };
  return sendMetaRequest(payload);
}

/**
 * Send an image message
 * @param {string} to - Recipient phone number
 * @param {imageUrl} imageUrl - Publicly accessible URL of the image
 * @param {string} [caption] - Image caption
 */
async function sendImageMessage(to, imageUrl, caption) {
  if (PROVIDER === 'twilio') {
    return sendTwilioRequest(to, caption || 'Image attachment from Gayatri Pharma', imageUrl);
  }
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(to),
    type: 'image',
    image: {
      link: imageUrl,
      caption: caption || ''
    }
  };
  return sendMetaRequest(payload);
=======
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
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
}

/**
 * Sends a template-style message with image header (mapped to a single twilio message for simplified Phase 1)
 */
async function sendTemplateWithImage(to, templateName, imageUrl, bodyParams = []) {
<<<<<<< HEAD
  if (PROVIDER === 'twilio') {
    let text = `📢 *NEW BROADCAST FROM GAYATRI PHARMA*\n\n`;
    if (templateName === 'PRODUCT_LAUNCH') {
      text += `*New Product:* ${bodyParams[0] || ''}\n*Generic Name:* ${bodyParams[1] || ''}\n*MRP:* ₹${bodyParams[2] || ''}\n*B2B Special Price:* *₹${bodyParams[3] || ''}*`;
    } else {
      text += `*Template:* ${templateName}\n\n${bodyParams.join('\n')}`;
    }
    return sendTwilioRequest(to, text, imageUrl);
  }

  const parameters = bodyParams.map(param => ({
    type: 'text',
    text: String(param)
  }));

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en_US' },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: { link: imageUrl }
            }
          ]
        },
        {
          type: 'body',
          parameters: parameters
        }
      ]
    }
  };
  return sendMetaRequest(payload);
}

/**
 * Send a document message (like PDF invoice)
 * @param {string} to - Recipient phone number
 * @param {string} documentUrl - Publicly accessible URL of the document
 * @param {string} filename - Filename of the document
 * @param {string} [caption] - Document caption
 */
async function sendDocumentMessage(to, documentUrl, filename, caption) {
  if (PROVIDER === 'twilio') {
    const text = caption || `B2B Invoice: ${filename || 'Invoice.pdf'}`;
    return sendTwilioRequest(to, text, documentUrl);
  }
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(to),
    type: 'document',
    document: {
      link: documentUrl,
      filename: filename || 'Invoice.pdf',
      caption: caption || ''
    }
  };
  return sendMetaRequest(payload);
}

/**
 * Format phone number to WhatsApp standards (strip characters, ensure country code)
 * @param {string} phone - Input phone number
 */
function formatPhoneNumber(phone) {
  // Strip non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  // Default to Indian country code (91) if it's 10 digits
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
=======
  // Generate text body from parameters
  let text = `Announcement from Gayatri Pharma:\n`;
  if (templateName === 'PRODUCT_LAUNCH') {
    text += `New Product Launched: ${bodyParams[0]}!\nNow available at discount rates. Contact us to book.`;
  } else {
    text += bodyParams.join('\n');
>>>>>>> 69f7b39390b953746f3da607611792d541ea67bc
  }
  return sendTwilioMessage(to, text, imageUrl);
}

/**
 * Sends a low stock alert to the admin mobile number.
 * @param {string} medicineName 
 * @param {number} currentStock 
 */
async function sendLowStockAlert(medicineName, currentStock) {
  const { getSettings } = require('./settings');
  const { admin_mobile_number } = getSettings();
  const adminMobile = admin_mobile_number || '919104332333';
  const message = `⚠️ *LOW STOCK ALERT* ⚠️\n\nGayatri Pharma Inventory Warning:\nProduct *${medicineName}* has fallen below the threshold of 250 units.\n\n*Current Stock:* ${currentStock} units.\n\nPlease update stock/reorder soon to avoid stockouts.`;
  
  try {
    await sendTextMessage(adminMobile, message);
    console.log(`[Low Stock Alert] Successfully sent WhatsApp alert to admin (${adminMobile}) for ${medicineName}. Stock: ${currentStock}`);
  } catch (error) {
    console.error(`[Low Stock Alert] Failed to send alert to admin for ${medicineName}:`, error.message);
  }
}

module.exports = {
  sendTwilioMessage,
  sendTextMessage,
  sendImageMessage,
  sendTemplateWithImage,
  sendDocumentMessage,
  formatPhoneNumber,
  sendLowStockAlert
};
