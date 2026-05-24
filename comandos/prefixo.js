import { prefix } from "../config.json";

module.exports = {
    name: "prefixo",
    execute(message) {
        message.reply(`O prefixo atual é: ${prefix}`);
        
    }
}