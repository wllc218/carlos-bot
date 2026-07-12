import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../../data/videos.json" with { type: "json" };
import User from "../../server/schemas/user-schema.js";

export const name = "printguess";
export function execute(message, args) {
  // 1. DETERMINA O MODO DO JOGO (NORMAL POR PADRÃO, MODIFICADO SE DIGITAR 'modif')
  // Exemplo de uso no Discord: !printguess modif ou !printguess norm
  let modoJogo = "normal"; 
  if (args && args[0]) {
    const parametro = args[0].toLowerCase();
    if (parametro === "modif") modoJogo = "modificado";
    if (parametro === "norm") modoJogo = "normal";
  }

  // 2. MAPEIA AS CATEGORIAS E TRANSFORMA EM UMA LISTA ÚNICA DE VÍDEOS
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

    const fps = parseFloat(videoSorteado.fps);
    const duracao = parseFloat(videoSorteado.duracao);

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

    const totalDeFrames = Math.floor(duracao * fps);
    const frameSorteado = Math.floor(Math.random() * totalDeFrames);
    const tempoEmSegundos = (frameSorteado / fps).toFixed(3);

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
          return processarVideo(
            msgProcessando,
            cronometroCarregando,
            tentativas + 1,
          );
        }

        try {
          // ANALISA SE O FRAME É VÁLIDO (NÃO PRETO E NÃO BRANCO)
          const stats = await sharp(stdoutBuffer).stats();
          const mediaBrilho = (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3;

          if (mediaBrilho < 25 || mediaBrilho > 230) {
            const tipoFrame = mediaBrilho < 25 ? "PRETO" : "BRANCO";
            console.warn(`[Filtro de Qualidade] Frame ${tipoFrame} detectado no vídeo "${videoSorteado.nome}".`);
            
            message.channel.send(`⚠️ **FRAME ${tipoFrame}** (Sorteando outro frame...)`).then((m) => {
              setTimeout(() => m.delete().catch(() => {}), 3000);
            });

            return processarVideo(
              msgProcessando,
              cronometroCarregando,
              tentativas + 1,
            );
          }

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

          const xAleatorio = Math.floor(Math.random() * (larguraOriginal - larguraCorte));
          const yAleatorio = Math.floor(Math.random() * (alturaOriginal - alturaCorte));

          // 5. BANCO DE MODIFICAÇÕES (SÓ SÃO USADAS NO MODO MODIFICADO)
          const listaModificacoes = [
            { nome: "⚫ Monocromático (Preto e Branco Extremo)", aplicar: (img) => img.grayscale().linear(1.3, -20) },
            { nome: "🧪 Cores Negativas (Invertidas)", aplicar: (img) => img.negate() },
            { nome: "💧 Super Desfocado / Embaçado (Blur Máximo)", aplicar: (img) => img.blur(22) },
            { 
              nome: "🎨 Efeito Abstrato / Pintura Pesada", 
              aplicar: (img, largCorte) => img.median(Math.max(15, Math.floor((largCorte || larguraCorte) * 0.08))) 
            },
            { 
              nome: "👾 Ultra Pixelado (Mosaico 8-Bit)", 
              aplicar: (img, largCorte, altCorte, largOrig, altOrig) => {
                const lc = largCorte || larguraCorte;
                const ac = altCorte || alturaCorte;
                const lo = largOrig || larguraOriginal;
                const ao = altOrig || alturaOriginal;
                
                const larguraGrade = lc === lo ? 8 : 16;
                const alturaGrade = Math.floor(larguraGrade * (ac / lc));
                return img
                  .resize(larguraGrade, alturaGrade, { kernel: 'nearest' })
                  .resize(lo, ao, { kernel: 'nearest' });
              }
            },
            { nome: "📺 Monitor CRT Corrompido (Cores Distorcidas)", aplicar: (img) => img.linear(2.2, -120) },
            { nome: "🎭 Contraste Extremo / Sombras Psicotrópicas", aplicar: (img) => img.gamma(0.5).linear(2.0, -90) },
            { nome: "☀️ Efeito Solarização / Radiação de Luz", aplicar: (img) => img.negate({ alpha: false }).linear(1.8, -30) }
          ];

          // Sorteia um efeito caso o modo seja modificado
          let modificacaoEscolhida = { nome: "Nenhum (Padrão)", aplicar: (img) => img };
          if (modoJogo === "modificado") {
            modificacaoEscolhida = listaModificacoes[Math.floor(Math.random() * listaModificacoes.length)];
          }

          // Instancia o corte inicial para o desafio
          let pipelineSharp = sharp(stdoutBuffer)
            .extract({
              left: xAleatorio,
              top: yAleatorio,
              width: larguraCorte,
              height: alturaCorte,
            });

          // APLICAÇÃO CIRÚRGICA DOS FILTROS E REDIMENSIONAMENTO NO CORTE
          if (modificacaoEscolhida.nome === "👾 Ultra Pixelado (Mosaico 8-Bit)") {
            pipelineSharp = modificacaoEscolhida.aplicar(pipelineSharp, larguraCorte, alturaCorte, larguraOriginal, alturaOriginal);
          } else {
            pipelineSharp = modificacaoEscolhida.aplicar(pipelineSharp, larguraCorte);
            pipelineSharp = pipelineSharp.resize(larguraOriginal, alturaOriginal);
          }

          const imagemComZoomBuffer = await pipelineSharp.toBuffer();
          const listaCategoriasTexto = ReduzirCategorias(categoriasDisponiveis);

          // 6. ENVIA O DESAFIO NO CHAT
          await message.reply({
            content: `🎮 **DESAFIO GAMER (${modoJogo.toUpperCase()})**\nQUAL O VÍDEO DA PRINT? DÊ O SEU PALPITE!\n\n✨ **Modificação desta rodada:** ${modificacaoEscolhida.nome}\n\n\n\n`,
            files: [
              {
                attachment: imagemComZoomBuffer,
                name: "desafio_zoom.png",
              },
            ],
          });

          if (msgProcessando) {
            clearInterval(cronometroCarregando);
            msgProcessando.delete().catch(() => {});
          }

          // 7. COLETOR DE MENSAGENS INDEFINIDO
          const filtroChat = (m) => !m.author.bot;
          const coletorChat = message.channel.createMessageCollector({ filter: filtroChat });

          coletorChat.on("collect", async (msgPretendente) => {
            const respostaUsuario = msgPretendente.content.trim().toLowerCase();
            const respostaCorreta = videoSorteado.categoriaNome.toLowerCase();

            if (respostaUsuario === respostaCorreta) {
              coletorChat.stop();

              const user = await User.findById(msgPretendente.author.id);
              if (user && user.vitorias) {
                user.vitorias.printGuess++;
                await user.save();
              }

              try {
                let imagemOriginalBuffer;

                // SE FOR MODIFICADO, RENDERIZA A IMAGEM COMPLETA COM O FILTRO APLICADO
                if (modoJogo === "modificado") {
                  let pipelineFinal = sharp(stdoutBuffer);

                  if (modificacaoEscolhida.nome === "👾 Ultra Pixelado (Mosaico 8-Bit)") {
                    // No caso do pixelado completo, passamos as dimensões originais como se fossem o "corte" para estourar tudo de forma macro
                    imagemOriginalBuffer = await modificacaoEscolhida.aplicar(
                      pipelineFinal, 
                      larguraOriginal, 
                      alturaOriginal, 
                      larguraOriginal, 
                      alturaOriginal
                    ).toBuffer();
                  } else {
                    // Para os outros filtros, aplica e garante o tamanho final
                    pipelineFinal = modificacaoEscolhida.aplicar(pipelineFinal, larguraOriginal);
                    imagemOriginalBuffer = await pipelineFinal.resize(larguraOriginal, alturaOriginal).toBuffer();
                  }
                } else {
                  // MODO NORMAL: Envia a imagem limpa e original
                  imagemOriginalBuffer = await sharp(stdoutBuffer).toBuffer();
                }

                return message.channel.send({
                  content: `🎉 **PARABÉNS!** <@${msgPretendente.author.id}> \n• Categoria: **${videoSorteado.categoriaNome}**\n• Vídeo original: **${videoSorteado.nome}**\n• Frame exato: **#${frameSorteado}**`,
                  files: [
                    {
                      attachment: imagemOriginalBuffer,
                      name: modoJogo === "modificado" ? "resposta_modificada.png" : "resposta_original.png",
                    },
                  ],
                });
              } catch (errResposta) {
                console.error("[Erro Sharp] Falha ao gerar imagem de resposta:", errResposta);
                return message.channel.send(
                  `🎉 **PARABÉNS!** <@${msgPretendente.author.id}> \n• Categoria: **${videoSorteado.categoriaNome}**\n• Vídeo original: **${videoSorteado.nome}**\n• Frame exato: **#${frameSorteado}**`,
                );
              }
            }

            if (categoriasDisponiveis.map((c) => c.toLowerCase()).includes(respostaUsuario)) {
              msgPretendente.reply("❌ ERROU!").then((m) => {
                setTimeout(() => m.delete().catch(() => {}), 2500);
              });
            }
          });
        } catch (errSharp) {
          console.error("[Erro Sharp] Falha ao aplicar filtros/zoom:", errSharp);
          return processarVideo(msgProcessando, cronometroCarregando, tentativas + 1);
        }
      },
    );
  }

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