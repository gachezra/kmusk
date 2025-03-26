const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: `${process.env.AI_URL}`,
  apiKey: `${process.env.AI_API}`,
  defaultHeaders: {
    "HTTP-Referer": "<YOUR_SITE_URL>",
    "X-Title": "<YOUR_SITE_NAME>",
  },
});

module.exports = openai;