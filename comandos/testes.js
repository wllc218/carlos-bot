module.exports = {
    name: "oi",
    execute(message) {

        message.channel.send("OI");

        const filter = (m) => m.author.id === message.author.id;

        const collector = message.channel.createMessageCollector({
            filter,
            time: 15000 // 15 segundos
        });

        collector.on("collect", (msg) => {

            if (msg.content === "OI") {
                message.channel.send("tudo bem");
                collector.stop();
            } else {
                message.channel.send("SE MATA SEU MERDA FILHO DA PUTA");
            }

        });

        collector.on("end", () => {
            console.log("coleta finalizada");
        });

    }
};