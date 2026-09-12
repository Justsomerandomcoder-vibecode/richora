'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../../utils/database');
const { isValidAmount, clampBalance, formatCurrency } = require('../../utils/economy');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Transfer Credits to another user.')
    .addUserOption((option) => option.setName('user').setDescription('Who to pay').setRequired(true))
    .addIntegerOption((option) =>
      option.setName('amount').setDescription('Amount to pay').setRequired(true).setMinValue(1)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);

    if (target.bot) {
      await interaction.reply({ embeds: [errorEmbed('You can\'t pay bots.')], ephemeral: true });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed('You can\'t pay yourself.')], ephemeral: true });
      return;
    }

    if (!isValidAmount(amount)) {
      await interaction.reply({ embeds: [errorEmbed('Please enter a valid whole number greater than 0.')], ephemeral: true });
      return;
    }

    const sender = getUser(interaction.user.id);

    if (amount > sender.wallet) {
      await interaction.reply({
        embeds: [errorEmbed(`You only have **${formatCurrency(sender.wallet)}** in your wallet.`)],
        ephemeral: true,
      });
      return;
    }

    const recipient = getUser(target.id);

    sender.wallet = clampBalance(sender.wallet - amount);
    recipient.wallet = clampBalance(recipient.wallet + amount);
    saveUser(interaction.user.id);
    saveUser(target.id);

    await interaction.reply({
      embeds: [
        successEmbed(
          '💸 Payment Sent',
          `You paid **${target.username}** **${formatCurrency(amount)}**.\n\nYour new wallet balance: ${formatCurrency(sender.wallet)}`
        ),
      ],
    });
  },
};
