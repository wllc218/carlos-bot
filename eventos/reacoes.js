const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;

    const reacoes = {
      //nicolas
      //prettier-ignore
      "<:rob:1390110593721040966>": ["nicolas","rob","robique","negro","nigga","nigger","preto","4","quatro","Four","negros",
        ],

      //prettier-ignore
      //lucas
      "<:Lucas:1390114953582870833>": ["lucas","prjooj","luque","3","três","three","branco","branca","white",
        ],

      //prettier-ignore
      //wallace
      "<:wallace:1390110948127146086>": ["wallace","walface","cabeça","2","dois","two","cearense","gay",
        ],

      //carlos
      //prettier-ignore
      "<:carlos:1390110742971289632>": ["carlos","deyvid","1","um","one","sapo","perereca","barros","cabos","vitor","de jesus","cagao",
        ],

      //theo
      //prettier-ignore
      "<:theo:1390110538993766421>": ["theo"],

      //menuina
      //prettier-ignore
      "<:vocejaviuessameniuna:1415817551333818550>": ["nos","agente","vamos","a gente","vamo","gente","iremos","somos","nossas","5","cinco","five","menuina","menina","voce ja viu","voces ja viram","olho","olhos",
        ],

      //regina
      //prettier-ignore
      "<:vagina:1390109875089965228>": ["regina", "vagina", "GO GO GO GO", "buceta", "prikito", "prikituda"],

      //Sonic. exe
      //prettier-ignore
      "<:oie:1497972408391434462>": ["eles", "elas", "TA[A]*KE THA[A]*T","LETS DO THIS","YES","HAH[AH]*","TAKE","CAPUHA","PAPUHA","PREPARE FOR","NIGGARLAS","Sonic. exe","niggalas","Sonic","TA[A]*KE THI[I]*S[S]*",
        ],

      //sonic.exe
      //prettier-ignore
      "<:dsd:1505684509591339208>": ["HAH[AH]*"],

      //bosta
      //prettier-ignore
      "<:oi:1390108899863957747>": ["bosta","bosta","bostas","bostinha","bostinhas","bostola","bostolas","bostão","bostoes","bostões","embostado","embostada","bostear","bostejar","bostejando","bostejo","bostuda","bostudo","merda","merdas","merdinha","merdola","caguei","cagando","cagou","cagar",
        ],

      //sisycus
      "<:sisycus:1481109255355367455>": ["YES[S]*"],

      //prettier-ignore
      //moça
      "<:moca:1390104833092096091>" : ["moça", "moca", "mulher", "puta", "foid", "vagabunda", "fudida", "ela", "cagona", "feia", "desgraçada", "vaca", "dela", "nela", "cadela", "cachorra", "loira", "bonita", "linda", "gostosa", "peituda", "bunduda", "magnifica", "estupida", "burra", "vadia"],
    };

    const texto = message.content
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

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
  },
};
