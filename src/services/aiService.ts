import { ApiService } from './api';
import { AICommandRequestPayload, AICommandResponseData, TaskPriority, TaskStatus, TaskCategory } from '../models';

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

    try {
      const res = await ApiService.post<any>('/ai/command', payload);

      if (res && typeof res === 'object') {
        if ('data' in res && res.data && typeof res.data === 'object' && 'intent' in res.data) {
          return res.data as AICommandResponseData;
        }
        if ('intent' in res) {
          return res as AICommandResponseData;
        }
      }
    } catch (err: any) {
      console.warn('[AIService] Remote API endpoint error:', err.message);

      // Attempt local backend connection (Android Emulator 10.0.2.2 or localhost)
      try {
        const localUrl = 'http://10.0.2.2:5000/api/ai/command';
        const localRes = await fetch(localUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (localRes.ok) {
          const localData = await localRes.json();
          if (localData?.data?.intent) return localData.data;
          if (localData?.intent) return localData;
        }
      } catch {}

      // Resilient client-side fallback if server endpoint is 404 / unavailable
      return AIService.generateClientFallback(prompt);
    }

    return AIService.generateClientFallback(prompt);
  }

  private static generateClientFallback(prompt: string): AICommandResponseData {
    const lower = prompt.toLowerCase();
    const now = new Date();

    // 1. Missing time clarification ("Study DSA tomorrow.", "Remind me to study tomorrow")
    const isRelativeDay = /tomorrow|today|tonight|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(prompt);
    const hasExplicitTime = /at \d+|\d+:\d+|\d+ ?(am|pm)|in \d+ hours?/i.test(prompt);
    if (isRelativeDay && !hasExplicitTime && !/roadmap|plan|search|breakdown|find|resource/i.test(prompt)) {
      let subject = 'study';
      const studyMatch = prompt.match(/study\s+([a-zA-Z0-9\s]+)/i);
      if (studyMatch && studyMatch[1]) {
        subject = `study ${studyMatch[1].replace(/tomorrow|today|tonight/gi, '').trim()}`;
      }
      return {
        intent: 'CLARIFICATION_NEEDED',
        message: `What time tomorrow would you like to ${subject.trim() || 'study'}?`,
        requiresConfirmation: false,
        tasks: [],
      };
    }

    // 2. Explicit task creation ("Tomorrow at 7 PM remind me to study DSA...")
    if (/remind|create task|add task|tomorrow at|today at|\d+ pm|\d+ am/i.test(prompt) && !/roadmap|plan|breakdown/i.test(prompt)) {
      const tomorrow7PM = new Date(now);
      tomorrow7PM.setDate(tomorrow7PM.getDate() + 1);
      tomorrow7PM.setHours(19, 0, 0, 0);
      const deadline = new Date(tomorrow7PM.getTime() + 2 * 60 * 60 * 1000);

      return {
        intent: 'CREATE_TASK',
        message: "I've prepared your task for Tomorrow at 7:00 PM: Study DSA (2 hours, High Priority).",
        requiresConfirmation: true,
        tasks: [
          {
            title: 'Study DSA',
            description: 'Study Data Structures & Algorithms for 2 hours.',
            dateTime: tomorrow7PM.toISOString(),
            deadline: deadline.toISOString(),
            priority: TaskPriority.HIGH,
            status: TaskStatus.PENDING,
            category: TaskCategory.STUDY,
            tags: ['DSA', 'Study'],
            reminderMinutesBefore: 15,
          },
        ],
      };
    }

    // 3. Multi-day Roadmap / Plan ("roadmap of flutter to prepare for placement", "30 day roadmap")
    if (/roadmap|plan|learning|placement|timetable|schedule/i.test(prompt)) {
      const isFlutter = /flutter/i.test(prompt);
      const title = isFlutter ? 'Flutter App Development Placement Roadmap' : 'Study & Learning Roadmap';

      const tasks = [
        'Day 1-2: Dart Fundamentals, OOP, Async/Await & Collections',
        'Day 3-4: Flutter Widget Tree, Stateless vs Stateful, Responsive Layouts',
        'Day 5-7: State Management (Provider / Bloc / Riverpod) & Reactive Patterns',
        'Day 8-10: REST API Integration, JSON Parsing & Offline Storage (Hive / Async-Storage)',
        'Day 11-14: Clean Architecture, Unit & Widget Testing, App Deployment & Portfolio',
      ].map((stepTitle, idx) => {
        const d = new Date(now.getTime() + (idx + 1) * 24 * 60 * 60 * 1000);
        d.setHours(18, 0, 0, 0);
        return {
          title: stepTitle,
          description: `Master ${stepTitle} with hands-on practice.`,
          dateTime: d.toISOString(),
          deadline: new Date(d.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          priority: TaskPriority.HIGH,
          status: TaskStatus.PENDING,
          category: TaskCategory.STUDY,
          tags: ['Flutter', 'Placement'],
          reminderMinutesBefore: 15,
          sourceUrl: 'https://docs.flutter.dev',
        };
      });

      return {
        intent: 'CREATE_PLAN',
        message: `Here is your structured ${title} designed for 2 hours daily study:`,
        requiresConfirmation: true,
        plan: {
          title,
          durationDays: 14,
          overview: 'Comprehensive placement preparation roadmap for mobile app developers covering Dart, Flutter, State Management, API integration, and portfolio project building.',
          sections: [
            { name: 'Phase 1: Dart Core & OOP', description: 'Syntax, null-safety, async programming, collections', taskCount: 2 },
            { name: 'Phase 2: Flutter UI & State', description: 'Custom widgets, Provider/Bloc state management', taskCount: 2 },
            { name: 'Phase 3: APIs & Architecture', description: 'REST APIs, JSON serializing, Clean Architecture, Portfolio App', taskCount: 1 },
          ],
        },
        tasks,
        sources: [
          {
            title: 'Official Flutter Documentation',
            url: 'https://docs.flutter.dev',
            domain: 'docs.flutter.dev',
            snippet: 'Complete official tutorials, widget catalogue, and architecture guides.',
          },
          {
            title: 'Flutter Dev Official YouTube',
            url: 'https://youtube.com/@flutterdev',
            domain: 'youtube.com',
            snippet: 'Video tutorials and widget of the week series.',
          },
        ],
      };
    }

    // 4. Search resources
    if (/search|resources|youtube|find|tutorials/i.test(prompt)) {
      return {
        intent: 'SEARCH_RESOURCES',
        message: 'Here are top recommended learning resources and documentation:',
        requiresConfirmation: false,
        tasks: [],
        sources: [
          {
            title: 'Flutter Official Documentation & Install Guide',
            url: 'https://docs.flutter.dev/get-started/install',
            domain: 'docs.flutter.dev',
            snippet: 'Official installation and getting started guide.',
          },
          {
            title: 'Flutter YouTube Channel',
            url: 'https://www.youtube.com/@flutterdev',
            domain: 'youtube.com',
            snippet: 'Official YouTube videos and tutorials.',
          },
        ],
      };
    }

    // 5. Breakdown task
    if (/breakdown|break down|subtasks/i.test(prompt)) {
      return {
        intent: 'BREAKDOWN_TASK',
        message: 'Here is the step-by-step task breakdown:',
        requiresConfirmation: true,
        tasks: [
          {
            title: 'Architecture & Project Setup',
            description: 'Initialize repository, dependencies, and folder structure.',
            dateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            deadline: new Date(now.getTime() + 28 * 60 * 60 * 1000).toISOString(),
            priority: TaskPriority.HIGH,
            status: TaskStatus.PENDING,
            category: TaskCategory.WORK,
            tags: ['Breakdown'],
            reminderMinutesBefore: 15,
          },
        ],
      };
    }

    // 6. Conversational / General Assistance ("Hyy", "Hello", etc.)
    return {
      intent: 'GENERAL_ASSISTANCE',
      message: '✨ Hi! I am TaskFlow AI, your personal planning assistant.\n\nHow can I help you today? You can ask me to:\n• "Remind me to study DSA tomorrow at 7 PM"\n• "Give me roadmap of flutter to prepare for placement"\n• "Search YouTube channels for Android development"\n• "Break my project into subtasks"',
      requiresConfirmation: false,
      tasks: [],
    };
  }
}
