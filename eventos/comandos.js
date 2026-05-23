module.exports = {
  name: "messageCreate",

  execute(message, client) {

    if (message.author.bot) return;

    const prefix = "C!";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/);

    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      command.execute(message, args);
    } catch (error) {

      console.error(error);

      message.reply(
        "SEU BURRO SMT VC ERROU OLHA AI NOQ VC ERROU E TENTA DNV: " + error
      );
    }
  }
};