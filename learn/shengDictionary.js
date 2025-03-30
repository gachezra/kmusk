const db = require('../config/firebase');

class ShengDictionary {
  constructor() {
    // Reference the shengDictionary node inside a "dictionaries" parent node
    this.dictionaryRef = db.ref('dictionaries/shengDictionary');
  }

  // Load the dictionary from Realtime Database (initializes with basic words if not present)
  async loadDictionary() {
    try {
      const snapshot = await this.dictionaryRef.once('value');
      let dictionary = snapshot.val();
      if (!dictionary) {
        dictionary = {
          "niaje": ["hello", "how are you", "what's up"],
          "poa": ["cool", "fine", "good"],
          "mbogi": ["friends", "crew", "squad"],
          "wadau": ["people", "folks", "guys"]
        };
        await this.dictionaryRef.set(dictionary);
      }
      return dictionary;
    } catch (error) {
      console.error('Error loading Sheng dictionary:', error);
      return {};
    }
  }

  // Add or update a Sheng word with English translations and reverse mappings
  async addWord(shengWord, englishTranslations) {
    try {
      const translations = Array.isArray(englishTranslations)
        ? englishTranslations
        : [englishTranslations];
      
      // Load current dictionary to merge data
      const dictionary = await this.loadDictionary();
      const existingTranslations = dictionary[shengWord] || [];
      const combinedTranslations = Array.from(new Set([...existingTranslations, ...translations]));
      
      // Update the Sheng word entry
      await this.dictionaryRef.child(shengWord).set(combinedTranslations);
      
      // Update reverse mappings (English to Sheng)
      for (const translation of translations) {
        const normalizedTranslation = translation.toLowerCase();
        const reverseKey = `_reverse_${normalizedTranslation}`;
        const existingReverse = dictionary[reverseKey] || [];
        if (!existingReverse.includes(shengWord)) {
          existingReverse.push(shengWord);
          await this.dictionaryRef.child(reverseKey).set(existingReverse);
        }
      }
    } catch (error) {
      console.error('Error adding word to Sheng dictionary:', error);
    }
  }

  // Get English translations for a given Sheng word
  async getEnglishTranslations(shengWord) {
    const dictionary = await this.loadDictionary();
    return dictionary[shengWord] || [];
  }

  // Get Sheng words for a given English word
  async getShengWords(englishWord) {
    const dictionary = await this.loadDictionary();
    const normalizedWord = englishWord.toLowerCase();
    return dictionary[`_reverse_${normalizedWord}`] || [];
  }

  // Check if a word exists as a Sheng word in the dictionary
  async isShengWord(word) {
    const dictionary = await this.loadDictionary();
    return dictionary.hasOwnProperty(word);
  }

  // Get a random Sheng word from the dictionary
  async getRandomShengWord() {
    const dictionary = await this.loadDictionary();
    const shengWords = Object.keys(dictionary).filter(key => !key.startsWith('_reverse_'));
    if (shengWords.length === 0) return null;
    return shengWords[Math.floor(Math.random() * shengWords.length)];
  }
}

module.exports = ShengDictionary;
