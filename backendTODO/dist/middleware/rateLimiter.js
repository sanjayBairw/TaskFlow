"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRateLimiter = void 0;
const userRequestMap = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
const aiRateLimiter = (req, res, next) => {
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
exports.aiRateLimiter = aiRateLimiter;
