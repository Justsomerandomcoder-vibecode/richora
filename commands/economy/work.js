'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../../utils/database');
const {
  checkCooldown,
  setCooldown,
  calculateWorkIncome,
  formatDuration,
  formatCurrency,
  clampBalance,
  COOLDOWNS,
} = require('../../utils/economy');
const { baseEmbed, errorEmbed, COLORS } = require('../../utils/embeds');
const vip = require('../../utils/vip');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work your job to earn Credits (1 hour cooldown).'),

  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const owner = vip.isOwner(interaction.user.id);

    if (!user.job) {
      await interaction.reply({
        embeds: [errorEmbed('You don\'t have a job yet! Use `/jobs` to browse careers and `/job <job>` to pick one.')],
        ephemeral: true,
      });
      return;
    }

    const cooldownMs = owner ? COOLDOWNS.work * vip.COOLDOWN_MULTIPLIER : undefined;
    const { onCooldown, remainingMs } = checkCooldown(user, 'work', cooldownMs);
    if (onCooldown) {
      await interaction.reply({
        embeds: [errorEmbed(`You're tired from your last shift. You can work again in **${formatDuration(remainingMs)}**.`)],
        ephemeral: true,
      });
      return;
    }

    const extraBonus = owner ? vip.INCOME_BONUS : 0;
    const result = calculateWorkIncome(user, extraBonus);
    if (!result) {
      // Shouldn't happen since we already checked user.job, but guard anyway.
      await interaction.reply({ embeds: [errorEmbed('You don\'t have a valid job. Use `/jobs` to pick one.')], ephemeral: true });
      return;
    }

    setCooldown(user, 'work');
    user.wallet = clampBalance(user.wallet + result.final);
    saveUser(interaction.user.id);

    const embed = baseEmbed({
      color: COLORS.success,
      title: '💼 Work Complete!',
      description: owner ? vip.GREETING : undefined,
    }).addFields(
      { name: 'Job', value: `${result.job.emoji} ${result.job.name}`, inline: false },
      { name: '💰 Base Earnings', value: formatCurrency(result.base), inline: true },
      {
        name: '📈 Item Bonus',
        value: result.itemBonusPercent > 0 ? `+${Math.round(result.itemBonusPercent * 100)}%` : 'None',
        inline: true,
      }
    );

    if (result.extraBonusPercent > 0) {
      embed.addFields({ name: '👑 VIP Bonus', value: `+${Math.round(result.extraBonusPercent * 100)}%`, inline: true });
    }

    embed.addFields({ name: '💵 Final Earnings', value: formatCurrency(result.final), inline: true });

    await interaction.reply({ embeds: [embed] });
  },
};
