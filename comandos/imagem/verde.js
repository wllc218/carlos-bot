import sharp from "sharp";

export const name = "verde";

export async function execute(message) {
  const attachment = message.attachments.first();
  if (!attachment) {
    await message.reply("MANDA UMA IMAGEM PORRA");
    return;
  }

  const response = await fetch(attachment.url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const imagemFinal = await sharp(buffer)
    .tint({ r: 0, g: 255, b: 0 })
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
