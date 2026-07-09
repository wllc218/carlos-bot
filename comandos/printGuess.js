import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../data/videos.json" with { type: "json" };

export const name = "printguess";
export function execute(message) {
    // 1. TRANSFORMA O OBJETO EM UMA LISTA ÚNICA, INCLUINDO A CATEGORIA EM CADA VÍDEO
    const todosOsVideos = [];
    for (const categoria in videos) {
        if (Array.isArray(videos[categoria])) {
            const videosComCategoria = videos[categoria].map(video => ({
                ...video,
                categoriaNome: categoria
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
            return message.reply("❌ Ocorreram erros seguidos ao tentar ler os vídeos na nuvem.");
        }

        const videoSorteado = todosOsVideos[Math.floor(Math.random() * todosOsVideos.length)];
        const linkVideo = videoSorteado.url;

        // 2. BUSCA AS DIMENSÕES E DURAÇÃO REAL DO VÍDEO (FAST SEEKING)
        exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of default=noprint_wrappers=1:nokey=1 "${linkVideo}"`, { timeout: 5000 }, (err, stdout) => {
            if (err) {
                console.error(`[Erro FFprobe] Falha ao ler o vídeo: ${videoSorteado.nome}. Tentando outro...`);
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
            exec(ffmpegComando, { encoding: "buffer", maxBuffer: 1024 * 1024 * 20, timeout: 7000 }, async (err2, stdoutBuffer) => {
                if (err2) {
                    console.error(`[Erro FFMPEG] Falha ao extrair frame do vídeo: ${videoSorteado.nome}. Tentando outro...`);
                    return processarVideo(msgProcessando, tentativas + 1);
                }

                try {
                    // 4. CÁLCULO DO ZOOM ALEATÓRIO (De 2/4 até zoom quase total de 4/4)
                    const fatorZoom = 0.1 + Math.random() * 0.4; 
                    
                    const larguraCorte = Math.floor(larguraOriginal * fatorZoom);
                    const alturaCorte = Math.floor(alturaOriginal * fatorZoom);

                    const xAleatorio = Math.floor(Math.random() * (larguraOriginal - larguraCorte));
                    const yAleatorio = Math.floor(Math.random() * (alturaOriginal - alturaCorte));

                    // 5. SHARP APLICA O RECORTE E ESTICA A IMAGEM NA RAM
                    const imagemComZoomBuffer = await sharp(stdoutBuffer)
                        .extract({ left: xAleatorio, top: yAleatorio, width: larguraCorte, height: alturaCorte })
                        .resize(larguraOriginal, alturaOriginal)
                        .toBuffer();

                    const porcentagemZoom = Math.round((1 - fatorZoom) * 100);

                    // 6. ETAPA 1: ENVIA O DESAFIO E ADICIONA AS REAÇÕES BASE NA IMAGEM
                    const msgDesafio = await message.reply({
                        content: `🎮 **DESAFIO**\n• Categoria: **${videoSorteado.categoriaNome}**\n• Vídeo: **${videoSorteado.nome}**\n• Segundo sorteado: **${tempo}s**\n• Intensidade do Zoom: ~**${porcentagemZoom}%**\n\nR`,
                        files: [{
                            attachment: imagemComZoomBuffer,
                            name: "desafio_zoom.png"
                        }]
                    });

                    // Apaga o "carregando" assim que a foto sobe no Discord
                    if (msgProcessando) msgProcessando.delete().catch(() => {});

                    // Aplica os 4 emojis iniciais embaixo da mensagem da imagem
                    const emojisIniciais = ["❤️", "⭐", "🔮", "🌀"];
                    for (const emoji of emojisIniciais) {
                        await msgDesafio.react(emoji).catch(console.error);
                    }

                    // 7. ETAPA 2: CRONÔMETRO DE 5 SEGUNDOS PARA AS SUB-OPÇÕES
                    setTimeout(async () => {
                        try {
                            const msgSubmenu = await message.channel.send(
                                `🍎 **Eu amo buceta`
                            );

                            // Aplica as 4 sub-reações na nova mensagem de texto
                            const emojisSubmenu = ["🍌", "🍎", "🍐", "🍇"];
                            for (const emoji of emojisSubmenu) {
                                await msgSubmenu.react(emoji).catch(console.error);
                            }
                        } catch (errSubmenu) {
                            console.error("Erro ao enviar o submenu de reações:", errSubmenu);
                        }
                    }, 5000); // 5000 milissegundos = 5 segundos

                } catch (errSharp) {
                    console.error("[Erro Sharp] Falha ao aplicar zoom:", errSharp);
                    return processarVideo(msgProcessando, tentativas + 1);
                }
            });
        });
    }

    // Mensagem inicial de feedback visual
    message.channel.send("🔄 Puxando o vídeo da nuvem e aplicando o efeito de zoom extremo...").then(msgProcessando => {
        processarVideo(msgProcessando);
    }).catch(console.error);
}