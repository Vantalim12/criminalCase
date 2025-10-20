// Admin wallet addresses - configure these in your environment
// These wallets will have access to the admin panel

export const ADMIN_ADDRESSES = [
  // Add your admin wallet addresses here
  // Example: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
];

/**
 * Check if a wallet address is an admin
 */
export function isAdminWallet(address: string | null): boolean {
  if (!address) return false;
  return ADMIN_ADDRESSES.includes(address);
}
