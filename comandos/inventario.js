
const { EmbedBuilder } = require("discord.js");
const { emojis, totalEmojisObj } = require("../data/listaEmojis");




module.exports = {
    name: "inventario",
    execute(message) {
        let texto = "";





        const randomColor = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, "0");

        const embed = new EmbedBuilder()
            .setTitle("SEU INVENTÁRIO")
            .setDescription(texto)
            .setColor(`#${randomColor}`)
            .setFooter({ text: `TOTAL DE EMOJIS: ${totalEmojisObj.value}` })
            .setTimestamp();




        message.reply({ embeds: [embed] });
    }
}