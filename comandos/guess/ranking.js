import User from "../../server/schemas/user-schema.js";
import { EmbedBuilder } from "discord.js";

export const name = "ranking";
export async function execute(message) {
  let mensagem = [];
  const usuarios = await User.find();

  const ranking = usuarios.sort((a, b) => {
    const totalA =
      a.vitorias.numeroGuess + a.vitorias.printGuess + a.vitorias.dialoGuess;

    const totalB =
      b.vitorias.numeroGuess + b.vitorias.printGuess + b.vitorias.dialoGuess;

    return totalB - totalA;
  });

  ranking.forEach((rank) => {
    mensagem.push(
      `:regional_indicator_d: ${rank.vitorias.dialoGuess} :regional_indicator_p: ${rank.vitorias.printGuess} :regional_indicator_v: ${rank.vitorias.numeroGuess} <@${rank._id}>: `,
    );
  });

  const embed = new EmbedBuilder()
    .setTitle("RANKING GUESSERS") // Título do embed
    .setDescription(mensagem.join("\n")) // Texto principal
    .setColor("DarkGreen");

  message.reply({ embeds: [embed] });
}
