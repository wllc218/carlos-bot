
const { EmbedBuilder } = require("discord.js");

const { emojis, totalEmojisObj } = require("../data/listaEmojis");




module.exports = {
    name: "emoji",
    execute(message) {
        const aleatorio = Math.floor(Math.random() * 100);
        message.reply(aleatorio.toString());
    }
}