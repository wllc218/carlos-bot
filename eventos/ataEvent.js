import falas from "../data/ata.json" with { type: "json" };
import { Events } from "discord.js";
export const name = Events.MessageCreate;
export async function execute(message) {
  if (message.author.bot) return;
  let sorte = Math.floor(Math.random() * falas.normal.length);
  let sorteio = Math.floor(Math.random() * 50);
  if (sorteio <= 5) {
    await message.reply(falas.normal[sorte]);
  }
}
