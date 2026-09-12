'use strict';

/**
 * Centralized job configuration.
 *
 * Each job has:
 *  - id: unique lowercase identifier (used internally & in slash command choices)
 *  - name: display name
 *  - emoji: display emoji
 *  - category: broad career category (for flavor / future filtering)
 *  - minIncome / maxIncome: income range per /work use.
 *      If minIncome === maxIncome, the job is a FIXED-income job.
 *  - risk: display-only risk label describing income volatility
 *  - changeFee: cost in Credits to switch INTO this job (waived for a user's very first job)
 *
 * IMPORTANT: This is the single source of truth for job data. Do not duplicate
 * job numbers anywhere else in the codebase - always import from here.
 */

const JOBS = [
  {
    id: 'software_developer',
    name: 'Software Developer',
    emoji: '💻',
    category: 'Technology',
    minIncome: 500,
    maxIncome: 850,
    risk: 'Low',
    changeFee: 2500,
  },
  {
    id: 'game_developer',
    name: 'Game Developer',
    emoji: '🎮',
    category: 'Technology',
    minIncome: 350,
    maxIncome: 1200,
    risk: 'High',
    changeFee: 2500,
  },
  {
    id: 'digital_artist',
    name: 'Digital Artist',
    emoji: '🎨',
    category: 'Creative',
    minIncome: 300,
    maxIncome: 1000,
    risk: 'Medium',
    changeFee: 2000,
  },
  {
    id: 'video_editor',
    name: 'Video Editor',
    emoji: '🎬',
    category: 'Creative',
    minIncome: 400,
    maxIncome: 900,
    risk: 'Medium',
    changeFee: 2000,
  },
  {
    id: 'music_producer',
    name: 'Music Producer',
    emoji: '🎵',
    category: 'Entertainment',
    minIncome: 250,
    maxIncome: 1500,
    risk: 'High',
    changeFee: 2000,
  },
  {
    id: 'photographer',
    name: 'Photographer',
    emoji: '📸',
    category: 'Creative',
    minIncome: 300,
    maxIncome: 1300,
    risk: 'High',
    changeFee: 2000,
  },
  {
    id: 'writer',
    name: 'Writer',
    emoji: '✍️',
    category: 'Media',
    minIncome: 350,
    maxIncome: 700,
    risk: 'Low',
    changeFee: 1500,
  },
  {
    id: 'content_creator',
    name: 'Content Creator',
    emoji: '📱',
    category: 'Media',
    minIncome: 100,
    maxIncome: 2500,
    risk: 'Extreme',
    changeFee: 3000,
  },
  {
    id: 'business_consultant',
    name: 'Business Consultant',
    emoji: '📈',
    category: 'Business',
    minIncome: 600,
    maxIncome: 1000,
    risk: 'Low',
    changeFee: 3000,
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    emoji: '💼',
    category: 'Business',
    minIncome: 0,
    maxIncome: 5000,
    risk: 'Extreme',
    changeFee: 5000,
  },
  {
    id: 'teacher',
    name: 'Teacher',
    emoji: '👨‍🏫',
    category: 'Education',
    minIncome: 600,
    maxIncome: 600,
    risk: 'Very Low',
    changeFee: 1500,
  },
  {
    id: 'scientist',
    name: 'Scientist',
    emoji: '🔬',
    category: 'Science',
    minIncome: 700,
    maxIncome: 900,
    risk: 'Low',
    changeFee: 3500,
  },
  {
    id: 'chef',
    name: 'Chef',
    emoji: '👨‍🍳',
    category: 'Service',
    minIncome: 400,
    maxIncome: 850,
    risk: 'Medium',
    changeFee: 2000,
  },
  {
    id: 'doctor',
    name: 'Doctor',
    emoji: '🏥',
    category: 'Professional',
    minIncome: 1000,
    maxIncome: 1300,
    risk: 'Very Low',
    changeFee: 5000,
  },
  {
    id: 'esports_player',
    name: 'Esports Player',
    emoji: '🎮',
    category: 'Gaming',
    minIncome: 200,
    maxIncome: 4000,
    risk: 'Extreme',
    changeFee: 4000,
  },
  {
    id: 'streamer',
    name: 'Streamer',
    emoji: '🎙️',
    category: 'Gaming',
    minIncome: 50,
    maxIncome: 3500,
    risk: 'Extreme',
    changeFee: 3500,
  },
  {
    id: 'musician',
    name: 'Musician',
    emoji: '🎤',
    category: 'Entertainment',
    minIncome: 150,
    maxIncome: 2500,
    risk: 'Extreme',
    changeFee: 3000,
  },
  {
    id: 'journalist',
    name: 'Journalist',
    emoji: '📰',
    category: 'Media',
    minIncome: 400,
    maxIncome: 750,
    risk: 'Low',
    changeFee: 2000,
  },
  {
    id: 'architect',
    name: 'Architect',
    emoji: '🏗️',
    category: 'Professional',
    minIncome: 650,
    maxIncome: 1100,
    risk: 'Medium',
    changeFee: 3500,
  },
  {
    id: 'cybersecurity_analyst',
    name: 'Cybersecurity Analyst',
    emoji: '🛡️',
    category: 'Technology',
    minIncome: 550,
    maxIncome: 950,
    risk: 'Low',
    changeFee: 3000,
  },
  {
    id: 'engineer',
    name: 'Engineer',
    emoji: '⚙️',
    category: 'Science',
    minIncome: 600,
    maxIncome: 1000,
    risk: 'Low',
    changeFee: 3000,
  },
  {
    id: 'space_researcher',
    name: 'Space Researcher',
    emoji: '🧑‍🚀',
    category: 'Science',
    minIncome: 800,
    maxIncome: 1500,
    risk: 'Medium',
    changeFee: 4000,
  },
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    emoji: '📊',
    category: 'Technology',
    minIncome: 450,
    maxIncome: 850,
    risk: 'Low',
    changeFee: 2500,
  },
  {
    id: 'actor',
    name: 'Actor',
    emoji: '🎭',
    category: 'Entertainment',
    minIncome: 100,
    maxIncome: 3000,
    risk: 'Extreme',
    changeFee: 3500,
  },
  {
    id: 'race_driver',
    name: 'Race Driver',
    emoji: '🏎️',
    category: 'Gaming',
    minIncome: 200,
    maxIncome: 5000,
    risk: 'Extreme',
    changeFee: 4500,
  },
  {
    id: 'food_critic',
    name: 'Food Critic',
    emoji: '🍽️',
    category: 'Service',
    minIncome: 300,
    maxIncome: 1100,
    risk: 'Medium',
    changeFee: 2000,
  },
];

// Fast lookup map, built once.
const JOBS_BY_ID = new Map(JOBS.map((job) => [job.id, job]));

/**
 * Get a job definition by its id.
 * @param {string} id
 * @returns {object|null}
 */
function getJob(id) {
  if (!id || typeof id !== 'string') return null;
  return JOBS_BY_ID.get(id) || null;
}

/**
 * Returns true if the job is a fixed-income job (min === max).
 * @param {object} job
 */
function isFixedIncome(job) {
  return job.minIncome === job.maxIncome;
}

/**
 * Get all jobs, sorted alphabetically by name for display.
 */
function getAllJobs() {
  return [...JOBS].sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
  JOBS,
  getJob,
  getAllJobs,
  isFixedIncome,
};
