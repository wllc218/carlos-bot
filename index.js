import {
  Client,
  GatewayIntentBits,
  ActivityType,
  Collection,
} from "discord.js";
import connectDB from "./server/mongo.js";
import mongoose from "mongoose";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import messageCount from "./comandos/message-counter/message-counter.js";
//prettier-ignore
//prettier-ignore
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
import dotenv from "dotenv";

dotenv.config();

//faz o prefixo funcionar
const prefix = "C!";

console.log(JSON.stringify(process.env.DISCORD_TOKEN));
console.log(process.env.DISCORD_TOKEN.length);

for (const c of process.env.DISCORD_TOKEN) {
  console.log(c.charCodeAt(0));
}

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

function getCommandFiles(dir) {
  const files = [];

  for (const item of readdirSync(dir)) {
    const caminho = join(dir, item);
    if (statSync(caminho).isDirectory()) {
      files.push(...getCommandFiles(caminho));
    } else if (item.endsWith(".js")) {
      files.push(caminho);
    }
  }

  return files;
}

client.commands = new Collection();
const commandFiles = getCommandFiles("./comandos");
for (const file of commandFiles) {
  const command = await import(`./${file.replace(/\\/g, "/")}`);
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

console.log("Token existe?", !!process.env.DISCORD_TOKEN);
console.log("Tamanho:", process.env.DISCORD_TOKEN?.length);

const token = process.env.DISCORD_TOKEN.trim();

console.log(token === process.env.DISCORD_TOKEN);

await client.login(token);

try {
  await connectDB();
  console.log("Mongo conectado");
} catch (e) {
  console.error("Erro Mongo:", e);
}

try {
  console.log("Fazendo login...");
  await client.login(process.env.DISCORD_TOKEN);
  console.log("Login OK");
} catch (e) {
  console.error("Erro login:", e);
}
