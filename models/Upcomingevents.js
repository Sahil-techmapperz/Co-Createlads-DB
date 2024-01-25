const mongoose = require('mongoose');

const UpcomingeventsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: String,
  imageUrl: String,
  linkUrl: String
});

const Upcomingevents = mongoose.model('Event', UpcomingeventsSchema);

module.exports = Upcomingevents;
