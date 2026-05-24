// 1. Estrutura de dados com os blocos e as frases
const blocosDeDialogo = [
    {
        nome: "Presente Wallace Powerpoint 1",
        frases: [
            "FELIZ ANVERSIOA\nYEEEY",
            "Parabens mereceu",
            "Parabens por crescer E nascer hojem, hoje e um dia especial pq v",
            "Vce Lindo 😍😍😍😍😍😍😍😍😍😍😍😍😍😍😍",
            "TODOS SEUS AMIGOS VIERAO\nUE ELES SUMIRAOAKAK",
            "OLHA O GRAFICO",
            "TOP COISAS",
            "TRICKSHOTS PRO E MITADAS\n(é quente)",
            "ONDE ESTA O NABBITE???",
            "OLHA O MARIO"
        ]
    },
    {
        nome: "Presente Wallace Powerpoint 2",
        frases: [
            "PaBENS MERECEU 👏👏👏👏👏👏👏👏👏",
            "parabens por crescer e nascers hojem, hoje e um dia eita a fonte ficou grand",
            "V CLindo 😍😍😍😍😍😍😍😍😍😍😍😍😍😍😍",
            "T8=DOIS SEUS AMIGOS VIERAO",
            "TOP C\noisas",
            "4 DICAS JAPONESAS PARA\nVENCER A PREGUIÇA",
            "OLHA OS MARIOS"
        ]
    }
];

// 2. Lógica do comando dentro do seu evento de mensagem (messageCreate)
client.on('messageCreate', async (message) => {
    // Ignora mensagens de outros bots ou que não começam com o prefixo
    if (message.author.bot || !message.content.startsWith('C!')) return;

    // Separa o comando dos argumentos
    const args = message.content.slice('C!'.length).trim().split(/+/);
    const command = args.shift().toLowerCase();

    if (command === 'dialog') {
        // Seleciona um bloco aleatório
        const blocoAleatorio = blocosDeDialogo[Math.floor(Math.random() * blocosDeDialogo.length)];
        
        // Seleciona uma frase aleatória dentro desse bloco
        const fraseAleatoria = blocoAleatorio.frases[Math.floor(Math.random() * blocoAleatorio.frases.length)];

        // Envia a resposta formatada
        // O asterisco duplo (**) deixa o texto em negrito e o itálico (*) destaca a fonte
        await message.channel.send(`${fraseAleatoria}\n\n*Fonte: ${blocoAleatorio.nome}*`);
    }
});