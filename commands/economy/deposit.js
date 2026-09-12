'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../../utils/database');
const { isValidAmount, clampBalance, formatCurrency } = require('../../utils/economy');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Move Credits from your wallet into your bank.')
    .addStringOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount to deposit, or "all"')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = getUser(interaction.user.id);
    const raw = interaction.options.getString('amount', true).trim().toLowerCase();

    let amount;
    if (raw === 'all') {
      amount = user.wallet;
    } else {
      amount = Number(raw);
    }

    if (user.wallet <= 0 && raw === 'all') {
      await interaction.reply({ embeds: [errorEmbed('You have no Credits in your wallet to deposit.')], ephemeral: true });
      return;
    }

    if (!isValidAmount(amount)) {
      await interaction.reply({
        embeds: [errorEmbed('Please enter a valid whole number greater than 0 (or `all`).')],
        ephemeral: true,
      });
      return;
    }

    if (amount > user.wallet) {
      await interaction.reply({
        embeds: [errorEmbed(`You only have **${formatCurrency(user.wallet)}** in your wallet.`)],
        ephemeral: true,
      });
      return;
    }

    user.wallet = clampBalance(user.wallet - amount);
    user.bank = clampBalance(user.bank + amount);
    saveUser(interaction.user.id);

    await interaction.reply({
      embeds: [
        successEmbed(
          '🏦 Deposit Successful',
          `Deposited **${formatCurrency(amount)}** into your bank.\n\nWallet: ${formatCurrency(user.wallet)}\nBank: ${formatCurrency(user.bank)}`
        ),
      ],
    });
  },
};
