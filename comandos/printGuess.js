import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../data/videos.json" with { type: "json" };

export const name = "printguess";
export function execute(message) {
    // 1. TRANSFORMA O OBJETO EM UMA LISTA ÚNICA DE VÍDEOS
    const todosOsVideos = [];
    for (const categoria in videos) {
        if (Array.isArray(videos[categoria])) {
            todosOsVideos.push(...videos[categoria]);
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
                console.error(`[Erro Dados] Dados inválidos para o vídeo: ${videoSorteado.nome}. Tentando outro...`);
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
                    // 4. CÁLCULO DO ZOOM ALEATÓRIO (De 2/4 até quase zoom total de 4/4)
                    // Fator varia de 0.1 (zoom máximo, pegando 10% da tela) até 0.5 (zoom médio, pegando 2/4 da tela)
                    const fatorZoom = 0.1 + Math.random() * 0.4; 
                    
                    const larguraCorte = Math.floor(larguraOriginal * fatorZoom);
                    const alturaCorte = Math.floor(alturaOriginal * fatorZoom);

                    // Sorteia a posição X e Y de onde o corte vai acontecer na tela de forma imprevisível
                    const xAleatorio = Math.floor(Math.random() * (larguraOriginal - larguraCorte));
                    const yAleatorio = Math.floor(Math.random() * (alturaOriginal - alturaCorte));

                    // 5. SHARP APLICA O RECORTE E ESTICA A IMAGEM NA RAM
                    const imagemComZoomBuffer = await sharp(stdoutBuffer)
                        .extract({ left: xAleatorio, top: yAleatorio, width: larguraCorte, height: alturaCorte })
                        .resize(larguraOriginal, alturaOriginal) // Estica de volta criando o efeito de lente de aproximação
                        .toBuffer();

                    // Calcula a porcentagem visual aproximada do zoom para mandar no chat
                    const porcentagemZoom = Math.round((1 - fatorZoom) * 100);

                    // 6. ENVIA PARA O DISCORD EXIBINDO O NOME DO VÍDEO E DELETA A MENSAGEM DE CARREGANDO
                    message.reply({
                        content: `🎮 **Desafio Gerado!**\n• Vídeo: **${videoSorteado.nome}**\n• Segundo sorteado: **${tempo}s**\n• Intensidade do Zoom: ~**${porcentagemZoom}%**`,
                        files: [{
                            attachment: imagemComZoomBuffer,
                            name: "desafio_zoom.png"
                        }]
                    }).then(() => {
                        if (msgProcessando) msgProcessando.delete().catch(() => {});
                    }).catch(errDiscord => {
                        console.error("Erro ao enviar no Discord:", errDiscord);
                        if (msgProcessando) msgProcessando.delete().catch(() => {});
                    });

                } catch (errSharp) {
                    console.error("[Erro Sharp] Falha ao aplicar zoom:", errSharp);
                    return processarVideo(msgProcessando, tentatives + 1);
                }
            });
        });
    }

    // Cria a mensagem inicial e passa o controle dela para a função principal
    message.channel.send("🔄 Puxando o vídeo da nuvem e aplicando o efeito de zoom extremo...").then(msgProcessando => {
        processarVideo(msgProcessando);
    }).catch(console.error);
}