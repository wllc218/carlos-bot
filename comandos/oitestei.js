import User from "../server/schemas/user-schema.js";

export const name = "testei";
export async function execute(message) {
  const id = message.author.id;
  const resultado = await User.findById(id);

  if (!resultado) {
    message.reply("n deu");
    return;
  }
  message.reply(
    `OLÁ. <@${resultado._id}> VOCE MANDOU ${resultado.messageCount.toString()} MENSAGENS.`,
  );
}
