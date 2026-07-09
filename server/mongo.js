import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
export default async () => {
  await mongoose.connect(process.env.MONGO_URI);
};
