import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../../data/videos.json" with { type: "json" };
import User from "../../server/schemas/user-schema.js";

export const name = "printguess";
export function execute(message, args) {
  // 1. DICIONÁRIO DE ATALHOS PARA FORÇAR FILTROS ESPECÍFICOS
  const mapaFiltros = {
    pixel: "👾 Ultra Pixelado (Mosaico 8-Bit)",
    blur: "💧 Super Desfocado / Embaçado (Blur Máximo)",
    pintura: "🎨 Efeito Abstrato / Pintura Pesada",
    crt: "📺 Monitor CRT Corrompido (Cores Distorcidas)",
    contraste: "🎭 Contraste Extremo / Sombras Psicotrópicas",
    solar: "☀️ Efeito Solarização / Radiação de Luz",
    pb: "⚫ Monocromático (Preto e Branco Extremo)",
    negativo: "🧪 Cores Negativas (Invertidas)"
  };

  let modoJogo = "normal";
  let filtroForcado = null;

  if (args && args[0]) {
    const parametro = args[0].toLowerCase();
    
    if (parametro === "modif") {
      modoJogo = "modificado";
    } else if (mapaFiltros[parametro]) {
      modoJogo = "modificado";
      filtroForcado = mapaFiltros[parametro]; // Guarda o nome exato do filtro que o admin quer testar
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

// =========================================================================
// SUBSTITUA APENAS A SUA `listaModificacoes` POR ESTA NOVA VERSÃO COMPLETA:
// =========================================================================

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

  // ==========================================
  // 🚀 NOVOS FILTROS INSANOS ADICIONADOS ABAIXO:
  // ==========================================

  {
    nome: "🩻 Câmera Térmica (Efeito Predador)",
    aplicar: async (img) => {
      // Cria um mapa térmico artificial simulando calor pelo brilho da imagem original
      // Convertemos para escala de cinza para usar o brilho puro como base
      const cinza = await img.grayscale().toBuffer();
      
      // Remapeamos o canal de brilho para os tons térmicos (Azul/Roxo = Frio, Vermelho/Amarelo = Quente)
      return sharp(cinza)
        .linear(1.5, -30) // Força o contraste antes do remapeamento
        .recomb([
          [0.2, 0.8, -0.3], // Canal Vermelho (destaca áreas de brilho médio-alto)
          [-0.5, 0.6, 0.7], // Canal Verde (áreas médias)
          [1.0, -0.4, 0.2]  // Canal Azul (áreas escuras/frias)
        ]);
    }
  },

  {
    nome: "🔲 Detector de Bordas Pesado (Estilo Neon / Sobel)",
    aplicar: (img) => {
      // Matriz de convolução kernel Sobel 3x3 para destacar arestas verticais e horizontais violentamente
      return img
        .grayscale()
        .convolute({
          width: 3,
          height: 3,
          kernel: [
            -1, -2, -1,
             0,  0,  0,
             1,  2,  1
          ]
        })
        .linear(4.0, 0) // Multiplica o brilho das linhas brancas para dar efeito "neon aceso"
        .negate({ alpha: false }); // Opcional: Remova o .negate() se quiser linhas brancas no fundo preto absoluto!
    }
  },

  {
    nome: "🗯️ Efeito Quadrinhos / Retícula (Halftone Pop Art)",
    aplicar: async (img, largCorte) => {
      const lc = largCorte || 300;
      // Cria uma máscara pontilhada matemática usando SVG direto na RAM
      const svgPontos = `
        <svg width="${lc}" height="${lc}">
          <pattern id="pontos" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="3.5" fill="black" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pontos)" opacity="0.45" />
        </svg>
      `;
      const mascaraBuffer = Buffer.from(svgPontos);
      
      // Estoura o contraste dos tons (estilo cartoon) e joga a camada de bolinhas por cima
      return img
        .gamma(0.4)
        .linear(1.8, -40)
        .composite([{ input: mascaraBuffer, blend: "atop" }]);
    }
  },

  {
    nome: "🪟 Efeito Vidro Canelado (Textura de Vitral)",
    aplicar: (img, largCorte) => {
      const lc = largCorte || 300;
      // Criamos um efeito canelado reduzindo drasticamente apenas um dos eixos (horizontal)
      // e re-esticando sem interpolação. Isso estica os pixels como faixas de vidro verticais
      const microLargura = Math.max(8, Math.floor(lc * 0.04));
      return img
        .resize(microLargura, null, { kernel: 'nearest' })
        .resize(larguraOriginal, alturaOriginal, { kernel: 'lanczos3' }) 
        .blur(2); // Suaviza de leve as bordas esticadas para parecer refração de vidro
    }
  },

  {
    nome: "🟢 Terminal de Comando Retro (Efeito Matrix)",
    aplicar: async (img) => {
      // Extrai apenas as informações do canal verde da imagem crueza
      const canalVerde = await img.extractChannel('green').toBuffer();
      
      // Joga o frame em uma matriz onde os canais vermelho e azul são zerados, restando só o verde puro e brilhante
      return sharp(canalVerde)
        .linear(2.5, -80) // Estoura o contraste do verde para brilhar como fósforo antigo
        .toColorspace('srgb')
        .recomb([
          [0, 0, 0], // Vermelho = Apagado
          [0, 1, 0], // Verde = Ativo
          [0, 0, 0]  // Azul = Apagado
        ]);
    }
  },

  {
    nome: "💥 Efeito Glitch (Blocos Desalinhados de Compressão)",
    aplicar: async (img, largCorte, altCorte) => {
      const lc = largCorte || larguraCorte;
      const ac = altCorte || alturaCorte;
      
      // Tiramos um clone em Buffer da própria imagem recortada
      const bufferOriginal = await img.toBuffer();
      
      // Vamos recortar duas faixas horizontais aleatórias da própria imagem e colar de volta com deslocamento horizontal (Glitch)
      const alturaFaixa = Math.floor(ac * 0.12);
      const yFaixa1 = Math.floor(ac * 0.25);
      const yFaixa2 = Math.floor(ac * 0.65);

      try {
        const faixa1 = await sharp(bufferOriginal).extract({ left: 0, top: yFaixa1, width: lc, height: alturaFaixa }).toBuffer();
        const faixa2 = await sharp(bufferOriginal).extract({ left: 0, top: yFaixa2, width: lc, height: alturaFaixa }).toBuffer();

        return sharp(bufferOriginal).composite([
          { input: faixa1, top: yFaixa1, left: Math.floor(lc * 0.08), blend: "over" },  // Empurra a faixa 1 para a direita
          { input: faixa2, top: yFaixa2, left: -Math.floor(lc * 0.08), blend: "over" } // Empurra a faixa 2 para a esquerda
        ]);
      } catch {
        // Fallback de segurança caso o extract da faixa passe dos limites por arredondamento
        return sharp(bufferOriginal).linear(1.2, -10);
      }
    }
  }
];

          // Instancia o corte inicial para o desafio
          let pipelineSharp = sharp(stdoutBuffer)
            .extract({ left: xAleatorio, top: yAleatorio, width: larguraCorte, height: alturaCorte });

          // Aplicação e redimensionamento no corte
          if (modificacaoEscolhida.nome === "👾 Ultra Pixelado (Mosaico 8-Bit)") {
            pipelineSharp = modificacaoEscolhida.aplicar(pipelineSharp, larguraCorte, alturaCorte, larguraOriginal, alturaOriginal);
          } else {
            pipelineSharp = modificacaoEscolhida.aplicar(pipelineSharp, larguraCorte);
            pipelineSharp = pipelineSharp.resize(larguraOriginal, alturaOriginal);
          }

          const imagemComZoomBuffer = await pipelineSharp.toBuffer();
          const listaCategoriasTexto = ReduzirCategorias(categoriasDisponiveis);

          // Envia o desafio
          await message.reply({
            content: `🎮 **DESAFIO GAMER (${modoJogo.toUpperCase()})**\nQUAL O VÍDEO DA PRINT? DÊ O SEU PALPITE!\n\n✨ **Modificação desta rodada:** ${modificacaoEscolhida.nome}\n\n**CATEGORIAS:**\n${listaCategoriasTexto}\n\n`,
            files: [{ attachment: imagemComZoomBuffer, name: "desafio_zoom.png" }],
          });

          if (msgProcessando) {
            clearInterval(cronometroCarregando);
            msgProcessando.delete().catch(() => {});
          }

          // Helper para gerar a imagem final da resposta (reutilizado no acerto e na desistência)
          async function gerarImagemResposta() {
            if (modoJogo === "modificado") {
              let pipelineFinal = sharp(stdoutBuffer);
              if (modificacaoEscolhida.nome === "👾 Ultra Pixelado (Mosaico 8-Bit)") {
                return await modificacaoEscolhida.aplicar(pipelineFinal, larguraOriginal, alturaOriginal, larguraOriginal, alturaOriginal).toBuffer();
              } else {
                pipelineFinal = modificacaoEscolhida.aplicar(pipelineFinal, larguraOriginal);
                return await pipelineFinal.resize(larguraOriginal, alturaOriginal).toBuffer();
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

            // LÓGICA DE ERRO (CATEGORIA VÁLIDA)
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