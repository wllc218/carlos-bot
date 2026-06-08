const userSchema = require("./schemas/user-schema");

module.exports = {
  name: "testei",

  async execute(message) {
    const id = message.author.id;
    const resultado = await userSchema.findById(id);

    if (!resultado) {
      message.reply("n deu");
      return;
    }
    message.reply(
      `OLÁ. <@${resultado._id}> VOCE MANDOU ${resultado.messageCount.toString()} MENSAGENS.`,
    );
  },
};
