const blocosDeDialogo = require('./dialogos.json');

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('C!')) return;

    const args = message.content.slice('C!'.length).trim().split(/+/);
    const command = args.shift().toLowerCase();

    if (command === 'dialog') {
        const blocoAleatorio = blocosDeDialogo[Math.floor(Math.random() * blocosDeDialogo.length)];
        const fraseAleatoria = blocoAleatorio.frases[Math.floor(Math.random() * blocoAleatorio.frases.length)];

        await message.channel.send(`${fraseAleatoria}\n\n*Fonte: ${blocoAleatorio.nome}*`);
    }
});