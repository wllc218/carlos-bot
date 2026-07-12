import User from "../../server/schemas/user-schema.js";
import { EmbedBuilder } from "discord.js";

export const name = "ranking";
export async function execute(message) {
  let mensagem = [];
  const usuarios = await User.find();
  const total = (a, b) => a + b;
  const ranking = usuarios.sort((a, b) => {
    const totalA = Object.values(a.vitorias).reduce(total);
    const totalB = Object.values(b.vitorias).reduce(total);
    return totalB - totalA;
  });

  let soma = 0;
  ranking.forEach((rank) => {
    soma += 1;
    mensagem.push(
      `${soma == 1 ? ":first_place:" : soma == 2 ? ":second_place:" : soma == 3 ? ":third_place:" : ":middle_finger:"} ${soma}°  <@${rank._id}>: (d **${rank.vitorias.dialoGuess}** p **${rank.vitorias.printGuess}** v **${rank.vitorias.numeroGuess}**)  **[${Object.values(rank.vitorias).reduce(total)}]**`,
    );
  });

  const embed = new EmbedBuilder()
    .setTitle("RANKING GUESSERS") // Título do embed
    .setDescription(mensagem.join("\n")) // Texto principal
    .setColor("DarkGreen");

  message.reply({ embeds: [embed] });
}
