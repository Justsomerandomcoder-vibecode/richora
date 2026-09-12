'use strict';

const { getJob, isFixedIncome } = require('./jobs');
const { getItem } = require('./items');

/**
 * Upper bound used to reject absurd / unsafe numeric input before it ever
 * touches a balance. Well below Number.MAX_SAFE_INTEGER so arithmetic
 * between two values can never silently overflow into an unsafe range.
 */
const MAX_SAFE_AMOUNT = 1_000_000_000_000; // 1 trillion Credits

const STARTING_BALANCE = 1000;

const COOLDOWNS = {
  daily: 24 * 60 * 60 * 1000, // 24 hours
  work: 60 * 60 * 1000, // 1 hour
  rob: 2 * 60 * 60 * 1000, // 2 hours
  crime: 60 * 60 * 1000, // 1 hour
};

/**
 * Format a number as a Credits amount for display, e.g. 1000 -> "1,000 Credits".
 * @param {number} amount
 */
function formatCurrency(amount) {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${Math.round(safe).toLocaleString('en-US')} Credits`;
}

/**
 * Validate a user-supplied amount (e.g. for /deposit, /pay, /coinflip).
 * Rejects NaN, Infinity, non-integers, zero/negative values, and anything
 * beyond MAX_SAFE_AMOUNT.
 * @param {*} amount
 * @returns {boolean}
 */
function isValidAmount(amount) {
  if (typeof amount !== 'number') return false;
  if (!Number.isFinite(amount)) return false;
  if (!Number.isInteger(amount)) return false;
  if (amount <= 0) return false;
  if (amount > MAX_SAFE_AMOUNT) return false;
  return true;
}

/**
 * Clamp a balance value into a safe, non-negative integer range.
 * Used as a defensive last line before writing any value to the database.
 * @param {number} value
 */
function clampBalance(value) {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > MAX_SAFE_AMOUNT) return MAX_SAFE_AMOUNT;
  return rounded;
}

/**
 * Get the full job object for a user's current job, or null if unemployed.
 * @param {object} user
 */
function getUserJob(user) {
  if (!user || !user.job) return null;
  return getJob(user.job);
}

/**
 * Calculate the total item-driven bonus (as a decimal, e.g. 0.55 = +55%)
 * that a user currently benefits from for a given job id. Bonuses stack
 * across different owned items; owning an item multiple times never
 * stacks (inventory entries are unique item ids).
 * @param {object} user
 * @param {string} jobId
 * @returns {number} decimal bonus, always >= 0
 */
function calculateJobBonus(user, jobId) {
  if (!user || !Array.isArray(user.inventory) || !jobId) return 0;
  const owned = new Set(user.inventory);
  let total = 0;
  for (const itemId of owned) {
    const item = getItem(itemId);
    if (!item || !item.jobBoosts) continue;
    const bonus = item.jobBoosts[jobId];
    if (typeof bonus === 'number' && Number.isFinite(bonus) && bonus > 0) {
      total += bonus;
    }
  }
  // Defensive clamp - bonuses should never be able to produce something
  // absurd even if configuration data were ever malformed.
  if (!Number.isFinite(total) || total < 0) return 0;
  return total;
}

/**
 * Calculate the result of a /work action for a user.
 * @param {object} user
 * @param {number} [extraBonusPercent] - additional decimal bonus (e.g. 1.0 = +100%)
 *   stacked on top of item-driven bonuses. Used for special-case perks; 0 for
 *   normal users.
 * @returns {{job: object, base: number, itemBonusPercent: number, extraBonusPercent: number, bonusPercent: number, final: number}|null}
 *   null if the user has no job.
 */
function calculateWorkIncome(user, extraBonusPercent = 0) {
  const job = getUserJob(user);
  if (!job) return null;

  const base = isFixedIncome(job)
    ? job.minIncome
    : randomInt(job.minIncome, job.maxIncome);

  const itemBonusPercent = calculateJobBonus(user, job.id);
  const safeExtra = Number.isFinite(extraBonusPercent) && extraBonusPercent > 0 ? extraBonusPercent : 0;
  const bonusPercent = itemBonusPercent + safeExtra;
  const rawFinal = base * (1 + bonusPercent);
  const final = clampBalance(Math.round(rawFinal));

  return { job, base, itemBonusPercent, extraBonusPercent: safeExtra, bonusPercent, final };
}

/**
 * Inclusive random integer between min and max.
 * @param {number} min
 * @param {number} max
 */
function randomInt(min, max) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/**
 * Estimate a user's net worth for leaderboard purposes:
 * wallet + bank + the sale value of everything in their inventory.
 * @param {object} user
 */
function calculateNetWorth(user) {
  const wallet = clampBalance(user.wallet);
  const bank = clampBalance(user.bank);
  const itemValue = Array.isArray(user.inventory)
    ? user.inventory.reduce((sum, itemId) => {
        const item = getItem(itemId);
        return sum + (item ? item.price : 0);
      }, 0)
    : 0;
  return wallet + bank + itemValue;
}

/**
 * Check whether a cooldown (keyed by name, e.g. 'work') has expired for a
 * user, returning how much time remains.
 * @param {object} user
 * @param {'daily'|'work'|'rob'|'crime'} key
 * @param {number} [durationOverrideMs] - use this duration instead of the
 *   default for this key. Used for special-case perks; omit for normal use.
 * @returns {{onCooldown: boolean, remainingMs: number}}
 */
function checkCooldown(user, key, durationOverrideMs) {
  const defaultDuration = COOLDOWNS[key];
  if (!defaultDuration) throw new Error(`Unknown cooldown key: ${key}`);
  const duration = Number.isFinite(durationOverrideMs) && durationOverrideMs > 0 ? durationOverrideMs : defaultDuration;
  const last = (user.cooldowns && user.cooldowns[key]) || 0;
  const now = Date.now();
  const elapsed = now - last;
  const remainingMs = duration - elapsed;
  return {
    onCooldown: remainingMs > 0,
    remainingMs: Math.max(0, remainingMs),
  };
}

/** Mark a cooldown as used right now. */
function setCooldown(user, key) {
  if (!COOLDOWNS[key]) throw new Error(`Unknown cooldown key: ${key}`);
  if (!user.cooldowns) user.cooldowns = {};
  user.cooldowns[key] = Date.now();
}

/**
 * Format a millisecond duration as a friendly "Xh Ym Zs" style string.
 * @param {number} ms
 */
function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

/**
 * Attempt to change a user's job.
 * Performs full validation (same job, affordability) and, on success,
 * deducts the fee (waived for a user's first-ever job) and updates job.
 * Does NOT touch inventory, other balances, or cooldowns.
 * @param {object} user
 * @param {string} newJobId
 * @returns {{ok: true, fee: number, wasFirstJob: boolean} | {ok: false, reason: string}}
 */
function changeJob(user, newJobId) {
  const newJob = getJob(newJobId);
  if (!newJob) return { ok: false, reason: 'invalid_job' };

  if (user.job === newJobId) {
    return { ok: false, reason: 'same_job' };
  }

  const wasFirstJob = !user.job;
  const fee = wasFirstJob ? 0 : newJob.changeFee;

  if (fee > 0 && user.wallet < fee) {
    return { ok: false, reason: 'insufficient_funds', fee };
  }

  if (fee > 0) {
    user.wallet = clampBalance(user.wallet - fee);
  }
  user.job = newJobId;

  return { ok: true, fee, wasFirstJob };
}

module.exports = {
  STARTING_BALANCE,
  MAX_SAFE_AMOUNT,
  COOLDOWNS,
  formatCurrency,
  isValidAmount,
  clampBalance,
  getUserJob,
  calculateJobBonus,
  calculateWorkIncome,
  calculateNetWorth,
  checkCooldown,
  setCooldown,
  formatDuration,
  changeJob,
  randomInt,
};
