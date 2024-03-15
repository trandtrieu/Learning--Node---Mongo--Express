const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Question = require("../models/questions");
const questionRouter = express.Router();
questionRouter.use(bodyParser.json());
var authenticate = require("../models/authenticate");
const cors = require("cors");
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
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Question.create(req.body)
      .then(
        (quizzes) => {
          console.log("Question Created ", quizzes);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(quizzes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Question.deleteMany({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /questions");
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
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "Post opreration not support on /questions/" + req.params.questionId
    );
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Question.findByIdAndUpdate(
      req.params.questionId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((question) => {
        return Question.findById(quiz._id).populate("questions").exec();
      })
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
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Question.findByIdAndDelete(req.params.questionId)
        .then((deletedQuestion) => {
          if (!deletedQuestion) {
            res.status(404).json({ message: "Question not found" });
            return;
          }
          res.status(200).json({
            message: "Question deleted successfully",
            deletedQuestion,
          });
        })
        .catch((err) => next(err));
    }
  );

module.exports = questionRouter;
