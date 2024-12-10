// QuestionRouter.js
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stringSimilarity = require('string-similarity');
const QuestionModel = require('../../model/QuestionModel.js');
const { extractQuestionsFromText } = require('../../utils/questionExtractor');
const path = require('path');
const fs = require('fs');
const { generateQuestions } = require('../../ai/questionGenerator.js');
require('dotenv').config(); // For environment variables
const { OpenAI } = require('openai'); 

const QuestionRouter = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../../uploads/');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Upload and process PDF (POST /api/v1/questions/upload-pdf)
QuestionRouter.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const pdfPath = req.file.path;

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    // Now process the text to detect questions
    const detectedQuestions = extractQuestionsFromText(text);

    res.status(200).json({
      questions: detectedQuestions.map((q) => ({ text: q })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing PDF' });
  }
});



// Upload a question (POST /api/v1/questions)
QuestionRouter.post('/', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: 'Please provide question text.' });
  }

  try {
    const questions = text.split('\n').filter((q) => q.trim().length > 0);
    const savedQuestions = [];

    for (const questionText of questions) {
      const existingQuestions = await QuestionModel.find({});
      const existingTexts = existingQuestions.map((q) => q.text);

      let highestSimilarity = 0;
      let mostSimilarQuestion = '';

      existingTexts.forEach((existingText) => {
        const similarity = stringSimilarity.compareTwoStrings(
          questionText.toLowerCase(),
          existingText.toLowerCase()
        );

        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          mostSimilarQuestion = existingText;
        }
      });

      const plagiarismScore = (highestSimilarity * 100).toFixed(2);
      const isPlagiarized = highestSimilarity >= 0.8;

      const question = new QuestionModel({
        text: questionText,
        isPlagiarized,
        plagiarismScore,
        mostSimilarQuestion: isPlagiarized ? mostSimilarQuestion : null,
      });

      const savedQuestion = await question.save();
      savedQuestions.push(savedQuestion);
    }

    res.status(201).json({
      message: 'Questions uploaded successfully.',
      questions: savedQuestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading questions.' });
  }
});

// Generate AI-based questions (GET /api/v1/questions/generate)
QuestionRouter.get('/generate', async (req, res) => {
  const { keywords, questionType, count } = req.query;
  const keywordsArray = keywords
    ? keywords.split(',').map((kw) => kw.trim())
    : [];
  const numberOfQuestions = count ? parseInt(count) : 5;

  if (keywordsArray.length < 3) {
    return res.status(400).json({
      message: 'Please provide at least three keywords.',
    });
  }

  try {
    // Fetch all existing questions
    const existingQuestions = await QuestionModel.find({});

    if (!existingQuestions || existingQuestions.length === 0) {
      return res.status(400).json({
        message: 'No existing questions found. Please upload questions first.',
      });
    }

    // Generate questions using the improved generator
    let generatedQuestions = await generateQuestions(
      existingQuestions,
      keywordsArray,
      questionType,
      numberOfQuestions
    );

    if (!generatedQuestions || generatedQuestions.length === 0) {
      return res.status(200).json({
        message: 'No questions could be generated with the given keywords.',
      });
    }

    res.json({
      questions: generatedQuestions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Plagiarism Checker (POST /api/v1/questions/check-plagiarism)
QuestionRouter.post('/check-plagiarism', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: 'Please provide a question.' });
  }

  try {
    // Fetch all existing questions
    const existingQuestions = await QuestionModel.find({});
    const existingTexts = existingQuestions.map((q) => q.text);

    let highestSimilarity = 0;
    let mostSimilarQuestion = '';

    // Tokenize the input text
    const inputTokens = tokenizer.tokenize(text.toLowerCase());

    existingTexts.forEach((existingText) => {
      // Tokenize the existing question
      const existingTokens = tokenizer.tokenize(existingText.toLowerCase());

      // Compute the number of input tokens present in existingTokens
      const matchCount = inputTokens.filter((token) =>
        existingTokens.includes(token)
      ).length;

      // Compute similarity as the proportion of input tokens present in existingTokens
      const similarity = matchCount / inputTokens.length;

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        mostSimilarQuestion = existingText;
      }
    });

    const plagiarismScore = (highestSimilarity * 100).toFixed(2);

    res.status(200).json({
      message: 'Plagiarism check completed.',
      plagiarismScore,
      mostSimilarQuestion,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



QuestionRouter.get('/uploaded-questions', async (req, res) => {
  try {
    // Get page and limit from query parameters, with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of questions for pagination
    const total = await QuestionModel.countDocuments();

    // Fetch questions with pagination and sorting
    const questions = await QuestionModel
      .find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .select({ // Select only needed fields
        text: 1,
        topics: 1,
        createdAt: 1,
        plagiarismScore: 1
      });

    // Format the response
    const formattedQuestions = questions.map(question => ({
      id: question._id,
      text: question.text,
      topics: question.topics || [],
      createdAt: question.createdAt,
      plagiarismScore: question.plagiarismScore
    }));

    res.status(200).json({
      questions: formattedQuestions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });

  } catch (err) {
    console.error('Error in fetching questions:', err);
    res.status(500).json({ 
      message: 'Error fetching questions',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});




module.exports = QuestionRouter;

