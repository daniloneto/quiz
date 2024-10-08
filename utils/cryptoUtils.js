const crypto = require('crypto');

function generateHmac (payload, key) {
  const hmac = crypto.createHmac('sha256', key);
  return hmac.update(payload).digest('hex');
}

module.exports = { generateHmac };
