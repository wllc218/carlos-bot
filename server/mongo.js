import mongoose from "mongoose";

export default async () => {
  console.log("MONGO_URI:", process.env.MONGO_URI);

  await mongoose.connect(process.env.MONGO_URI);
};
