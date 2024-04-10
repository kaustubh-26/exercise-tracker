const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  userid: String,
  description: String,
  duration: Number,
  date: Date,
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
