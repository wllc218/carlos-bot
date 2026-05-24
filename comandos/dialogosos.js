const dialogos = require('../dialogos.json'); // Ajuste o caminho se o JSON estiver na pasta principal

// Se você usa o Commando Handler que exporta o "run" ou "execute":
module.exports = {
    name: 'dialog',
    async execute(message) {
        // Escolhe o bloco e a frase de forma limpa
        const bloco = dialogos[Math.floor(Math.random() * dialogos.length)];
        const frase = bloco.frases[Math.floor(Math.random() * bloco.frases.length)];

        await message.channel.send(`${frase}\n\n*Fonte: ${bloco.nome}*`);
    }
};