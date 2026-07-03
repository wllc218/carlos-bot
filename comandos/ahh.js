export const name = "say";
export function execute(message, args) {
  if (!args.length) {
    return message.reply("Filho da puta.");
  }
  message.channel.send(args.join(" "));
}
