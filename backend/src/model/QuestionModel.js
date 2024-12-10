// models/QuestionModel.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  topics: [String], // Array of detected topics
  createdAt: { type: Date, default: Date.now },
});

const QuestionModel = mongoose.model('Question', QuestionSchema);

module.exports = QuestionModel;
