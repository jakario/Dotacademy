import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.6-27b',
        messages: [
          { role: 'system', content: 'คุณคือผู้ช่วย AI ชื่อ Mr. Wick ของกรมการท่องเที่ยว ให้ข้อมูลมาตรฐานแหล่งท่องเที่ยวอย่างสุภาพ' },
          { role: 'user', content: 'มีคู่มือมาตรฐานแหล่งท่องเที่ยวเชิงนิเวศไหม และมีเกณฑ์สำคัญอย่างไร' }
        ],
        max_tokens: 300
      })
    });
    const data = await res.json();
    return NextResponse.json({ 
      success: true, 
      answer: data.choices ? data.choices[0]?.message?.content : data.error 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
