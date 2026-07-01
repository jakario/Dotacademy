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
  const [result, setResult] = useState<{ score: number; passed: boolean; correctCount: number; totalQuestions: number } | null>(null);

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-2xl mx-auto mt-12">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">ผลการทดสอบ</h2>
        <div className={`text-5xl font-extrabold mb-6 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
          {result.score.toFixed(0)}%
        </div>
        <p className="text-xl text-gray-700 mb-8">
          คุณตอบถูก {result.correctCount} จาก {result.totalQuestions} ข้อ
          <br/>
          <span className="font-semibold">{result.passed ? "ยินดีด้วย! คุณผ่านการทดสอบ" : "คุณยังไม่ผ่านการทดสอบ กรุณาลองใหม่อีกครั้ง"}</span>
        </p>
        <div className="flex gap-4 justify-center">
          {!result.passed && (
            <button onClick={() => { setResult(null); setAnswers({}); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              ทำแบบทดสอบอีกครั้ง
            </button>
          )}
          <Link href={`/courses/${courseId}`} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            กลับไปที่บทเรียน
          </Link>
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
