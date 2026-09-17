"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded || !decoded.userId) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token.',
        });
    }
    req.user = { id: decoded.userId };
    next();
};
exports.authenticateToken = authenticateToken;
