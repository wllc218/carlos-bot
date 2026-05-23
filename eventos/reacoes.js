const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {

        // Ignora bots
        if (message.author.bot) return;

        // Lista de palavras + emoji
        const reacoes = {
            "<:rob:1390110593721040966>": ["nicolas"],
            "<:Lucas:1390114953582870833>": ["lucas"],
            "<:wallace:1390110948127146086>": ["wallace"],
            "<:carlos:1390110742971289632>": ["carlos"],
            "<:theo:1390110538993766421>": ["theo"],

            "<:vocejaviuessameniuna:1415817551333818550>": [
                "nós",
                "agente",
                "vamos",
                "eles"
            ],

            "<:vagina:1390109875089965228>": ["regina"]
        };

        const texto = message.content.toLowerCase();

for (const emoji in reacoes) {

    const palavras = reacoes[emoji];

    for (const palavra of palavras) {

        const regex = new RegExp(`\\b${palavra}\\b`, "i");

        if (regex.test(texto)) {

            try {
                await message.react(emoji);
            } catch (err) {
                console.log(err);
            }

            break;
        }
    }
}}}