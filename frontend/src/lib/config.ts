export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  wsUrl: import.meta.env.VITE_WS_URL || "ws://localhost:3000",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  tokenContractAddress:
    import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS ||
    "YOUR_TOKEN_MINT_ADDRESS_HERE",
};
