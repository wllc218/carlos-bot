const userSchema = require("./schemas/user-schema");

module.exports = {
  name: "dinheirao",

  async execute(message) {
    const dinheiro = Math.floor(Math.random() * 100 + 1);
    await userSchema.findOneAndUpdate(
      { _id: message.author.id },
      { $inc: { cash: dinheiro } },
      { upsert: true },
    );

    message.reply(`VC GANHOU ${dinheiro} CARALHINHOS.`);
  },
};
