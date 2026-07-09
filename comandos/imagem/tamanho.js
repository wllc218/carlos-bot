import sharp from "sharp";

export const name = "imagem";

export async function execute(message, args) {
  const attachment = message.attachments.first();
  if (!attachment) {
    await message.reply("MANDA UMA IMAGEM PORRA");
    return;
  }
  if (!args[1]) {
    await message.reply("MANDA A LARGURA E A ALTURA TBM EM ORDEM");
    return;
  }
  let tamanho = [Number(args[0]), Number(args[1])];
  const response = await fetch(attachment.url);
  const buffer = Buffer.from(await response.arrayBuffer());

  const imagemFinal = await sharp(buffer)
    .resize(tamanho[0], tamanho[1], { fit: "fill" })
    .png()
    .toBuffer();

  await message.reply({
    files: [
      {
        attachment: imagemFinal,
        name: "imagem.png",
      },
    ],
  });
}
