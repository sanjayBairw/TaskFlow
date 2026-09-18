import { GoogleGenAI } from '@google/genai';

export const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in backend environment configuration.');
  }
  return new GoogleGenAI({ apiKey });
};

export const getGeminiModelName = (): string => {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
};
