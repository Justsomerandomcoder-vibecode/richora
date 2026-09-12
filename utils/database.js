'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'economy.json');

/**
 * Default shape for a brand new user profile.
 * A fresh copy is returned each time so callers never share references.
 */
function defaultUser() {
  return {
    wallet: 1000,
    bank: 0,
    job: null,
    inventory: [],
    cooldowns: {
      daily: 0,
      work: 0,
      rob: 0,
      crime: 0,
    },
  };
}

/** In-memory cache of the database, kept in sync with disk. */
let cache = null;

/**
 * Ensure the data directory and economy.json file exist, creating them
 * (with an empty user table) if they do not.
 */
function ensureDatabaseFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = { users: {} };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
}

/**
 * Load the database from disk into the in-memory cache.
 * If the file is missing or corrupted, it is (re)initialized safely.
 */
function loadDatabase() {
  ensureDatabaseFile();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.users !== 'object' || parsed.users === null) {
      throw new Error('Malformed database shape');
    }
    cache = parsed;
  } catch (err) {
    console.error('[database] Failed to load economy.json, reinitializing:', err.message);
    cache = { users: {} };
    persist();
  }
  return cache;
}

/**
 * Write the in-memory cache to disk atomically (write to a temp file, then
 * rename over the real file) to avoid corrupting the database if the
 * process crashes mid-write.
 */
function persist() {
  ensureDatabaseFile();
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(cache, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

/** Get the live database object, loading it from disk first if needed. */
function getDatabase() {
  if (!cache) loadDatabase();
  return cache;
}

/**
 * Get a user's profile, creating one automatically if it doesn't exist yet.
 * Always returns a valid, fully-shaped user object (never null/undefined).
 * @param {string} userId
 */
function getUser(userId) {
  const db = getDatabase();
  if (!db.users[userId]) {
    db.users[userId] = defaultUser();
    persist();
  } else {
    // Backfill any missing fields for users created before a schema change.
    const user = db.users[userId];
    let changed = false;
    const fresh = defaultUser();
    for (const key of Object.keys(fresh)) {
      if (!(key in user)) {
        user[key] = fresh[key];
        changed = true;
      }
    }
    if (!user.cooldowns) {
      user.cooldowns = fresh.cooldowns;
      changed = true;
    } else {
      for (const key of Object.keys(fresh.cooldowns)) {
        if (!(key in user.cooldowns)) {
          user.cooldowns[key] = 0;
          changed = true;
        }
      }
    }
    if (changed) persist();
  }
  return db.users[userId];
}

/**
 * Explicitly create a user profile (idempotent - safe to call even if the
 * user already exists; it will simply return the existing profile).
 * @param {string} userId
 */
function createUser(userId) {
  return getUser(userId);
}

/**
 * Persist the current state of a user object back to disk.
 * Call this after mutating a user object returned by getUser().
 * @param {string} userId
 */
function saveUser(userId) {
  const db = getDatabase();
  if (!db.users[userId]) {
    throw new Error(`Cannot save unknown user: ${userId}`);
  }
  persist();
}

/**
 * Get all [userId, userObject] pairs currently in the database.
 */
function getAllUsers() {
  const db = getDatabase();
  return Object.entries(db.users);
}

module.exports = {
  loadDatabase,
  getDatabase,
  getUser,
  createUser,
  saveUser,
  getAllUsers,
};
