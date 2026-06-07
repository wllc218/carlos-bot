const mongo = require("./mongo");
const messageCountSchema = require("../schemas/message-count-schema");

console.log("arquivo message-counter carregado");

module.exports = (client) => {
  console.log("messageCounter carregado");

  client.on("messageCreate", async (message) => {
    console.log("mensagem recebida");
    const { author } = message;
    const { id } = author;
    console.log("AUTHOR: " + author);

    await mongo().then(async (mongoose) => {
      try {
        await messageCountSchema
          .findOneAndUpdate(
            { _id: id },
            {
              $inc: {
                messageCount: 1,
              },
            },
            {
              upsert: true,
            },
          )
          .exec();
      } finally {
      }
    });
  });
};
