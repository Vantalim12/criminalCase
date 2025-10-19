import { Request, Response, NextFunction } from "express";
import { solanaService } from "../services/solana.service";

export interface AuthRequest extends Request {
  walletAddress?: string;
}

/**
 * Middleware to verify wallet signature
 * Expects: { signature, message, walletAddress } in request body
 */
export function verifyWallet(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { signature, message, walletAddress } = req.body;

  if (!signature || !message || !walletAddress) {
    return res.status(400).json({
      error: "Missing required fields: signature, message, walletAddress",
    });
  }

  // Verify the signature
  const isValid = solanaService.verifySignature(
    message,
    signature,
    walletAddress
  );

  if (!isValid) {
    return res.status(401).json({
      error: "Invalid signature",
    });
  }

  // Check message timestamp (prevent replay attacks)
  try {
    const messageMatch = message.match(/Timestamp: (\d+)/);
    if (messageMatch) {
      const timestamp = parseInt(messageMatch[1]);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (Math.abs(now - timestamp) > fiveMinutes) {
        return res.status(401).json({
          error: "Message timestamp expired",
        });
      }
    }
  } catch (error) {
    console.error("Error checking timestamp:", error);
  }

  // Attach wallet address to request
  req.walletAddress = walletAddress;
  next();
}
