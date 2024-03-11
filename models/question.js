const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: String,
  options: { type: [String] },
  keywords: { type: [String] },
  correctAnswerIndex: Number,
});

module.exports = mongoose.model("Question", questionSchema);
