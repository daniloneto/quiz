const crypto = require('crypto');

function generateSecretKey () {
  return crypto.randomBytes(64).toString('hex');
}

const secretKey = generateSecretKey();
console.log('JWT Secret Key:', secretKey);
