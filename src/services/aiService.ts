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

    const res = await ApiService.post<{ data: AICommandResponseData } | AICommandResponseData>('/ai/command', payload);
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as AICommandResponseData;
  }
}
