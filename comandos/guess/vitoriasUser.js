import User from "../../server/schemas/user-schema";
export const name = "vitoria";
export async function execute(message) {
  const user = await User.findById(message.author.id);
  message.reply(
    `**DIALOGUESSER** = ${user.vitorias.dialoguess}\n**PRINTGUESSER** = ${user.vitorias.printguess}`,
  );
}
