import { EmbedBuilder } from "discord.js";
export const name = "oi";
export function execute(message) {
  // Cria o embed
  const embed = new EmbedBuilder()
    .setTitle("Saudações!") // Título do embed
    .setDescription(`Oi ${message.author.username}, tudo bem?`) // Texto principal
    .setColor("#00FF00") // Cor lateral do embed (verde nesse caso)
    .setFooter({ text: "Este é um embed de teste" }) // Texto no rodapé
    .setTimestamp(); // Adiciona a hora de envio

  // Envia o embed
  message.reply({ embeds: [embed] });
}
