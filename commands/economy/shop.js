'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getAllItems } = require('../../utils/items');
const { getJob } = require('../../utils/jobs');
const { formatCurrency } = require('../../utils/economy');
const { baseEmbed, COLORS } = require('../../utils/embeds');

/** Turn an item's jobBoosts map into a short "Job +X%, Job +Y%" string. */
function formatBoosts(jobBoosts) {
  const entries = Object.entries(jobBoosts)
    .map(([jobId, bonus]) => {
      const job = getJob(jobId);
      const label = job ? job.name : jobId;
      return `${label} +${Math.round(bonus * 100)}%`;
    })
    .slice(0, 4); // keep it clean - full list is visible via /inventory once owned
  return entries.join(', ');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Browse items you can buy to boost your job income.'),

  async execute(interaction) {
    const items = getAllItems();

    const embed = baseEmbed({
      color: COLORS.primary,
      title: '🛒 ITEM SHOP',
      description: 'Use `/buy <item>` to purchase. Items boost income for specific jobs - they don\'t give free money.',
    });

    for (const item of items) {
      const value = [
        item.description,
        `**Price:** ${formatCurrency(item.price)}`,
        `**Boosts:** ${formatBoosts(item.jobBoosts)}`,
      ].join('\n');
      embed.addFields({ name: `${item.emoji} ${item.name}`, value });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
