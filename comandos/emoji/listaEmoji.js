import { EmbedBuilder } from "discord.js";
import emojisData from "../../data/emojis.json" with { type: "json" };
const emojis = emojisData.emojis;

export const name = "lista";
export function execute(message) {
  function lista() {
    let mensagem = "";
    const raridades = [...new Set(emojis.map((emoji) => emoji.raridade))];

    raridades.forEach((rari) => {
      const emojisRaridade = emojis.filter((e) => e.raridade === rari);
      mensagem += `\n### ${rari.toUpperCase()}\n ${emojisRaridade.map((e) => `<:${e.discordName}:${e.discordId}> ${e.nome}`).join("\n")}`;
    });
    return mensagem;
  }

  const embed = new EmbedBuilder()
    .setTitle("LISTA EMOJIS")
    .setDescription(lista())
    .setColor("#fdeff8")
    .setTimestamp();

  message.reply({ embeds: [embed] });
}
