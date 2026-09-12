'use strict';

/**
 * Centralized item / shop configuration.
 *
 * Each item has:
 *  - id: unique lowercase identifier
 *  - name: display name
 *  - emoji: display emoji
 *  - description: short flavor text
 *  - price: cost in Credits
 *  - jobBoosts: map of jobId -> decimal bonus (0.10 = +10%) applied to /work
 *      income when the user owns this item AND currently has that job.
 *  - unique: whether a user can only own one of this item (all items are
 *      unique by default per the economy design - no stacking duplicates).
 *
 * IMPORTANT: This is the single source of truth for item data. Do not
 * duplicate item numbers anywhere else in the codebase - always import
 * from here.
 */

const ITEMS = [
  {
    id: 'laptop',
    name: 'Laptop',
    emoji: '💻',
    description: 'A solid work laptop. Great for coding, writing, and crunching numbers.',
    price: 3000,
    jobBoosts: {
      software_developer: 0.1,
      writer: 0.05,
      business_consultant: 0.05,
      data_analyst: 0.1,
    },
    unique: true,
  },
  {
    id: 'gaming_pc',
    name: 'Gaming PC',
    emoji: '🖥️',
    description: 'A high-end rig built for game development, competitive gaming, and streaming.',
    price: 10000,
    jobBoosts: {
      game_developer: 0.2,
      esports_player: 0.2,
      streamer: 0.15,
      digital_artist: 0.1,
    },
    unique: true,
  },
  {
    id: 'drawing_tablet',
    name: 'Drawing Tablet',
    emoji: '🎨',
    description: 'A pressure-sensitive tablet for digital art and other creative work.',
    price: 6000,
    jobBoosts: {
      digital_artist: 0.3,
      video_editor: 0.1,
      photographer: 0.1,
      content_creator: 0.1,
      writer: 0.1,
    },
    unique: true,
  },
  {
    id: 'professional_camera',
    name: 'Professional Camera',
    emoji: '🎥',
    description: 'A high-resolution camera for capturing pristine shots and footage.',
    price: 8000,
    jobBoosts: {
      photographer: 0.25,
      content_creator: 0.15,
      journalist: 0.1,
      actor: 0.05,
    },
    unique: true,
  },
  {
    id: 'editing_pc',
    name: 'Editing PC',
    emoji: '🎬',
    description: 'A powerful workstation built for video rendering and editing.',
    price: 12000,
    jobBoosts: {
      video_editor: 0.25,
      content_creator: 0.15,
      game_developer: 0.1,
    },
    unique: true,
  },
  {
    id: 'music_studio',
    name: 'Music Studio',
    emoji: '🎵',
    description: 'A fully equipped studio for producing and recording music.',
    price: 15000,
    jobBoosts: {
      music_producer: 0.3,
      musician: 0.25,
    },
    unique: true,
  },
  {
    id: 'office',
    name: 'Office',
    emoji: '🏢',
    description: 'A professional office space to run your business out of.',
    price: 20000,
    jobBoosts: {
      business_consultant: 0.2,
      entrepreneur: 0.15,
      architect: 0.1,
    },
    unique: true,
  },
  {
    id: 'research_lab',
    name: 'Research Lab',
    emoji: '🔬',
    description: 'A fully-stocked lab for scientific research and experimentation.',
    price: 30000,
    jobBoosts: {
      scientist: 0.25,
      space_researcher: 0.25,
      engineer: 0.15,
    },
    unique: true,
  },
  {
    id: 'cybersecurity_lab',
    name: 'Cybersecurity Lab',
    emoji: '🛡️',
    description: 'A hardened lab environment for penetration testing and threat research.',
    price: 25000,
    jobBoosts: {
      cybersecurity_analyst: 0.25,
    },
    unique: true,
  },
  {
    id: 'private_server',
    name: 'Private Server',
    emoji: '🖥️',
    description: 'A dedicated private server for hosting, testing, and securing projects.',
    price: 20000,
    jobBoosts: {
      cybersecurity_analyst: 0.15,
      software_developer: 0.05,
    },
    unique: true,
  },
  {
    id: 'ai_supercomputer',
    name: 'AI Supercomputer',
    emoji: '🤖',
    description: 'A massive compute cluster that supercharges technical and research-heavy work.',
    price: 100000,
    jobBoosts: {
      software_developer: 0.25,
      cybersecurity_analyst: 0.3,
      game_developer: 0.2,
      data_analyst: 0.3,
      scientist: 0.25,
      space_researcher: 0.35,
    },
    unique: true,
  },
  {
    id: 'racing_simulator',
    name: 'Racing Simulator',
    emoji: '🏎️',
    description: 'A pro-grade racing rig for sharpening reflexes and race craft.',
    price: 18000,
    jobBoosts: {
      race_driver: 0.25,
      esports_player: 0.1,
    },
    unique: true,
  },
  {
    id: 'streaming_setup',
    name: 'Streaming Setup',
    emoji: '🎙️',
    description: 'Cameras, lighting, and capture gear for high-quality streams and content.',
    price: 15000,
    jobBoosts: {
      streamer: 0.3,
      content_creator: 0.2,
    },
    unique: true,
  },
  {
    id: 'medical_equipment',
    name: 'Medical Equipment',
    emoji: '🏥',
    description: 'Advanced diagnostic and treatment equipment for medical practice.',
    price: 40000,
    jobBoosts: {
      doctor: 0.25,
    },
    unique: true,
  },
];

const ITEMS_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

/**
 * Get an item definition by its id.
 * @param {string} id
 * @returns {object|null}
 */
function getItem(id) {
  if (!id || typeof id !== 'string') return null;
  return ITEMS_BY_ID.get(id) || null;
}

/**
 * Returns all items, sorted alphabetically by name for display.
 */
function getAllItems() {
  return [...ITEMS].sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
  ITEMS,
  getItem,
  getAllItems,
};
