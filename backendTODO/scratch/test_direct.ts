import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { AIService } from '../src/services/aiService';

const prompts = [
  'Tomorrow at 7 PM remind me to study DSA for 2 hours with high priority.',
  'Study DSA tomorrow.',
  'Create a 7 day Flutter learning roadmap. I can study 2 hours every day.',
  'Search the best resources to learn Flutter.',
  'Break down building a Flutter e-commerce app into tasks.',
  'How should I prepare for my app development placement?',
];

async function main() {
  const now = new Date();
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const res = await AIService.processCommand({
      prompt,
      nowIso: now.toISOString(),
      timezone: 'Asia/Kolkata',
    });
    console.log(`\n=== PROMPT ${i + 1}: "${prompt}" ===`);
    console.log(`Intent: ${res.intent}`);
    console.log(`Message: ${res.message.substring(0, 100)}...`);
    console.log(`Tasks Count: ${res.tasks.length}`);
    console.log(`Has Plan: ${!!res.plan}`);
    console.log(`Has Sources: ${!!res.sources}`);
  }
}

main();
