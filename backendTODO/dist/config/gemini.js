"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeminiModelName = exports.getGeminiClient = void 0;
const genai_1 = require("@google/genai");
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing in backend environment configuration.');
    }
    return new genai_1.GoogleGenAI({ apiKey });
};
exports.getGeminiClient = getGeminiClient;
const getGeminiModelName = () => {
    return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
};
exports.getGeminiModelName = getGeminiModelName;
