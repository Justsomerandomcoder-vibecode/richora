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

const SUCCESS_CHANCE = 0.5;
const SUCCESS_MIN = 500;
const SUCCESS_MAX = 2000;
const FAIL_LOSS_MIN = 200;
const FAIL_LOSS_MAX = 750;

const SUCCESS_MESSAGES = [
  'pulled off a slick scheme and walked away with a tidy profit.',
  'ran a clever hustle that paid off big time.',
  'got away clean with a hefty haul.',
];

const FAIL_MESSAGES = [
  'got busted and had to pay a fine.',
  'botched the plan and lost some Credits in the chaos.',
  'tripped the silent alarm and had to bail in a hurry.',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Commit a crime for a shot at quick Credits (1 hour cooldown, 50% success chance).'),

  async execute(interaction) {
    const user = getUser(interaction.user.id);

    const { onCooldown, remainingMs } = checkCooldown(user, 'crime');
    if (onCooldown) {
      await interaction.reply({
        embeds: [errorEmbed(`The heat is still on. Try again in **${formatDuration(remainingMs)}**.`)],
        ephemeral: true,
      });
      return;
    }

    setCooldown(user, 'crime');

    const success = Math.random() < SUCCESS_CHANCE;

    if (success) {
      const reward = randomInt(SUCCESS_MIN, SUCCESS_MAX);
      user.wallet = clampBalance(user.wallet + reward);
      saveUser(interaction.user.id);

      const embed = baseEmbed({
        color: COLORS.success,
        title: '😎 Crime Successful!',
        description: `You ${pick(SUCCESS_MESSAGES)}\n\nYou earned **${formatCurrency(reward)}**!`,
      });
      await interaction.reply({ embeds: [embed] });
    } else {
      const loss = randomInt(FAIL_LOSS_MIN, FAIL_LOSS_MAX);
      const actualLoss = Math.min(loss, user.wallet);
      user.wallet = clampBalance(user.wallet - actualLoss);
      saveUser(interaction.user.id);

      const embed = baseEmbed({
        color: COLORS.danger,
        title: '🚔 Crime Failed!',
        description: `You ${pick(FAIL_MESSAGES)}\n\nYou lost **${formatCurrency(actualLoss)}**.`,
      });
      await interaction.reply({ embeds: [embed] });
    }
  },
};
