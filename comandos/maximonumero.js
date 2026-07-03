let maximo = 999;
export default {
  get maximo() {
    return maximo;
  },
  name: "maxnum",
  execute(message, args) {
    if (args.length === 0) {
      message.reply(`O MÁXIMO É ${maximo}`);
      return;
    }
    if (!isNaN(args[0]) && parseInt(args[0]) > 0) {
      maximo = parseInt(args[0]);
      message.reply(`AGORA O MÁXIMO É **${maximo}**`);
    } else {
      message.reply("ESCREVE UM NUMERO Q FUNCIONE BURROO");
    }
  },
};
