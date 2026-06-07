const maxNumCommand = require("./maximonumero.js");

module.exports = {
  name: "numero",

  async execute(message) {
    const numero = Math.floor(Math.random() * maxNumCommand.maximo) + 1;
    let tentativas = 1;
    message.channel.send(
      "ADIVINHE O NUMERO. ENTRE 1 E " +
        maxNumCommand.maximo.toString() +
        " VALENDOO",
    );

    const collector = message.channel.createMessageCollector();
    collector.on("collect", (msg) => {
      if (msg.author.bot) return;

      if (msg.content.toLowerCase() === "desisto") {
        message.channel.send(
          `QUE PENA SEU CARALHO , O NUMERO ERA **${numero}**. VAI TREINAR MAIS E JOGAR MAIS ISAC E VOLTA AQUI DEPOIS PRA GANHAR`,
        );
        collector.stop();
        return;
      }

      if (!isNaN(msg.content)) {
        if (msg.content === numero.toString()) {
          message.channel.send(
            `PABENS ${msg.author}, ACERTOU SE EM ${tentativas} TENTATIVAS PABENS ACERTOU ERA **${numero}** MESMO.`,
          );
          collector.stop();
          return;
        }
        message.channel.send(
          parseInt(msg.content) > numero
            ? "ERROU O NUMERO É **MENOR**"
            : "ERROU O NUMERO É **MAIOR**",
        );
        tentativas++;
      } else {
        message.channel.send("ESCREVE UM NUMERO BURROO");
      }
    });
  },
};
