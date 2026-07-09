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
});

export default model("users", userSchema);
