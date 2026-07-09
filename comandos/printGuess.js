import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../data/videos.json" with { type: "json" };

export const name = "printguess";
export function execute(message) {
    // 1. TRANSFORMA O OBJETO EM UMA LISTA ÚNICA DE VÍDEOS
    // Junta todas as categorias ("sonicexe", "carlostale", etc.) em um único lugar
    console.log("CONTEÚDO DO JSON CARREGADO:", videos);
    const todosOsVideos = [];
    for (const categoria in videos) {
        if (Array.isArray(videos[categoria])) {
            todosOsVideos.push(...videos[categoria]);
        }
    }

    if (todosOsVideos.length === 0) {
        return message.reply("❌ Nenhum vídeo configurado no arquivo videos.json!");
    }

    // 2. SORTEIO DO VÍDEO
    const videoSorteado = todosOsVideos[Math.floor(Math.random() * todosOsVideos.length)];
    const linkVideo = videoSorteado.url;

    // Envia o aviso de processamento no chat
    message.channel.send("🔄 Puxando o vídeo da nuvem e gerando o print...").then(msgProcessando => {

        // 3. BUSCA AS INFORMAÇÕES DO VÍDEO ONLINE (FFPROBE SEGURO)
        exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of default=noprint_wrappers=1:nokey=1 "${linkVideo}"`, { maxBuffer: 1024 * 1024 }, (err, stdout) => {
            if (err) {
                msgProcessando.delete().catch(() => {});
                return message.reply("❌ Erro ao ler as propriedades do vídeo na nuvem.");
            }

            const dados = stdout.trim().split("\n");
            const duracao = parseFloat(dados[2]);
            
            if (isNaN(duracao)) {
                msgProcessando.delete().catch(() => {});
                return message.reply("❌ Não foi possível calcular a duração do vídeo sorteado.");
            }

            const tempo = Math.floor(Math.random() * duracao);

            // 4. FFMPEG ULTRA OTIMIZADO NA MEMÓRIA (BUFFER)
            // O traço "-" no final joga a imagem direto na memória RAM.
            // maxBuffer configurado para 20MB (1024 * 1024 * 20) para dar total folga ao processo.
            const ffmpegComando = `ffmpeg -y -ss ${tempo} -i "${linkVideo}" -frames:v 1 -f image2pipe -vcodec png -`;
            
            exec(ffmpegComando, { encoding: "buffer", maxBuffer: 1024 * 1024 * 20 }, (err2, stdoutBuffer) => {
                if (err2) {
                    msgProcessando.delete().catch(() => {});
                    console.error("Erro FFMPEG:", err2);
                    return message.reply("❌ Erro ao processar o frame do vídeo.");
                }

                // 5. ENVIO SEGURO PARA O DISCORD
                // Assim que o upload termina, a memória RAM é limpa instantaneamente.
                message.reply({
                    content: `🎮 Segundo sorteado: **${tempo}**`,
                    files: [{
                        attachment: stdoutBuffer,
                        name: "frame.png"
                    }]
                }).then(() => {
                    msgProcessando.delete().catch(() => {}); // Apaga o aviso de carregamento
                }).catch(errDiscord => {
                    console.error("Erro ao enviar no Discord:", errDiscord);
                    msgProcessando.delete().catch(() => {});
                });
            });
        });
    }).catch(console.error);
}