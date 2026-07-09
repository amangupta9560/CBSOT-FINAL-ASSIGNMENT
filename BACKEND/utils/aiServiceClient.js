const axios = require('axios');

const aiServiceClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:8080',
  timeout: 90000, // 90 seconds
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
  },
});

module.exports = aiServiceClient;
