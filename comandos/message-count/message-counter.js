const mongo = require("../schemas/mongo");
const userSchema = require("../schemas/user-schema");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    const { author } = message;
    const { id } = author;
    //essas variaveis são só pra não tomar tanto espaço
    //quando for escrever o await ai embaixo

    await mongo().then(async (mongoose) => {
      try {
        await userSchema
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
