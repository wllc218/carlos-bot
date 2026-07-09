import { EmbedBuilder } from "discord.js";
import User from "../../server/schemas/user-schema.js";
import emojisData from "../../data/emojis.json" with { type: "json" };
const emojisJson = emojisData.emojis;

export const name = "banco";
export async function execute(message) {
  let user = await User.findById(message.author.id);
  const emojisBanco = user.emojis;
  let emojisUser = [];
  let mensagem = "";
  const e = emojisJson.forEach((e) => {
    emojisBanco.forEach((emoji) => {
      if (e.emojiId === emoji.emojiId) {
        emojisUser.push(e);
      }
    });
  });

  const raridades = [...new Set(emojisUser.map((emoji) => emoji.raridade))];
  raridades.forEach((rari) => {
    const emojisRaridade = emojisUser.filter((e) => e.raridade === rari);
    mensagem += `\n### ${rari.toUpperCase()}\n ${emojisRaridade.map((e) => `**${emojisBanco.find((i) => i.emojiId == e.emojiId).quantidade}** <:${e.discordName}:${e.discordId}> ${e.nome}`).join("\n")}`;
  });

  const embed = new EmbedBuilder()
    .setTitle("SEUS EMOJIS")
    .setDescription(mensagem)
    .setColor("#fdeff8")
    .setTimestamp();

  message.reply({ embeds: [embed] });
}
