const BlueskyMonitor = require('./blueSkyMonitor');
const BlueskyService = require('./blueSkyService');
const ShengLearning = require('../learn/shengLearning');
const generateReplyTweet = require('../agent/reply');

class MonitorHandler {
  constructor() {
    this.blueskyMonitor = new BlueskyMonitor();
    this.blueskyService = new BlueskyService();
    this.shengLearning = new ShengLearning();
    
    // Setup event handlers
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // Handle mentions
    this.blueskyMonitor.on('mention', async (notification) => {
      await this.handleMention(notification);
    });
    
    // Handle replies
    this.blueskyMonitor.on('reply', async (notification) => {
      await this.handleReply(notification);
    });
    
    // Handle quotes
    this.blueskyMonitor.on('quote', async (notification) => {
      await this.handleQuote(notification);
    });
  }
  
  async extractTextFromNotification(notification) {
    // Extract text content from notification
    let text = '';
    if (notification.record && notification.record.text) {
      text = notification.record.text;
    }
    return text;
  }
  
  async handleMention(notification) {
    try {
      console.log('Handling Bluesky mention:', notification);
      
      // Extract text from the mention
      const mentionText = await this.extractTextFromNotification(notification);
      
      // Learn Sheng words from the mention
      await this.shengLearning.extractPotentialShengWords(mentionText);
      
      // Generate a reply
      const replyTweet = await generateReplyTweet({
        tweet: mentionText,
        platform: 'bluesky'
      });
      
      // Post the reply
      const result = await this.blueskyService.replyToPost(notification.uri, replyTweet);
      
      if (result.success) {
        console.log('Successfully replied to Bluesky mention:', result.uri);
      } else {
        console.error('Failed to reply to Bluesky mention:', result.error);
      }
    } catch (error) {
      console.error('Error handling Bluesky mention:', error);
    }
  }
  
  async handleReply(notification) {
    try {
      console.log('Handling Bluesky reply:', notification);
      
      // Extract text from the reply
      const replyText = await this.extractTextFromNotification(notification);
      
      // Learn Sheng words from the reply
      await this.shengLearning.extractPotentialShengWords(replyText);
      
      // Generate a response
      const responseText = await generateReplyTweet({
        tweet: replyText,
        platform: 'bluesky'
      });
      
      // Post the response
      const result = await this.blueskyService.replyToPost(notification.uri, responseText);
      
      if (result.success) {
        console.log('Successfully responded to Bluesky reply:', result.uri);
      } else {
        console.error('Failed to respond to Bluesky reply:', result.error);
      }
    } catch (error) {
      console.error('Error handling Bluesky reply:', error);
    }
  }
  
  async handleQuote(notification) {
    try {
      console.log('Handling Bluesky quote:', notification);
      
      // Extract text from the quote
      const quoteText = await this.extractTextFromNotification(notification);
      
      // Learn Sheng words from the quote
      await this.shengLearning.extractPotentialShengWords(quoteText);
      
      // Generate a response (optional, respond only to certain types of quotes)
      if (quoteText.includes('?') || /what|how|why|when|where/i.test(quoteText)) {
        const responseText = await generateReplyTweet({
          tweet: quoteText
        });
        
        // Post the response
        const result = await this.blueskyService.replyToPost(notification.uri, responseText);
        
        if (result.success) {
          console.log('Successfully responded to Bluesky quote:', result.uri);
        } else {
          console.error('Failed to respond to Bluesky quote:', result.error);
        }
      } else {
        console.log('Quote post does not require a response');
      }
    } catch (error) {
      console.error('Error handling Bluesky quote:', error);
    }
  }
  
  // Start monitoring
  startMonitoring(interval = 60000) {
    this.blueskyMonitor.startMonitoring(interval);
  }
  
  // Stop monitoring
  stopMonitoring() {
    this.blueskyMonitor.stopMonitoring();
  }
}

module.exports = MonitorHandler;