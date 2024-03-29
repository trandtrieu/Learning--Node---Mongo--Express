const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
});

module.exports = mongoose.model("Quiz", quizSchema);
