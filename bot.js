require("dotenv").config();

const fs = require("fs");
const mongoose = require("mongoose");

const messageCount = require("./comandos/message-count/message-counter");

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  Collection,
} = require("discord.js");

const testSchema = require("./comandos/schemas/test-schema");

// =====================
// CLIENT
// =====================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// =====================
// COMMANDS
// =====================

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./comandos")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./comandos/${file}`);

  if (!command.name) {
    console.log(`Comando ${file} sem nome.`);
    continue;
  }

  client.commands.set(command.name, command);
}

console.log(`${client.commands.size} comandos carregados.`);

// =====================
// EVENTS
// =====================

const eventFiles = fs
  .readdirSync("./eventos")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./eventos/${file}`);

  // exemplo de evento correto:
  // module.exports = {
  //   name: "guildCreate",
  //   execute(guild, client) {}
  // }

  client.on(event.name, (...args) => {
    event.execute(...args, client);
  });
}

console.log(`${eventFiles.length} eventos carregados.`);

// =====================
// READY
// =====================

client.once("clientReady", async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
  messageCount(client);

  client.user.setActivity("MERDA NOS OUTROS", {
    type: ActivityType.Playing,
  });
});

//   try {
//     mongoose.set("strictQuery", true);
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("✅ MongoDB conectado.");

//     // TESTE MONGO
//     setTimeout(async () => {
//       await new testSchema({
//         message: "oi tudo bem?:::oioi??"
//       }).save();
//     }, 1000);

//   } catch (err) {
//     console.error("Erro ao conectar MongoDB:", err);
//   }

// =====================
// PREFIX COMMAND HANDLER
// =====================

const prefix = "C!";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  //se for bot morre
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);

  const cmdName = args.shift().toLowerCase();

  const command = client.commands.get(cmdName);

  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(err);

    message.reply("PORRA DEU ERRO");
  }
});

// =====================
// ERROR HANDLERS
// =====================

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// =====================
// LOGIN
// =====================

client.login(process.env.DISCORD_TOKEN);
