const stringSimilarity = require('string-similarity');
const { generateQuestions } = require('../ai/questionGenerator');

async function enhanceIncompleteQuestions(incompleteQuestions, contextKeywords = []) {
  const enhancedQuestions = [];

  for (const question of incompleteQuestions) {
    const suggestions = await generateQuestions([{ text: question }], contextKeywords, 3);
    enhancedQuestions.push({
      original: question,
      suggestions,
    });
  }

  return enhancedQuestions;
}

module.exports = { enhanceIncompleteQuestions };
