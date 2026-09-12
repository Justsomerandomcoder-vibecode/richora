'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { loadDatabase } = require('./utils/database');

const { DISCORD_TOKEN } = process.env;

if (!DISCORD_TOKEN) {
  console.error('❌ Missing DISCORD_TOKEN in your .env file. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// Make sure the JSON database exists and is loaded before anything else runs.
loadDatabase();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// ---- Load commands from commands/<category>/*.js ----
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath).filter((entry) =>
  fs.statSync(path.join(commandsPath, entry)).isDirectory()
);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    if (!command || !command.data || typeof command.execute !== 'function') {
      console.warn(`⚠️  Skipping invalid command file: ${filePath} (missing "data" or "execute")`);
      continue;
    }

    client.commands.set(command.data.name, command);
  }
}

console.log(`📦 Loaded ${client.commands.size} command(s).`);

// ---- Load events from events/*.js ----
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (!event || !event.name || typeof event.execute !== 'function') {
    console.warn(`⚠️  Skipping invalid event file: ${filePath} (missing "name" or "execute")`);
    continue;
  }

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection:', reason);
});

client.login(DISCORD_TOKEN);
