# 💪 Proof of Grind - Celo Builder Rewards NFT

A free-mint NFT with grind tiers, streaks, and on-chain leaderboard designed to maximize transactions and engagement for Celo Builders.

## Features

- 🆓 **Free Mint** - One NFT per address, no cost to start
- 🔥 **Grind System** - Call `grind()` every hour to level up
- 📈 **Streak Bonuses** - Maintain streaks for multiplied points
- 🏆 **On-chain Leaderboard** - Top 100 grinders tracked
- 🎨 **Dynamic SVG** - NFT visuals update with your stats
- 🤝 **Boost Others** - Social engagement earns both parties points

## Tiers

| Tier | Grinds Required |
|------|-----------------|
| Bronze | 0 |
| Silver | 10 |
| Gold | 50 |
| Diamond | 100 |
| Legend | 500 |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your private key
```

### 3. Deploy


**Mainnet (Celo):**
```bash
npm run deploy:celo
```

### 4. Verify Contract

```bash

npm run verify:celo
```

## Contract Functions

### For Users

| Function | Description |
|----------|-------------|
| `mint()` | Free mint your Proof of Grind NFT |
| `grind()` | Record a grind session (1 hour cooldown) |
| `boost(address)` | Boost another grinder (+5 pts to them, +2 to you) |
| `dailyCheckIn()` | Claim daily bonus points (+25 pts) |

### View Functions

| Function | Description |
|----------|-------------|
| `getGrinderStats(address)` | Get full stats for a grinder |
| `canGrind(address)` | Check if address can grind now |
| `getTimeUntilNextGrind(address)` | Seconds until next grind |
| `getTopGrinders()` | Get leaderboard addresses |
| `getLeaderboardPosition(address)` | Get rank (0 if not on board) |

## Leaderboard Strategy

To maximize your Celo Builder Rewards ranking:

1. **Deploy on Mainnet** - More weight than testnet
2. **Drive Mints** - Share on Twitter, Discord, Telegram
3. **Encourage Grinding** - Each `grind()` = transaction + fee
4. **Promote Boosts** - Social interactions multiply engagement
5. **Daily Check-ins** - Simple way to keep users coming back

## Frontend Integration

See `/frontend` folder for a ready-to-use React component that integrates with wagmi/viem.

## Gas Estimates

| Function | Approx. Gas |
|----------|-------------|
| mint() | ~150,000 |
| grind() | ~80,000 |
| boost() | ~50,000 |
| dailyCheckIn() | ~45,000 |

## License

MIT

## Author

Built by Chidera for Celo Builder Rewards 🌱
