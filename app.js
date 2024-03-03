var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var config = require("./config");
var passport = require("passport");
var authenticate = require("./models/authenticate");

var dishRouter = require("./routes/dishRouter");
var promotionRouter = require("./routes/promotionRoute");
var leaderRouter = require("./routes/leaderRoute");
var toppingRouter = require("./routes/toppingRouter");
var youtubeRouter = require("./routes/youtubeRouter");
var cakeRouter = require("./routes/cakeRouter");
var userRouter = require("./routes/userRouter");
const uploadRouter = require("./routes/uploadRouter");
var app = express();
const mongoose = require("mongoose");
const url = config.mongoUrl;
const connect = mongoose.connect(url);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser("18102002"));

app.use(
  session({
    name: "session-id",
    secret: "12345-67890-09876-54321",
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/users", userRouter);
// app.use(auth);
app.use("/imageUpload", uploadRouter);
app.use("/dishes", dishRouter);
app.use("/toppings", toppingRouter);
app.use("/promotions", promotionRouter);
app.use("/leaders", leaderRouter);
app.use("/youtubes", youtubeRouter);
app.use("/cakes", cakeRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

connect.then(
  (db) => {
    console.log("Connected correctly to the server");
  },
  (err) => {
    console.log(err);
  }
);
app.all("*", (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(
      307,
      "https://" + req.hostname + ":" + app.get("secPort") + req.url
    );
  }
});

module.exports = app;
