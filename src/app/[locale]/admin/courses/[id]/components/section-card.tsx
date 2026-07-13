'use client';

import * as React from 'react';
import { useState } from 'react';

// Interfaces based on CourseEditClient
interface Resource {
  id: string;
  title: string;
  type: string;
  content: string;
}

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

interface Section {
  id: string;
  title: string;
  resources: Resource[];
  quiz: Quiz | null;
}

export interface SectionCardProps {
  section: Section;
  index: number;
  onRenameSection: (sectionId: string, newTitle: string) => void;
  onDeleteSection: (sectionId: string, title: string) => void;
  onOpenQuizEditor: (section: Section) => void;
  onAddResource: (sectionId: string, resourceType: string) => void;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (sectionId: string, resourceId: string, title: string) => void;
}

export function SectionCard({
  section,
  index,
  onRenameSection,
  onDeleteSection,
  onOpenQuizEditor,
  onAddResource,
  onEditResource,
  onDeleteResource
}: SectionCardProps) {
  // Local state for Rename Modal
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim() && editTitle !== section.title) {
      onRenameSection(section.id, editTitle.trim());
    }
    setIsRenameModalOpen(false);
  };

  return (
    <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6 space-y-4">
      {/* Section Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            ตอนที่ {index + 1}
          </span>
          <h4 className="font-bold text-slate-200">{section.title}</h4>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          {/* Section Quiz management trigger */}
          <button
            onClick={() => onOpenQuizEditor(section)}
            className={`flex items-center gap-1 py-0.5 px-2 rounded ${
              section.quiz 
                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700'
            } transition-all`}
          >
            📝 {section.quiz ? `ข้อสอบท้ายบท (${section.quiz.questions.length} ข้อ)` : '+ แบบทดสอบท้ายบท'}
          </button>

          <span className="text-slate-700">|</span>
          
          <button
            onClick={() => {
              setEditTitle(section.title);
              setIsRenameModalOpen(true);
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            แก้ไขชื่อบท
          </button>
          
          <button
            onClick={() => onDeleteSection(section.id, section.title)}
            className="text-rose-500 hover:text-rose-400 font-bold transition-colors"
          >
            ลบ
          </button>
        </div>
      </div>

      {/* Resources List */}
      <ul className="space-y-2.5">
        {section.resources.map((res) => (
          <li 
            key={res.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-sm hover:border-slate-700 transition-colors gap-3"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              {res.type === 'VIDEO' ? (
                <span className="text-rose-500 text-[10px] sm:text-xs bg-rose-500/10 px-2 py-0.5 rounded font-bold shrink-0">วิดีโอ</span>
              ) : res.type === 'PDF' ? (
                <span className="text-blue-500 text-[10px] sm:text-xs bg-blue-500/10 px-2 py-0.5 rounded font-bold shrink-0">PDF</span>
              ) : res.type === 'IMAGE' ? (
                <span className="text-amber-500 text-[10px] sm:text-xs bg-amber-500/10 px-2 py-0.5 rounded font-bold shrink-0">รูปภาพ</span>
              ) : res.type === 'HTML' ? (
                <span className="text-purple-500 text-[10px] sm:text-xs bg-purple-500/10 px-2 py-0.5 rounded font-bold shrink-0">HTML</span>
              ) : (
                <span className="text-emerald-500 text-[10px] sm:text-xs bg-emerald-500/10 px-2 py-0.5 rounded font-bold shrink-0">เอกสาร</span>
              )}
              <span className="text-slate-200 truncate">{res.title}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
              <button
                onClick={() => onEditResource(res)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded transition-colors"
              >
                แก้ไขเนื้อหา
              </button>
              <button
                onClick={() => onDeleteResource(section.id, res.id, res.title)}
                className="text-xs text-rose-500 hover:text-rose-400 font-bold px-2 py-1"
              >
                ลบ
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Add Resource Trigger */}
      <button
        onClick={() => onAddResource(section.id, 'TEXT')}
        className="w-full py-2 bg-slate-900/30 hover:bg-slate-900/60 rounded-xl text-xs text-slate-400 font-bold border border-dashed border-slate-700 hover:text-slate-200 hover:border-slate-500 transition-colors"
      >
        + เพิ่มเนื้อหา (วิดีโอ/เอกสาร)
      </button>

      {/* Rename Modal (Replacing prompt) */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <form onSubmit={handleRenameSubmit}>
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white text-base">แก้ไขชื่อหมวดหมู่ย่อย</h3>
                <button 
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="p-5">
                <label className="block text-xs font-bold text-slate-400 mb-2">ชื่อใหม่สำหรับหมวดหมู่</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น บทที่ 1..."
                />
              </div>
              <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-lg shadow-blue-500/20 transition-colors"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
