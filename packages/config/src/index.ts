export const ROUND_DURATION_MS = 25 * 60 * 1000; // 25 minutes
export const SUBMISSION_WINDOW_MS = 3 * 60 * 1000; // 3 minutes
export const HOLDER_SYNC_INTERVAL_MS = 60 * 1000; // 60 seconds (reduced frequency to avoid rate limits)
export const MAX_PHOTO_SIZE_MB = 10;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/jpg"];

// Token Contract Address - Replace with your actual Solana token mint address
export const TOKEN_CONTRACT_ADDRESS =
  process.env.TOKEN_CONTRACT_ADDRESS || "YOUR_TOKEN_MINT_ADDRESS_HERE";
