import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

interface RateLimitRecord {
  timestamps: number[];
}

const userRequestMap = new Map<string, RateLimitRecord>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

export const aiRateLimiter = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id || req.ip || 'anonymous';
  const now = Date.now();

  let record = userRequestMap.get(userId);
  if (!record) {
    record = { timestamps: [] };
    userRequestMap.set(userId, record);
  }

  // Filter out timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'Too many AI requests. Please wait a minute before sending another prompt.',
    });
  }

  record.timestamps.push(now);
  next();
};
