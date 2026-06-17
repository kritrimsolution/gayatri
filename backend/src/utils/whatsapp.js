const dotenv = require('dotenv');
dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERSION = process.env.WHATSAPP_VERSION || 'v20.0';

/**
 * Send a WhatsApp Message via Meta Cloud API
 * @param {object} payload - The message payload
 * @returns {Promise<object>} - Response from Meta API or mock response
 */
async function sendMetaRequest(payload) {
  const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;
  
  // If we don't have valid credentials, simulate success in dev
  if (!WHATSAPP_TOKEN || WHATSAPP_TOKEN.startsWith('EAAGb37BZAoZB0BO') || !PHONE_NUMBER_ID || PHONE_NUMBER_ID === '1234567890') {
    console.log(`[WhatsApp Mock API] Sent message to ${payload.to}. Payload:`, JSON.stringify(payload, null, 2));
    return {
      success: true,
      mock: true,
      message_id: `wamid.HBgMOTE1OTIzNDU2Nzg5FQIAERgSRDMxQzE4QzNFNUUwRkQ4N0FDAA==`
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Meta API returned an error');
    }
    return { success: true, ...data };
  } catch (error) {
    console.error(`[WhatsApp API Error] Failed to send to ${payload.to}:`, error.message);
    throw error;
  }
}

/**
 * Send a text message
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} text - Message content
 */
async function sendTextMessage(to, text) {
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
 * @param {string} imageUrl - Publicly accessible URL of the image
 * @param {string} [caption] - Image caption
 */
async function sendImageMessage(to, imageUrl, caption) {
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
}

/**
 * Send a template message with image header
 * @param {string} to - Recipient phone number
 * @param {string} templateName - Template name
 * @param {string} imageUrl - Public image URL for header
 * @param {array} bodyParams - Variables for the template body (array of strings)
 */
async function sendTemplateWithImage(to, templateName, imageUrl, bodyParams = []) {
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
 * Format phone number to WhatsApp standards (strip characters, ensure country code)
 * @param {string} phone - Input phone number
 */
function formatPhoneNumber(phone) {
  // Strip non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  // Default to Indian country code (91) if it's 10 digits
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

module.exports = {
  sendTextMessage,
  sendImageMessage,
  sendTemplateWithImage,
  formatPhoneNumber
};
