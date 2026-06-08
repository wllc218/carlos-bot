const userSchema = require("./schemas/user-schema");

module.exports = {
  name: "dinheiro",
  async execute(message) {
    const id = message.author.id;
    const dinheiroQuantia = await userSchema.findById(id);
    message.reply(`vc tem ${dinheiroQuantia.cash.toString()} reais parabens`);
  },
};
