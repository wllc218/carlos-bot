import dialogos from "../../data/dialoguess.json" with { type: "json" };
import { EmbedBuilder } from "discord.js";
import User from "../../server/schemas/user-schema.js";

let jogoAtivo = false;

export const name = "dialoguess";
export async function execute(message) {
  if (jogoAtivo) {
    return message.reply("PERA Q JA MANDARAM O COMANDO ESPERA ACABA");
  }

  jogoAtivo = true;

  const bloco = dialogos[Math.floor(Math.random() * dialogos.length)];
  const frase = bloco.frases[Math.floor(Math.random() * bloco.frases.length)];

  let tentativas = 3;

  message.channel.send(frase);

  const collector = message.channel.createMessageCollector({
    time: 15000,
  });

  collector.on("collect", async (msg) => {
    if (msg.author.bot) return;

    let resposta = msg.content
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    let nomeObra = bloco.nome
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    // ACERTOU
    if (resposta === nomeObra) {
      const user = await User.findById(message.author.id);
      user.vitorias.dialoGuess++;
      await user.save();

      const final = new EmbedBuilder()
        .setTitle(bloco.nome)
        .setDescription(`### ${msg.author} ACERTOU 🎊🎊🎊`)
        .setColor("#80ef80");

      if (bloco.thumb) {
        final.setThumbnail(bloco.thumb);
      }

      message.channel.send({ embeds: [final] });
      jogoAtivo = false;
      collector.stop();
      return;
    }

    // ERROU
    tentativas--;

    // PERDEU
    if (tentativas <= 0) {
      const final = new EmbedBuilder()
        .setTitle(bloco.nome)
        .setDescription(`### BURROU.\nERA **${bloco.nome}**`)
        .setColor("#ef8080");

      if (bloco.thumb) {
        final.setThumbnail(bloco.thumb);
      }

      message.channel.send({ embeds: [final] });

      jogoAtivo = false;

      collector.stop();

      return;
    }

    // ainda tem chances
    return message.channel.send(`### ERROU MAIS ${tentativas} CHANCE`);
  });

  collector.on("end", (collected, reason) => {
    // se acabou o tempo sem respostas corretas, mostra a resposta
    if (reason === "time") {
      const final = new EmbedBuilder()
        .setTitle(bloco.nome)
        .setDescription(
          `### TEMPO ESGOTADO.
            ERA **${bloco.nome}**`,
        )
        .setColor("#efc080");

      if (bloco.thumb) {
        final.setThumbnail(bloco.thumb);
      }

      message.channel.send({ embeds: [final] });
    }

    jogoAtivo = false;
  });
}
