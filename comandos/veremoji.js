import { EmbedBuilder } from "discord.js";
import emojis from "../data/emojis.json" with { type: "json" };

export const name = "veremoji";
export function execute(message, args) {
  if (!args[0]) {
    return message.reply("VC NAO ESCREVEU NADA");
  }
  const input = args[0].toLowerCase();
  let emoji;

  if (!isNaN(input)) {
    emoji = emojis.find((e) => e.id == input);
  } else {
    emoji = emojis.find((e) => e.nome.toLowerCase() === input);
  }

  if (!emoji) {
    return message.reply(
      `NN TEM ESSE EMOJI AI NAO ESCOLHE UM NUMERO ENTRE 0 E ${emojis.length - 1} OU ESCREVE O NOME CERTO NE BURRAO`,
    );
  }

  const embed = new EmbedBuilder()
    .setTitle(emoji.nome)
    .setDescription(
      `**RARIDADE**: ${emoji.raridade}\n` +
        `**CONTADOR**: ${emoji.contador}\n` +
        `**ID**: ${emoji.id}`,
    )
    .setColor(emoji.cor)
    .setThumbnail(`https://cdn.discordapp.com/emojis/${emoji.discordId}.png`);

  message.reply({ embeds: [embed] });
}
