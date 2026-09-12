'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { getAllJobs, isFixedIncome } = require('../../utils/jobs');
const { formatCurrency } = require('../../utils/economy');
const { baseEmbed, COLORS } = require('../../utils/embeds');

/** Group jobs by category, preserving a sensible category display order. */
function groupByCategory(jobs) {
  const order = [
    'Technology',
    'Creative',
    'Gaming',
    'Business',
    'Entertainment',
    'Science',
    'Education',
    'Media',
    'Professional',
    'Service',
  ];
  const groups = new Map();
  for (const job of jobs) {
    if (!groups.has(job.category)) groups.set(job.category, []);
    groups.get(job.category).push(job);
  }
  // Sort groups by our preferred order, falling back to alphabetical for
  // any category not explicitly listed.
  return [...groups.entries()].sort((a, b) => {
    const ia = order.indexOf(a[0]);
    const ib = order.indexOf(b[0]);
    if (ia === -1 && ib === -1) return a[0].localeCompare(b[0]);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function formatIncomeRange(job) {
  if (isFixedIncome(job)) {
    return `${formatCurrency(job.minIncome)} (fixed)`;
  }
  return `${job.minIncome.toLocaleString('en-US')}-${job.maxIncome.toLocaleString('en-US')} Credits`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jobs')
    .setDescription('Browse all available careers.'),

  async execute(interaction) {
    const jobs = getAllJobs();
    const grouped = groupByCategory(jobs);

    const embed = baseEmbed({
      color: COLORS.info,
      title: '📋 AVAILABLE CAREERS',
      description: 'Use `/job <job>` to select a career. Your first job is free — switching later costs a fee.',
    });

    for (const [category, categoryJobs] of grouped) {
      const lines = categoryJobs.map((job) => {
        return `${job.emoji} **${job.name}** — ${formatIncomeRange(job)} • Risk: ${job.risk} • Fee: ${formatCurrency(job.changeFee)}`;
      });
      embed.addFields({ name: category, value: lines.join('\n') });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
