'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed, COLORS } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check the bot\'s latency.'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
    const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = Math.round(interaction.client.ws.ping);

    const embed = baseEmbed({ color: COLORS.info, title: '🏓 Pong!' }).addFields(
      { name: 'Round Trip', value: `${roundTrip}ms`, inline: true },
      { name: 'WebSocket', value: `${wsLatency}ms`, inline: true }
    );

    await interaction.editReply({ content: null, embeds: [embed] });
  },
};
