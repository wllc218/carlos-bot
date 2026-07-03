import mongo from "../server/mongo.js";
import User from "../server/schemas/user-schema.js";

export default (client) => {
  client.on("messageCreate", async (message) => {
    const { author } = message;
    const { id } = author;
    //essas variaveis são só pra não tomar tanto espaço
    //quando for escrever o await ai embaixo

    await mongo().then(async (mongoose) => {
      try {
        await User.findOneAndUpdate(
          { _id: id },
          {
            $inc: {
              messageCount: 1,
            },
          },
          {
            upsert: true,
          },
        ).exec();
      } finally {
      }
    });
  });
};
