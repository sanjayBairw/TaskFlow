"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenAiModel = exports.getOpenAiApiKey = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getOpenAiApiKey = () => {
    return process.env.OPENAI_API_KEY || '';
};
exports.getOpenAiApiKey = getOpenAiApiKey;
const getOpenAiModel = () => {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
};
exports.getOpenAiModel = getOpenAiModel;
