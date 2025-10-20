"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_CONTRACT_ADDRESS = exports.ALLOWED_PHOTO_TYPES = exports.MAX_PHOTO_SIZE_MB = exports.HOLDER_SYNC_INTERVAL_MS = exports.SUBMISSION_WINDOW_MS = exports.ROUND_DURATION_MS = void 0;
exports.ROUND_DURATION_MS = 25 * 60 * 1000; // 25 minutes
exports.SUBMISSION_WINDOW_MS = 3 * 60 * 1000; // 3 minutes
exports.HOLDER_SYNC_INTERVAL_MS = 10 * 1000; // 10 seconds
exports.MAX_PHOTO_SIZE_MB = 10;
exports.ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/jpg"];
// Token Contract Address - Replace with your actual Solana token mint address
exports.TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS || "YOUR_TOKEN_MINT_ADDRESS_HERE";
