const mongoose = require("mongoose");
const { mongoPath } = require("../../config.json");

// module.exports = async () => {
//   await mongoose.connect(mongoPath, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   console.log("✅ MongoDB conectado");
//   return mongoose;
// };

module.exports = async () => {
  await mongoose.connect(mongoPath);

  console.log("✅ MongoDB conectado");

  return mongoose;
};
