'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

interface Resource {
  id?: string;
  title: string;
  type: string;
  content: string;
}

export interface ResourceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Resource, 'id'>, id?: string) => void;
  initialData?: Resource | null;
}

export function ResourceForm({ isOpen, onClose, onSubmit, initialData }: ResourceFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('TEXT');
  const [content, setContent] = useState('');

  // Reset form when opened with new data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setType(initialData.type || 'TEXT');
        setContent(initialData.content || '');
      } else {
        setTitle('');
        setType('TEXT');
        setContent('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit(
      { title: title.trim(), type, content },
      initialData?.id
    );
  };

  // Helper to extract Youtube ID for preview
  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = type === 'VIDEO' ? getYoutubeVideoId(content) : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 relative">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
            <h3 className="font-bold text-white text-lg">
              {initialData ? 'แก้ไขบทเรียน' : 'เพิ่มเนื้อหาบทเรียนใหม่'}
            </h3>
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5">
            
            {/* Title Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">ชื่อบทเรียน</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น แนะนำหลักสูตร..."
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">ประเภทเนื้อหา</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { value: 'TEXT', label: 'เอกสารอ่าน', icon: '📝' },
                  { value: 'HTML', label: 'โค้ด HTML', icon: '🌐' },
                  { value: 'VIDEO', label: 'วิดีโอ', icon: '▶️' },
                  { value: 'PDF', label: 'ไฟล์ PDF', icon: '📄' },
                  { value: 'IMAGE', label: 'รูปภาพ', icon: '🖼️' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      type === opt.value
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-xl mb-1">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Field based on Type */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase">
                {type === 'VIDEO' ? 'URL ลิงก์วิดีโอ YouTube' :
                 type === 'PDF' ? 'ที่อยู่ไฟล์ PDF (เช่น /pdfs/ebook.pdf)' :
                 type === 'IMAGE' ? 'ลิงก์ URL ของรูปภาพ' :
                 type === 'HTML' ? 'โค้ด HTML' : 'เนื้อหาบทเรียนสรุป'}
              </label>

              {type === 'VIDEO' ? (
                <div className="space-y-4">
                  <input
                    type="url"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {/* YouTube Preview */}
                  {videoId ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-700 bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : content.length > 0 ? (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs text-center">
                      ไม่พบรูปแบบ URL ของ YouTube ที่ถูกต้อง (รองรับ youtube.com หรือ youtu.be)
                    </div>
                  ) : null}
                </div>
              ) : type === 'HTML' || type === 'TEXT' ? (
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex min-h-[150px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder={type === 'HTML' ? '<div class="p-4">\n  <h1>หัวข้อ</h1>\n</div>' : 'พิมพ์เนื้อหาของบทเรียน...'}
                />
              ) : (
                <input
                  type="text"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={type === 'IMAGE' ? 'https://example.com/image.jpg' : '/docs/file.pdf'}
                />
              )}
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-slate-800/50 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
            >
              {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มเนื้อหา'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
