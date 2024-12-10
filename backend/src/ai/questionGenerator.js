const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stringSimilarity = require('string-similarity');
const fs = require('fs');
const path = require('path');

// Load GloVe embeddings (ensure you have the file `glove.6B.50d.txt` in the `data` folder)
const gloveEmbeddings = new Map();

function loadGloveEmbeddings() {
  const filePath = path.join(__dirname, 'glove.6B.50d.txt');
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines.forEach((line) => {
    const tokens = line.split(' ');
    const word = tokens[0];
    const vector = tokens.slice(1).map(Number);
    gloveEmbeddings.set(word, vector);
  });
}

// Helper: Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Helper: Find the closest word using GloVe embeddings
function findClosestWord(word) {
  const wordVector = gloveEmbeddings.get(word.toLowerCase());
  if (!wordVector) return word;
  
  let closestWord = null;
  let highestSimilarity = -1;

  for (const [otherWord, vector] of gloveEmbeddings.entries()) {
    const similarity = cosineSimilarity(wordVector, vector);
    if (similarity > highestSimilarity) {
      closestWord = otherWord;
      highestSimilarity = similarity;
    }
  }

  return closestWord;
}

// Predefined sentence patterns for different question types
const questionPatterns = {
  what: [
    "What is the relationship between {keyword1} and {keyword2}?",
    "What role does {keyword1} play in {keyword2}?",
    "What are the key aspects of {keyword1} in relation to {keyword2}?",
    "What impact does {keyword1} have on {keyword2}?",
    "What factors contribute to {keyword1} in {keyword2}?",
    "What challenges does {keyword1} face in {keyword2}?",
    "What is the significance of {keyword1} in modern {keyword2}?",
    "What trends are emerging in {keyword1} for {keyword2}?",
    "What methods are used to analyze {keyword1} in {keyword2}?",
    "What solutions exist to improve {keyword1} in {keyword2}?",
    "What historical events shaped {keyword1} in {keyword2}?",
    "What are the main advantages of using {keyword1} in {keyword2}?",
    "What are the potential risks of {keyword1} in {keyword2}?",
    "What innovations are driving {keyword1} in {keyword2}?",
    "What tools are essential for understanding {keyword1} in {keyword2}?",
    "What are the critical differences between {keyword1} and {keyword2}?",
    "What role do policies play in shaping {keyword1} for {keyword2}?",
    "What recent studies highlight the importance of {keyword1} in {keyword2}?",
    "What are the implications of {keyword1} for {keyword2} in the future?",
    "What questions remain unanswered about {keyword1} and {keyword2}?"
  ],
  how: [
    "How does {keyword1} affect {keyword2}?",
    "How can {keyword1} be used to improve {keyword2}?",
    "How do {keyword1} and {keyword2} interact with {keyword3}?",
    "How is {keyword1} implemented in {keyword2}?",
    "How can {keyword1} be optimized for {keyword2}?",
    "How does the development of {keyword1} influence {keyword2}?",
    "How can technology enhance {keyword1} in {keyword2}?",
    "How does collaboration between {keyword1} and {keyword2} work?",
    "How are strategies for {keyword1} evolving in {keyword2}?",
    "How does understanding {keyword1} help in achieving {keyword2}?",
    "How do experts address challenges in {keyword1} for {keyword2}?",
    "How does {keyword1} impact sustainability in {keyword2}?",
    "How do cultural factors influence {keyword1} and {keyword2}?",
    "How can {keyword1} be scaled effectively in {keyword2}?",
    "How does funding affect progress in {keyword1} and {keyword2}?",
    "How do researchers approach the study of {keyword1} in {keyword2}?",
    "How do advancements in {keyword1} affect {keyword2} outcomes?",
    "How can data improve decision-making in {keyword1} and {keyword2}?",
    "How do education and training enhance {keyword1} in {keyword2}?",
    "How is the global market responding to {keyword1} in {keyword2}?"
  ],
  why: [
    "Why is {keyword1} important for {keyword2}?",
    "Why does {keyword1} influence {keyword2}?",
    "Why are {keyword1} and {keyword2} related to {keyword3}?",
    "Why should {keyword1} be considered in {keyword2}?",
    "Why do {keyword1} and {keyword2} affect each other?",
    "Why has {keyword1} become a priority in {keyword2}?",
    "Why are innovations in {keyword1} critical for {keyword2}?",
    "Why do policymakers focus on {keyword1} in {keyword2}?",
    "Why is collaboration between {keyword1} and {keyword2} essential?",
    "Why does understanding {keyword1} matter for {keyword2}?",
    "Why are ethical concerns surrounding {keyword1} in {keyword2} rising?",
    "Why is funding for {keyword1} important in {keyword2} research?",
    "Why are certain challenges in {keyword1} more prominent in {keyword2}?",
    "Why is it difficult to achieve progress in {keyword1} for {keyword2}?",
    "Why is {keyword1} gaining attention in the context of {keyword2}?",
    "Why do experts prioritize {keyword1} in addressing {keyword2}?",
    "Why has {keyword1} been linked to success in {keyword2}?",
    "Why do critics question the role of {keyword1} in {keyword2}?",
    "Why is public opinion divided on {keyword1} in {keyword2}?",
    "Why does the future of {keyword1} depend on {keyword2}?"
  ],
  when: [
    "When did {keyword1} first become relevant to {keyword2}?",
    "When should {keyword1} be introduced in {keyword2} processes?",
    "When is {keyword1} considered effective for {keyword2}?",
    "When do challenges in {keyword1} typically arise in {keyword2}?",
    "When is the best time to implement {keyword1} in {keyword2}?",
    "When was the last major advancement in {keyword1} for {keyword2}?",
    "When did researchers first study {keyword1} in relation to {keyword2}?",
    "When does {keyword1} have the greatest impact on {keyword2}?",
    "When are stakeholders most involved in {keyword1} for {keyword2}?",
    "When do ethical concerns about {keyword1} in {keyword2} become critical?"
  ],
  where: [
    "Where is {keyword1} most effective in {keyword2}?",
    "Where can {keyword1} be implemented to improve {keyword2}?",
    "Where do the benefits of {keyword1} align with {keyword2}?",
    "Where has {keyword1} been successfully integrated into {keyword2}?",
    "Where should changes be made to enhance {keyword1} in {keyword2}?",
    "Where have challenges in {keyword1} been resolved for {keyword2}?",
    "Where does research suggest {keyword1} impacts {keyword2} most?",
    "Where can resources for {keyword1} in {keyword2} be found?",
    "Where is progress in {keyword1} lagging in {keyword2}?",
    "Where do opportunities for innovation in {keyword1} exist in {keyword2}?"
  ],
  who: [
    "Who benefits the most from {keyword1} in {keyword2}?",
    "Who is responsible for advancing {keyword1} in {keyword2}?",
    "Who are the key stakeholders in {keyword1} for {keyword2}?",
    "Who contributes to the development of {keyword1} in {keyword2}?",
    "Who should be accountable for {keyword1} outcomes in {keyword2}?",
    "Who are the leaders driving progress in {keyword1} and {keyword2}?",
    "Who are the critics of {keyword1} in {keyword2}, and why?",
    "Who can provide the most insight into {keyword1} for {keyword2}?",
    "Who are the target audiences for {keyword1} in {keyword2}?",
    "Who stands to lose the most if {keyword1} fails in {keyword2}?"
  ],
  can: [
    "Can {keyword1} be used to improve {keyword2}?",
    "Can {keyword1} and {keyword2} work together effectively?",
    "Can {keyword1} solve the challenges in {keyword2}?",
    "Can {keyword1} provide better results for {keyword2}?",
    "Can {keyword1} and {keyword2} impact {keyword3} positively?",
    "Can {keyword1} replace traditional methods in {keyword2}?",
    "Can innovations in {keyword1} enhance {keyword2}?",
    "Can {keyword1} reduce costs associated with {keyword2}?",
    "Can {keyword1} improve the sustainability of {keyword2}?",
    "Can {keyword1} address ethical concerns in {keyword2}?",
    "Can {keyword1} be implemented globally in {keyword2}?",
    "Can {keyword1} improve efficiency in {keyword2} operations?",
    "Can {keyword1} support the long-term growth of {keyword2}?",
    "Can {keyword1} be customized for {keyword2} needs?",
    "Can {keyword1} and {keyword2} create value for stakeholders?",
    "Can {keyword1} adapt to the changing needs of {keyword2}?",
    "Can {keyword1} revolutionize the field of {keyword2}?",
    "Can {keyword1} integrate with existing systems in {keyword2}?",
    "Can {keyword1} increase the adoption of {keyword2}?",
    "Can {keyword1} overcome barriers in {keyword2} implementation?"
  ],
  do: [
    "Do {keyword1} and {keyword2} share common goals?",
    "Do {keyword1} affect the success of {keyword2}?",
    "Do {keyword1} and {keyword2} influence {keyword3} outcomes?",
    "Do policies in {keyword1} align with {keyword2} requirements?",
    "Do stakeholders support {keyword1} in {keyword2} contexts?",
    "Do trends in {keyword1} indicate growth in {keyword2}?",
    "Do innovations in {keyword1} apply to {keyword2} challenges?",
    "Do cultural differences impact {keyword1} in {keyword2}?",
    "Do advancements in {keyword1} enhance {keyword2} capabilities?",
    "Do collaborations in {keyword1} improve {keyword2} outcomes?",
    "Do ethical considerations affect {keyword1} in {keyword2}?",
    "Do {keyword1} solutions meet {keyword2} expectations?",
    "Do experts agree on the role of {keyword1} in {keyword2}?",
    "Do {keyword1} practices align with {keyword2} sustainability?",
    "Do data insights from {keyword1} apply to {keyword2}?",
    "Do consumers prefer {keyword1} over alternatives in {keyword2}?",
    "Do {keyword1} regulations hinder {keyword2} innovations?",
    "Do cost reductions in {keyword1} benefit {keyword2} systems?",
    "Do researchers focus on {keyword1} for solving {keyword2}?",
    "Do leadership strategies in {keyword1} affect {keyword2}?"
  ],
  which: [
    "Which factors influence {keyword1} and {keyword2} outcomes?",
    "Which methods are most effective for {keyword1} in {keyword2}?",
    "Which challenges does {keyword1} face in {keyword2} settings?",
    "Which tools improve {keyword1} in relation to {keyword2}?",
    "Which stakeholders benefit from {keyword1} in {keyword2}?",
    "Which advancements in {keyword1} impact {keyword2}?",
    "Which strategies enhance {keyword1} implementation in {keyword2}?",
    "Which policies support {keyword1} growth in {keyword2}?",
    "Which innovations in {keyword1} apply to {keyword2}?",
    "Which ethical concerns arise in {keyword1} for {keyword2}?",
    "Which cultural factors affect {keyword1} adoption in {keyword2}?",
    "Which costs are reduced by {keyword1} in {keyword2}?",
    "Which metrics evaluate {keyword1} success in {keyword2}?",
    "Which {keyword1} practices optimize {keyword2} performance?",
    "Which collaborations improve {keyword1} outcomes in {keyword2}?",
    "Which technologies drive {keyword1} progress in {keyword2}?",
    "Which trends in {keyword1} align with {keyword2} demands?",
    "Which key players support {keyword1} in {keyword2} settings?",
    "Which global regions adopt {keyword1} for {keyword2} the most?",
    "Which aspects of {keyword1} influence {keyword2} decisions?"
  ],
  explain: [
    "Explain the role of {keyword1} in {keyword2}.",
    "Explain how {keyword1} and {keyword2} interact in {keyword3}.",
    "Explain why {keyword1} is critical for {keyword2}.",
    "Explain how {keyword1} influences {keyword2} outcomes.",
    "Explain the challenges in implementing {keyword1} for {keyword2}.",
    "Explain the relationship between {keyword1} and {keyword2}.",
    "Explain how advancements in {keyword1} impact {keyword2}.",
    "Explain the ethical concerns surrounding {keyword1} in {keyword2}.",
    "Explain how {keyword1} can address issues in {keyword2}.",
    "Explain the innovations driving {keyword1} in {keyword2}."
  ],
  describe: [
    "Describe the significance of {keyword1} in {keyword2}.",
    "Describe how {keyword1} has evolved in {keyword2} contexts.",
    "Describe the tools used to implement {keyword1} in {keyword2}.",
    "Describe the collaboration between {keyword1} and {keyword2}.",
    "Describe the current trends in {keyword1} for {keyword2}.",
    "Describe the role of leadership in {keyword1} and {keyword2}.",
    "Describe the impact of funding on {keyword1} for {keyword2}.",
    "Describe the challenges {keyword1} faces in achieving {keyword2}.",
    "Describe how {keyword1} is optimized for {keyword2}.",
    "Describe the future prospects of {keyword1} in {keyword2}."
  ],
  discuss: [
    "Discuss the implications of {keyword1} for {keyword2}.",
    "Discuss how {keyword1} and {keyword2} shape {keyword3}.",
    "Discuss the importance of {keyword1} in modern {keyword2}.",
    "Discuss the role of {keyword1} in achieving {keyword2} goals.",
    "Discuss the challenges associated with {keyword1} in {keyword2}.",
    "Discuss the strategies to improve {keyword1} in {keyword2}.",
    "Discuss the global impact of {keyword1} on {keyword2}.",
    "Discuss the policies affecting {keyword1} in {keyword2}.",
    "Discuss the key stakeholders involved in {keyword1} and {keyword2}.",
    "Discuss the future developments of {keyword1} in {keyword2}."
  ]
};


// Helper functions for patterns
function replacePlaceholders(pattern, keywords) {
  let result = pattern;
  keywords.forEach((keyword, index) => {
    result = result.replace(`{keyword${index + 1}}`, keyword);
  });
  return result;
}

// Markov Chain Construction
function buildMarkovChain(questions) {
  const chain = {};

  questions.forEach((questionObj) => {
    const sanitizedQuestion = questionObj.text.replace(/[^\w\s?]/g, '').toLowerCase();
    const tokens = tokenizer.tokenize(sanitizedQuestion);

    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];
      const nextWord = tokens[i + 1];

      if (!chain[word]) {
        chain[word] = [];
      }
      if (nextWord) {
        chain[word].push(nextWord);
      } else {
        chain[word].push(null); // End of sentence
      }
    }
  });

  return chain;
}

function generateSentence(chain, startWords, maxWords = 20) {
  let word = startWords[Math.floor(Math.random() * startWords.length)];
  const sentence = [word];
  let count = 0;

  while (word && count < maxWords) {
    const nextWords = chain[word];
    if (!nextWords || nextWords.length === 0) break;

    word = nextWords[Math.floor(Math.random() * nextWords.length)];
    if (word) {
      sentence.push(word);
    }
    count++;
  }

  return sentence.join(' ');
}

// Generate one additional question based on existing database questions
function generateFromExisting(existingQuestions, questionType, keywords) {
  if (existingQuestions.length === 0) return null;

  // Find the most similar question to the keywords
  let mostRelevantQuestion = null;
  let highestRelevance = 0;

  existingQuestions.forEach((q) => {
    const text = q.text.toLowerCase();
    const relevance = keywords.reduce((sum, keyword) => {
      return sum + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);

    if (relevance > highestRelevance) {
      highestRelevance = relevance;
      mostRelevantQuestion = q;
    }
  });

  if (!mostRelevantQuestion) return null;

  // Check if the question type exists in patterns
  const patterns = questionPatterns[questionType.toLowerCase()];
  if (!patterns || patterns.length === 0) {
    console.error(`No patterns found for question type: ${questionType}`);
    return null;
  }

  // Use the first pattern
  const relatedPattern = patterns[0];

  // Safeguard to check if relatedPattern contains placeholders
  const placeholders = relatedPattern.match(/\{keyword\d+\}/g);
  const numPlaceholders = placeholders ? placeholders.length : 0;

  const keywordsToUse = keywords.slice(0, numPlaceholders); // Limit keywords
  const newQuestion = replacePlaceholders(relatedPattern, keywordsToUse);

  // Calculate plagiarism score for the new question
  let highestSimilarity = 0;
  existingQuestions.forEach((q) => {
    const similarity = stringSimilarity.compareTwoStrings(
      newQuestion.toLowerCase(),
      q.text.toLowerCase()
    );
    highestSimilarity = Math.max(highestSimilarity, similarity);
  });

  const plagiarismScore = (highestSimilarity * 100).toFixed(2);
  return { question: newQuestion, plagiarismScore };
}


// Main question generation function
async function generateQuestions(
  existingQuestions = [],
  keywords = [],
  questionType = 'what',
  numberOfQuestions = 5,
  complexity = 2
) {
  try {
    loadGloveEmbeddings();

    const generatedQuestions = [];
    const patterns = questionPatterns[questionType.toLowerCase()] || questionPatterns.what;
    const chain = buildMarkovChain(existingQuestions);
    const startWords = [questionType.toLowerCase(), ...keywords.map((k) => k.toLowerCase())];

    // Generate questions
    for (let i = 0; i < numberOfQuestions; i++) {
      let question = '';
      let plagiarismScore = 0;

      if (i === numberOfQuestions - 1) {
        // AI/GloVe-based question
        const aiGenerated = `What is the significance of ${findClosestWord(keywords[0])} in ${findClosestWord(keywords[1])}?`;
        question = aiGenerated;
        plagiarismScore = '0.00';
      } else if (i % 2 === 0) {
        // Markov Chain
        const sentence = generateSentence(chain, startWords);
        question = `${sentence.charAt(0).toUpperCase() + sentence.slice(1)}?`;
      } else {
        // Predefined Pattern
        const pattern = patterns[i % patterns.length];
        question = replacePlaceholders(pattern, keywords);
      }

      // Calculate plagiarism score
      const existingTexts = existingQuestions.map((q) => q.text);
      let highestSimilarity = 0;

      existingTexts.forEach((text) => {
        const similarity = stringSimilarity.compareTwoStrings(
          question.toLowerCase(),
          text.toLowerCase()
        );
        highestSimilarity = Math.max(highestSimilarity, similarity);
      });

      plagiarismScore = (highestSimilarity * 100).toFixed(2);

      if (
        question.split(' ').length >= 5 &&
        question.split(' ').length <= 25 &&
        !question.includes('undefined') &&
        !question.includes('null')
      ) {
        generatedQuestions.push({ question, plagiarismScore });
      }
    }

    // Generate one additional question from the existing questions
    const additionalQuestion = generateFromExisting(existingQuestions, questionType, keywords);
    if (additionalQuestion) {
      generatedQuestions.push(additionalQuestion);
    }

    return generatedQuestions;
  } catch (error) {
    console.error('Error in generateQuestions:', error);
    return keywords.slice(0, numberOfQuestions).map((keyword) => ({
      question: `${questionType.charAt(0).toUpperCase() + questionType.slice(1)} is ${keyword}?`,
      plagiarismScore: '0.00'
    }));
  }
}

module.exports = { generateQuestions };
