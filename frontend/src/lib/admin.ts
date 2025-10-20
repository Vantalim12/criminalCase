// Admin wallet addresses - configure these in your environment
// These wallets will have access to the admin panel

export const ADMIN_ADDRESSES: string[] = [
  // Add your admin wallet addresses here
  // Example: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
  
  // ⚠️ IMPORTANT: Add YOUR wallet address here to access the admin panel!
  // When you connect this wallet, the admin panel will automatically appear on the main page
  
  // For testing, add your current wallet address:
  // "YOUR_WALLET_ADDRESS_HERE",
  
  // For production, add your production wallet address(es):
  // "PRODUCTION_WALLET_1",
  // "PRODUCTION_WALLET_2",
];

/**
 * Check if a wallet address is an admin
 */
export function isAdminWallet(address: string | null): boolean {
  if (!address) return false;
  return ADMIN_ADDRESSES.includes(address);
}
