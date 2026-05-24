const respostas = ["HAH[AH]*"]


module.exports = {
    name: "teste",
    execute(message, args) {
        if (!args.length) {
            return message.reply("ESCREVE ALGUMA COISA PORR");
        }
        const sorte = Math.floor(Math.random() * respostas.length);
        message.reply(respostas[sorte]);
    }
}