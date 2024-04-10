const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  userid: String,
  description: String,
  duration: Number,
  date: String,
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
