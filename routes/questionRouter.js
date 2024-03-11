const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Question = require("../models/question");
const questionRouter = express.Router();
questionRouter.use(bodyParser.json());
var authenticate = require("../models/authenticate");
const cors = require("cors");
const question = require("../models/question");
questionRouter.options("/", cors());

questionRouter
  .route("/")
  .get(async (req, res) => {
    try {
      const questions = await Question.find();
      res.json(questions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
  .post((req, res, next) => {
    Question.create(req.body)
      .then(
        (quizzes) => {
          console.log("Dish Created ", quizzes);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(quizzes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(async (req, res) => {
    const question = new Question({
      text: req.body.text,
      options: req.body.options,
      keywords: req.body.keywords,
      correctAnswerIndex: req.body.correctAnswerIndex,
    });
    try {
      const newQuestion = await question.save();
      res.status(201).json(newQuestion);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
questionRouter
  .route("/:questionId")
  .get((req, res, next) => {
    Question.findById(req.params.questionId)
      .then(
        (question) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(question);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Question.findByIdAndDelete(req.params.questionId)
      .then((deletedQuestion) => {
        if (!deletedQuestion) {
          res.status(404).json({ message: "Question not found" });
          return;
        }
        res
          .status(200)
          .json({ message: "Question deleted successfully", deletedQuestion });
      })
      .catch((err) => next(err));
  });

module.exports = questionRouter;
