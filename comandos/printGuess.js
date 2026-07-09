import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../data/videos.json" with { type: "json" };

export const name = "printguess";
export function execute(message) {
    const todosOsVideos = [];
    for (const categoria in videos) {
        if (Array.isArray(videos[categoria])) {
            todosOsVideos.push(...videos[categoria]);
        }
    }

    if (todosOsVideos.length === 0) {
        return message.reply("❌ Nenhum vídeo configurado no arquivo videos.json!");
    }

    function processarVideo(tentativas = 0) {
        if (tentativas >= 3) {
            return message.reply("❌ Ocorreram erros seguidos ao tentar ler os vídeos na nuvem.");
        }

        const videoSorteado = todosOsVideos[Math.floor(Math.random() * todosOsVideos.length)];
        const linkVideo = videoSorteado.url;

        // 1. BUSCA AS DIMENSÕES E DURAÇÃO REAL DO VÍDEO
        exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of default=noprint_wrappers=1:nokey=1 "${linkVideo}"`, { timeout: 5000 }, (err, stdout) => {
            if (err) {
                console.error(`[Erro FFprobe] Falha ao ler o vídeo: ${videoSorteado.nome}. Tentando outro...`);
                return processarVideo(tentativas + 1);
            }

            const dados = stdout.trim().split("\n");
            const larguraOriginal = parseInt(dados[0]);
            const alturaOriginal = parseInt(dados[1]);
            const duracao = parseFloat(dados[2]);
            
            if (isNaN(larguraOriginal) || isNaN(alturaOriginal) || isNaN(duracao)) {
                console.error(`[Erro Dados] Dados inválidos para o vídeo: ${videoSorteado.nome}. Tentando outro...`);
                return processarVideo(tentativas + 1);
            }

            const tempo = Math.floor(Math.random() * duracao);
            const ffmpegComando = `ffmpeg -y -ss ${tempo} -i "${linkVideo}" -frames:v 1 -f image2pipe -vcodec png -`;
            
            // 2. EXTRAI O FRAME ORIGINAL NA MEMÓRIA RAM
            exec(ffmpegComando, { encoding: "buffer", maxBuffer: 1024 * 1024 * 20, timeout: 7000 }, async (err2, stdoutBuffer) => {
                if (err2) {
                    console.error(`[Erro FFMPEG] Falha ao extrair frame: ${videoSorteado.nome}. Tentando outro...`);
                    return processarVideo(tentativas + 1);
                }

                try {
                    // 3. CÁLCULO DO ZOOM ALEATÓRIO (Entre 2/4 e 3/4 do tamanho da imagem)
                    // Sorteia uma escala entre 0.5 (2/4) e 0.75 (3/4)
                    const fatorZoom = 0.5 + Math.random() * 0.25; 
                    
                    const larguraCorte = Math.floor(larguraOriginal * fatorZoom);
                    const alturaCorte = Math.floor(alturaOriginal * fatorZoom);

                    // Sorteia a posição X e Y de onde o corte vai começar (sem passar das bordas)
                    const xAleatorio = Math.floor(Math.random() * (larguraOriginal - larguraCorte));
                    const yAleatorio = Math.floor(Math.random() * (alturaOriginal - alturaCorte));

                    // 4. SHARP APLICA O CORTE E REDIMENSIONA (ZOOM) NA RAM
                    const imagemComZoomBuffer = await sharp(stdoutBuffer)
                        .extract({ left: xAleatorio, top: yAleatorio, width: larguraCorte, height: alturaCorte })
                        .resize(larguraOriginal, alturaOriginal) // Redimensiona de volta ao tamanho original para dar o efeito de aproximação
                        .toBuffer();

                    // 5. ENVIA A IMAGEM ZOOMADA PARA O DISCORD
                    message.reply({
                        content: `🎮 Segundo sorteado: **${tempo}** (Dica: A imagem está com zoom aleatório!)`,
                        files: [{
                            attachment: imagemComZoomBuffer,
                            name: "frame_zoom.png"
                        }]
                    }).catch(errDiscord => console.error("Erro ao enviar no Discord:", errDiscord));

                } catch (errSharp) {
                    console.error("[Erro Sharp] Falha ao aplicar zoom:", errSharp);
                    return processarVideo(tentativas + 1);
                }
            });
        });
    }

    message.channel.send("🔄 Puxando o vídeo, aplicando zoom e gerando o desafio...").then(msgProcessando => {
        processarVideo();
        msgProcessando.delete().catch(() => {});
    }).catch(console.error);
}