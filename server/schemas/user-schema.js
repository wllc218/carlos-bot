import { Schema, model } from "mongoose";
const userSchema = new Schema({
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

  emojis: [
    {
      emojiId: String,
      quantidade: Number,
    },
  ],

  vitorias: {
    dialoGuess: {
      type: Number,
      default: 0,
    },
    printGuess: {
      type: Number,
      default: 0,
    },
    numeroGuess: {
      type: Number,
      default: 0,
    },
  },
});

export default model("users", userSchema);
