'use client';

import * as React from 'react';

interface CourseMetadataFormProps {
  title: string;
  description: string;
  isPublished: boolean;
  savingCourse: boolean;
  onChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CourseMetadataForm({
  title,
  description,
  isPublished,
  savingCourse,
  onChange,
  onSubmit
}: CourseMetadataFormProps) {
  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 shadow-sm sticky top-24">
      <h2 className="text-base font-bold text-slate-200 border-b border-slate-700 pb-3 mb-4">ข้อมูลหลักสูตร</h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ชื่อหลักสูตร</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => onChange('title', e.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="ระบุชื่อหลักสูตร..."
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">คำอธิบาย</label>
          <textarea
            rows={4}
            value={description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="รายละเอียดเนื้อหาของหลักสูตรโดยย่อ..."
          />
        </div>

        {/* Published Switch */}
        <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800 transition-colors hover:border-slate-700/80">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-200">เผยแพร่หลักสูตร</h4>
            <p className="text-xs text-slate-500">แสดงแก่สาธารณะให้สมาชิกเรียนได้</p>
          </div>
          
          <button
            type="button"
            role="switch"
            aria-checked={isPublished}
            onClick={() => onChange('isPublished', !isPublished)}
            className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 ${isPublished ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <span
              className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${isPublished ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={savingCourse}
          className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium ring-offset-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-600/90 h-10 px-4 py-2 mt-2 shadow-lg shadow-blue-900/20"
        >
          {savingCourse ? 'กำลังบันทึก...' : 'บันทึกข้อมูลหลักสูตร'}
        </button>
      </form>
    </div>
  );
}
