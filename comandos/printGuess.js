// const { exec } = require("child_process");
// const path = require("path");
// const sharp = require("sharp");

// module.exports = {
//     name: "printguess",
//     execute(message) {
        
//         const video = path.join(__dirname, "..", "mp4", "BBNICOLA$", "CASA.mp4");

//         exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${video}"`, (err, stdout) => {

//             if (err) return message.reply("erro ffprobe");

//             const duracao = parseFloat(stdout);
//             const tempo = Math.floor(Math.random() * duracao);

//             exec(`ffmpeg -y -ss ${tempo} -i "${video}" -frames:v 1 frame.png`, (err2) => {

//                 if (err2) return message.reply("erro ffmpeg");

//                 // sharp("frame.png").resize(2000, 2000).toFile("frame_zoom.png").then(() => {
//                 //     message.reply({ files: ["frame_zoom.png"] });
//                 // }).catch(() => {
//                     //         message.reply("erro no sharp");
//                     // });
//                 message.reply({ files: ["frame.png"] });
                    
//             });

//         });

//     }
// };