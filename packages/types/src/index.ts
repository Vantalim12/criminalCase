export type RoundStatus = "active" | "submission_window" | "ended";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface GameRound {
  id: string;
  round_number: number;
  start_time: string;
  end_time: string;
  highest_holder_address: string | null;
  highest_holder_balance: number | null;
  status: RoundStatus;
  target_item: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  round_id: string;
  wallet_address: string;
  photo_url: string;
  status: SubmissionStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}

export interface Holder {
  wallet_address: string;
  balance: number;
  rank: number;
  percentage: number;
  last_updated: string;
}

export interface Config {
  key: string;
  value: any;
  updated_at: string;
}

export interface HoldersResponse {
  holders: Holder[];
  timestamp: string;
}

export interface CurrentRoundResponse {
  round: GameRound | null;
  timeRemaining: number;
  phase: "active" | "submission" | "ended";
}

export interface SubmitPhotoRequest {
  signature: string;
  message: string;
  photoBase64: string;
  roundId: string;
  walletAddress: string;
}

export interface StatsResponse {
  totalRounds: number;
  totalSubmissions: number;
  approvedFinds: number;
  currentHolders: number;
}
