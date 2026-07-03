import User from "../server/schemas/user-schema.js";

export default (client) => {
  client.on("messageCreate", async (message) => {
    const { id } = message.author;

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
      );
    } catch (err) {
      console.error(err);
    }
  });
};
