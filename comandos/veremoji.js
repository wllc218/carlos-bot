const { EmbedBuilder } = require("discord.js");
const listaEmojis = require("../data/emojis.json");

module.exports = {

    name: "veremoji",
    execute(message, args) {

        if (!args[0]) {
            return message.reply("VC NAO ESCREVEU NADA");
        }

        const input = args[0].toLowerCase();

        let emoji;

        if (!isNaN(input)) {
            emoji = listaEmojis.emojis.find(e => e.id == input);
        } else {
            emoji = listaEmojis.emojis.find(e => e.nome.toLowerCase() === input);
        }

        if (!emoji) {
            return message.reply(`NN TEM ESSE EMOJI AI NAO ESCOLHE UM NUMERO ENTRE 0 E ${listaEmojis.emojis.length - 1} OU ESCREVE O NOME CERTO NE BURRAO`);
        }

        const embed = new EmbedBuilder()
            .setTitle(emoji.nome)
            .setDescription(
                `**RARIDADE**: ${emoji.raridade}\n` +
                `**CONTADOR**: ${emoji.contador}\n` +
                `**ID**: ${emoji.id}`
            )
            .setColor("#000000")
            .setThumbnail(`https://cdn.discordapp.com/emojis/${emoji.discordId}.png`)

        message.reply({ embeds: [embed] });
    }
};