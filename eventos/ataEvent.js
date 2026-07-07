import falas from "../data/ata.json" with { type: "json" };
import { Events } from "discord.js";
export const name = Events.MessageCreate;
export async function execute(message) {
  const sorte = Math.floor(Math.random() * falas.normal);
  if (sorte <= 2) {
    await message.reply(falas.normal[sorte]);
  }
}
