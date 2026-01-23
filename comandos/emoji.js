
const { EmbedBuilder } = require("discord.js");

const { emojis, totalEmojisObj } = require("../data/listaEmojis");

module.exports = {
    name: "emoji",

    execute(message) {
        function aleatorio(array) {
            const random = Math.floor(Math.random() * array.length);
            return array[random];
        }





        const raridade = aleatorio(Object.keys(emojis));
        const emoji = aleatorio(Object.keys(emojis[raridade]));
        emojis[raridade][emoji]++;
        totalEmojisObj.value++


        const randomColor = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, "0");


        const embed = new EmbedBuilder()
            .setTitle(raridade)
            .setDescription(1 + " " + emoji)
            .setColor(`#${randomColor}`)
            .setFooter({ text: "pro" })
            .setTimestamp();




        message.reply({ embeds: [embed] });
    }
}