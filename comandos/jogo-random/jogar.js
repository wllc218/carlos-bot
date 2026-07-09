import { EmbedBuilder } from "discord.js";

export const name = "jogo";
export async function execute(message) {
  const page = Math.floor(Math.random() * 500) + 1;
  const resposta = await fetch(
    `https://api.rawg.io/api/games?key=1c0bc51108974f1db030f7e31d35a501&page=${page}&page_size=40`,
  );
  const dados = await resposta.json();
  const aleatorio = Math.floor(Math.random() * dados.results.length);
  const jogo = dados.results[aleatorio];
  const plataformas =
    jogo.platforms?.map((p) => p.platform.name).join(", ") || "Desconhecido";

  const randomColor = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  const embed = new EmbedBuilder()
    .setTitle(`🎮 ${jogo.name}\n`)
    .setDescription(
      `LANÇOU EM: **${jogo.released}**
    PLATAFORMA: ${plataformas}
    RATING: ${"⭐".repeat(Math.floor(jogo.rating))} (${jogo.rating != 0 ? jogo.rating : "SEM INFORMAÇÕES"}) `,
    )
    .setColor(`#${randomColor}`)
    .setImage(jogo.background_image);

  message.reply({ embeds: [embed] });
}
