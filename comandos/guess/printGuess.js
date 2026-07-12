import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../../data/videos.json" with { type: "json" };
import User from "../../server/schemas/user-schema.js";

export const name = "printguess";
export function execute(message, args) {
  // 1. DICIONÁRIO DE ATALHOS PARA FORÇAR FILTROS ESPECÍFICOS NO CHAT
  const mapaFiltros = {
    pixel: "👾 Ultra Pixelado (Mosaico 8-Bit)",
    blur: "💧 Super Desfocado / Embaçado (Blur Máximo)",
    pintura: "🎨 Efeito Abstrato / Pintura Pesada",
    crt: "📺 Monitor CRT Corrompido (Cores Distorcidas)",
    contraste: "🎭 Contraste Extremo / Sombras Psicotrópicas",
    solar: "☀️ Efeito Solarização / Radiação de Luz",
    pb: "⚫ Monocromático (Preto e Branco Extremo)",
    negativo: "🧪 Cores Negativas (Invertidas)",
    termica: "🩻 Câmera Térmica (Efeito Predador)",
    bordas: "🔲 Detector de Bordas Pesado (Estilo Neon / Sobel)",
    quadrinhos: "🗯️ Efeito Quadrinhos / Retícula (Halftone Pop Art)",
    vidro: "🪟 Efeito Vidro Canelado (Textura de Vitral)",
    matrix: "🟢 Terminal de Comando Retro (Efeito Matrix)",
    glitch: "💥 Efeito Glitch (Blocos Desalinhados de Compressão)"
  };

  let modoJogo = "normal";
  let filtroForcado = null;

  if (args && args[0]) {
    const parametro = args[0].toLowerCase();
    
    if (parametro === "modif") {
      modoJogo = "modificado";
    } else if (mapaFiltros[parametro]) {
      modoJogo = "modificado";
      filtroForcado = mapaFiltros[parametro]; // Captura o filtro exato para testes
    } else if (parametro === "norm") {
      modoJogo = "normal";
    }
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

  // Função interna para processamento
  function processarVideo(msgProcessando, cronometroCarregando, tentativas = 0) {
    if (tentativas >= 5) {
      if (msgProcessando) {
        clearInterval(cronometroCarregando);
        msgProcessando.delete().catch(() => {});
      }
      return message.reply("❌ Ocorreram erros ou frames inválidos seguidos ao tentar processar os vídeos.");
    }

    const videoSorteado = todosOsVideos[Math.floor(Math.random() * todosOsVideos.length)];
    const linkVideo = videoSorteado.url;

    const fps = parseFloat(videoSorteado.fps);
    const duracao = parseFloat(videoSorteado.duracao);

    if (isNaN(fps) || isNaN(duracao)) {
      console.error(`[Aviso] O vídeo ${videoSorteado.nome} não possui 'fps' ou 'duracao' configurados no JSON.`);
      return processarVideo(msgProcessando, cronometroCarregando, tentativas + 1);
    }

    const totalDeFrames = Math.floor(duracao * fps);
    const frameSorteado = Math.floor(Math.random() * totalDeFrames);
    const tempoEmSegundos = (frameSorteado / fps).toFixed(3);

    const ffmpegComando = `ffmpeg -y -threads 1 -noaccurate_seek -ss ${tempoEmSegundos} -probesize 150K -fflags +discardcorrupt -i "${linkVideo}" -vframes 1 -an -f image2pipe -vcodec mjpeg -`;

    // 3. EXTRAI O FRAME ESPECÍFICO NA MEMÓRIA RAM
    exec(
      ffmpegComando,
      { encoding: "buffer", maxBuffer: 1024 * 1024 * 60, timeout: 12000 },
      async (err2, stdoutBuffer, stderrBuffer) => {
        if (err2 || !stdoutBuffer || stdoutBuffer.length === 0) {
          return processarVideo(msgProcessando, cronometroCarregando, tentativas + 1);
        }

        try {
          // ANALISA SE O FRAME É VÁLIDO (NÃO PRETO E NÃO BRANCO)
          const stats = await sharp(stdoutBuffer).stats();
          const mediaBrilho = (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3;

          if (mediaBrilho < 25 || mediaBrilho > 230) {
            return processarVideo(msgProcessando, cronometroCarregando, tentativas + 1);
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

          // 5. BANCO DE MODIFICAÇÕES COMPLETO (PADRÕES + NOVOS INSANOS)
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
                const alturaGrade = Math.max(1, Math.floor(larguraGrade * (ac / lc)));
                return img
                  .resize(larguraGrade, alturaGrade, { kernel: 'nearest' })
                  .resize(lo, ao, { kernel: 'nearest' });
              }
            },
            { nome: "📺 Monitor CRT Corrompido (Cores Distorcidas)", aplicar: (img) => img.linear(2.2, -120) },
            { nome: "🎭 Contraste Extremo / Sombras Psicotrópicas", aplicar: (img) => img.gamma(0.5).linear(2.0, -90) },
            { nome: "☀️ Efeito Solarização / Radiação de Luz", aplicar: (img) => img.negate({ alpha: false }).linear(1.8, -30) },
            {
              nome: "🩻 Câmera Térmica (Efeito Predador)",
              aplicar: async (img) => {
                const cinza = await img.grayscale().toBuffer();
                return sharp(cinza).linear(1.5, -30).recomb([
                  [0.2, 0.8, -0.3], [1.0, -0.4, 0.2], [-0.5, 0.6, 0.7]
                ]);
              }
            },
            {
              nome: "🔲 Detector de Bordas Pesado (Estilo Neon / Sobel)",
              aplicar: (img) => {
                return img.grayscale().convolute({
                  width: 3, height: 3,
                  kernel: [-1, -2, -1, 0, 0, 0, 1, 2, 1]
                }).linear(4.0, 0).negate({ alpha: false });
              }
            },
            {
              nome: "🗯️ Efeito Quadrinhos / Retícula (Halftone Pop Art)",
              aplicar: async (img, largCorte) => {
                const lc = largCorte || 300;
                const svgPontos = `<svg width="${lc}" height="${lc}"><pattern id="pontos" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="3.5" fill="black" /></pattern><rect width="100%" height="100%" fill="url(#pontos)" opacity="0.45" /></svg>`;
                return img.gamma(0.4).linear(1.8, -40).composite([{ input: Buffer.from(svgPontos), blend: "atop" }]);
              }
            },
            {
              nome: "🪟 Efeito Vidro Canelado (Textura de Vitral)",
              aplicar: (img, largCorte) => {
                const lc = largCorte || 300;
                const microLargura = Math.max(8, Math.floor(lc * 0.04));
                return img.resize(microLargura, null, { kernel: 'nearest' }).resize(larguraOriginal, alturaOriginal, { kernel: 'lanczos3' }).blur(2);
              }
            },
            {
              nome: "🟢 Terminal de Comando Retro (Efeito Matrix)",
              aplicar: async (img) => {
                const canalVerde = await img.extractChannel('green').toBuffer();
                return sharp(canalVerde).linear(2.5, -80).toColorspace('srgb').recomb([
                  [0, 0, 0], [0, 1, 0], [0, 0, 0]
                ]);
              }
            },
            {
              nome: "💥 Efeito Glitch (Blocos Desalinhados de Compressão)",
              aplicar: async (img, largCorte, altCorte) => {
                const lc = largCorte || larguraCorte;
                const ac = altCorte || alturaCorte;
                const bufferOriginal = await img.toBuffer();
                const alturaFaixa = Math.floor(ac * 0.12);
                const yFaixa1 = Math.floor(ac * 0.25);
                const yFaixa2 = Math.floor(ac * 0.65);
                try {
                  const faixa1 = await sharp(bufferOriginal).extract({ left: 0, top: yFaixa1, width: lc, height: alturaFaixa }).toBuffer();
                  const faixa2 = await sharp(bufferOriginal).extract({ left: 0, top: yFaixa2, width: lc, height: alturaFaixa }).toBuffer();
                  return sharp(bufferOriginal).composite([
                    { input: faixa1, top: yFaixa1, left: Math.floor(lc * 0.08), blend: "over" },
                    { input: faixa2, top: yFaixa2, left: -Math.floor(lc * 0.08), blend: "over" }
                  ]);
                } catch {
                  return sharp(bufferOriginal).linear(1.2, -10);
                }
              }
            }
          ];

          // 6. SELEÇÃO DO FILTRO (ALEATÓRIO OU FORÇADO PARA TESTES)
          let modificacaoEscolhida = { nome: "Nenhum (Padrão)", aplicar: (img) => img };
          
          if (modoJogo === "modificado") {
            if (filtroForcado) {
              modificacaoEscolhida = listaModificacoes.find(m => m.nome === filtroForcado);
            } else {
              modificacaoEscolhida = listaModificacoes[Math.floor(Math.random() * listaModificacoes.length)];
            }
          }

          // Instancia o corte inicial para o desafio
          let pipelineSharp = sharp(stdoutBuffer)
            .extract({ left: xAleatorio, top: yAleatorio, width: larguraCorte, height: alturaCorte });

          // Aplicação e redimensionamento estruturado no corte
          if (modificacaoEscolhida.nome === "👾 Ultra Pixelado (Mosaico 8-Bit)") {
            pipelineSharp = modificacaoEscolhida.aplicar(pipelineSharp, larguraCorte, alturaCorte, larguraOriginal, alturaOriginal);
          } else if (modificacaoEscolhida.nome === "🪟 Efeito Vidro Canelado (Textura de Vitral)") {
            pipelineSharp = modificacaoEscolhida.aplicar(pipelineSharp, larguraCorte);
          } else {
            const resMod = modificacaoEscolhida.aplicar(pipelineSharp, larguraCorte, alturaCorte, larguraOriginal, alturaOriginal);
            pipelineSharp = (resMod instanceof Promise ? await resMod : resMod);
            // Garante o redimensionamento final se o filtro já não tiver tratado as dimensões nativamente
            const metaAtual = await pipelineSharp.metadata();
            if (metaAtual.width !== larguraOriginal || metaAtual.height !== alturaOriginal) {
              pipelineSharp = pipelineSharp.resize(larguraOriginal, alturaOriginal);
            }
          }

          const imagemComZoomBuffer = await pipelineSharp.toBuffer();
          const listaCategoriasTexto = ReduzirCategorias(categoriasDisponiveis);

          // Envia o desafio no chat do Discord
          await message.reply({
            content: `🎮 **DESAFIO GAMER (${modoJogo.toUpperCase()})**\nQUAL O VÍDEO DA PRINT? DÊ O SEU PALPITE!\n\n✨ **Modificação desta rodada:** ${modificacaoEscolhida.nome}\n\n**CATEGORIAS:**\n${listaCategoriasTexto}\n\n`,
            files: [{ attachment: imagemComZoomBuffer, name: "desafio_zoom.png" }],
          });

          if (msgProcessando) {
            clearInterval(cronometroCarregando);
            msgProcessando.delete().catch(() => {});
          }

          // Helper robusto para gerar a imagem final na revelação (Reaplica efeitos na escala macro se modificado)
          async function gerarImagemResposta() {
            if (modoJogo === "modificado") {
              let pipelineFinal = sharp(stdoutBuffer);
              if (modificacaoEscolhida.nome === "👾 Ultra Pixelado (Mosaico 8-Bit)") {
                return await modificacaoEscolhida.aplicar(pipelineFinal, larguraOriginal, alturaOriginal, larguraOriginal, alturaOriginal).toBuffer();
              } else if (modificacaoEscolhida.nome === "🪟 Efeito Vidro Canelado (Textura de Vitral)") {
                return await modificacaoEscolhida.aplicar(pipelineFinal, larguraOriginal).toBuffer();
              } else {
                const resFinal = modificacaoEscolhida.aplicar(pipelineFinal, larguraOriginal, alturaOriginal, larguraOriginal, alturaOriginal);
                let resolvida = (resFinal instanceof Promise ? await resFinal : resFinal);
                return await resolvida.resize(larguraOriginal, alturaOriginal).toBuffer();
              }
            } else {
              return await sharp(stdoutBuffer).toBuffer();
            }
          }

          // 7. COLETOR DE MENSAGENS INDEFINIDO
          const filtroChat = (m) => !m.author.bot;
          const coletorChat = message.channel.createMessageCollector({ filter: filtroChat });

          coletorChat.on("collect", async (msgPretendente) => {
            const textoMensagem = msgPretendente.content.trim().toLowerCase();
            const respostaUsuario = textoMensagem;
            const respostaCorreta = videoSorteado.categoriaNome.toLowerCase();

            // LÓGICA DE DESISTÊNCIA
            if (textoMensagem === "desisto") {
              coletorChat.stop();
              await msgPretendente.reply("🏳️ **OK! Vocês desistiram.** Revelando a resposta...");
              
              try {
                const imagemRevelada = await gerarImagemResposta();
                return message.channel.send({
                  content: `💡 **Gabarito do Desafio:**\n• Categoria: **${videoSorteado.categoriaNome}**\n• Vídeo original: **${videoSorteado.nome}**\n• Frame exato: **#${frameSorteado}**`,
                  files: [{ attachment: imagemRevelada, name: "resposta_revelada.png" }],
                });
              } catch (errDesisto) {
                console.error(errDesisto);
                return message.channel.send(`💡 **Gabarito do Desafio:** Categoria **${videoSorteado.categoriaNome}** (${videoSorteado.nome})`);
              }
            }

            // LÓGICA DE ACERTO
            if (respostaUsuario === respostaCorreta) {
              coletorChat.stop();

              const user = await User.findById(msgPretendente.author.id);
              if (user && user.vitorias) {
                user.vitorias.printGuess++;
                await user.save();
              }

              try {
                const imagemOriginalBuffer = await gerarImagemResposta();
                return message.channel.send({
                  content: `🎉 **PARABÉNS!** <@${msgPretendente.author.id}> \n• Categoria: **${videoSorteado.categoriaNome}**\n• Vídeo original: **${videoSorteado.nome}**\n• Frame exato: **#${frameSorteado}**`,
                  files: [{ attachment: imagemOriginalBuffer, name: "resposta.png" }],
                });
              } catch (errResposta) {
                return message.channel.send(`🎉 **PARABÉNS!** <@${msgPretendente.author.id}> \n• Categoria: **${videoSorteado.categoriaNome}**`);
              }
            }

            // LÓGICA DE ERRO (Apenas apaga respostas que casem com as categorias para não poluir)
            if (categoriasDisponiveis.map((c) => c.toLowerCase()).includes(respostaUsuario)) {
              msgPretendente.reply("❌ ERROU!").then((m) => {
                setTimeout(() => m.delete().catch(() => {}), 2500);
              });
            }
          });
        } catch (errSharp) {
          console.error("[Erro Sharp]", errSharp);
          return processarVideo(msgProcessando, cronometroCarregando, tentativas + 1);
        }
      },
    );
  }

  message.channel.send("🔄 CARGANDO .").then((msgProcessando) => {
    let pontos = 1;
    const cronometroCarregando = setInterval(async () => {
      pontos++;
      const sufixoPontos = " .".repeat(pontos);
      await msgProcessando.edit(`🔄 CARGANDO${sufixoPontos}`).catch(() => {});
    }, 1000);

    processarVideo(msgProcessando, cronometroCarregando);
  }).catch(console.error);
}

function ReduzirCategorias(lista) {
  return lista.map((cat) => `• **${cat}**`).join("\n");
}