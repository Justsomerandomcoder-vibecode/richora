'use strict';

const { Events, MessageFlags } = require('discord.js');
const { errorEmbed } = require('../utils/embeds');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`[interactionCreate] No command matching "${interaction.commandName}" was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`[interactionCreate] Error executing "${interaction.commandName}":`, err);

        const payload = {
          embeds: [errorEmbed('Something went wrong while running that command. Please try again in a moment.')],
        };

        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ ...payload, flags: MessageFlags.Ephemeral });
          } else {
            await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
          }
        } catch (replyErr) {
          console.error('[interactionCreate] Failed to send error response:', replyErr);
        }
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command || typeof command.autocomplete !== 'function') {
        return;
      }

      try {
        await command.autocomplete(interaction);
      } catch (err) {
        console.error(`[interactionCreate] Error during autocomplete for "${interaction.commandName}":`, err);
      }
    }
  },
};
