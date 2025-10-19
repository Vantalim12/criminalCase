import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { env } from "../config/env";

/**
 * Middleware to verify admin access
 * Must be used after verifyWallet middleware
 */
export function verifyAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const walletAddress = req.walletAddress;

  if (!walletAddress) {
    return res.status(401).json({
      error: "Wallet not authenticated",
    });
  }

  const isAdmin = env.ADMIN_ADDRESSES.includes(walletAddress);

  if (!isAdmin) {
    return res.status(403).json({
      error: "Admin access required",
    });
  }

  next();
}
