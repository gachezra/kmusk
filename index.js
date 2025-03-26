const express = require('express');
const bodyParser = require('body-parser');
const scheduleTweets = require('./schedule');
const generateReplyTweet = require('./reply');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON payloads
app.use(bodyParser.json());

// Start scheduling tweets (10 random tweets per day)
scheduleTweets();

// Webhook endpoint for generating reply tweets
app.post('/hook', async (req, res) => {
  console.log("Received webhook call:", req.body);
  try {
    // Assume the payload contains a "tweet" field with the original tweet text.
    const reply = await generateReplyTweet(req.body);
    console.log("Generated reply tweet:", reply);
    res.status(200).json({ message: "Webhook processed", reply });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

app.get('/', (req, res) => {
  res.status(200).send('Server on 👍');
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
