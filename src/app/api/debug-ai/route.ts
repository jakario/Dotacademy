import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {};
  
  // Test gemini-2.5-flash
  try {
    const res = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'ตอบคำว่า OK',
    });
    results['gemini-2.5-flash'] = res.text;
  } catch (e: any) {
    results['gemini-2.5-flash_error'] = e.message;
  }

  // Test gemini-3.8-flash
  try {
    const res = await generateText({
      model: google('gemini-3.8-flash'),
      prompt: 'ตอบคำว่า OK',
    });
    results['gemini-3.8-flash'] = res.text;
  } catch (e: any) {
    results['gemini-3.8-flash_error'] = e.message;
  }

  return NextResponse.json(results);
}

