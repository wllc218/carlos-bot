const fs = require("fs");
const path = require("path");

const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== COMANDOS =====
client.commands = new Map();

const commandFiles = fs
  .readdirSync("./comandos")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

  const command = require(`./comandos/${file}`);
  client.commands.set(command.name, command);
}

// ===== EVENTOS =====
const eventFiles = fs
  .readdirSync("./eventos")
  .filter(file => file.endsWith(".js"));

for (const file of eventFiles) {

  const event = require(`./eventos/${file}`);

  client.on(event.name, (...args) => {
    event.execute(...args, client);
  });
}

// ===== READY =====
client.once("clientReady", (client) => {

  console.log(`Bot iniciado.`);

  client.user.setActivity(
    `MERDA NOS OUTROS`,
    { type: ActivityType.Playing }
  );
});

require("dotenv").config();

const token = process.env.DISCORD_TOKEN;

client.login(token);