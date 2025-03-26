const { TwitterApi } = require('twitter-api-v2');
const config = require('./config/twitter.js');

class TwitterService {
  constructor() {
    this.client = new TwitterApi({
      appKey: config.twitter.apiKey,
      appSecret: config.twitter.apiSecret,
      accessToken: config.twitter.accessToken,
      accessSecret: config.twitter.accessSecret,
    });
    // Create a read-write client instance
    this.readWriteClient = this.client.readWrite;
  }

  async postTweet(tweetText) {
    try {
      const response = await this.readWriteClient.v2.tweet(tweetText);
      console.log('Tweet posted successfully:', response);
      return response;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  }
}

module.exports = TwitterService;
