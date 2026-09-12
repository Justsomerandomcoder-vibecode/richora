'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../../utils/database');
const {
  checkCooldown,
  setCooldown,
  formatDuration,
  formatCurrency,
  clampBalance,
  randomInt,
  COOLDOWNS,
} = require('../../utils/economy');
const { baseEmbed, errorEmbed, COLORS } = require('../../utils/embeds');
const vip = require('../../utils/vip');

const MIN_DAILY = 500;
const MAX_DAILY = 1500;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily Credits reward (500-1,500, once every 24 hours).'),

  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const owner = vip.isOwner(interaction.user.id);

    const cooldownMs = owner ? COOLDOWNS.daily * vip.COOLDOWN_MULTIPLIER : undefined;
    const { onCooldown, remainingMs } = checkCooldown(user, 'daily', cooldownMs);
    if (onCooldown) {
      await interaction.reply({
        embeds: [
          errorEmbed(`You've already claimed your daily reward. Come back in **${formatDuration(remainingMs)}**.`),
        ],
        ephemeral: true,
      });
      return;
    }

    // Lock the cooldown immediately to prevent double-claims from rapid
    // double-submission before the write completes.
    setCooldown(user, 'daily');

    let reward = randomInt(MIN_DAILY, MAX_DAILY);
    if (owner) {
      reward = Math.round(reward * (1 + vip.INCOME_BONUS));
    }
    user.wallet = clampBalance(user.wallet + reward);
    saveUser(interaction.user.id);

    const embed = baseEmbed({
      color: COLORS.success,
      title: '🎁 Daily Reward Claimed!',
      description: [owner ? vip.GREETING : null, `You received **${formatCurrency(reward)}**!`]
        .filter(Boolean)
        .join('\n'),
    }).addFields({ name: 'New Wallet Balance', value: formatCurrency(user.wallet) });

    await interaction.reply({ embeds: [embed] });
  },
};
