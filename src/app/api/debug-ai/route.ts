import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!googleKey) return NextResponse.json({ error: 'No google key' });

  // Test direct REST call to gemini-2.5-flash
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }]
      })
    });
    const data = await res.json();
    return NextResponse.json({ gemini25: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}


