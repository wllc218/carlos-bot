import { EmbedBuilder } from "discord.js";
import emojisData from "../../data/emojis.json" with { type: "json" };
import User from "../../server/schemas/user-schema.js";

const emojiJson = emojisData.emojis;

export const name = "emoji";
export async function execute(message) {
  const sorte = Math.floor(Math.random() * emojiJson.length);
  let randomEmoji = emojiJson[sorte];
  let user = await User.findById(message.author.id);
  if (!user) {
    user = await User.create({
      _id: message.author.id,
    });
  }

  const emojiBanco = user.emojis.find((e) => e.emojiId === randomEmoji.emojiId);

  if (emojiBanco) {
    emojiBanco.quantidade++;
    await user.save();
  } else {
    user.emojis.push({
      emojiId: randomEmoji.emojiId,
      quantidade: 1,
    });

    await user.save();
  }

  const embed = new EmbedBuilder()
    .setTitle(randomEmoji.nome)
    .setDescription(
      `RARIDADE: ${randomEmoji.raridade}
          CONTADOR: ${user.emojis.find((e) => e.emojiId === randomEmoji.emojiId).quantidade}

          `,
    )
    .setColor(randomEmoji.cor)
    .setThumbnail(
      `https://cdn.discordapp.com/emojis/${randomEmoji.discordId}.png`,
    );

  message.reply({ embeds: [embed] });
}
