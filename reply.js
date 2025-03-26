const fs = require('fs');
const path = require('path');
const openai = require('./config/openai');

// Utility: get a random element from an array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateReplyTweet(payload) {
  // Read character configuration from char.json
  const charFilePath = path.join(__dirname, 'char.json');
  const charData = fs.readFileSync(charFilePath, 'utf8');
  const character = JSON.parse(charData);

  // Get current date and time info
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const hour = now.getHours();
  const minute = now.getMinutes();
  const formattedTime = `${hour}:${minute < 10 ? '0' + minute : minute}`;

  // Get the original tweet from the payload
  const originalTweet = payload.tweet || "an interesting conversation";

  // Build a dynamic prompt for a reply tweet.
  // Instruct KenyanMusk not to mention his humble background unless directly asked.
  const prompt = `You are ${character.name}, an upcoming entrepreneur with a humble background who rarely talks about his past unless asked. You know some Swahili but prefer to tweet in English, sometimes mixing in a bit of Swahili. 
An original tweet said: "${originalTweet}".
Today is ${dayName} and the time is ${formattedTime}.
Using your style (subtly reference innovation and your Kenyan roots without mentioning your humble background), generate a clever reply tweet under 280 characters.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [{ role: "user", content: prompt }]
    });
    const replyTweet = completion.choices[0].message.content.trim();
    return replyTweet;
  } catch (error) {
    console.error("Error generating reply tweet:", error);
    throw error;
  }
}

module.exports = generateReplyTweet;
