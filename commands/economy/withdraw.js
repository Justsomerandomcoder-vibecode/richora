'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../../utils/database');
const { isValidAmount, clampBalance, formatCurrency } = require('../../utils/economy');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Move Credits from your bank into your wallet.')
    .addStringOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount to withdraw, or "all"')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const raw = interaction.options.getString('amount', true).trim().toLowerCase();

    let amount;
    if (raw === 'all') {
      amount = user.bank;
    } else {
      amount = Number(raw);
    }

    if (user.bank <= 0 && raw === 'all') {
      await interaction.reply({ embeds: [errorEmbed('You have no Credits in your bank to withdraw.')], ephemeral: true });
      return;
    }

    if (!isValidAmount(amount)) {
      await interaction.reply({
        embeds: [errorEmbed('Please enter a valid whole number greater than 0 (or `all`).')],
        ephemeral: true,
      });
      return;
    }

    if (amount > user.bank) {
      await interaction.reply({
        embeds: [errorEmbed(`You only have **${formatCurrency(user.bank)}** in your bank.`)],
        ephemeral: true,
      });
      return;
    }

    user.bank = clampBalance(user.bank - amount);
    user.wallet = clampBalance(user.wallet + amount);
    saveUser(interaction.user.id);

    await interaction.reply({
      embeds: [
        successEmbed(
          '🏦 Withdrawal Successful',
          `Withdrew **${formatCurrency(amount)}** from your bank.\n\nWallet: ${formatCurrency(user.wallet)}\nBank: ${formatCurrency(user.bank)}`
        ),
      ],
    });
  },
};
