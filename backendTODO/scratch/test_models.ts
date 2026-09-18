import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testModel(modelName: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`Testing model: ${modelName}, API key present: ${!!apiKey}`);
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy' });
    const res = await ai.models.generateContent({
      model: modelName,
      contents: 'Hello! Respond with {"status": "ok"}',
      config: {
        responseMimeType: 'application/json',
      },
    });
    console.log(`[SUCCESS] ${modelName}:`, res.text);
  } catch (err: any) {
    console.error(`[ERROR] ${modelName}:`, err.message || err);
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-1.5-flash');
  await testModel('gemini-3.6-flash');
}

run();
