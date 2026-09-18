import dotenv from 'dotenv';
dotenv.config();

export const getOpenAiApiKey = (): string => {
  return process.env.OPENAI_API_KEY || '';
};

export const getOpenAiModel = (): string => {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
};
