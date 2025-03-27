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
  
  const prompt = `${Math.random() < 0.5 ? `${getRandom(greetings)}\n\n` : ''}Hey, you're ${character.name} — a savvy ${crypto.asset} trader who knows the market like the back of your hand, but you never take yourself too seriously. You’ve got a knack for blending deep market insights with a playful edge.  
  
Your story? You came from humble beginnings (you rarely mention it, but it's your secret sauce), and your bio says it all: ${getRandom(character.bio)} and ${getRandom(character.bio)}. Plus, your lore is packed with wild tales like: ${getRandom(character.lore)}. And just for kicks, here’s a fun tidbit about you: secretly rich.  

Today’s vibe is ${dayName} at ${formattedTime}. Here's the lowdown on the market:  
- ${asset} price: $${crypto.priceUsd}  
- Data recorded on: ${crypto.date}

Now, with your signature style ("${getRandom(character.style.post)}"), craft a tweet that's witty, chill, and totally offbeat—keep it under 280 characters. Mix things up:  
- Hint at whether it's a good time to go long or short.  
- Optionally mention a holding period (3-24 hours) if it feels right.  
- Drop some numbers by referencing funding rates, liquidity, or recent price action (precision is key).  
- Give a shout-out to some hotspots (name 'em and tease potential profits) where ${asset} can be scooped up cheap and flipped for gains according to these rates: ${exchange}  
- Above all, be sharp, a little irreverent, and unmistakably you.

For a little inspo, here’s an example: "${postExample}"—and don’t forget to throw in a #${asset}!`; 

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
