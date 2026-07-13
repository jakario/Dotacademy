'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id?: string;
  text: string;
  options: Option[];
}

interface Quiz {
  title: string;
  passScore: number;
  questions: Question[];
}

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quiz: Quiz, sectionId: string) => void;
  initialQuiz: Quiz | null;
  sectionId: string;
  sectionTitle: string;
}

export function QuizForm({ isOpen, onClose, onSubmit, initialQuiz, sectionId, sectionTitle }: QuizFormProps) {
  const [quiz, setQuiz] = useState<Quiz>({
    title: `แบบทดสอบท้ายบท: ${sectionTitle}`,
    passScore: 100,
    questions: []
  });

  useEffect(() => {
    if (isOpen) {
      if (initialQuiz) {
        setQuiz(initialQuiz);
      } else {
        setQuiz({
          title: `แบบทดสอบท้ายบท: ${sectionTitle}`,
          passScore: 100,
          questions: []
        });
      }
    }
  }, [isOpen, initialQuiz, sectionTitle]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          text: '',
          options: [
            { text: 'ตัวเลือก ก', isCorrect: true },
            { text: 'ตัวเลือก ข', isCorrect: false },
            { text: 'ตัวเลือก ค', isCorrect: false },
            { text: 'ตัวเลือก ง', isCorrect: false }
          ]
        }
      ]
    });
  };

  const handleUpdateQuestionText = (qIdx: number, text: string) => {
    const updated = [...quiz.questions];
    updated[qIdx].text = text;
    setQuiz({ ...quiz, questions: updated });
  };

  const handleUpdateOptionText = (qIdx: number, oIdx: number, text: string) => {
    const updated = [...quiz.questions];
    updated[qIdx].options[oIdx].text = text;
    setQuiz({ ...quiz, questions: updated });
  };

  const handleSetCorrectOption = (qIdx: number, correctOIdx: number) => {
    const updated = [...quiz.questions];
    updated[qIdx].options = updated[qIdx].options.map((o, idx) => ({
      ...o,
      isCorrect: idx === correctOIdx
    }));
    setQuiz({ ...quiz, questions: updated });
  };

  const handleDeleteQuestion = (qIdx: number) => {
    const updated = quiz.questions.filter((_, idx) => idx !== qIdx);
    setQuiz({ ...quiz, questions: updated });
  };

  const handleChangeOptionsCount = (qIdx: number, newCount: number) => {
    const updated = [...quiz.questions];
    const currentOptions = updated[qIdx].options;
    
    if (newCount > currentOptions.length) {
      // Add more options
      const diff = newCount - currentOptions.length;
      const newOpts = Array.from({ length: diff }).map((_, i) => ({
        text: `ตัวเลือกใหม่ ${currentOptions.length + i + 1}`,
        isCorrect: false
      }));
      updated[qIdx].options = [...currentOptions, ...newOpts];
    } else if (newCount < currentOptions.length) {
      // Remove options
      updated[qIdx].options = currentOptions.slice(0, newCount);
      
      // Ensure at least one option is correct after slicing
      if (!updated[qIdx].options.some(o => o.isCorrect)) {
        updated[qIdx].options[0].isCorrect = true;
      }
    }
    
    setQuiz({ ...quiz, questions: updated });
  };

  const validateQuiz = () => {
    if (quiz.questions.length === 0) {
      toast.error('กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ');
      return false;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.text.trim()) {
        toast.error(`คำถามข้อที่ ${i + 1} ยังไม่มีโจทย์`);
        return false;
      }
      
      let hasCorrect = false;
      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        if (!o.text.trim()) {
          toast.error(`คำถามข้อที่ ${i + 1} ตัวเลือกที่ ${j + 1} ห้ามเว้นว่าง`);
          return false;
        }
        if (o.isCorrect) hasCorrect = true;
      }
      
      if (!hasCorrect) {
        toast.error(`คำถามข้อที่ ${i + 1} ต้องเลือกคำตอบที่ถูกต้องอย่างน้อย 1 ข้อ`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateQuiz()) {
      onSubmit(quiz, sectionId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
          <h3 className="font-bold text-white text-lg">⚙️ ตั้งค่าแบบทดสอบท้ายบท (Section Quiz)</h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Form Body - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Quiz Configuration Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase">หัวข้อแบบทดสอบท้ายบท</label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase">เกณฑ์ผ่าน (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={quiz.passScore}
                onChange={(e) => setQuiz({ ...quiz, passScore: Number(e.target.value) })}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Questions Area */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                รายการคำถาม ({quiz.questions.length} ข้อ)
              </h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-bold border border-blue-500/20 hover:border-blue-500 transition-all"
              >
                + เพิ่มคำถามใหม่
              </button>
            </div>

            {quiz.questions.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/20 rounded-xl border border-dashed border-slate-700/50">
                <p className="text-slate-500 text-sm mb-4">ยังไม่มีคำถามสำหรับบทนี้</p>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20"
                >
                  สร้างคำถามข้อแรก
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {quiz.questions.map((question, qIdx) => (
                  <div key={qIdx} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 space-y-4">
                    
                    {/* Question Header & Delete */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                      <span className="font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-full text-xs">
                        คำถามข้อที่ {qIdx + 1}
                      </span>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400">จำนวนตัวเลือก:</label>
                          <select
                            value={question.options.length}
                            onChange={(e) => handleChangeOptionsCount(qIdx, Number(e.target.value))}
                            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                          >
                            {[2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>{num} ข้อ</option>
                            ))}
                          </select>
                        </div>
                        
                        <span className="text-slate-700">|</span>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(qIdx)}
                          className="text-xs text-rose-500 hover:text-rose-400 font-bold transition-colors"
                        >
                          ลบคำถาม
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">โจทย์คำถาม</label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                        placeholder="พิมพ์คำถามที่นี่..."
                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">ตัวเลือกคำตอบ (เลือกข้อที่ถูก)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {question.options.map((option, oIdx) => (
                          <div 
                            key={oIdx} 
                            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                              option.isCorrect 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : 'bg-slate-900/60 border-slate-700/50 hover:border-slate-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-option-${qIdx}`}
                              checked={option.isCorrect}
                              onChange={() => handleSetCorrectOption(qIdx, oIdx)}
                              className="w-4 h-4 ml-1 accent-emerald-500 shrink-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                              placeholder={`ตัวเลือกที่ ${oIdx + 1}`}
                              className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none focus:ring-0 px-1 placeholder:text-slate-600"
                            />
                            {option.isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0 mr-1">
                                คำตอบ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
          >
            บันทึกแบบทดสอบ
          </button>
        </div>

      </div>
    </div>
  );
}
