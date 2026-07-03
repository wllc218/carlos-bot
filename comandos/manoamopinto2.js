import emojisData from "../data/emojis.json" with { type: "json" };
import { EmbedBuilder } from "discord.js";

const emojis = emojisData.emojis;

export const name = "sexo2";
export function execute(message, args) {
  let teste;
  if (!args[0]) {
    return message.reply("vsf");
  }
  if (!isNaN(args[0])) {
    teste = emojis[args[0]];
  } else {
    teste = emojis.find((e) => e.nome.toLowerCase() == args[0].toLowerCase());
  }

  const embed = new EmbedBuilder()
    .setTitle("Saudações!") // Título do embed
    .setDescription(
      `RARIDADE: ${teste.raridade}
        
        `,
    )
    .setColor(teste.cor);

  message.reply(`<:${teste.discordName}:${teste.discordId}>`);
}
