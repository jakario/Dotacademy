import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      }
    });
    const data = await res.json();
    const modelIds = data.data ? data.data.map((m: any) => m.id) : data;
    return NextResponse.json({ success: true, models: modelIds });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
