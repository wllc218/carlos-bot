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
                        content: `🎮 **DESAFIO GAMER**\n• Categoria: **${videoSorteado.categoriaNome}**\n• Vídeo: **${videoSorteado.nome}**\n• Segundo sorteado: **${tempo}s**\n• Intensidade do Zoom: ~**${porcentagemZoom}%**\n\nReaja abaixo com seu palpite inicial!`,
                        files: [{
                            attachment: imagemComZoomBuffer,
                            name: "desafio_zoom.png"
                        }]
                    });

                    if (msgProcessando) msgProcessando.delete().catch(() => {});

                    const emojisIniciais = ["❤️", "⭐", "🔮", "🌀"];
                    for (const emoji of emojisIniciais) {
                        await msgDesafio.react(emoji).catch(console.error);
                    }

                    // Map para registrar a escolha inicial de cada ID de usuário
                    const escolhasUsuarios = new Map();

                    const filtroEtapa1 = (reaction, user) => emojisIniciais.includes(reaction.emoji.name) && !user.bot;
                    const coletorEtapa1 = msgDesafio.createReactionCollector({ filter: filtroEtapa1, time: 5000 });

                    coletorEtapa1.on("collect", async (reaction, user) => {
                        const idUsuario = user.id;
                        if (escolhasUsuarios.has(idUsuario)) {
                            await reaction.users.remove(idUsuario).catch(() => {});
                            return;
                        }
                        escolhasUsuarios.set(idUsuario, reaction.emoji.name);
                    });

                    // 7. ETAPA 2: CRONÔMETRO DE 5 SEGUNDOS PARA UMA ÚNICA MENSAGEM GLOBAL
                    setTimeout(async () => {
                        try {
                            coletorEtapa1.stop();

                            // Pega o emoji de quem começou o jogo (quem enviou o comando) para usar como exemplo na mensagem
                            const emojiDoAutor = escolhasUsuarios.get(message.author.id) || "❓";

                            // Envia apenas UMA mensagem no canal para todo mundo interagir
                            const msgSubmenu = await message.channel.send(
                                `🍎 **Sub-opções liberadas!** O criador escolheu ${emojiDoAutor} <@${message.author.id}>. Escolham agora o complemento do palpite de vocês:`
                            );

                            const emojisSubmenu = ["🍌", "🍎", "🍐", "🍇"];
                            for (const emoji of emojisSubmenu) {
                                await msgSubmenu.react(emoji).catch(console.error);
                            }

                            // Lista para controlar quem já finalizou a Etapa 2
                            const usuariosFinalizados = new Set();

                            // Coletor global: qualquer um pode reagir, contanto que não seja robô
                            const filtroEtapa2 = (reaction, user) => emojisSubmenu.includes(reaction.emoji.name) && !user.bot;
                            const coletorEtapa2 = msgSubmenu.createReactionCollector({ filter: filtroEtapa2, time: 30000 });

                            coletorEtapa2.on("collect", async (reaction, user) => {
                                const idUsuario = user.id;

                                // Se o usuário tentar clicar em mais de um emoji no submenu, remove o clique extra
                                if (usuariosFinalizados.has(idUsuario)) {
                                    await reaction.users.remove(idUsuario).catch(() => {});
                                    return;
                                }

                                // Busca qual emoji este usuário específico escolheu lá na Etapa 1
                                const emojiDaEtapa1 = escolhasUsuarios.get(idUsuario);

                                // Se ele não votou na primeira etapa, não deixamos votar na segunda
                                if (!emojiDaEtapa1) {
                                    await reaction.users.remove(idUsuario).catch(() => {});
                                    return message.channel.send(`⚠️ <@${idUsuario}>, você não participou da primeira etapa!`).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                                }

                                // Marca que este usuário já concluiu seu palpite
                                usuariosFinalizados.add(idUsuario);

                                // Avisa o palpite completo de quem acabou de votar
                                message.channel.send(`✅ <@${idUsuario}> finalizou o palpite! Combinação: ${emojiDaEtapa1} + ${reaction.emoji.name}`);
                            });

                            coletorEtapa2.on("end", () => {
                                message.channel.send(`⏰ Fim do tempo de votação! O vídeo correto era: **${videoSorteado.nome}**`);
                            });

                        } catch (errSubmenu) {
                            console.error("Erro ao enviar o submenu global:", errSubmenu);
                        }
                    }, 5000);

                } catch (errSharp) {
                    console.error("[Erro Sharp] Falha ao aplicar zoom:", errSharp);
                    return processarVideo(msgProcessando, tentatives + 1);
                }
            });
        });
    }

    message.channel.send("🔄 Puxando o vídeo da nuvem e aplicando o efeito de zoom extremo...").then(msgProcessando => {
        processarVideo(msgProcessando);
    }).catch(console.error);
}