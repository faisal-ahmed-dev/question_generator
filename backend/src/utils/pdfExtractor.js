const winkNLP = require('wink-nlp');
const model = require('wink-eng-lite-web-model');

const nlp = winkNLP(model);
const its = nlp.its;

// Enhanced question patterns
const questionPatterns = [
  /^\d+\./, // Matches numbered questions like "1. "
  /^\d+\)\s*/, // Matches "1)"
  /^[a-z]\)\s*/, // Matches "(a)"
  /^(What|Why|How|Where|When|Who|Which|Explain|Describe|Discuss|Analyze|Compare|Evaluate|Summarize|Illustrate|Examine|Propose|Imagine|Assume|Given|State|List)\b/i, // Matches typical question starters
];

// Detect whether a sentence is a potential question
function isQuestion(sentence) {
  return questionPatterns.some((pattern) => {
    if (typeof pattern === 'string') {
      return sentence.trim().toLowerCase().startsWith(pattern.toLowerCase());
    } else if (pattern instanceof RegExp) {
      return pattern.test(sentence.trim());
    }
    return false;
  });
}

// Main function for extracting questions
function extractTextFromPDF(text) {
  // Ensure the input is a string
  if (typeof text !== 'string') {
    throw new Error('Invalid input: text must be a string.');
  }

  const lines = text.split(/\n+/); // Split by newlines to preserve multi-line questions
  const detectedQuestions = [];
  const incompleteQuestions = [];
  const undetectedSentences = [];
  let currentQuestion = '';

  lines.forEach((line) => {
    if (isQuestion(line)) {
      if (currentQuestion.trim()) {
        detectedQuestions.push(currentQuestion.trim());
      }
      currentQuestion = line.trim();
    } else if (currentQuestion) {
      currentQuestion += ' ' + line.trim();
    } else {
      undetectedSentences.push(line.trim());
    }
  });

  // Push the last question if it exists
  if (currentQuestion.trim()) {
    detectedQuestions.push(currentQuestion.trim());
  }

  // Classify complete and incomplete questions
  detectedQuestions.forEach((question) => {
    const doc = nlp.readDoc(question);
    const hasNoun = doc.tokens().some((t) => t.out(its.pos) === 'NOUN');
    const hasVerb = doc.tokens().some((t) => t.out(its.pos) === 'VERB');

    if (!(hasNoun && hasVerb)) {
      incompleteQuestions.push(question); // If missing noun or verb, consider incomplete
    }
  });

  return {
    completeQuestions: detectedQuestions.filter((q) => !incompleteQuestions.includes(q)),
    incompleteQuestions,
    undetectedSentences,
  };
}

module.exports = { extractTextFromPDF };
