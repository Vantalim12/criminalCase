import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || "",
  SOLANA_RPC_URL:
    process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  TOKEN_CONTRACT_ADDRESS: process.env.TOKEN_CONTRACT_ADDRESS || "",
  ADMIN_ADDRESSES: process.env.ADMIN_ADDRESSES?.split(",") || [],
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET || "default-secret-change-me",
};

export function validateEnv() {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
