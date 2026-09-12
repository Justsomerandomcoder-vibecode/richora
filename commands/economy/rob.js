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
} = require('../../utils/economy');
const { baseEmbed, errorEmbed, COLORS } = require('../../utils/embeds');

const SUCCESS_CHANCE = 0.4;
const STEAL_MIN_PERCENT = 0.1;
const STEAL_MAX_PERCENT = 0.3;
const FAIL_LOSS_MIN = 100;
const FAIL_LOSS_MAX = 500;

const SUCCESS_MESSAGES = [
  'snuck in, grabbed the cash, and vanished into the night!',
  'picked the lock and made off with some Credits!',
  'distracted them just long enough to grab their wallet!',
];

const FAIL_MESSAGES = [
  'tripped the alarm and had to make a costly escape!',
  'got caught red-handed and had to pay their way out!',
  'fumbled the whole thing and dropped some Credits running away!',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to rob another user (2 hour cooldown, 40% success chance).')
    .addUserOption((option) => option.setName('user').setDescription('Who to rob').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('user', true);

    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed('You can\'t rob yourself.')], ephemeral: true });
      return;
    }

    if (target.bot) {
      await interaction.reply({ embeds: [errorEmbed('You can\'t rob bots.')], ephemeral: true });
      return;
    }

    const robber = getUser(interaction.user.id);

    const { onCooldown, remainingMs } = checkCooldown(robber, 'rob');
    if (onCooldown) {
      await interaction.reply({
        embeds: [errorEmbed(`You need to lay low. Try robbing again in **${formatDuration(remainingMs)}**.`)],
        ephemeral: true,
      });
      return;
    }

    const victim = getUser(target.id);

    if (victim.wallet <= 0) {
      await interaction.reply({
        embeds: [errorEmbed(`**${target.username}** has nothing in their wallet worth stealing.`)],
        ephemeral: true,
      });
      return;
    }

    setCooldown(robber, 'rob');

    const success = Math.random() < SUCCESS_CHANCE;

    if (success) {
      const percent = STEAL_MIN_PERCENT + Math.random() * (STEAL_MAX_PERCENT - STEAL_MIN_PERCENT);
      const stolen = Math.max(1, Math.min(victim.wallet, Math.round(victim.wallet * percent)));

      victim.wallet = clampBalance(victim.wallet - stolen);
      robber.wallet = clampBalance(robber.wallet + stolen);
      saveUser(interaction.user.id);
      saveUser(target.id);

      const embed = baseEmbed({
        color: COLORS.success,
        title: '🦹 Robbery Successful!',
        description: `You ${pick(SUCCESS_MESSAGES)}\n\nYou stole **${formatCurrency(stolen)}** from **${target.username}**!`,
      });
      await interaction.reply({ embeds: [embed] });
    } else {
      const loss = randomInt(FAIL_LOSS_MIN, FAIL_LOSS_MAX);
      const actualLoss = Math.min(loss, robber.wallet);
      robber.wallet = clampBalance(robber.wallet - actualLoss);
      saveUser(interaction.user.id);

      const embed = baseEmbed({
        color: COLORS.danger,
        title: '🚨 Robbery Failed!',
        description: `You ${pick(FAIL_MESSAGES)}\n\nYou lost **${formatCurrency(actualLoss)}**.`,
      });
      await interaction.reply({ embeds: [embed] });
    }
  },
};
