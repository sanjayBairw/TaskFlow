import { ApiService } from './api';
import { AICommandRequestPayload, AICommandResponseData } from '../models';

export class AIService {
  public static async sendCommand(prompt: string, conversationId?: string): Promise<AICommandResponseData> {
    const nowIso = new Date().toISOString();
    let timezone = 'UTC';

    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      timezone = 'UTC';
    }

    const payload: AICommandRequestPayload = {
      prompt,
      nowIso,
      timezone,
      conversationId,
    };

    const res = await ApiService.post<any>('/ai/command', payload);

    if (res && typeof res === 'object') {
      if ('data' in res && res.data && typeof res.data === 'object' && 'intent' in res.data) {
        return res.data as AICommandResponseData;
      }
      return res as AICommandResponseData;
    }

    throw new Error('Invalid response structure received from TaskFlow AI server');
  }
}
