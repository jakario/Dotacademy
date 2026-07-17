import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return NextResponse.json({ error: "No key" });
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
