import { config } from "./config";
import type {
  HoldersResponse,
  CurrentRoundResponse,
  Submission,
  StatsResponse,
} from "@discover/types";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private async fetch(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  }

  // Public endpoints
  async getHolders(): Promise<HoldersResponse> {
    return this.fetch("/api/holders");
  }

  async getHolderRank(address: string) {
    return this.fetch(`/api/holders/rank/${address}`);
  }

  async getCurrentRound(): Promise<CurrentRoundResponse> {
    return this.fetch("/api/game/current");
  }

  async getApprovedSubmissions(): Promise<{ submissions: Submission[] }> {
    return this.fetch("/api/submissions/approved");
  }

  async getStats(): Promise<StatsResponse> {
    return this.fetch("/api/stats");
  }

  // Authenticated endpoints
  async submitPhoto(data: {
    signature: string;
    message: string;
    walletAddress: string;
    photoBase64: string;
    roundId: string;
  }) {
    return this.fetch("/api/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Admin endpoints
  async getPendingSubmissions(authData: {
    signature: string;
    message: string;
    walletAddress: string;
  }): Promise<{ submissions: Submission[] }> {
    return this.fetch("/api/admin/submissions/pending", {
      method: "GET",
      headers: {
        "X-Wallet-Signature": authData.signature,
        "X-Wallet-Message": authData.message,
        "X-Wallet-Address": authData.walletAddress,
      },
    });
  }

  async updateSubmission(
    id: string,
    status: "approved" | "rejected",
    reviewerNotes: string,
    authData: {
      signature: string;
      message: string;
      walletAddress: string;
    }
  ) {
    return this.fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        signature: authData.signature,
        message: authData.message,
        walletAddress: authData.walletAddress,
        status,
        reviewerNotes,
      }),
    });
  }

  async startNewRound(
    targetItem: string,
    authData: {
      signature: string;
      message: string;
      walletAddress: string;
    }
  ) {
    return this.fetch("/api/admin/rounds/start", {
      method: "POST",
      body: JSON.stringify({
        signature: authData.signature,
        message: authData.message,
        walletAddress: authData.walletAddress,
        targetItem,
      }),
    });
  }

  async updateConfig(
    key: string,
    value: any,
    authData: {
      signature: string;
      message: string;
      walletAddress: string;
    }
  ) {
    return this.fetch("/api/admin/config", {
      method: "PATCH",
      body: JSON.stringify({
        signature: authData.signature,
        message: authData.message,
        walletAddress: authData.walletAddress,
        key,
        value,
      }),
    });
  }

  async getRewardInfo(authData: {
    signature: string;
    message: string;
    walletAddress: string;
  }): Promise<{
    isConfigured: boolean;
    balance?: number;
    address?: string;
    message?: string;
  }> {
    return this.fetch("/api/admin/rewards/info", {
      method: "GET",
      headers: {
        "X-Wallet-Signature": authData.signature,
        "X-Wallet-Message": authData.message,
        "X-Wallet-Address": authData.walletAddress,
      },
    });
  }

  async sendReward(
    recipientAddress: string,
    authData: {
      signature: string;
      message: string;
      walletAddress: string;
    },
    amount?: number,
    volume24h?: number
  ): Promise<{ success: boolean; signature: string; amount: number }> {
    return this.fetch("/api/admin/rewards/send", {
      method: "POST",
      body: JSON.stringify({
        signature: authData.signature,
        message: authData.message,
        walletAddress: authData.walletAddress,
        recipientAddress,
        amount,
        volume24h,
      }),
    });
  }

  async calculateReward(
    volume24h: number,
    authData: {
      signature: string;
      message: string;
      walletAddress: string;
    }
  ): Promise<{
    amount: number;
    volume24h: number;
    formula: string;
  }> {
    return this.fetch("/api/admin/rewards/calculate", {
      method: "POST",
      body: JSON.stringify({
        signature: authData.signature,
        message: authData.message,
        walletAddress: authData.walletAddress,
        volume24h,
      }),
    });
  }
}

export const api = new ApiClient();
