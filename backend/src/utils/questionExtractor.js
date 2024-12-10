// utils/questionExtractor.js

const natural = require('natural');
const pos = require('pos');

// Enhanced question patterns
const questionPatterns = [
  /^\d+[\.\)]\s*/, // Matches numbered questions like "1." or "1)"
  /^[a-z][\.\)]\s*/i, // Matches "a)" or "a."
  /^[\(\[]?[a-zA-Z]\)/, // Matches "(a)" or "[a]"
  /^(What|Why|How|Where|When|Who|Which|Explain|Describe|Discuss|Analyze|Compare|Evaluate|Summarize|Illustrate|Examine|Propose|Imagine|Assume|Given|State|List|Define|Identify|Justify|Outline|Provide|Suggest|Relate|Assess|Debate|Formulate|Clarify|Critique|Support|Review|Create|Design|Devise|Predict|Contrast|Plan|Develop|Defend|Advocate|Choose|Recommend|Determine|Conclude|Validate|Highlight|Translate|Show|Write|Estimate|Test|Prove|Quantify|Name|Select|Adapt|Solve|Derive|Integrate|Generate|Combine|Expand|Trace|Explain)\b/i, // Matches common question starters
  /.+\?$/, // Matches sentences ending with a question mark
];

// Helper function to check if a line qualifies as a question
function isQuestion(line) {
  const trimmedLine = line.trim();

  // Match against question patterns
  if (questionPatterns.some((pattern) => pattern.test(trimmedLine))) {
    return true;
  }

  // Additional check using POS tagging
  const words = new pos.Lexer().lex(trimmedLine);
  const tagger = new pos.Tagger();
  const taggedWords = tagger.tag(words);

  let hasVerb = false;
  let hasNoun = false;

  for (let i = 0; i < taggedWords.length; i++) {
    const tag = taggedWords[i][1];
    if (tag.startsWith('VB')) {
      hasVerb = true;
    }
    if (tag.startsWith('NN') || tag === 'PRP') {
      hasNoun = true;
    }
  }

  return hasVerb && hasNoun && words.length >= 3; // Consider it a question if it has a verb, noun, and at least 3 words
}

// Main function for extracting questions from text
function extractQuestionsFromText(text) {
  const lines = text.split(/\n+/); // Split text into lines
  const detectedQuestions = [];
  let currentQuestion = '';

  lines.forEach((line) => {
    line = line.trim();
    if (line.length === 0) return;

    if (isQuestion(line)) {
      if (currentQuestion.trim()) {
        detectedQuestions.push(currentQuestion.trim());
        currentQuestion = '';
      }
      currentQuestion = line;
    } else if (currentQuestion) {
      currentQuestion += ' ' + line;
    }
  });

  // Push the last question if it exists
  if (currentQuestion.trim()) {
    detectedQuestions.push(currentQuestion.trim());
  }

  return detectedQuestions;
}

module.exports = { extractQuestionsFromText };
