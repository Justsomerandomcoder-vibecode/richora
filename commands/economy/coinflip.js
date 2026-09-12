'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../../utils/database');
const { isValidAmount, clampBalance, formatCurrency } = require('../../utils/economy');
const { baseEmbed, errorEmbed, COLORS } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Bet Credits on a 50/50 coin flip.')
    .addIntegerOption((option) =>
      option.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1)
    )
    .addStringOption((option) =>
      option
        .setName('choice')
        .setDescription('Heads or tails')
        .setRequired(true)
        .addChoices({ name: 'Heads', value: 'heads' }, { name: 'Tails', value: 'tails' })
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount', true);
    const choice = interaction.options.getString('choice', true);

    if (!isValidAmount(amount)) {
      await interaction.reply({ embeds: [errorEmbed('Please enter a valid whole number greater than 0.')], ephemeral: true });
      return;
    }

    const user = getUser(interaction.user.id);

    if (amount > user.wallet) {
      await interaction.reply({
        embeds: [errorEmbed(`You only have **${formatCurrency(user.wallet)}** in your wallet.`)],
        ephemeral: true,
      });
      return;
    }

    // Deduct the bet up-front so a crash mid-flip can never duplicate Credits.
    user.wallet = clampBalance(user.wallet - amount);

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = result === choice;

    if (won) {
      // Return the original bet plus profit equal to the bet amount.
      user.wallet = clampBalance(user.wallet + amount * 2);
    }
    saveUser(interaction.user.id);

    const embed = baseEmbed({
      color: won ? COLORS.success : COLORS.danger,
      title: won ? '🪙 You Won!' : '🪙 You Lost!',
      description: won
        ? `The coin landed on **${result}**! You won **${formatCurrency(amount)}**.`
        : `The coin landed on **${result}**. You lost **${formatCurrency(amount)}**.`,
    }).addFields({ name: 'New Wallet Balance', value: formatCurrency(user.wallet) });

    await interaction.reply({ embeds: [embed] });
  },
};
