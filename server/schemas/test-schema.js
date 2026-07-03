import { Schema, model } from "mongoose";

const schema = new Schema({
  message: {
    type: String,
    required: true,
  },
});

export default model("testing", schema, "testing");
