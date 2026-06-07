const maxNumCommand = require("./maximonumero.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "numerao",

  async execute(message) {
    let tentativas = 0;
    let historico = "";

    const numeroFinal =
      Math.floor(Math.random() * (maxNumCommand.maximo - 100 + 1)) + 100;

    const embedInicial = new EmbedBuilder()
      .setTitle("ESCREVE UM NUMERO AI ")
      .setDescription("oi digita ai")
      .setColor("#ffc558")
      .setFooter({ text: "Digite `parar` para acabar ne tudos." })
      .setThumbnail(
        "https://media.discordapp.net/attachments/1455988231907709025/1513233208844615964/image0.gif?ex=6a26fbbf&is=6a25aa3f&hm=7b281514713bf1ebc847a76f0af8a7ab2c34d112be579e8f5aaa5810046cfa88&=&width=242&height=136",
      );

    const mensagemBot = await message.channel.send({
      embeds: [embedInicial],
    });

    const collector = message.channel.createMessageCollector();

    collector.on("collect", async (msg) => {
      if (msg.author.bot) return;

      if (msg.content.toLowerCase() === "parar") {
        collector.stop();

        const embedParado = new EmbedBuilder()
          .setTitle("ACABOU.")
          .setDescription(
            `O número era **${numeroFinal}**.\nTentativas: **${tentativas}**`,
          )
          .setColor("#ff5555");

        await mensagemBot.edit({
          embeds: [embedParado],
        });

        return;
      }

      // Verifica se é um número válido
      if (
        isNaN(Number(msg.content)) ||
        msg.content.length !== numeroFinal.toString().length
      ) {
        return;
      }

      const numeroQuebrado = numeroFinal.toString().split("");
      const numeroUsuario = msg.content.split("");

      let linha = "";

      numeroQuebrado.forEach((num, index) => {
        if (num === numeroUsuario[index]) {
          linha += "🟩";
        } else if (Math.abs(Number(num) - Number(numeroUsuario[index])) <= 2) {
          linha += "🟧";
        } else {
          linha += "🟥";
        }
      });

      tentativas++;

      historico += `${linha} ${msg.content} \n`;

      // Acertou
      if (msg.content === numeroFinal.toString()) {
        const embedVitoria = new EmbedBuilder()
          .setTitle("🎉🎉🎉 YESSSSSSSSSSSSSSSSSSSSSSSSSS.")
          .setDescription(
            `${historico}\n\nO número era **${numeroFinal}**, PABENS`,
          )
          .setColor("#57f287")
          .setFooter({
            text: `Tentativas: ${tentativas}`,
          })
          .setThumbnail(
            "https://media.discordapp.net/attachments/1455988231907709025/1513233750589182013/image0.gif?ex=6a26fc40&is=6a25aac0&hm=b5b451794eb8406ced7c641a000f1ee7f6e485447cd4bb48e710a53a1dca2eed&=&width=242&height=136",
          );

        await mensagemBot.edit({
          embeds: [embedVitoria],
        });

        collector.stop();
        return;
      }

      const embedJogo = new EmbedBuilder()
        .setTitle("ESCREVE UM NUMERO AI")
        .setDescription(historico)
        .setColor("#ffc558")

        .setFooter({
          text: `Tentativas: ${tentativas}`,
        })
        .setThumbnail(
          "https://media.discordapp.net/attachments/1455988231907709025/1513233208844615964/image0.gif?ex=6a26fbbf&is=6a25aa3f&hm=7b281514713bf1ebc847a76f0af8a7ab2c34d112be579e8f5aaa5810046cfa88&=&width=242&height=136",
        );

      await mensagemBot.edit({
        embeds: [embedJogo],
      });
    });
  },
};
