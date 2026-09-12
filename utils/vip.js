'use strict';

/**
 * Owner special-treatment perks.
 *
 * This is intentionally a tiny, isolated module (not a full permissions/role
 * system) - it exists to give exactly one specific Discord account (set via
 * the OWNER_ID environment variable) a personal set of perks:
 *
 *   - +100% bonus on /work income (on top of any item bonuses)
 *   - Half the normal cooldown on /work and /daily
 *   - A "Welcome back, master" greeting on /work and /daily
 *
 * Shop prices are intentionally NOT discounted for the owner.
 *
 * To change who the owner is, set OWNER_ID in your .env file to that
 * account's Discord user ID. Leave it blank/unset to disable this entirely.
 */

const INCOME_BONUS = 1.0; // +100%, stacks additively with item bonuses
const COOLDOWN_MULTIPLIER = 0.5; // half the normal cooldown
const GREETING = '👑 Welcome back, master!';

/**
 * Whether the given Discord user id is the configured owner.
 * @param {string} userId
 */
function isOwner(userId) {
  const ownerId = process.env.OWNER_ID;
  return Boolean(ownerId) && userId === ownerId;
}

module.exports = {
  isOwner,
  INCOME_BONUS,
  COOLDOWN_MULTIPLIER,
  GREETING,
};
