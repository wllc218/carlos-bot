import falas from "../data/ata.json" with { type: "json" };
export const name = "ata";
export function execute(message, args) {
  let mensagem;
  if (!args.length) {
    return message.reply("ESCREVE ALGUMA COISA PORR");
  }
  if (args[0].toLowerCase() === "quem" || args[0].toLowerCase() === "qm") {
    mensagem = falas.quem;
  } else {
    mensagem = falas.normal;
  }
  const sorte = Math.floor(Math.random() * mensagem.length);
  message.reply(mensagem[sorte]);
}
