import User from "../../server/schemas/user-schema.js";
export const name = "vitoria";
export async function execute(message) {
  const oi = await User.findById(message.author.id);
  const user = oi.vitorias;
  message.reply(
    `**NUMEROGUESSER: **${user.numeroGuess}\n**DIALOGUESSER: **${user.dialoGuess}\n**PRINTGUESSER: **${user.printGuess}\n**TOTAL: **${Object.values(user).reduce((a, b) => a + b)}`,
  );
}
