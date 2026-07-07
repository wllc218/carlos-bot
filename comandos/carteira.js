import User from "../server/schemas/user-schema.js";

export const name = "carteira";
export async function execute(message) {
  const id = message.author.id;
  const dinheiroQuantia = await User.findById(id);
  message.reply(`vc tem ${dinheiroQuantia.cash.toString()} reais parabens`);
}
