import { getGeminiClient, getGeminiModelName } from '../config/gemini';

export interface NormalizedSearchResult {
  title: string;
  url: string;
  description: string;
  domain: string;
  type?: 'YOUTUBE' | 'DOCUMENTATION' | 'COURSE' | 'ARTICLE';
  age?: string;
}

export interface SearchOptions {
  count?: number;
  isYouTube?: boolean;
}

function safeExtractJson(text: string): any {
  if (!text) return null;
  const stripped = text.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export class SearchService {
  public static async searchWeb(query: string, options: SearchOptions = {}): Promise<NormalizedSearchResult[]> {
    const cleanQuery = (query || '').trim();

    if (!cleanQuery) {
      return [];
    }

    try {
      const ai = getGeminiClient();
      const model = getGeminiModelName();

      const systemPrompt = `You are a web search and learning resource discovery engine for TaskFlow AI.
Given a search topic or user query, return high-quality, real web resources, official documentation, courses, articles, and popular YouTube tutorials.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON in this exact structure:
{
  "results": [
    {
      "title": "Clear descriptive title",
      "url": "https://...",
      "description": "Short 1-2 sentence description of the resource",
      "domain": "example.com",
      "type": "YOUTUBE" | "DOCUMENTATION" | "COURSE" | "ARTICLE"
    }
  ]
}
2. Provide valid, well-known, accurate URLs (e.g. https://flutter.dev, https://youtube.com/watch?v=..., https://reactnative.dev, https://developer.mozilla.org, etc.).
3. Return between 4 to 8 top resources.`;

      const response = await ai.models.generateContent({
        model,
        contents: `Find high quality web resources and video tutorials for: "${cleanQuery}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsed = safeExtractJson(responseText) || {};

      const rawResults = parsed.results || [];
      const results: NormalizedSearchResult[] = [];
      const seenUrls = new Set<string>();

      if (Array.isArray(rawResults)) {
        for (const item of rawResults) {
          if (!item.url || seenUrls.has(item.url)) continue;
          seenUrls.add(item.url);

          let domain = item.domain || 'web';
          try {
            domain = new URL(item.url).hostname.replace('www.', '');
          } catch {}

          const isYouTube = domain.includes('youtube') || domain.includes('youtu.be') || item.type === 'YOUTUBE';
          const isDocs = domain.includes('docs') || domain.includes('developer') || domain.includes('flutter.dev') || item.type === 'DOCUMENTATION';

          results.push({
            title: (item.title || item.url).replace(/<\/?[^>]+(>|$)/g, ''),
            url: item.url,
            description: (item.description || '').replace(/<\/?[^>]+(>|$)/g, ''),
            domain,
            type: isYouTube ? 'YOUTUBE' : isDocs ? 'DOCUMENTATION' : (item.type || 'ARTICLE'),
          });
        }
      }

      return results.slice(0, 8);
    } catch (error) {
      console.warn('[SearchService] Error calling Gemini Search API:', error);
      return [];
    }
  }
}
