import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../../data/videos.json" with { type: "json" };
import User from "../../server/schemas/user-schema.js";

export const name = "printguess";
export function execute(message) {
  // 1. MAPEIA AS CATEGORIAS E TRANSFORMA EM UMA LISTA ÚNICA DE VÍDEOS
  const categoriasDisponiveis = Object.keys(videos);
  const todosOsVideos = [];

  for (const categoria in videos) {
    if (Array.isArray(videos[categoria])) {
      const videosComCategoria = videos[categoria].map((video) => ({
        ...video,
        categoriaNome: categoria,
      }));
      todosOsVideos.push(...videosComCategoria);
    }
  }

  if (todosOsVideos.length === 0) {
    return message.reply("❌ Nenhum vídeo configurado no arquivo videos.json!");
  }

  // Função interna para processamento e tratamento de erros
  function processarVideo(msgProcessando, tentativas = 0) {
    if (tentativas >= 3) {
      if (msgProcessando) msgProcessando.delete().catch(() => {});
      return message.reply(
        "❌ Ocorreram erros seguidos ao tentar ler os vídeos na nuvem.",
      );
    }

    const videoSorteado =
      todosOsVideos[Math.floor(Math.random() * todosOsVideos.length)];
    const linkVideo = videoSorteado.url;

    // 2. BUSCA AS DIMENSÕES E DURAÇÃO REAL DO VÍDEO (FAST SEEKING)
    exec(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of default=noprint_wrappers=1:nokey=1 "${linkVideo}"`,
      { timeout: 45000 },
      (err, stdout) => {
        if (err) {
          console.error(
            `[Erro FFprobe] Falha ao ler o vídeo: ${videoSorteado.nome}. Tentando outro...`,
          );
          return processarVideo(msgProcessando, tentativas + 1);
        }

        const dados = stdout.trim().split("\n");
        const larguraOriginal = parseInt(dados[0]);
        const alturaOriginal = parseInt(dados[1]);
        const duracao = parseFloat(dados[2]);

        if (isNaN(larguraOriginal) || isNaN(alturaOriginal) || isNaN(duracao)) {
          return processarVideo(msgProcessando, tentativas + 1);
        }

        const tempo = Math.floor(Math.random() * duracao);
        const ffmpegComando = `ffmpeg -y -ss ${tempo} -i "${linkVideo}" -frames:v 1 -f image2pipe -vcodec png -`;

        // 3. EXTRAI O FRAME ORIGINAL NA MEMÓRIA RAM
        exec(
          ffmpegComando,
          { encoding: "buffer", maxBuffer: 1024 * 1024 * 20, timeout: 45000 },
          async (err2, stdoutBuffer) => {
            if (err2) {
              console.error(
                `[Erro FFMPEG] Falha ao extrair frame do vídeo: ${videoSorteado.nome}. Tentando outro...`,
              );
              return processarVideo(msgProcessando, tentativas + 1);
            }

            try {
              // 4. CÁLCULO DO ZOOM ALEATÓRIO (De 2/4 até zoom quase total de 4/4)
              const fatorZoom = 0.1 + Math.random() * 0.4;

              const larguraCorte = Math.floor(larguraOriginal * fatorZoom);
              const alturaCorte = Math.floor(alturaOriginal * fatorZoom);

              const xAleatorio = Math.floor(
                Math.random() * (larguraOriginal - larguraCorte),
              );
              const yAleatorio = Math.floor(
                Math.random() * (alturaOriginal - alturaCorte),
              );

              // 5. SHARP APLICA O RECORTE E ESTICA A IMAGEM NA RAM
              const imagemComZoomBuffer = await sharp(stdoutBuffer)
                .extract({
                  left: xAleatorio,
                  top: yAleatorio,
                  width: larguraCorte,
                  height: alturaCorte,
                })
                .resize(larguraOriginal, alturaOriginal)
                .toBuffer();

              const porcentagemZoom = Math.round((1 - fatorZoom) * 100);
              const listaCategoriasTexto = categoriasDisponiveis
                .map((cat) => `• **${cat}**`)
                .join("\n");

              // 6. ENVIA O DESAFIO NO CHAT
              await message.reply({
                content: `🎮 **DESAFIO PRINTGUESS**\nDe qual categoria é essa imagem com zoom?\n\n**Categorias Disponíveis:**\n${listaCategoriasTexto}\n\n• Intensidade do Zoom: ~**${porcentagemZoom}%**\n\n✍️ *Digite o nome correto da categoria no chat para vencer!*`,
                files: [
                  {
                    attachment: imagemComZoomBuffer,
                    name: "desafio_zoom.png",
                  },
                ],
              });

              if (msgProcessando) msgProcessando.delete().catch(() => {});

              // 7. COLETOR DE MENSAGENS INDEFINIDO (Roda até alguém acertar)
              const filtroChat = (m) => !m.author.bot;
              const coletorChat = message.channel.createMessageCollector({
                filter: filtroChat,
              });

              coletorChat.on("collect", async (msgPretendente) => {
                const respostaUsuario = msgPretendente.content
                  .trim()
                  .toLowerCase();
                const respostaCorreta =
                  videoSorteado.categoriaNome.toLowerCase();

                // VITORIAAAAAAAAAA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // Resposta imediata se acertar
                if (respostaUsuario === respostaCorreta) {
                  coletorChat.stop();
                  const user = await User.findById(message.author.id);
                  user.vitorias.print++;
                  await user.save();

                  return message.channel.send(
                    `🎉 **PARABÉNS!** <@${msgPretendente.author.id}> acertou em cheio!\n• Categoria: **${videoSorteado.categoriaNome}**\n• Vídeo original: **${videoSorteado.nome}**\n• Segundo exato: **${tempo}s**`,
                  );
                }

                // Resposta imediata se errar (apenas se o chute for uma das categorias válidas do jogo)
                if (
                  categoriasDisponiveis
                    .map((c) => c.toLowerCase())
                    .includes(respostaUsuario)
                ) {
                  msgPretendente
                    .reply("❌ Resposta incorreta! Continue tentando...")
                    .then((m) => {
                      setTimeout(() => m.delete().catch(() => {}), 2500);
                    });
                }
              });
            } catch (errSharp) {
              console.error("[Erro Sharp] Falha ao aplicar zoom:", errSharp);
              return processarVideo(msgProcessando, tentativas + 1);
            }
          },
        );
      },
    );
  }

  message.channel
    .send("🔄 Puxando o vídeo da nuvem e aplicando o efeito de zoom extremo...")
    .then((msgProcessando) => {
      processarVideo(msgProcessando);
    })
    .catch(console.error);
}
