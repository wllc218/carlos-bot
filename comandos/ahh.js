export const name = "say";
export function execute(message, args) {
  if (!args.length) {
    return message.reply("diz alguma coisa");
  }
  message.channel.send(args.join(" "));
}
