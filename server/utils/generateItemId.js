const crypto = require('crypto');

const getCategoryCode = (category) => {
  if (!category) return 'GEN';
  const cat = category.trim().toUpperCase();
  if (cat.includes('ELECTRONIC') || cat.includes('LAPTOP') || cat.includes('CHARGER') || cat.includes('PHONE') || cat.includes('HEADSET')) return 'ELE';
  if (cat.includes('BOOK') || cat.includes('NOTEBOOK') || cat.includes('STATIONERY')) return 'BOK';
  if (cat.includes('KEY') || cat.includes('CARD') || cat.includes('ID')) return 'KEY';
  if (cat.includes('CLOTH') || cat.includes('BAG') || cat.includes('WALLET') || cat.includes('PURSE')) return 'BAG';
  if (cat.includes('BOTTLE') || cat.includes('MUG') || cat.includes('CUP')) return 'BOT';
  
  // Default to first 3 letters or GEN
  const cleanStr = cat.replace(/[^A-Z]/g, '');
  return cleanStr.length >= 3 ? cleanStr.substring(0, 3) : 'GEN';
};

const generateItemId = (category) => {
  const code = getCategoryCode(category);
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars (digits + letters A-F)
  // Format: CR-ELE-A9F8D2 or similar
  return `CR-${code}-${randomSuffix}`;
};

module.exports = generateItemId;
