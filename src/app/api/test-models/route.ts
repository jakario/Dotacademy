import { NextResponse } from 'next/server';

export async function GET() {
  const models = ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
  const results: any = {};

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'ตอบสั้นๆ: สวัสดี' }],
          max_tokens: 30
        })
      });
      const data = await res.json();
      results[model] = data.choices ? data.choices[0]?.message?.content : data.error?.message;
    } catch (e: any) {
      results[model] = e.message;
    }
  }

  return NextResponse.json({ results });
}
