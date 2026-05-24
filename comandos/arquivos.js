const fs = require("fs");
const arquivos = fs.readdirSync("./mp4")

module.exports = {
    name: "arquivos",
    execute(message) {
        message.reply(`Arquivos disponíveis:\n${arquivos.join("\n")}`);
    }
}