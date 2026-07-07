import { EmbedBuilder } from "discord.js";
import emojisData from "../data/emojis.json" with { type: "json" };
const emojis = emojisData.emojis;

export const name = "veremoji";
export function execute(message, args) {
  let teste;
  if (!args[0]) {
    return message.reply("NAO TEM ESSE EMOJI");
  }
  if (!isNaN(args[0])) {
    teste = emojis[args[0]];
  } else {
    teste = emojis.find((e) => e.nome.toLowerCase() == args[0].toLowerCase());
  }

  const embed = new EmbedBuilder()
    .setTitle(teste.nome)
    .setDescription(
      `RARIDADE: ${teste.raridade}
          CONTADOR: ${teste.contador}
          ID: ${teste.discordId}
          `,
    )
    .setColor(teste.cor)
    .setThumbnail(`https://cdn.discordapp.com/emojis/${teste.discordId}.png`);

  message.reply({ embeds: [embed] });
}
