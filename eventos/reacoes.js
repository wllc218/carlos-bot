const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {

        if (message.author.bot) return;

        const reacoes = {
            "<:rob:1390110593721040966>": ["nicolas", "rob", "robique"],
            "<:Lucas:1390114953582870833>": ["lucas", "prjooj", "luque"],
            "<:wallace:1390110948127146086>": ["wallace", "walface"],
            "<:carlos:1390110742971289632>": ["carlos", "deyvid"],
            "<:theo:1390110538993766421>": ["theo"],
            "<:vocejaviuessameniuna:1415817551333818550>": ["nos", "agente", "vamos", "a gente"],
            "<:vagina:1390109875089965228>": ["regina"],
            "<:oie:1497972408391434462>": ["ele", "eles", "ela", "elas", "TAKE THIS", "TAKE THAT", "LETS DO THIS", "YES"],
            "<:dsd:1505684509591339208>": ["HAHAHA", "HAH"],
            "<:oi:1390108899863957747>": ["bosta", "bosta", "bostas", "bostinha", "bostinhas", "bostola", "bostolas", "bostão",
                "bostoes", "bostões", "embostado", "embostada", "bostear", "bostejar", "bostejando", "bostejo", "bostuda", "bostudo", 
                "merda", "merdas", "merdinha", "merdola", "caguei", "cagando", "cagou", "cagar"],
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