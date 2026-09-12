'use strict';

const { EmbedBuilder } = require('discord.js');

/** Shared color palette for a clean, dark, slightly cyber/economy vibe. */
const COLORS = {
  primary: 0x2b2d6b, // deep indigo - default brand color
  success: 0x2ecc71,
  danger: 0xe74c3c,
  warning: 0xf1c40f,
  info: 0x3498db,
  neutral: 0x2f3136,
};

/**
 * Base embed with shared styling (color, timestamp). Pass overrides as needed.
 * @param {{color?: number, title?: string, description?: string}} [opts]
 */
function baseEmbed(opts = {}) {
  const embed = new EmbedBuilder()
    .setColor(opts.color ?? COLORS.primary)
    .setTimestamp();
  if (opts.title) embed.setTitle(opts.title);
  if (opts.description) embed.setDescription(opts.description);
  return embed;
}

/** A standardized error embed. */
function errorEmbed(message) {
  return baseEmbed({ color: COLORS.danger, title: '⚠️ Error', description: message });
}

/** A standardized success embed. */
function successEmbed(title, message) {
  return baseEmbed({ color: COLORS.success, title: title ?? '✅ Success', description: message });
}

module.exports = {
  COLORS,
  baseEmbed,
  errorEmbed,
  successEmbed,
};
