import mongoose, { connect } from "mongoose";
import config from "../config.json" with { type: "json" };
const { mongoPath } = config;

export default async () => {
  await connect(mongoPath);
  return mongoose;
};
