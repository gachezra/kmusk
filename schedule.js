const axios = require('axios');
const generateRandomTweet = require('./generate');
const TwitterService = require('./twitter');
const fs = require('fs');

const tweetsPerDay = 10;
const dayMs = 24 * 60 * 60 * 1000;
let usePositiveChange = true;

async function fetchAsset() {
  try {
    const response = await axios.get('https://api.coincap.io/v2/assets');
    const assets = response.data.data;

    if (!assets || assets.length === 0) {
      throw new Error('No assets found');
    }

    const filteredAssets = assets.filter(asset => 
      usePositiveChange ? parseFloat(asset.changePercent24Hr) > 0 : parseFloat(asset.changePercent24Hr) < 0
    );

    usePositiveChange = !usePositiveChange; // Switch selection criteria

    if (filteredAssets.length === 0) {
      return assets.reduce((best, asset) => 
        Math.abs(parseFloat(asset.changePercent24Hr)) > Math.abs(parseFloat(best.changePercent24Hr)) ? asset : best
      , assets[0]); // Choose the asset with the highest absolute change
    }
    
    return filteredAssets.reduce((best, asset) => 
      Math.abs(parseFloat(asset.changePercent24Hr)) > Math.abs(parseFloat(best.changePercent24Hr)) ? asset : best
    , filteredAssets[0]); // Choose the most volatile asset
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
  return tweet.replace(/\s+/g, ' ').trim();
}

async function postTweet(tweet) {
  try {
    const twitterService = new TwitterService();
    const result = await twitterService.postTweet(tweet);
    console.log(`Tweet posted: ${result}`);
    // fs.appendFileSync('postedTweets.txt', `${new Date().toISOString()} - ${tweet}\n`);
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
