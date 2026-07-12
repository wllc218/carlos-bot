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

  // Função interna para processamento - Rápida e imune a erros de tamanho
  function processarVideo(
    msgProcessando,
    cronometroCarregando,
    tentativas = 0,
  ) {
    if (tentativas >= 5) {
      if (msgProcessando) {
        clearInterval(cronometroCarregando);
        msgProcessando.delete().catch(() => {});
      }
      return message.reply(
        "❌ Ocorreram erros ou frames inválidos seguidos ao tentar processar os vídeos.",
      );
    }

    const videoSorteado =
      todosOsVideos[Math.floor(Math.random() * todosOsVideos.length)];
    const linkVideo = videoSorteado.url;

    // Pega dados do JSON
    const fps = parseFloat(videoSorteado.fps);
    const duracao = parseFloat(videoSorteado.duracao);

    // Validação de segurança
    if (isNaN(fps) || isNaN(duracao)) {
      console.error(
        `[Aviso] O vídeo ${videoSorteado.nome} não possui 'fps' ou 'duracao' configurados no JSON.`,
      );
      return processarVideo(
        msgProcessando,
        cronometroCarregando,
        tentativas + 1,
      );
    }

    // Calcula o total de frames aproximados e sorteia um frame específico
    const totalDeFrames = Math.floor(duracao * fps);
    const frameSorteado = Math.floor(Math.random() * totalDeFrames);

    // Transforma o frame sorteado em segundos exatos
    const tempoEmSegundos = (frameSorteado / fps).toFixed(3);

    // OTIMIZAÇÃO MÁXIMA CORRIGIDA
    const ffmpegComando = `ffmpeg -y -threads 1 -noaccurate_seek -ss ${tempoEmSegundos} -probesize 150K -fflags +discardcorrupt -i "${linkVideo}" -vframes 1 -an -f image2pipe -vcodec mjpeg -`;

    // 3. EXTRAI O FRAME ESPECÍFICO NA MEMÓRIA RAM
    exec(
      ffmpegComando,
      {
        encoding: "buffer",
        maxBuffer: 1024 * 1024 * 60, // 60MB
        timeout: 12000, 
      },
      async (err2, stdoutBuffer, stderrBuffer) => {
        if (err2 || !stdoutBuffer || stdoutBuffer.length === 0) {
          console.error(`\n============ [ERRO IMPREVISTO NO FFmpeg] ============`);
          console.error(`Vídeo atual: ${videoSorteado.nome} (${linkVideo})`);
          console.error(`Tentativa: ${tentativas + 1}/5`);
          if (err2) console.error(`Detalhes do Erro do Node:`, err2.message);
          if (stderrBuffer && stderrBuffer.length > 0) {
            console.error(`Log do FFmpeg:\n${stderrBuffer.toString("utf8")}`);
          }
          console.error(`======================================================\n`);

          return processarVideo(
            msgProcessando,
            cronometroCarregando,
            tentativas + 1,
          );
        }

        try {
          // ANALISA SE O FRAME É PRETO/ESCURO ANTES DE CONTINUAR
          const stats = await sharp(stdoutBuffer).stats();
          const mediaBrilho = (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3;

          // CORRIGIDO: Agora avisa "FRAME PRETO" no chat e deleta o aviso depois de 3 segundos
          if (mediaBrilho < 25) {
            console.warn(`[Filtro Anti-Breu] Frame escuro detectado no vídeo "${videoSorteado.nome}".`);
            
            message.channel.send("⚠️ **FRAME PRETO** (Sorteando outro frame...)").then((m) => {
              setTimeout(() => m.delete().catch(() => {}), 3000);
            });

            return processarVideo(
              msgProcessando,
              cronometroCarregando,
              tentativas + 1,
            );
          }

          // Lendo as dimensões reais direto da RAM via Sharp
          const metadata = await sharp(stdoutBuffer).metadata();
          const larguraOriginal = metadata.width;
          const alturaOriginal = metadata.height;

          if (!larguraOriginal || !alturaOriginal) {
            throw new Error("Não foi possível ler as dimensões da imagem.");
          }

          // 4. CÁLCULO DO ZOOM ALEATÓRIO
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

          // 7. COLETOR DE MENSAGENS INDEFINIDO
          const filtroChat = (m) => !m.author.bot;
          const coletorChat = message.channel.createMessageCollector({
            filter: filtroChat,
          });

          coletorChat.on("collect", async (msgPretendente) => {
            const respostaUsuario = msgPretendente.content.trim().toLowerCase();
            const respostaCorreta = videoSorteado.categoriaNome.toLowerCase();

            // Resposta imediata se acertar
            if (respostaUsuario === respostaCorreta) {
              coletorChat.stop();

              // Pontuação para quem acertou
              const user = await User.findById(msgPretendente.author.id);
              if (user && user.vitorias) {
                user.vitorias.printGuess++;
                await user.save();
              }

              try {
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

            // Resposta imediata se errar
            if (
              categoriasDisponiveis
                .map((c) => c.toLowerCase())
                .includes(respostaUsuario)
            ) {
              msgPretendente.reply("❌ ERROU!").then((m) => {
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

// Helper para formatar a lista de categorias no chat
function ReduzirCategorias(lista) {
  return lista.map((cat) => `• **${cat}**`).join("\n");
}