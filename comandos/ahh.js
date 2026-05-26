module.exports = {
    name: "say",
    execute(message, args) {
        if(args.length === 0) return message.reply(" ");
        
        const texto = message.toString().split(" ").slice(1).join(" ");



        message.reply(texto);


    }
}