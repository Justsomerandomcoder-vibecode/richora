'use strict';

const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);

    try {
      client.user.setPresence({
        activities: [{ name: '/help | Building an economy', type: ActivityType.Playing }],
        status: 'online',
      });
    } catch (err) {
      console.error('[ready] Failed to set presence:', err);
    }
  },
};
