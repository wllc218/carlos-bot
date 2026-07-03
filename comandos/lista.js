import { EmbedBuilder } from "discord.js";
export const name = "lista";
export async function execute(message, args) {
  const pagina = Number(args[0]) || 1;

  let mensagem = [];
  const resposta = await fetch(
    `https://api.rawg.io/api/games?key=1c0bc51108974f1db030f7e31d35a501&page=${pagina}&page_size=20`,
  );
  const dados = await resposta.json();
  const personagens = dados.results;

  personagens.forEach((element) => {
    mensagem.push(element.name);
  });

  const embed = new EmbedBuilder()
    .setTitle(`PÁGINA ${pagina}`)
    .setDescription(`${mensagem.join("\n")}`)
    .setColor(`#000000`)
    .setFooter({ text: "oi" })
    .setTimestamp();

  message.reply({ embeds: [embed] });
}
