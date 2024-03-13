const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Quiz = require("../models/quiz");
const quizRouter = express.Router();
quizRouter.use(bodyParser.json());
var authenticate = require("../models/authenticate");
const cors = require("cors");
quizRouter.options("/", cors());

quizRouter
  .route("/")
  .get(async (req, res) => {
    try {
      const quizzes = await Quiz.find();
      res.json(quizzes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
  .post(
    cors(),
    authenticate.verifyUser,
    authenticate.verifyUser,
    async (req, res) => {
      const quiz = new Quiz({
        title: req.body.title,
        description: req.body.description,
        questions: req.body.questions,
      });
      try {
        const savedQuiz = await quiz.save();
        res.status(201).json(savedQuiz);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    }
  );

quizRouter
  .route("/:quizId")
  .get(async (req, res) => {
    const quiz = await Quiz.findById(req.params.quizId).populate("questions");
    res.json(quiz);
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Quiz.findByIdAndUpdate(
      req.params.quizId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Quiz.findByIdAndDelete(req.params.quizId)
      .then((deletedQuizz) => {
        if (!deletedQuizz) {
          res.status(404).json({ message: "Quizz not found" });
          return;
        }
        res
          .status(200)
          .json({ message: "Quizz deleted successfully", deletedQuizz });
      })
      .catch((err) => next(err));
  });

quizRouter.route("/:quizId/populate").get((req, res, next) => {
  const keyword = req.query.keyword;

  const regexKeyword = new RegExp(keyword, "i");

  Quiz.findById(req.params.quizId)
    .populate({
      path: "questions",
      match: {
        text: { $regex: regexKeyword },
      },
    })
    .then((quiz) => {
      if (!quiz) {
        const err = new Error("Quiz not found");
        err.status = 404;
        throw err;
      }
      res.status(200);
      res.setHeader("Content-Type", "application/json");
      res.json(quiz);
    });
});

quizRouter.route("/:quizId/populate2").get((req, res, next) => {
  Quiz.findById(req.params.quizId)
    .populate({ path: "questions", match: { text: { $regex: /periodic/i } } })

    .then((quiz) => {
      if (!quiz) {
        const err = new Error("Quiz not found");
        err.status = 404;
        throw err;
      }
      res.status(200);
      res.setHeader("Content-Type", "application/json");
      res.json(quiz);
    });
});

module.exports = quizRouter;
