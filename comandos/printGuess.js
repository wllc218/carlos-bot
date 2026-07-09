import { exec } from "child_process";
import path from "path";
import sharp from "sharp";
import videos from "../data/videos.json" with { type: "json" };

export const name = "printguess";
export function execute(message) {
    // 1. JUNTA TODOS OS VÍDEOS
    const todosOsVideos = [];
    for (const categoria in videos) {
        if (Array.isArray(videos[categoria])) {
            todosOsVideos.push(...videos[categoria]);
        }
    }

    if (todosOsVideos.length === 0) {
        return message.reply("❌ Nenhum vídeo configurado no arquivo videos.json!");
    }

    // 2. TESTE DE SISTEMA: VERIFICA SE O FFPROBE EXISTE NA MÁQUINA
    exec("ffprobe -version", (errVersion) => {
        if (errVersion) {
            return message.reply(
                "❌ **ERRO DE SISTEMA:** O programa `ffprobe` não está instalado na hospedagem do seu bot! " +
                "Você precisa instalar o FFmpeg/FFprobe no sistema operacional do servidor para que o comando funcione."
            );
        }

        // Se o ffprobe existe, escolhe um vídeo e tenta ler
        const videoSorteado = todosOsVideos[Math.floor(Math.random() * todosOsVideos.length)];
        const linkVideo = videoSorteado.url;

        message.channel.send(`🔄 Testando conexão com o vídeo: **${videoSorteado.nome}**...`).then(msgProcessando => {

            // 3. EXECUTA O FFPROBE NO VÍDEO
            exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of default=noprint_wrappers=1:nokey=1 "${linkVideo}"`, { timeout: 8000 }, (err, stdout) => {
                if (err) {
                    msgProcessando.delete().catch(() => {});
                    console.error("ERRO DETALHADO DO FFPROBE:", err);
                    return message.reply(
                        `❌ **ERRO DE CONEXÃO:** O ffprobe está instalado, mas não conseguiu acessar o vídeo **${videoSorteado.nome}** na nuvem.\n` +
                        `• Erro: \`${err.message.substring(0, 100)}...\`\n` +
                        `• Verifique se o link funciona no seu navegador: ${linkVideo}`
                    );
                }

                const dados = stdout.trim().split("\n");
                const duracao = parseFloat(dados[2]);
                
                if (isNaN(duracao)) {
                    msgProcessando.delete().catch(() => {});
                    return message.reply(`❌ O vídeo **${videoSorteado.nome}** retornou dados inválidos na nuvem.`);
                }

                const tempo = Math.floor(Math.random() * duracao);
                const ffmpegComando = `ffmpeg -y -ss ${tempo} -i "${linkVideo}" -frames:v 1 -f image2pipe -vcodec png -`;
                
                // 4. EXECUTA O FFMPEG
                exec(ffmpegComando, { encoding: "buffer", maxBuffer: 1024 * 1024 * 20, timeout: 10000 }, (err2, stdoutBuffer) => {
                    if (err2) {
                        msgProcessando.delete().catch(() => {});
                        console.error("ERRO DETALHADO DO FFMPEG:", err2);
                        return message.reply(`❌ O ffprobe leu o vídeo, mas o **ffmpeg** falhou ao tirar o print.`);
                    }

                    // Se tudo der certo
                    message.reply({
                        content: `✅ **Sucesso!** Vídeo: **${videoSorteado.nome}** | Segundo: **${tempo}**`,
                        files: [{
                            attachment: stdoutBuffer,
                            name: "frame.png"
                        }]
                    }).then(() => {
                        msgProcessando.delete().catch(() => {});
                    });
                });
            });
        });
    });
}