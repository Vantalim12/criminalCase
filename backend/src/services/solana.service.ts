import { Connection, PublicKey } from "@solana/web3.js";
import { sign } from "tweetnacl";
import bs58 from "bs58";
import { env } from "../config/env";

class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(env.SOLANA_RPC_URL, "confirmed");
  }

  /**
   * Verify a wallet signature
   */
  verifySignature(
    message: string,
    signature: string,
    publicKey: string
  ): boolean {
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = new PublicKey(publicKey).toBytes();

      return sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
      console.error("Error verifying signature:", error);
      return false;
    }
  }

  /**
   * Fetch token holders for a given SPL token mint address
   * Returns holders sorted by balance descending
   */
  async fetchTokenHolders(
    mintAddress: string
  ): Promise<Array<{ address: string; balance: number }>> {
    try {
      const mintPublicKey = new PublicKey(mintAddress);

      // Get all token accounts for this mint
      const accounts = await this.connection.getProgramAccounts(
        new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL Token Program
        {
          filters: [
            {
              dataSize: 165, // Size of token account
            },
            {
              memcmp: {
                offset: 0,
                bytes: mintPublicKey.toBase58(),
              },
            },
          ],
        }
      );

      const holders: Array<{ address: string; balance: number }> = [];

      for (const account of accounts) {
        try {
          // Parse token account data
          const data = account.account.data;

          // Owner is at offset 32 (32 bytes)
          const owner = new PublicKey(data.slice(32, 64));

          // Amount is at offset 64 (8 bytes, little-endian u64)
          const amountBytes = data.slice(64, 72);
          const amount = Number(
            amountBytes[0] +
              amountBytes[1] * 256 +
              amountBytes[2] * 256 * 256 +
              amountBytes[3] * 256 * 256 * 256
          );

          if (amount > 0) {
            holders.push({
              address: owner.toBase58(),
              balance: amount,
            });
          }
        } catch (err) {
          console.error("Error parsing account:", err);
        }
      }

      // Sort by balance descending
      return holders.sort((a, b) => b.balance - a.balance);
    } catch (error) {
      console.error("Error fetching token holders:", error);
      throw error;
    }
  }

  /**
   * Get connection for manual queries
   */
  getConnection(): Connection {
    return this.connection;
  }
}

export const solanaService = new SolanaService();
