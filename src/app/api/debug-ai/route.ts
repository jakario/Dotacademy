import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!googleKey) return NextResponse.json({ error: 'No google key' });

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleKey}`);
    const data = await res.json();
    const modelNames = data.models ? data.models.map((m: any) => m.name) : data;
    return NextResponse.json({ models: modelNames });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
