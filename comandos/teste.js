module.exports = {
    name: "teste",
    async execute(message) {
        let risada = "HAH"; 

        const tamanhoAleatorio = Math.floor(Math.random() * 21) + 5; 

        const letras = ["A", "H"];

        for (let i = 0; i < tamanhoAleatorio; i++) {
            const letraSorteada = letras[Math.floor(Math.random() * letras.length)];
            risada += letraSorteada;
        }

        await message.reply(risada);
    }
}