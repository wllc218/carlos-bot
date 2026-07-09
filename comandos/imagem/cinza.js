import sharp from "sharp";

export const name = "cinza";

export async function execute(message) {
  const attachment = message.attachments.first();
  if (!attachment) {
    await message.reply("MANDA UMA IMAGEM PORRA");
    return;
  }

  const response = await fetch(attachment.url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const imagemFinal = await sharp(buffer).grayscale().png().toBuffer();
  await message.reply({
    files: [
      {
        attachment: imagemFinal,
        name: "imagem.png",
      },
    ],
  });
}
