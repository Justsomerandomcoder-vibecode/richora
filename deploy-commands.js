'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in your .env file.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

const commandFolders = fs.readdirSync(commandsPath).filter((entry) =>
  fs.statSync(path.join(commandsPath, entry)).isDirectory()
);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter((file) =>
    file.endsWith('.js')
  );

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    if (!command || !command.data) {
      console.warn(`⚠️ Skipping invalid command file: ${filePath}`);
      continue;
    }

    commands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🌍 Deploying ${commands.length} slash command(s) globally...`);

    const data = await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log(`✅ Successfully deployed ${data.length} global slash command(s).`);
  } catch (err) {
    console.error('❌ Failed to deploy global commands:', err);
    process.exit(1);
  }
})();