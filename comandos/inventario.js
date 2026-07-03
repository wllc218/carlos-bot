import { EmbedBuilder } from "discord.js";
import listaEmojis from "../data/listaEmojis.js";
const { emojis, totalEmojisObj, soma } = listaEmojis;

export const name = "inventario";
export function execute(message) {
  let texto = "";
  const randomColor = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  const embed = new EmbedBuilder()
    .setTitle("SEU INVENTÁRIO")
    .setDescription(texto)
    .setColor(`#${randomColor}`)
    .setFooter({ text: `TOTAL DE EMOJIS: ${totalEmojisObj.value}` })
    .setTimestamp();
  message.reply({ embeds: [embed] });
}
