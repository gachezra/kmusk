require('dotenv').config();

module.exports = {
    twitter: {
      apiKey: `${process.env.API_KEY}`,
      apiSecret: `${process.env.API_SECRET}`,
      accessToken: `${process.env.ACCESS_TOKEN}`,
      accessSecret: `${process.env.ACCESS_SECRET}`,
      bearerToken: `${process.env.BEARER_TOKEN}`
    }
  };
  