const axios = require('axios');
const generateRandomTweet = require('./generate');
const TwitterService = require('./twitter');
const fs = require('fs');

const tweetsPerDay = 10;
const dayMs = 24 * 60 * 60 * 1000;

async function fetchAsset() {
  try {
    const response = await axios.get('https://api.coincap.io/v2/assets');
    const assets = response.data.data;

    if (!assets || assets.length === 0) {
      throw new Error('No assets found');
    }

    // Sort assets by absolute 24-hour change percentage in descending order
    const sortedAssets = assets.sort((a, b) => 
      Math.abs(parseFloat(b.changePercent24Hr)) - Math.abs(parseFloat(a.changePercent24Hr))
    );

    // Get the top 5 most volatile assets
    const topVolatileAssets = sortedAssets.slice(0, 5);

    // Select a random asset from the top 5
    const randomAsset = topVolatileAssets[Math.floor(Math.random() * topVolatileAssets.length)];

    return randomAsset.id;

  } catch (error) {
    console.error('Error fetching asset:', error);
    return null;
  }
}

function getRandomTimes() {
  const offsets = [];
  for (let i = 0; i < tweetsPerDay; i++) {
    offsets.push(Math.floor(Math.random() * dayMs));
  }
  return offsets.sort((a, b) => a - b);
}

function cleanTweet(tweet) {
  return tweet.replace(/"\s*/g, '').replace(/\(Characters:\s*\d+\)/g, '').trim();
}

async function postTweet(tweet) {
  try {
    fs.appendFileSync('postedTweets.txt', `${new Date().toISOString()} - ${tweet}\n`);
    const twitterService = new TwitterService();
    const result = await twitterService.postTweet(tweet);
    console.log(`Tweet posted: ${result}`);
  } catch (e) {
    console.error('Error on schedule, posting issue: ', e);
  }
}

async function scheduleTweets() {
  const offsets = getRandomTimes();
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);

  offsets.forEach(offset => {
    const tweetTime = new Date(midnight.getTime() + offset);
    console.log(tweetTime)
    const delay = tweetTime.getTime() - now.getTime();
    if (delay > 0) {
      setTimeout(async () => {
        try {
          const asset = await fetchAsset();
          if (!asset) return;
          
          let tweet = await generateRandomTweet(asset);
          tweet = cleanTweet(tweet);
          console.log(`Tweet generated at ${new Date().toLocaleTimeString()}: ${tweet}`);
          await postTweet(tweet);
        } catch (error) {
          console.error("Error generating scheduled tweet:", error);
        }
      }, delay);
    }
  });
  console.log("Tweets scheduled for today.");
}

scheduleTweets();

const currentTime = new Date();
const nextMidnight = new Date(currentTime);
nextMidnight.setHours(24, 0, 0, 0);
const msUntilMidnight = nextMidnight.getTime() - currentTime.getTime();
setTimeout(() => {
  scheduleTweets();
}, msUntilMidnight);

module.exports = scheduleTweets;
