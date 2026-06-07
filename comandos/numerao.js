const maxNumCommand = require("./maximonumero.js");
const numero = (module.exports = {
  name: "numerao",

  async execute(message) {
    const numeroFinal =
      Math.floor(Math.random() * (maxNumCommand.maximo - 100 + 1)) + 100;
    const mensagemBot = await message.channel.send("oi");

    let collector = message.channel.createMessageCollector();
    collector.on("collect", async (msg) => {
      let texto = mensagemBot.content + "\n";

      if (msg.content.toLowerCase() === "parar") {
        message.channel.send("ok");
        collector.stop();
        return;
      }

      if (msg.author.bot) return;

      const numeroQuebrado = numeroFinal.toString().split("");
      const numeroUsuario = msg.content.split("");

      numeroQuebrado.forEach((num, index) => {
        if (num === numeroUsuario[index]) {
          texto += ":green_square:";
        } else if (Math.abs(Number(num) - Number(numeroUsuario[index])) <= 2) {
          texto += ":orange_square:";
        } else {
          texto += ":red_square:";
        }
      });

      if (numeroFinal.toString() === msg.content) {
        texto += "\nPABENS ACERTOU O NUMERO FINAL ERA " + numeroFinal;
        collector.stop();
      }

      await mensagemBot.edit(texto);
    });
  },
});
