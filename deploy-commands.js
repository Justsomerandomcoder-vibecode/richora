'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// Pass --global (or set DEPLOY_GLOBAL=true) to register commands worldwide
// instead of to a single guild. Global commands can take up to ~1 hour to
// propagate to Discord clients, while guild commands update instantly - so
// guild deployment is recommended while developing/testing.
const isGlobal = process.argv.includes('--global') || process.env.DEPLOY_GLOBAL === 'true';

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in your .env file.');
  console.error('   Copy .env.example to .env and fill in your values.');
  process.exit(1);
}

if (!isGlobal && !GUILD_ID) {
  console.error('❌ Missing GUILD_ID in your .env file (required for guild deployment).');
  console.error('   Either add GUILD_ID to .env, or run with --global to deploy globally instead.');
  process.exit(1);
}

const commands = [];
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

    if (!command || !command.data) {
      console.warn(`⚠️  Skipping invalid command file: ${filePath}`);
      continue;
    }

    commands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🚀 Deploying ${commands.length} slash command(s) to guild ${GUILD_ID}...`);

    const data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

    console.log(`✅ Successfully deployed ${data.length} slash command(s).`);
  } catch (err) {
    console.error('❌ Failed to deploy commands:', err);
    process.exit(1);
  }
})();
