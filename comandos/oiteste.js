import User from "../server/schemas/user-schema.js";
export const name = "vitoria";
export async function execute(messaage) {
  const user = await User.findById(message.author.id);
  console.log(user.vitorias.dialogo);
}
