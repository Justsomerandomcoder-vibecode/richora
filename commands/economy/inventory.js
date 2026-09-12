'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getUser } = require('../../utils/database');
const { getItem } = require('../../utils/items');
const { getJob } = require('../../utils/jobs');
const { getUserJob, calculateJobBonus } = require('../../utils/economy');
const { baseEmbed, COLORS } = require('../../utils/embeds');

/** Turn an item's jobBoosts map into a short "Job +X%" string. */
function formatBoosts(jobBoosts) {
  return Object.entries(jobBoosts)
    .map(([jobId, bonus]) => {
      const job = getJob(jobId);
      const label = job ? job.name : jobId;
      return `${label} +${Math.round(bonus * 100)}%`;
    })
    .join(', ');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your owned items and active job bonuses.'),

  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const inventory = Array.isArray(user.inventory) ? user.inventory : [];

    const embed = baseEmbed({ color: COLORS.primary, title: '🎒 INVENTORY' });

    if (inventory.length === 0) {
      embed.setDescription('You don\'t own any items yet. Check `/shop` to see what\'s available!');
    } else {
      for (const itemId of inventory) {
        const item = getItem(itemId);
        if (!item) continue;
        embed.addFields({
          name: `${item.emoji} ${item.name}`,
          value: `${item.description}\n**Bonuses:** ${formatBoosts(item.jobBoosts)}`,
        });
      }
    }

    const job = getUserJob(user);
    if (job) {
      const bonus = calculateJobBonus(user, job.id);
      embed.addFields({
        name: '📊 ACTIVE JOB BONUSES',
        value: `**Current Job:**\n${job.emoji} ${job.name}\n\n**Total Bonus:**\n+${Math.round(bonus * 100)}%`,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
