'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed, COLORS } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('See all available commands.'),

  async execute(interaction) {
    const embed = baseEmbed({
      color: COLORS.primary,
      title: '📖 HELP — Economy Bot Commands',
      description: 'Build your fortune, pick a career, and climb the leaderboard!',
    }).addFields(
      {
        name: '💰 Economy',
        value: [
          '`/balance [user]` — Check wallet, bank, and net worth',
          '`/daily` — Claim your daily reward (500-1,500 Credits)',
          '`/deposit <amount|all>` — Move Credits into your bank',
          '`/withdraw <amount|all>` — Move Credits out of your bank',
          '`/pay <user> <amount>` — Send Credits to another user',
          '`/leaderboard` — See the top 10 richest users',
        ].join('\n'),
      },
      {
        name: '💼 Careers',
        value: [
          '`/jobs` — Browse all available careers',
          '`/job <job>` — Select or switch your career',
          '`/work` — Work your job to earn Credits (1 hour cooldown)',
        ].join('\n'),
      },
      {
        name: '🛒 Shop',
        value: [
          '`/shop` — Browse items that boost job income',
          '`/buy <item>` — Purchase an item',
          '`/inventory` — View your items and active bonuses',
        ].join('\n'),
      },
      {
        name: '🎲 Risk It',
        value: [
          '`/crime` — Attempt a crime (1 hour cooldown, 50% success)',
          '`/rob <user>` — Attempt to rob someone (2 hour cooldown, 40% success)',
          '`/coinflip <amount> <heads/tails>` — Bet on a coin flip',
        ].join('\n'),
      },
      {
        name: '🔧 Utility',
        value: ['`/ping` — Check the bot\'s latency', '`/help` — Show this message'].join('\n'),
      }
    );

    await interaction.reply({ embeds: [embed] });
  },
};
