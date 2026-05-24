const { EmbedBuilder } = require("discord.js");
const { emojis, totalEmojisObj } = require("../data/listaEmojis");

module.exports = {
    
    name: "veremoji",
    execute(message, args) {
        let prikito;

        if (args.length === 0) {
            message.reply("VSF VC NAO ESCERVEU NADA NA FRENTE ");
            return;
        }

        if (typeof args[0] === 'string') {
            prikito = "penis";
        } else if (typeof args[0] === 'number') {
            prikito = "buceta";
        } else {
            prikito = "keisso n entendi";
        }

        message.reply(prikito);
    }
};
