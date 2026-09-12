'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getUser } = require('../../utils/database');
const { getUserJob, calculateJobBonus, calculateNetWorth, formatCurrency } = require('../../utils/economy');
const { baseEmbed, COLORS } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your (or someone else\'s) Credits balance and job.')
    .addUserOption((option) =>
      option.setName('user').setDescription('Whose balance to check (defaults to you)').setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const user = getUser(target.id);

    const job = getUserJob(user);
    const netWorth = calculateNetWorth(user);

    const embed = baseEmbed({
      color: COLORS.primary,
      title: '💰 BALANCE',
    })
      .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
      .addFields(
        { name: 'Wallet', value: formatCurrency(user.wallet), inline: true },
        { name: 'Bank', value: formatCurrency(user.bank), inline: true },
        { name: 'Net Worth', value: formatCurrency(netWorth), inline: true }
      );

    if (job) {
      const bonus = calculateJobBonus(user, job.id);
      embed.addFields({ name: '💼 Current Job', value: `${job.emoji} ${job.name}`, inline: true });
      if (bonus > 0) {
        embed.addFields({ name: '📈 Job Bonus', value: `+${Math.round(bonus * 100)}%`, inline: true });
      }
    } else {
      embed.addFields({ name: '💼 Current Job', value: 'None — use `/jobs` to get started!', inline: false });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
