const fs = require("fs");
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ====== COMANDOS ======
client.commands = new Map();

const commandFiles = fs
  .readdirSync("./comandos")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./comandos/${file}`);
  client.commands.set(command.name, command);
}

// ====== READY ======
client.once("clientReady", (client) => {
  console.log(
    `Bot foi iniciado, com ${client.users.cache.size} usuários, ` +
    `em ${client.channels.cache.size} canais, ` +
    `em ${client.guilds.cache.size} servidores.`
  );

  client.user.setActivity(
    `MERDA NOS OUTROS`,
    { type: ActivityType.Playing }
  );
});

// ====== EVENTOS ======
client.on("messageCreate", message => {
  if (message.author.bot) return;

  const prefix = "C!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("SEU BURRO SMT VC ERROU OLHA AI NOQ VC ERROU E TENTA DNV: " + error);
  }
});

client.login(config.token);
