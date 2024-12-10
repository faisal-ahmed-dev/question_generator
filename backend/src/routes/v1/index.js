const express = require("express");
const UserRouter = require("./UserRoute.js");
const QuestionRouter = require("./QuestionRoute.js");

const router = express.Router();

router.use('/questions', QuestionRouter);

module.exports = router;
