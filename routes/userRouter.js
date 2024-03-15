const express = require("express");

const bodyParser = require("body-parser");
const userRouter = express.Router();
var Users = require("../models/users");
var passport = require("passport");
var authenticate = require("../models/authenticate");
userRouter.use(bodyParser.json());

userRouter
  .route("/")
  .get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Users.find({})
      .then(
        (users) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(users);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

userRouter.post("/signup", (req, res, next) => {
  Users.register(new Users({ username: req.body.username }), req.body.password)
    .then((user) => {
      if (req.body.firstname) user.firstname = req.body.firstname;
      if (req.body.lastname) user.lastname = req.body.lastname;
      return user.save();
    })
    .then((user) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: true, status: "Registration Successful!" });
    })
    .catch((err) => {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ err: err });
    });
});

//passport jwt
userRouter.post("/login", passport.authenticate("local"), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", " application/json");
  res.json({
    success: true,
    token: token,
    status: "You are successfully logged in!",
  });
});

userRouter.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

userRouter.get(
  "/facebook/token",
  passport.authenticate("facebook-token"),
  (req, res) => {
    if (req.user) {
      var token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        token: token,
        status: "You are successfully logged in!",
      });
    }
  }
);

module.exports = userRouter;
