import { EmbedBuilder } from "discord.js";
import listaEmojis from "../data/listaEmojis.js";
const { emojis, totalEmojisObj, soma } = listaEmojis;

export const name = "emoji";
export function execute(message) {
  const aleatorio = Math.floor(Math.random() * 100);
  message.reply(aleatorio.toString());
}
