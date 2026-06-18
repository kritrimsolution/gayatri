const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');

function getSettings() {
  try {
    if (!fs.existsSync(path.dirname(SETTINGS_FILE))) {
      fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ admin_mobile_number: '919104332333' }, null, 2));
    }
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading settings:', err);
    return { admin_mobile_number: '919104332333' };
  }
}

function updateSettings(newSettings) {
  try {
    if (!fs.existsSync(path.dirname(SETTINGS_FILE))) {
      fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    }
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
    return updated;
  } catch (err) {
    console.error('Error writing settings:', err);
    throw err;
  }
}

module.exports = {
  getSettings,
  updateSettings
};
