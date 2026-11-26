import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY;
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  const result: any = {
    groq: {
      exists: !!groqKey,
      prefix: groqKey ? groqKey.slice(0, 7) + '...' : null,
      length: groqKey ? groqKey.length : 0,
      testStatus: 'pending'
    },
    google: {
      exists: !!googleKey,
      prefix: googleKey ? googleKey.slice(0, 6) + '...' : null,
      length: googleKey ? googleKey.length : 0,
      testStatus: 'pending'
    }
  };

  // Test Groq
  if (groqKey) {
    try {
      const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: groqKey,
      });
      const res = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: 'test',
        maxTokens: 5,
      });
      result.groq.testStatus = 'OK';
      result.groq.sample = res.text;
    } catch (e: any) {
      result.groq.testStatus = 'FAILED';
      result.groq.error = e.message;
    }
  }

  // Test Google
  if (googleKey) {
    try {
      const res = await generateText({
        model: google('gemini-1.5-flash'),
        prompt: 'test',
        maxTokens: 5,
      });
      result.google.testStatus = 'OK';
      result.google.sample = res.text;
    } catch (e: any) {
      result.google.testStatus = 'FAILED';
      result.google.error = e.message;
    }
  }

  return NextResponse.json(result);
}
