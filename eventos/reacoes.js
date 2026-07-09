import { Events } from "discord.js";
export const name = Events.MessageCreate;
import emojisData from "../data/emojis.json" with { type: "json" };
const emojis = emojisData.emojis;
export async function execute(message) {
  //prettier-ignore
  const texto = message.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (message.author.bot) return;
  for (const emoji of emojis) {
    if (!Array.isArray(emoji.reactions)) continue;

    for (const palavra of emoji.reactions) {
      const regex = new RegExp(`\\b${palavra.toLowerCase()}\\b`, "i");

      if (regex.test(texto)) {
        try {
          await message.react(emoji.discordId);
        } catch (err) {
          console.log(err);
        }

        break;
      }
    }
  }
}

// const palavrei = "carlos".split("");

// if (palavrei.every((letra) => texto.includes(letra))) {
//   message.react("<:carlos:1390110742971289632>");
// }
