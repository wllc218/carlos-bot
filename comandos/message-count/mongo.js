const mongoose = require("mongoose");
const config = require("../../config.json");

console.log(config);
module.exports = async () => {
  //   await mongoose.connect(mongoPath, {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //   });
  //   return mongoose;

  await mongoose.connect(mongoPath);
  console.log("✅ MongoDB conectado");
  return mongoose;
};
