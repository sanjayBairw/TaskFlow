"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'taskflow_default_secret_key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign({ userId }, secret, {
        expiresIn: expiresIn,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET || 'taskflow_default_secret_key';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch {
        return null;
    }
};
exports.verifyToken = verifyToken;
