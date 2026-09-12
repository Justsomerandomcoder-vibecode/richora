# 💰 Economy Bot

A fun, beginner-friendly Discord economy game bot built with **discord.js v14**. Pick a career, work for Credits, buy gear to boost your income, bank your earnings, and climb the leaderboard — or take a risk with `/crime` and `/rob`.

## Features

- 25 unique careers across Technology, Creative, Gaming, Business, Entertainment, Science, Education, Media, Professional, and Service — each with its own income range and risk profile (some steady, some wildly unpredictable)
- 14 shop items that boost income for specific jobs (never free money)
- Wallet + bank system with deposits, withdrawals, and transfers
- Daily rewards, hourly work, crime, and robbery — all with cooldowns and anti-exploit validation
- A JSON file database that's created automatically — no external database needed
- Clean, dark-themed embeds throughout

---

## 1. Install Node.js

You'll need **Node.js v18 or newer**. Download it from [nodejs.org](https://nodejs.org/) if you don't already have it. You can check your version with:

```bash
node --version
```

## 2. Open the project folder

Open a terminal and navigate into the `economy-bot` folder you downloaded.

```bash
cd economy-bot
```

## 3. Install dependencies

```bash
npm install
```

This installs `discord.js` and `dotenv`.

## 4. Create a Discord Application & Bot (if you don't have one yet)

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Give it a name, then go to the **Bot** tab and click **Add Bot**.
3. Under the Bot tab, click **Reset Token** to reveal your bot token — copy it somewhere safe. You'll need it in step 5.
4. Still on the Bot tab, make sure **Message Content Intent** etc. aren't required for this bot (it only uses slash commands, so the default intents are enough).
5. Go to the **OAuth2 → URL Generator** tab, check the `bot` and `applications.commands` scopes, then under **Bot Permissions** check `Send Messages`, `Embed Links`, and `Use Slash Commands`. Copy the generated URL and open it in your browser to invite the bot to your server.
6. Your **Client ID** is on the **General Information** tab (labeled "Application ID").
7. Your **Guild ID** (server ID) — in Discord, enable Developer Mode (User Settings → Advanced), then right-click your server icon and choose **Copy Server ID**.

## 5. Create your `.env` file

Copy the example file:

```bash
cp .env.example .env
```

Then open `.env` in a text editor and fill in the three values:

```
DISCORD_TOKEN=your-bot-token-here
CLIENT_ID=your-application-id-here
GUILD_ID=your-server-id-here
```

**Never share your bot token or commit `.env` to git** — it's already excluded via `.gitignore`.

## 6. Deploy the slash commands

This registers all the bot's commands to your server:

```bash
npm run deploy
```

You should see a confirmation that all commands were deployed.

## 7. Start the bot

```bash
npm start
```

If everything is set up correctly, you'll see `✅ Logged in as YourBot#1234` in the console, and the commands will be live in your server.

---

## Commands

| Command | Description |
|---|---|
| `/balance [user]` | Check wallet, bank, net worth, and current job |
| `/daily` | Claim a daily reward of 500–1,500 Credits (24h cooldown) |
| `/jobs` | Browse all available careers |
| `/job <job>` | Select or switch your career (first job is free; switching costs a fee, with a confirm/cancel prompt) |
| `/work` | Work your job to earn Credits (1h cooldown) |
| `/deposit <amount\|all>` | Move Credits from wallet to bank |
| `/withdraw <amount\|all>` | Move Credits from bank to wallet |
| `/pay <user> <amount>` | Send Credits to another user |
| `/leaderboard` | See the top 10 richest users |
| `/shop` | Browse items that boost job income |
| `/buy <item>` | Purchase an item |
| `/inventory` | View your owned items and your active job bonus |
| `/rob <user>` | Attempt to rob someone (2h cooldown, 40% success chance) |
| `/crime` | Commit a crime for quick Credits (1h cooldown, 50% success chance) |
| `/coinflip <amount> <heads\|tails>` | Bet Credits on a 50/50 coin flip |
| `/ping` | Check the bot's latency |
| `/help` | Show all commands |

---

## Project structure

```
economy-bot/
├── commands/
│   ├── economy/       # All economy-related slash commands
│   └── utility/       # help, ping
├── utils/
│   ├── database.js    # JSON database read/write layer
│   ├── economy.js      # Core calculations: income, bonuses, cooldowns, validation
│   ├── jobs.js         # Centralized job configuration (single source of truth)
│   ├── items.js        # Centralized item/shop configuration (single source of truth)
│   └── embeds.js        # Shared embed styling helpers
├── data/
│   └── economy.json    # Auto-created on first run - your live database
├── events/
│   ├── ready.js
│   └── interactionCreate.js
├── deploy-commands.js  # Registers slash commands to your server
└── index.js            # Bot entry point
```

## Owner perks (optional)

You can give **one specific account** (yours, most likely) a set of special perks by setting `OWNER_ID` in your `.env` file to that account's Discord user ID:

```
OWNER_ID=your-user-id-here
```

To find your own user ID: enable Developer Mode (User Settings → Advanced → Developer Mode), then right-click your own name/avatar anywhere in Discord and choose **Copy User ID**.

When `OWNER_ID` matches the person running `/daily` or `/work`, they get:

- A **"👑 Welcome back, master!"** greeting on both commands
- **+100% bonus** on `/work` income and `/daily` rewards
- **Half the normal cooldown** on both `/work` (30 min instead of 1 hour) and `/daily` (12 hours instead of 24)

Shop prices are **not** discounted for the owner - buying items still costs full price.

Leave `OWNER_ID` blank (or remove it) to disable this entirely; everyone is treated the same by default. This logic lives in `utils/vip.js` if you want to tweak the numbers or add more perks later.

## Notes on the economy design

- **Jobs have real personality.** Teacher and Doctor are steady and reliable; Content Creator, Entrepreneur, and Race Driver are extreme, high-variance gambles. Higher max income doesn't automatically mean a job is "better" — it's a trade-off.
- **Items only boost specific jobs** they're configured for — they never hand out free money, and bonuses stack across different owned items (but never from duplicates of the same item).
- **All user input is validated** — negative amounts, zero, NaN, Infinity, decimals, and unsafely large numbers are all rejected before they ever touch a balance.

## Extending the bot

The architecture is intentionally modular so you can add features later without restructuring:

- Job XP/levels, promotions, and quests can hook into the existing `job` field on each user
- A stock market, auctions, or trading system can live in its own `utils/` file and reuse `getUser`/`saveUser`
- Temporary boosts or server-wide events can be layered on top of `calculateJobBonus` in `utils/economy.js`
- Bank interest can be added as a scheduled job that reads/writes via `utils/database.js`

## Troubleshooting

- **"Missing DISCORD_TOKEN..."** — make sure you created `.env` (not just `.env.example`) and filled in all three values.
- **Commands don't show up in Discord** — run `npm run deploy` again, and make sure `CLIENT_ID` and `GUILD_ID` are correct. It can occasionally take a minute for Discord to refresh guild commands.
- **Bot goes offline / crashes on start** — check the console output for the specific error; common causes are an invalid token or a typo in `.env`.
