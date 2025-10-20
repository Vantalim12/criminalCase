import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { env } from "../config/env.js";

class RewardService {
  private connection: Connection;
  private rewardWallet: Keypair | null = null;

  constructor() {
    this.connection = new Connection(env.SOLANA_RPC_URL, "confirmed");
    this.initializeRewardWallet();
  }

  /**
   * Initialize the reward wallet from private key
   */
  private initializeRewardWallet() {
    try {
      if (!env.REWARD_WALLET_PRIVATE_KEY) {
        console.warn(
          "REWARD_WALLET_PRIVATE_KEY not set - reward sending will be disabled"
        );
        return;
      }

      // Decode the base58-encoded private key
      const privateKeyBytes = bs58.decode(env.REWARD_WALLET_PRIVATE_KEY);
      this.rewardWallet = Keypair.fromSecretKey(privateKeyBytes);

      console.log(
        "Reward wallet initialized:",
        this.rewardWallet.publicKey.toBase58()
      );
    } catch (error) {
      console.error("Failed to initialize reward wallet:", error);
      this.rewardWallet = null;
    }
  }

  /**
   * Check if reward wallet is configured
   */
  isConfigured(): boolean {
    return this.rewardWallet !== null;
  }

  /**
   * Get reward wallet balance
   */
  async getRewardWalletBalance(): Promise<number> {
    if (!this.rewardWallet) {
      throw new Error("Reward wallet not configured");
    }

    const balance = await this.connection.getBalance(
      this.rewardWallet.publicKey
    );
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Get reward wallet address
   */
  getRewardWalletAddress(): string | null {
    if (!this.rewardWallet) {
      return null;
    }
    return this.rewardWallet.publicKey.toBase58();
  }

  /**
   * Calculate reward based on volume
   * Formula: Base reward + (Volume-based bonus)
   * 
   * For now, we'll use a simple formula:
   * - Minimum reward: 0.01 SOL
   * - Volume-based: 0.5% of 24h volume (in SOL)
   * 
   * You can adjust this formula based on your tokenomics
   */
  calculateReward(volume24h: number = 0): number {
    const baseReward = 0.01; // Minimum 0.01 SOL
    const volumeBonus = volume24h * 0.005; // 0.5% of volume
    const totalReward = baseReward + volumeBonus;

    // Cap at 1 SOL per reward to prevent overspending
    return Math.min(totalReward, 1.0);
  }

  /**
   * Send SOL reward to winner
   * @param recipientAddress - Winner's wallet address
   * @param amount - Amount in SOL
   * @returns Transaction signature
   */
  async sendReward(
    recipientAddress: string,
    amount: number
  ): Promise<{ signature: string; amount: number }> {
    if (!this.rewardWallet) {
      throw new Error("Reward wallet not configured");
    }

    // Validate recipient address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipientAddress);
    } catch (error) {
      throw new Error("Invalid recipient address");
    }

    // Check reward wallet balance
    const balance = await this.getRewardWalletBalance();
    if (balance < amount) {
      throw new Error(
        `Insufficient balance in reward wallet. Available: ${balance} SOL, Required: ${amount} SOL`
      );
    }

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.rewardWallet.publicKey,
        toPubkey: recipientPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Send transaction
    try {
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.rewardWallet],
        {
          commitment: "confirmed",
        }
      );

      console.log(
        `Reward sent: ${amount} SOL to ${recipientAddress}, signature: ${signature}`
      );

      return {
        signature,
        amount,
      };
    } catch (error: any) {
      console.error("Failed to send reward:", error);
      throw new Error(`Failed to send reward: ${error.message}`);
    }
  }

  /**
   * Send reward with automatic calculation based on volume
   */
  async sendCalculatedReward(
    recipientAddress: string,
    volume24h: number = 0
  ): Promise<{ signature: string; amount: number }> {
    const amount = this.calculateReward(volume24h);
    return this.sendReward(recipientAddress, amount);
  }
}

export const rewardService = new RewardService();

