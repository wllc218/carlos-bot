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

  // Função interna para processamento - Recebe corretamente o cronômetro como segundo parâmetro
  function processarVideo(
    msgProcessando,
    cronometroCarregando,
    tentativas = 0,
  ) {
    if (tentativas >= 3) {
      if (msgProcessando) {
        clearInterval(cronometroCarregando);
        msgProcessando.delete().catch(() => {});
      }
      return message.reply(
        "❌ Ocorreram erros seguidos ao tentar ler os vídeos na nuvem.",
      );
    }

    const videoSorteado =
      todosOsVideos[Math.floor(Math.random() * todosOsVideos.length)];
    const linkVideo = videoSorteado.url;

    // 2. BUSCA AS DIMENSÕES, DURAÇÃO REAL E TAXA DE FRAMES (FPS) DO VÍDEO
    // CORREÇÃO: Removidas as flags de buffer que quebravam a leitura da nuvem e adicionado stderr
    exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate:format=duration -of default=noprint_wrappers=1:nokey=1 "${linkVideo}"`, { timeout: 12000 }, (err, stdout, stderr) => {
        if (err) {
          console.error(
            `[Erro FFprobe] Falha ao ler o vídeo: ${videoSorteado.nome}. Tentando outro... | Detalhes:`,
            err.message,
            stderr ? stderr.toString() : ""
          );
          return processarVideo(
            msgProcessando,
            cronometroCarregando,
            tentativas + 1,
          );
        }

        const dados = stdout.trim().split("\n");
        const larguraOriginal = parseInt(dados[0]);
        const alturaOriginal = parseInt(dados[1]);

        // Tratamento da taxa de frames (r_frame_rate vem em formato de fração, ex: "30/1" ou "60000/1001")
        const expressaoFps = dados[2].split("/");
        const fps = parseFloat(expressaoFps[0]) / parseFloat(expressaoFps[1]);
        const duracao = parseFloat(dados[3]);

        if (
          isNaN(larguraOriginal) ||
          isNaN(alturaOriginal) ||
          isNaN(fps) ||
          isNaN(duracao)
        ) {
          return processarVideo(
            msgProcessando,
            cronometroCarregando,
            tentativas + 1,
          );
        }

        // Calcula o total de frames aproximados do vídeo e sorteia um frame específico
        const totalDeFrames = Math.floor(duracao * fps);
        const frameSorteado = Math.floor(Math.random() * totalDeFrames);

        // Transforma o frame sorteado em segundos exatos para busca veloz via Fast Seeking (-ss)
        const tempoEmSegundos = (frameSorteado / fps).toFixed(3);

        // FORMATO ATUALIZADO: 'mjpeg' para compatibilidade total com buffers no Windows
        const ffmpegComando = `ffmpeg -y -ss ${tempoEmSegundos} -i "${linkVideo}" -frames:v 1 -an -f image2pipe -vcodec mjpeg -`;

        // 3. EXTRAI O FRAME ESPECÍFICO NA MEMÓRIA RAM
        exec(
          ffmpegComando,
          { encoding: "buffer", maxBuffer: 1024 * 1024 * 30, timeout: 9000 },
          async (err2, stdoutBuffer) => {
            if (err2) {
              console.error(
                `[Erro FFMPEG] Falha ao extrair frame do vídeo: ${videoSorteado.nome}. Tentando outro...`,
              );
              return processarVideo(
                msgProcessando,
                cronometroCarregando,
                tentativas + 1,
              );
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
              const listaCategoriasTexto = ReduzirCategorias(categoriasDisponiveis);

              // 6. ENVIA O DESAFIO NO CHAT
              await message.reply({
                content: `🎮 **DESAFIO GAMER**\nQUAL O VÍDEO DA PRINT? DÊ O SEU PALPITE!\n\n**CATEGORIAS:**\n${listaCategoriasTexto}\n\n`,
                files: [
                  {
                    attachment: imagemComZoomBuffer,
                    name: "desafio_zoom.png",
                  },
                ],
              });

              // Limpa o intervalo e apaga a mensagem de carregamento
              if (msgProcessando) {
                clearInterval(cronometroCarregando);
                msgProcessando.delete().catch(() => {});
              }

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

                // Resposta imediata se acertar
                if (respostaUsuario === respostaCorreta) {
                  coletorChat.stop();
                  
                  // CORREÇÃO: Pontuação vai para quem acertou (msgPretendente) usando a propriedade correta
                  const user = await User.findById(msgPretendente.author.id);
                  if (user && user.vitorias) {
                    user.vitorias.printGuess++;
                    await user.save();
                  }

                  try {
                    // Gera a imagem original (sem zoom) aproveitando o buffer que já está na RAM
                    const imagemOriginalBuffer =
                      await sharp(stdoutBuffer).toBuffer();

                    return message.channel.send({
                      content: `🎉 **PARABÉNS!** <@${msgPretendente.author.id}> \n• Categoria: **${videoSorteado.categoriaNome}**\n• Vídeo original: **${videoSorteado.nome}**\n• Frame exato: **#${frameSorteado}**`,
                      files: [
                        {
                          attachment: imagemOriginalBuffer,
                          name: "resposta_original.png",
                        },
                      ],
                    });
                  } catch (errResposta) {
                    console.error(
                      "[Erro Sharp] Falha ao gerar imagem de resposta:",
                      errResposta,
                    );
                    return message.channel.send(
                      `🎉 **PARABÉNS!** <@${msgPretendente.author.id}> \n• Categoria: **${videoSorteado.categoriaNome}**\n• Vídeo original: **${videoSorteado.nome}**\n• Frame exato: **#${frameSorteado}**`,
                    );
                  }
                }

                // Resposta imediata se errar (apenas se o chute for uma das categorias válidas do jogo)
                if (
                  categoriasDisponiveis
                    .map((c) => c.toLowerCase())
                    .includes(respostaUsuario)
                ) {
                  msgPretendente
                    .reply("❌ ERROU!")
                    .then((m) => {
                      setTimeout(() => m.delete().catch(() => {}), 2500);
                    });
                }
              });
            } catch (errSharp) {
              console.error("[Erro Sharp] Falha ao aplicar zoom:", errSharp);
              return processarVideo(
                msgProcessando,
                cronometroCarregando,
                tentativas + 1,
              );
            }
          },
        );
      },
    );
  }

  // Envia a mensagem inicial de carregamento
  message.channel
    .send("🔄 CARGANDO .")
    .then((msgProcessando) => {
      let pontos = 1;

      const cronometroCarregando = setInterval(async () => {
        pontos++;
        const sufixoPontos = " .".repeat(pontos);

        await msgProcessando.edit(`🔄 CARGANDO${sufixoPontos}`).catch(() => {});
      }, 1000);

      processarVideo(msgProcessando, cronometroCarregando);
    })
    .catch(console.error);
}

function ReduzirCategorias(lista) {
  return lista.map((cat) => `• **${cat}**`).join("\n");
}