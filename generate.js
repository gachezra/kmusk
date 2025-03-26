const fs = require('fs');
const path = require('path');
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: `${process.env.AI_URL}`,
  apiKey: `${process.env.AI_API}`,
  defaultHeaders: {
    "HTTP-Referer": "https://kenyanmusk.onrender.com",
    "X-Title": "kmusk",
  },
});

// Utility: get a random element from an array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const getData = async (asset) => {
  try {
    const res = await axios.get(`https://api.coincap.io/v2/assets/${asset}/history?interval=h6`)
    return res.data;
  } catch (e) {
    console.error('Error fetching Crypto Data: ', e)
  }
}

const getRates = async (asset) => {
  try {
    const res = await axios.get(`https://api.coincap.io/v2/assets/${asset}/markets`)
    return res.data;
  } catch (e) {
    console.error('Error fething exchanges: ', e)
  }
}

async function generateRandomTweet(asset) {
  const charFilePath = path.join(__dirname, 'char.json');
  const charData = fs.readFileSync(charFilePath, 'utf8');
  const character = JSON.parse(charData);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const hour = now.getHours();
  const minute = now.getMinutes();
  const formattedTime = `${hour}:${minute < 10 ? '0' + minute : minute}`;

  const crypto = await getData(asset);

  const exchange = await getRates(asset);

  const postExample = getRandom(character.postExamples);

  const greetings = [
    `Niaje watu wangu, ${asset} inawapelekaje? 😂`,
    `Wadau wa crypto, ni aje? ${asset} imeamka aje leo?`,
    `Mbogi ya crypto, kuna mtu ame-liquidate ama tuko sawa? 😆`,
    `Soko imeamua aje leo? Tukuwe bullish ama tuhamie farming? 😂`
  ];
  
  const prompt = `${Math.random() < 0.5 ? `${getRandom(greetings)}\n\n` : ''}You are ${character.name}, an expert ${crypto.asset} trader with a deep understanding of market sentiment and technical analysis.  
  You rarely talk about your humble background, but it's what made you a sharp trader.  
  Your bio: ${getRandom(character.bio)} and ${getRandom(character.bio)}.  
  Your lore includes: ${getRandom(character.lore)}.  
  
  Today is ${dayName} and the current time is ${formattedTime}.  
  The market data is:  
  - ${asset} price: $${crypto.priceUsd}  
  - Date: ${crypto.date}
  
  Using this information and your style guidelines ("${getRandom(character.style.post)}"), analyze the market and generate a **concise, nonchalant** tweet under 280 characters.  
  
  Your tweet must:  
  - **Hint at whether to go long or short** based on your analysis.  
  - Optionally suggest a **holding period (3-24 hours)**.  
  - Reference **funding rates, liquidity levels, or recent price action**, remember to be precise while mentioning prices.  
  - Give a hint on which places (mention them by name and list the potential profits) to buy ${asset} for cheap and resell it according to these rates: ${exchange}
  - Be sharp, no-nonsense, and aligned with your trading persona.  
  
  For inspiration, here is an example: "${postExample}" and make sure to mention a #${asset}`;  

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [{ role: "user", content: prompt }]
    });
    const tweet = completion.choices[0].message.content.trim();
    return tweet;
  } catch (error) {
    console.error("Error generating random tweet:", error);
    throw error;
  }
}

module.exports = generateRandomTweet;
