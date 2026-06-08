const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },

  messageCount: {
    type: Number,
    default: 0,
  },

  cash: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("users", userSchema);
