import dotenv from "dotenv";
import { readdirSync } from "fs";
import mongoose from "mongoose";
import messageCount from "./comandos/message-counter.js";
//prettier-ignore
import {Client, GatewayIntentBits, ActivityType, Collection} from "discord.js";
//prettier-ignore
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
import connectDB from "./server/mongo.js";

dotenv.config();

//faz o prefixo funcionar
const prefix = "C!";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();
  const command = client.commands.get(cmdName);
  if (!command) return;
  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(err);
    message.reply("PORRA DEU ERRO " + err);
  }
});

//comandos
client.commands = new Collection();
const commandFiles = readdirSync("./comandos").filter((file) =>
  file.endsWith(".js"),
);
for (const file of commandFiles) {
  const command = await import(`./comandos/${file}`);
  if (!command.name) {
    console.log(`Comando ${file} sem nome.`);
    continue;
  }
  client.commands.set(command.name, command);
}

//eventos

const eventFiles = readdirSync("./eventos").filter((file) =>
  file.endsWith(".js"),
);
for (const file of eventFiles) {
  const event = await import(`./eventos/${file}`);
  client.on(event.name, (...args) => event.execute(...args, client));
}

//quando ele ligar execute
client.once("clientReady", async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
  messageCount(client);
});

await connectDB();
client.login(process.env.DISCORD_TOKEN);
