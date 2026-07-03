import { Events } from "discord.js";
import emojisData from "../data/emojis.json" with { type: "json" };
const emojis = emojisData.emojis;
export const name = Events.MessageCreate;
export async function execute(message) {
  if (message.author.bot) return;

  const reacoes = {
    //Sonic. exe
    //prettier-ignore
    "<:oie:1497972408391434462>": ["eles", "elas", "TA[A]*KE THA[A]*T", "LETS DO THIS", "YES", "HAH[AH]*", "TAKE", "CAPUHA", "PAPUHA", "PREPARE FOR", "NIGGARLAS", "Sonic. exe", "niggalas", "Sonic", "TA[A]*KE THI[I]*S[S]*",
    ],

    //sonic.exe
    //prettier-ignore
    "<:dsd:1505684509591339208>": ["HAH[AH]*"],

    //bosta
    //prettier-ignore
    "<:oi:1390108899863957747>": ["bosta", "bosta", "bostas", "bostinha", "bostinhas", "bostola", "bostolas", "bostão", "bostoes", "bostões", "embostado", "embostada", "bostear", "bostejar", "bostejando", "bostejo", "bostuda", "bostudo", "merda", "merdas", "merdinha", "merdola", "caguei", "cagando", "cagou", "cagar",
    ],

    //sisycus
    "<:sisycus:1481109255355367455>": ["YES[S]*"],

    //prettier-ignore
    //moça
    "<:moca:1390104833092096091>": ["moça", "moca", "mulher", "puta", "foid", "vagabunda", "fudida", "ela", "cagona", "feia", "desgraçada", "vaca", "dela", "nela", "cadela", "cachorra", "loira", "bonita", "linda", "gostosa", "peituda", "bunduda", "magnifica", "estupida", "burra", "vadia", "merdalher", "bitch", "senhorita", "senhora", "prostituta", "diva", "perfeita", "divonica", "babilonica", "faraonica", "labubonica", "tesuda", "bucetuda", "piranha", "piranhuda", "woman", "she", "her", "hoe"],

    //prettier-ignore
    //moça
    "<:leyte:1392605726786191441>": ["dem", "leyte", "leite", "demencia", "dementia", "doida", "maluca", "psicopata", "duente", "doente", "louca", "milk",],

    //prettier-ignore
    //636
    "<:tres:1432852614986334384>": ["six three six", "seis tres seis", "636", "6[6]*6[3]*6[6]*", "seiscentos e trinta e seis"],
  };
  const texto = message.content
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // const palavrei = "carlos".split("");

  // if (palavrei.every((letra) => texto.includes(letra))) {
  //   message.react("<:carlos:1390110742971289632>");
  // }

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
  }
}
