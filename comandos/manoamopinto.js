import emojisData from "../data/emojis.json" with { type: "json" };
const emojis = emojisData.emojis;

export const name = "sexo";
export function execute(message, args) {
  message.reply(emojis[17].reactions.join(", "));

  let naosei = [];
  for (let oi of emojis) {
    naosei.push(oi.nome);
  }
  message.reply(naosei.join(", "));
  let outro = [];
  for (let i = 0; i < emojis.length; i++) {
    console.log(emojis[i]?.reactions);
  }
}
