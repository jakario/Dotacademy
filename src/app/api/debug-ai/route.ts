import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { embed, generateText } from 'ai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: any = {};

  // Test embedding
  try {
    const emb = await embed({
      model: google.textEmbeddingModel('gemini-embedding-2'),
      value: 'ทดสอบ',
    });
    result.embedding = { status: 'OK', dims: emb.embedding.length };
  } catch (e: any) {
    result.embedding = { status: 'FAILED', error: e.message };
  }

  // Test different gemini models
  const modelsToTest = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-8b', 'gemini-1.5-flash-001', 'gemini-1.5-pro'];
  result.models = {};

  for (const m of modelsToTest) {
    try {
      const res = await generateText({
        model: google(m),
        prompt: 'test',
        maxTokens: 5,
      });
      result.models[m] = { status: 'OK', text: res.text };
      break; // Found working model!
    } catch (e: any) {
      result.models[m] = { status: 'FAILED', error: e.message };
    }
  }

  return NextResponse.json(result);
}
