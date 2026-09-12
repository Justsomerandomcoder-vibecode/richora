'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getAllUsers } = require('../../utils/database');
const { calculateNetWorth, formatCurrency } = require('../../utils/economy');
const { baseEmbed, COLORS } = require('../../utils/embeds');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('See the richest 10 users (wallet + bank + item value).'),

  async execute(interaction) {
    await interaction.deferReply();

    const allUsers = getAllUsers();
    const ranked = allUsers
      .map(([userId, user]) => ({ userId, netWorth: calculateNetWorth(user) }))
      .filter((entry) => entry.netWorth > 0)
      .sort((a, b) => b.netWorth - a.netWorth)
      .slice(0, 10);

    if (ranked.length === 0) {
      await interaction.editReply({
        embeds: [baseEmbed({ color: COLORS.info, title: '🏆 LEADERBOARD', description: 'No one has any Credits yet!' })],
      });
      return;
    }

    const lines = await Promise.all(
      ranked.map(async (entry, index) => {
        const rank = MEDALS[index] ?? `#${index + 1}`;
        let displayName = `<@${entry.userId}>`;
        try {
          const member = await interaction.client.users.fetch(entry.userId);
          displayName = member.username;
        } catch (err) {
          // User may have left Discord entirely; fall back to a mention.
        }
        return `${rank} **${displayName}** — ${formatCurrency(entry.netWorth)}`;
      })
    );

    const embed = baseEmbed({
      color: COLORS.warning,
      title: '🏆 LEADERBOARD',
      description: lines.join('\n'),
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
