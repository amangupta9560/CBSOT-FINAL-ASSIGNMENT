const crypto = require('crypto');

const generateOTP = () => {
  // Generate cryptographically random 6-digit number
  const code = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  return { code, expiresAt };
};

module.exports = generateOTP;
