const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Quiz = require("../models/quizzes");
const quizRouter = express.Router();
quizRouter.use(bodyParser.json());
var authenticate = require("../models/authenticate");
const cors = require("cors");
quizRouter.options("/", cors());

quizRouter
  .route("/")
  .get(async (req, res) => {
    try {
      const quizzes = await Quiz.find().populate("questions");
      res.json(quizzes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Quiz.create(req.body)
      .then((quiz) => {
        return Quiz.findById(quiz._id).populate("questions").exec();
      })
      .then((quiz) => {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ message: "Created document", data: quiz });
      })
      .catch((err) => next(err));
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Quiz.deleteMany({})
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
    res.end("PUT operation not supported on /quizzes");
  });

quizRouter
  .route("/:quizId")
  .get(async (req, res) => {
    const quiz = await Quiz.findById(req.params.quizId).populate("questions");
    res.json(quiz);
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("Post opreration not support on /dishes/" + req.params.quizId);
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Quiz.findByIdAndUpdate(
      req.params.quizId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((quiz) => {
        return Quiz.findById(quiz._id).populate("questions").exec();
      })
      .then(
        (quiz) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(quiz);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  );

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
// end point
quizRouter.route("/:quizId/populate2").get((req, res, next) => {
  Quiz.findById(req.params.quizId)
    .populate({ path: "questions", match: { text: { $regex: /capital/i } } })
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
