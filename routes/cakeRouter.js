const express = require("express");
const bodyParser = require("body-parser");

const cakeRouter = express.Router();
cakeRouter.use(bodyParser.json());

cakeRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.end("will send all the cake to you!");
  })
  .post((req, res, next) => {
    res.end(
      "will add the cake: " +
        req.body.type +
        "with details: " +
        req.body.price +
        req.body.name
    );
  });

cakeRouter
  .route("/:cakeId")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.end("cake by id: " + req.params.cakeId);
    // next();
  })
  .put((req, res, next) => {
    res.write("Updating the cake: " + req.params.cakeId + "\n");
    res.end(
      "Will update the cake: " +
        req.body.type +
        "will name: " +
        req.body.name +
        " and price: " +
        req.body.price
    );
  })

  .delete((req, res, next) => {
    res.end("Deleting cake: " + req.params.cakeId);
  });

module.exports = cakeRouter;
