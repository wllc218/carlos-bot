const respostas = ["oi tudo bem",
    "VAI SE FUDERRRRRRRRR",
    "caguei mt",
    "peidei tbm",
    "voao s fuderem",
    "tabom.",
    "nao",
    "EU TE ODEIO MUITO.",
    "Eu te amo.",
    "<:CORINTHIANS:1452793095635599462>",
    "verdade",
    "3748374834837483",
    "acho q isac",
    "nseiii",
    "O NICOLAS NE",
    "vc",
    "odeio",
    "o lucas",
    "o walface",
    "VC SABIA Q SE VC MATAR UM ANJO NO ISAAC COM O ISAAC VC PODE RANDOMIZAR TANTO O ITEM NORMAL QUANTO A CHAVE Q O ANJO DROPA SABIA SABIA",
    "EU JA SABIA",
    "o seu viadinho que da o cu do caralho",
    "TUDO BEM.",
    "vc e gay ne",
    "eu tbm acho",
    "vou matar ne tudos.,",
    "amanha quando eu acordar",
    "ACHO QUE SIM.",
    "VDD.",
    "NAO NAO",
    "ALEXA LIGAR O AR DA SALA",
    "<:filho:1436117414226956288>",
    "PARABENSSSSSSSSSSSSSSS",
    "MUITO PRO MDS",
    "EU TE ODEIO MUITO.",
    "EU TE AMO MUITO.",
    "vc e um merda",
    "OLHA O 67 KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
    "AQUELE JOGO LÁ O ISAC",
    "TO CAGANDO E A BOSTA N DESCE",
    "novo meme",
    "novo meme.",
    "EU VO LE PEGA FI DE RAPARIGA",
    "MENTIRA",
    "fiquei sabendo dumas parada ai.",
    "ola tudo bem",
    "TAKE THIS",
    "TAKE THAT",
    "LETS DO THIS",
    "YES",
    "HAH[AH]*",
]


module.exports = {
    name: "ata",
    execute(message, args) {
        if (!args.length) {
            return message.reply("ESCREVE ALGUMA COISA PORR");
        }
        const sorte = Math.floor(Math.random() * respostas.length);
        message.reply(respostas[sorte]);
    }
}