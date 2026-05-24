const { EmbedBuilder } = require("discord.js");
const listaEmojis = require("../data/emojis.json");
const lista = require("./lista");
module.exports = {

    name: "veremoji",
    execute(message, args) {
        const emojiS = listaEmojis.emojis;
        let prikito;

        if (args.length === 0) {
            message.reply("VSF VC NAO ESCERVEU NADA NA FRENTE ");
            return;
        }

        if (args > listaEmojis.emojis.length || args < 0) {
            message.reply("NN TEM ESSE EMOJI AI NAO ESCOLHE UM NUMERO ENTRE 0 E " + (listaEmojis.emojis.length - 1));
            return;
        }



       const embedEmoji = new EmbedBuilder()
            .setTitle(emojiS[args].nome)
            .setDescription(`${mensagem.join("\n")}`)
            .setColor(`#000000`)
            .setFooter({ text: "oi" })
            .setTimestamp()
            


        if (isNaN(args[0])) {
            prikito = "penis";
        } else {
            prikito = "buceta";
        }


        message.reply(emojiS[args].nome);
        }
};
