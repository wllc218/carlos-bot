import User from "../../server/schemas/user-schema.js";
export const name = "vitoria";
export async function execute(message) {
  const user = await User.findById(message.author.id);
  message.reply(
    `**DIALOGUESSER** = ${user.vitorias.dialoGuess}\n**PRINTGUESSER** = ${user.vitorias.printGuess}\n**NUMEROGUESSER** = ${user.vitorias.numeroGuess}`,
  );
}
