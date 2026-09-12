'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getUser, saveUser } = require('../../utils/database');
const { getAllItems, getItem } = require('../../utils/items');
const { clampBalance, formatCurrency } = require('../../utils/economy');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop.')
    .addStringOption((option) =>
      option.setName('item').setDescription('The item to buy').setRequired(true).setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const matches = getAllItems()
      .filter((item) => item.name.toLowerCase().includes(focused))
      .slice(0, 25)
      .map((item) => ({ name: `${item.emoji} ${item.name} - ${formatCurrency(item.price)}`, value: item.id }));
    await interaction.respond(matches);
  },

  async execute(interaction) {
    const itemId = interaction.options.getString('item', true);
    const item = getItem(itemId);

    if (!item) {
      await interaction.reply({ embeds: [errorEmbed('That\'s not a valid item. Use `/shop` to browse available items.')], ephemeral: true });
      return;
    }

    const user = getUser(interaction.user.id);

    if (!Array.isArray(user.inventory)) user.inventory = [];

    if (user.inventory.includes(item.id)) {
      await interaction.reply({ embeds: [errorEmbed(`You already own the **${item.name}**.`)], ephemeral: true });
      return;
    }

    if (user.wallet < item.price) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            `The **${item.name}** costs **${formatCurrency(item.price)}**, but your wallet only has **${formatCurrency(user.wallet)}**.`
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    user.wallet = clampBalance(user.wallet - item.price);
    user.inventory.push(item.id);
    saveUser(interaction.user.id);

    await interaction.reply({
      embeds: [
        successEmbed(
          '🛍️ Purchase Successful',
          `You bought the **${item.emoji} ${item.name}** for **${formatCurrency(item.price)}**.\n\nNew wallet balance: ${formatCurrency(user.wallet)}`
        ),
      ],
    });
  },
};
