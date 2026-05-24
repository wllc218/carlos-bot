const dialogos = require('../dialogos.json'); // Voltei para "../" considerando que está na pasta de comandos, mude o nome do arquivo se necessário!

module.exports = {
    name: 'dialog',
    async execute(message) {
        // Escolhe o bloco e a frase de forma limpa
        const bloco = dialogos[Math.floor(Math.random() * dialogos.length)];
        const frase = bloco.frases[Math.floor(Math.random() * bloco.frases.length)];

        // Envia apenas a frase sorteada
        await message.channel.send(`${frase}`);
    }
};