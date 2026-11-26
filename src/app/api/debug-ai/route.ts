import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await generateText({
      model: google('gemini-3.8-flash'),
      prompt: 'สวัสดีครับ',
      maxTokens: 20,
    });
    return NextResponse.json({ status: 'OK', text: res.text });
  } catch (e: any) {
    return NextResponse.json({ status: 'FAILED', error: e.message });
  }
}
