'use strict';

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { getUser, saveUser } = require('../../utils/database');
const { getAllJobs, getJob } = require('../../utils/jobs');
const { changeJob, formatCurrency } = require('../../utils/economy');
const { baseEmbed, errorEmbed, successEmbed, COLORS } = require('../../utils/embeds');

const CONFIRM_TIMEOUT_MS = 30_000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('job')
    .setDescription('Select or switch your career.')
    .addStringOption((option) =>
      option
        .setName('job')
        .setDescription('The job to select')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const matches = getAllJobs()
      .filter((job) => job.name.toLowerCase().includes(focused))
      .slice(0, 25)
      .map((job) => ({ name: `${job.emoji} ${job.name}`, value: job.id }));
    await interaction.respond(matches);
  },

  async execute(interaction) {
    const jobId = interaction.options.getString('job', true);
    const newJob = getJob(jobId);

    if (!newJob) {
      await interaction.reply({
        embeds: [errorEmbed('That\'s not a valid job. Use `/jobs` to see all available careers.')],
        ephemeral: true,
      });
      return;
    }

    const user = getUser(interaction.user.id);

    if (user.job === jobId) {
      await interaction.reply({
        embeds: [errorEmbed(`You're already working as a **${newJob.name}**!`)],
        ephemeral: true,
      });
      return;
    }

    const isFirstJob = !user.job;

    // First job ever: instant, free, no confirmation needed.
    if (isFirstJob) {
      const result = changeJob(user, jobId);
      if (!result.ok) {
        await interaction.reply({ embeds: [errorEmbed('Something went wrong selecting that job. Please try again.')], ephemeral: true });
        return;
      }
      saveUser(interaction.user.id);
      await interaction.reply({
        embeds: [
          successEmbed(
            '🎉 Job Selected!',
            `You're now working as a **${newJob.emoji} ${newJob.name}**! This first job was free of charge.`
          ),
        ],
      });
      return;
    }

    const fee = newJob.changeFee;
    const currentJob = getJob(user.job);

    // Can't afford it - reject before ever showing confirmation buttons.
    if (user.wallet < fee) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            `Switching to **${newJob.name}** costs **${formatCurrency(fee)}**, but your wallet only has **${formatCurrency(user.wallet)}**.`
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const confirmEmbed = baseEmbed({
      color: COLORS.warning,
      title: '⚠️ Confirm Job Change',
      description: [
        `Switch from **${currentJob ? `${currentJob.emoji} ${currentJob.name}` : 'Unemployed'}** to **${newJob.emoji} ${newJob.name}**?`,
        '',
        `**Fee:** ${formatCurrency(fee)} (deducted from wallet)`,
        'Your inventory, other balances, and work cooldown will not be affected.',
      ].join('\n'),
    });

    const confirmButton = new ButtonBuilder()
      .setCustomId('job_change_confirm')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder()
      .setCustomId('job_change_cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [row],
    });

    const message = await interaction.fetchReply();

    let collector;
    try {
      collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: CONFIRM_TIMEOUT_MS,
        max: 1,
        filter: (i) => i.user.id === interaction.user.id,
      });
    } catch (err) {
      console.error('[job] Failed to create component collector:', err);
      return;
    }

    collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.customId === 'job_change_cancel') {
        await buttonInteraction.update({
          embeds: [baseEmbed({ color: COLORS.neutral, title: '❌ Cancelled', description: 'No changes were made. Nothing was charged.' })],
          components: [],
        });
        return;
      }

      // Re-fetch fresh user state at confirm time in case anything changed
      // in the seconds between the initial check and the button click.
      const freshUser = getUser(interaction.user.id);

      if (freshUser.job === jobId) {
        await buttonInteraction.update({
          embeds: [errorEmbed(`You're already working as a **${newJob.name}**!`)],
          components: [],
        });
        return;
      }

      if (freshUser.wallet < fee) {
        await buttonInteraction.update({
          embeds: [errorEmbed(`You no longer have enough Credits for this fee (**${formatCurrency(fee)}**).`)],
          components: [],
        });
        return;
      }

      const result = changeJob(freshUser, jobId);
      if (!result.ok) {
        await buttonInteraction.update({
          embeds: [errorEmbed('Something went wrong changing your job. Please try again.')],
          components: [],
        });
        return;
      }
      saveUser(interaction.user.id);

      await buttonInteraction.update({
        embeds: [
          successEmbed(
            '🎉 Job Changed!',
            `You're now working as a **${newJob.emoji} ${newJob.name}**! **${formatCurrency(fee)}** was deducted from your wallet.`
          ),
        ],
        components: [],
      });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        try {
          await interaction.editReply({
            embeds: [baseEmbed({ color: COLORS.neutral, title: '⌛ Timed Out', description: 'You didn\'t respond in time. No changes were made.' })],
            components: [],
          });
        } catch (err) {
          // Message may have been deleted or interaction expired; safe to ignore.
        }
      }
    });
  },
};
