const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccountBase64 = process.env.SERVICE_KEY;
if (!serviceAccountBase64) {
  throw new Error('Missing FIREBASE SERVICE environment variable.');
}

// Decode the base64 string and parse it into a JSON object
const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pijiji-db022-default-rtdb.firebaseio.com"
});

module.exports = admin.database();
