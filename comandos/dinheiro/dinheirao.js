import User from "../../server/schemas/user-schema.js";

export const name = "dinheirao";
export async function execute(message) {
  const dinheiro = Math.floor(Math.random() * 100 + 1);
  await User.findOneAndUpdate(
    { _id: message.author.id },
    { $inc: { cash: dinheiro } },
    { upsert: true },
  );

  message.reply(`VC GANHOU ${dinheiro} CARALHINHOS.`);
}
