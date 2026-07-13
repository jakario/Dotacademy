"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";

type Option = { id: string; text: string };
type Question = { id: string; text: string; options: Option[] };
type Quiz = { id: string; title: string; questions: Question[] };

export default function QuizClient({ quiz, courseId }: { quiz: Quiz, courseId: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; correctCount: number; totalQuestions: number; wonReward?: boolean } | null>(null);

  const handleSelect = (questionId: string, optionId: string) => {
    if (result) return; // Prevent changing answers after submit
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      alert("กรุณาตอบคำถามให้ครบทุกข้อ");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });

      if (!res.ok) throw new Error("Failed to submit");
      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการส่งคำตอบ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8 sm:p-12 text-center max-w-2xl w-full">

          {/* Reward Winner Banner */}
          {result.wonReward && (
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-amber-900/50 via-yellow-800/30 to-amber-900/50 border border-amber-500/40 animate-pulse">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-xl font-black text-amber-300">
                ยินดีด้วย! คุณคือ 1 ใน 20 คนแรกที่สอบผ่าน!
              </h2>
              <p className="text-sm text-amber-200/80 mt-2">
                คุณได้รับสิทธิ์รับของรางวัลพิเศษจากกรมการท่องเที่ยว<br/>
                ทีมงานจะติดต่อกลับผ่านอีเมลที่ลงทะเบียนไว้ค่ะ
              </p>
            </div>
          )}

          {/* Score */}
          <div className={`text-7xl font-black mb-2 ${
            result.passed ? 'text-emerald-400' : 'text-rose-500'
          }`}>
            {result.score.toFixed(0)}%
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">
            {result.passed ? '✅ ผ่านการทดสอบ' : '❌ ยังไม่ผ่านการทดสอบ'}
          </h2>
          <p className="text-slate-400 mb-8">
            คุณตอบถูก{' '}
            <span className="font-bold text-white">{result.correctCount}</span>{' '}จาก{' '}
            <span className="font-bold text-white">{result.totalQuestions}</span> ข้อ
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!result.passed && (
              <button
                onClick={() => { setResult(null); setAnswers({}); }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
              >
                ทำแบบทดสอบอีกครั้ง
              </button>
            )}
            {result.passed && (
              <Link
                href="/feedback"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded-xl transition-all text-center"
              >
                💬 แสดงข้อเสนอแนะเพิ่มเติม
              </Link>
            )}
            <Link
              href={`/courses/${courseId}`}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition-colors text-center"
            >
              กลับไปที่บทเรียน
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{quiz.title}</h1>
      <div className="space-y-8">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{idx + 1}. {q.text}</h3>
            <div className="space-y-3">
              {q.options.map(opt => (
                <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => handleSelect(q.id, opt.id)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {isSubmitting ? "กำลังส่งคำตอบ..." : "ส่งคำตอบ"}
        </button>
      </div>
    </div>
  );
}
