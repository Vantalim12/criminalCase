# $DISCOVER - IRL Treasure Hunt Platform

A Solana-powered interactive treasure hunt platform where the highest token holder gets exclusive chances to find real-life items and earn rewards.

## 🎯 Features

- **Real-time Holder Tracking**: Automatically syncs top $DISCOVER token holders every 10 seconds
- **25-Minute Game Rounds**: Automatic round management with 3-minute submission windows
- **Photo Submissions**: Highest holders can submit photos during their window
- **Admin Panel**: Review and approve submissions, manage rounds
- **WebSocket Updates**: Live updates for holder rankings and round transitions
- **Criminal Case Theme**: Dark, investigation-aesthetic UI inspired by the game

## 🏗️ Architecture

### Monorepo Structure

```
/
├── apps/
│   ├── web/              # Frontend (React + Vite + TanStack Router)
│   └── api/              # Backend API (Node.js + Express)
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configuration
├── supabase/
│   └── migrations/       # Database migrations
```

### Tech Stack

**Frontend:**

- React 18
- TanStack Router
- TailwindCSS
- Solana Wallet Adapter
- Socket.io Client

**Backend:**

- Node.js + Express
- Solana Web3.js
- Socket.io
- Supabase (PostgreSQL + Storage)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Solana RPC endpoint (or use public endpoint)

### Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd CriminalCase
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

**Backend (`apps/api/.env`):**

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ADMIN_ADDRESSES=wallet1,wallet2
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret
```

**Frontend (`apps/web/.env`):**

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Set up Supabase:

   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Create a Storage bucket named `submissions` (public read)

5. Start development servers:

```bash
npm run dev
```

This starts both the API (port 3000) and web app (port 5173).

## 📊 Database Schema

### Tables

1. **game_rounds** - Stores game round information
2. **submissions** - Photo submissions from players
3. **holders** - Cached token holder data
4. **config** - Platform configuration (token address, admin wallets, etc.)

### Storage

- **submissions** bucket - Stores uploaded photos

## 🔧 Configuration

### Setting Token Address

1. Connect with an admin wallet
2. Go to `/admin`
3. Use the admin panel to update configuration
4. Set the `token_address` to your SPL token mint address

### Adding Admin Wallets

Add wallet addresses (comma-separated) to the `ADMIN_ADDRESSES` environment variable in the backend.

## 🎮 How It Works

### Game Flow

1. **Active Round (25 minutes)**

   - System tracks holder rankings in real-time
   - Users can see countdown and current leaderboard

2. **Submission Window (3 minutes)**

   - Highest holder at the 25-minute mark gets notified
   - They have 3 minutes to upload a photo of the target item
   - Photo is submitted with wallet signature verification

3. **Admin Review**

   - Admin reviews submissions
   - Approves/rejects with optional notes
   - Approved finds appear in gallery

4. **New Round**
   - Automatically starts after submission window ends
   - Cycle repeats every 28 minutes total

### Rewards

- Winners receive 20% of the fee pool (sent manually by admin)
- Approved finds are featured in the public gallery

## 🚢 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

Configuration is in `vercel.json`.

### Backend (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables in Render dashboard
4. Deploy automatically on push to main

Configuration is in `render.yaml`.

## 🔒 Security Features

- Wallet signature verification for all authenticated actions
- Admin whitelist for sensitive operations
- Rate limiting on API endpoints
- Row-level security in Supabase
- Message timestamp validation (prevents replay attacks)
- File size and type validation for uploads

## 🛠️ Development Scripts

```bash
# Install dependencies
npm install

# Development (both apps)
npm run dev

# Development (individual)
npm run dev:api
npm run dev:web

# Build all
npm run build

# Build individual
npm run build:api
npm run build:web

# Production
npm run start:prod
```

## 📝 API Endpoints

### Public Endpoints

- `GET /api/holders` - Get top 10 holders
- `GET /api/holders/rank/:address` - Get holder rank
- `GET /api/game/current` - Get current round info
- `GET /api/submissions/approved` - Get approved submissions
- `GET /api/stats` - Platform statistics

### Authenticated Endpoints

- `POST /api/submissions` - Submit photo (requires wallet signature)

### Admin Endpoints

- `GET /api/admin/submissions/pending` - Get pending submissions
- `PATCH /api/admin/submissions/:id` - Approve/reject submission
- `POST /api/admin/rounds/start` - Start new round
- `PATCH /api/admin/config` - Update configuration

## 🎨 Design Theme

The platform uses a "Criminal Case" inspired aesthetic:

- Dark navy background with red accents
- Cork board texture for leaderboards
- Polaroid-style photo frames
- Police tape animations
- Evidence markers and spotlight effects
- Bebas Neue font for headings

## 🔮 Future Enhancements

- NFT minting for winners
- Multiple concurrent games
- Mobile app version
- Community voting on submissions
- Leaderboard history and statistics
- Automated on-chain reward distribution

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR.

## 💬 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ for the Solana ecosystem
