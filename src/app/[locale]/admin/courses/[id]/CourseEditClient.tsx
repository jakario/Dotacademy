'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from "@/i18n/routing";
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

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

interface CourseData {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  sections: Section[];
}

interface CourseEditClientProps {
  initialCourse: CourseData;
}

export default function CourseEditClient({ initialCourse }: CourseEditClientProps) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseData>(initialCourse);
  const [savingCourse, setSavingCourse] = useState(false);

  // --- Confirm Dialog States ---
  const [deleteSectionDialogOpen, setDeleteSectionDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<{id: string, title: string} | null>(null);

  const [deleteResourceDialogOpen, setDeleteResourceDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<{sectionId: string, resourceId: string, title: string} | null>(null);

  // --- Course Metadata Handlers ---
  const handleUpdateCourseMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          isPublished: course.isPublished
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('บันทึกข้อมูลหลักสูตรเรียบร้อยแล้ว!');
      } else {
        toast.error('บันทึกไม่สำเร็จ: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSavingCourse(false);
    }
  };

  // --- Section Handlers ---
  const handleAddSection = async () => {
    const title = prompt('ระบุชื่อหมวดหมู่ย่อย (Section Title):');
    if (!title) return;

    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, title })
      });
      const data = await res.json();
      if (data.success && data.section) {
        toast.success('เพิ่มหมวดหมู่ย่อยเรียบร้อยแล้ว');
        setCourse({
          ...course,
          sections: [...course.sections, { ...data.section, resources: [], quiz: null }]
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleRenameSection = async (sectionId: string, currentTitle: string) => {
    const title = prompt('ระบุชื่อหมวดหมู่ย่อยใหม่:', currentTitle);
    if (!title || title === currentTitle) return;

    try {
      const res = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('เปลี่ยนชื่อเรียบร้อยแล้ว');
        setCourse({
          ...course,
          sections: course.sections.map(s => s.id === sectionId ? { ...s, title } : s)
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const promptDeleteSection = (sectionId: string, title: string) => {
    setSectionToDelete({ id: sectionId, title });
    setDeleteSectionDialogOpen(true);
  };

  const executeDeleteSection = async () => {
    if (!sectionToDelete) return;
    const { id: sectionId } = sectionToDelete;

    try {
      const res = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('ลบหมวดหมู่เรียบร้อยแล้ว');
        setCourse({
          ...course,
          sections: course.sections.filter(s => s.id !== sectionId)
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setSectionToDelete(null);
    }
  };

  // --- Resource (Lesson) Handlers ---
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [activeSectionForNewResource, setActiveSectionForNewResource] = useState<string | null>(null);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceType, setNewResourceType] = useState('TEXT');
  const [newResourceContent, setNewResourceContent] = useState('');

  const handleAddResource = async (sectionId: string) => {
    if (!newResourceTitle) {
      toast.error('กรุณากรอกชื่อบทเรียน');
      return;
    }

    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId,
          title: newResourceTitle,
          type: newResourceType,
          content: newResourceContent
        })
      });
      const data = await res.json();
      if (data.success && data.resource) {
        toast.success('เพิ่มบทเรียนเรียบร้อยแล้ว');
        setCourse({
          ...course,
          sections: course.sections.map(s => 
            s.id === sectionId 
              ? { ...s, resources: [...s.resources, data.resource] }
              : s
          )
        });
        // Clear form
        setNewResourceTitle('');
        setNewResourceContent('');
        setActiveSectionForNewResource(null);
      } else {
        toast.error('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มบทเรียน');
    }
  };

  const handleSaveEditedResource = async () => {
    if (!editingResource) return;

    try {
      const res = await fetch(`/api/admin/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingResource.title,
          type: editingResource.type,
          content: editingResource.content
        })
      });
      const data = await res.json();
      if (data.success && data.resource) {
        setCourse({
          ...course,
          sections: course.sections.map(s => ({
            ...s,
            resources: s.resources.map(r => r.id === editingResource.id ? data.resource : r)
          }))
        });
        setEditingResource(null);
        toast.success('แก้ไขบทเรียนเรียบร้อย!');
      } else {
        toast.error('แก้ไขไม่สำเร็จ: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาดในการบันทึกบทเรียน');
    }
  };

  const promptDeleteResource = (sectionId: string, resourceId: string, title: string) => {
    setResourceToDelete({ sectionId, resourceId, title });
    setDeleteResourceDialogOpen(true);
  };

  const executeDeleteResource = async () => {
    if (!resourceToDelete) return;
    const { sectionId, resourceId } = resourceToDelete;

    try {
      const res = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('ลบบทเรียนเรียบร้อยแล้ว');
        setCourse({
          ...course,
          sections: course.sections.map(s => 
            s.id === sectionId 
              ? { ...s, resources: s.resources.filter(r => r.id !== resourceId) }
              : s
          )
        });
      } else {
        toast.error('ลบไม่สำเร็จ: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาดในการลบบทเรียน');
    } finally {
      setResourceToDelete(null);
    }
  };

  // --- Quiz Management Handlers (Per-Section Quiz Modal) ---
  const [editingQuizSectionId, setEditingQuizSectionId] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const handleOpenQuizEditor = (section: Section) => {
    setEditingQuizSectionId(section.id);
    setEditingQuiz(section.quiz || {
      title: `แบบทดสอบท้ายบท: ${section.title}`,
      passScore: 100,
      questions: []
    });
  };

  const handleAddQuestion = () => {
    if (!editingQuiz) return;
    setEditingQuiz({
      ...editingQuiz,
      questions: [
        ...editingQuiz.questions,
        {
          text: 'พิมพ์คำถามข้อใหม่ที่นี่...',
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
    if (!editingQuiz) return;
    const updated = [...editingQuiz.questions];
    updated[qIdx].text = text;
    setEditingQuiz({ ...editingQuiz, questions: updated });
  };

  const handleUpdateOptionText = (qIdx: number, oIdx: number, text: string) => {
    if (!editingQuiz) return;
    const updated = [...editingQuiz.questions];
    updated[qIdx].options[oIdx].text = text;
    setEditingQuiz({ ...editingQuiz, questions: updated });
  };

  const handleSetCorrectOption = (qIdx: number, correctOIdx: number) => {
    if (!editingQuiz) return;
    const updated = [...editingQuiz.questions];
    updated[qIdx].options = updated[qIdx].options.map((o, oIdx) => ({
      ...o,
      isCorrect: oIdx === correctOIdx
    }));
    setEditingQuiz({ ...editingQuiz, questions: updated });
  };

  const handleDeleteQuestion = (qIdx: number) => {
    if (!editingQuiz) return;
    const updated = editingQuiz.questions.filter((_, idx) => idx !== qIdx);
    setEditingQuiz({ ...editingQuiz, questions: updated });
  };

  const handleSaveQuiz = async () => {
    if (!editingQuizSectionId || !editingQuiz) return;

    if (editingQuiz.questions.length === 0) {
      toast.error('กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ');
      return;
    }

    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: editingQuizSectionId,
          title: editingQuiz.title,
          passScore: Number(editingQuiz.passScore),
          questions: editingQuiz.questions
        })
      });
      const data = await res.json();
      if (data.success && data.quiz) {
        setCourse({
          ...course,
          sections: course.sections.map(s => 
            s.id === editingQuizSectionId 
              ? { ...s, quiz: editingQuiz }
              : s
          )
        });
        setEditingQuizSectionId(null);
        setEditingQuiz(null);
        toast.success('บันทึกแบบทดสอบท้ายบทเรียบร้อยแล้ว!');
      } else {
        toast.error('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาดทางเทคนิค');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Link href="/admin" className="hover:text-white transition-colors">แผงควบคุม</Link>
            <span>&rarr;</span>
            <span className="text-slate-200 font-bold truncate max-w-[150px] sm:max-w-[300px]">แก้ไข: {course.title}</span>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            &larr; ย้อนกลับ
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Course metadata */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 shadow-sm sticky top-24">
            <h2 className="text-base font-bold text-slate-200 border-b border-slate-700 pb-3 mb-4">ข้อมูลหลักสูตร</h2>
            
            <form onSubmit={handleUpdateCourseMetadata} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">ชื่อหลักสูตร</label>
                <input
                  type="text"
                  required
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">คำอธิบาย</label>
                <textarea
                  rows={4}
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">เผยแพร่หลักสูตร</h4>
                  <p className="text-[10px] text-slate-500">แสดงแก่สาธารณะให้สมาชิกเรียนได้</p>
                </div>
                <input
                  type="checkbox"
                  checked={course.isPublished}
                  onChange={(e) => setCourse({ ...course, isPublished: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={savingCourse}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-blue-500/10"
              >
                {savingCourse ? 'กำลังบันทึก...' : 'บันทึกข้อมูลหลักสูตร'}
              </button>
            </form>
          </div>
        </section>

        {/* Right column: Sections and Lessons Management */}
        <section className="lg:col-span-2 space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-200">บทเรียนย่อย (Sections & Lessons)</h3>
              <button
                onClick={handleAddSection}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition-colors"
              >
                + เพิ่มบทเรียนย่อย (Section)
              </button>
            </div>

            {course.sections.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                <p className="text-slate-400 text-sm">ยังไม่มีหมวดหมู่บทเรียนย่อย</p>
                <button
                  onClick={handleAddSection}
                  className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-50 text-xs font-bold text-white transition-colors rounded-lg"
                >
                  สร้างหมวดหมู่แรก
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {course.sections.map((section, sIdx) => (
                  <div key={section.id} className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6 space-y-4">
                    
                    {/* Section Title Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                          ตอนที่ {sIdx + 1}
                        </span>
                        <h4 className="font-bold text-slate-200">{section.title}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium">
                        {/* Section Quiz management trigger */}
                        <button
                          onClick={() => handleOpenQuizEditor(section)}
                          className={`flex items-center gap-1 py-0.5 px-2 rounded ${
                            section.quiz 
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20' 
                              : 'bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700'
                          } transition-all`}
                        >
                          📝 {section.quiz ? `ข้อสอบท้ายบท (${section.quiz.questions.length} ข้อ)` : '+ แบบทดสอบท้ายบท'}
                        </button>

                        <span className="text-slate-700">|</span>
                        
                        <button
                          onClick={() => handleRenameSection(section.id, section.title)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          แก้ไขชื่อบท
                        </button>
                        
                        <button
                          onClick={() => promptDeleteSection(section.id, section.title)}
                          className="text-rose-500 hover:text-rose-400 font-bold"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>

                    {/* Resources List within Section */}
                    <ul className="space-y-2.5">
                      {section.resources.map((res) => (
                        <li 
                          key={res.id} 
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-sm hover:border-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {res.type === 'VIDEO' ? (
                              <span className="text-rose-500 text-xs bg-rose-500/10 px-2 py-0.5 rounded font-bold">วิดีโอ</span>
                            ) : res.type === 'PDF' ? (
                              <span className="text-blue-500 text-xs bg-blue-500/10 px-2 py-0.5 rounded font-bold">PDF</span>
                            ) : res.type === 'IMAGE' ? (
                              <span className="text-amber-500 text-xs bg-amber-500/10 px-2 py-0.5 rounded font-bold">รูปภาพ</span>
                            ) : res.type === 'HTML' ? (
                              <span className="text-purple-500 text-xs bg-purple-500/10 px-2 py-0.5 rounded font-bold">HTML</span>
                            ) : (
                              <span className="text-emerald-500 text-xs bg-emerald-500/10 px-2 py-0.5 rounded font-bold">เอกสาร</span>
                            )}
                            <span className="text-slate-200 truncate">{res.title}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => setEditingResource(res)}
                              className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 px-2.5 py-1 rounded transition-colors"
                            >
                              แก้ไขเนื้อหา
                            </button>
                            <button
                              onClick={() => promptDeleteResource(section.id, res.id, res.title)}
                              className="text-xs text-rose-500 hover:text-rose-450 font-bold px-1"
                            >
                              ลบ
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Add Resource Form/Trigger */}
                    {activeSectionForNewResource === section.id ? (
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                        <h5 className="text-xs font-bold text-slate-300">สร้างเนื้อหาคลิป/เอกสารใหม่</h5>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block text-[10px] text-slate-500 mb-1">ชื่อคลิป หรือ หัวเรื่องเอกสาร</label>
                            <input
                              type="text"
                              placeholder="เช่น นโยบายและการพัฒนาแหล่งท่องเที่ยว"
                              value={newResourceTitle}
                              onChange={(e) => setNewResourceTitle(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">ประเภท</label>
                            <select
                              value={newResourceType}
                              onChange={(e) => setNewResourceType(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                            >
                              <option value="TEXT">เอกสารอ่าน / สรุปเนื้อหา</option>
                              <option value="HTML">เนื้อหาแบบ HTML</option>
                              <option value="VIDEO">คลิปวิดีโอ (YouTube)</option>
                              <option value="PDF">ไฟล์ PDF (ใส่ Path)</option>
                              <option value="IMAGE">รูปภาพประกอบ (ใส่ URL)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">
                            {newResourceType === 'VIDEO' ? 'URL ลิงก์วิดีโอ YouTube' :
                             newResourceType === 'PDF' ? 'ที่อยู่ไฟล์ PDF (เช่น /pdfs/ebook_xxx.pdf)' :
                             newResourceType === 'IMAGE' ? 'ลิงก์รูปภาพ (เช่น /images/xxx.jpg)' :
                             newResourceType === 'HTML' ? 'เขียนโค้ด HTML' : 'เนื้อหาบทเรียนสรุป'}
                          </label>
                          {newResourceType === 'VIDEO' || newResourceType === 'PDF' || newResourceType === 'IMAGE' ? (
                            <input
                              type="text"
                              placeholder={newResourceType === 'VIDEO' ? 'https://www.youtube.com/watch?v=...' :
                                           newResourceType === 'PDF' ? '/pdfs/ebook_xxx.pdf' : 'https://...'}
                              value={newResourceContent}
                              onChange={(e) => setNewResourceContent(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                            />
                          ) : (
                            <textarea
                              rows={4}
                              placeholder={newResourceType === 'HTML' ? '<p>ตกแต่ง HTML ที่นี่...</p>' : 'พิมพ์เนื้อหาสรุปที่นี่...'}
                              value={newResourceContent}
                              onChange={(e) => setNewResourceContent(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                            />
                          )}
                        </div>

                        <div className="flex justify-end gap-2 text-xs pt-1.5">
                          <button
                            onClick={() => setActiveSectionForNewResource(null)}
                            className="px-2.5 py-1 text-slate-400 hover:text-white"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => handleAddResource(section.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold"
                          >
                            บันทึกบทเรียน
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveSectionForNewResource(section.id);
                          setNewResourceType('TEXT');
                        }}
                        className="w-full py-2 bg-slate-900/30 hover:bg-slate-900/50 rounded-xl text-xs text-slate-400 font-bold border border-dashed border-slate-800 hover:text-slate-200 transition-colors"
                      >
                        + เพิ่มเนื้อหา (วิดีโอ/เอกสาร)
                      </button>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Resource Edit Modal */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">แก้ไขข้อมูลบทเรียน</h3>
              <button 
                onClick={() => setEditingResource(null)}
                className="text-slate-400 hover:text-white font-black"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">ชื่อบทเรียน</label>
                <input
                  type="text"
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">ประเภท</label>
                <select
                  value={editingResource.type}
                  onChange={(e) => setEditingResource({ ...editingResource, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="TEXT">เอกสารอ่าน</option>
                  <option value="HTML">เนื้อหาแบบ HTML</option>
                  <option value="VIDEO">วิดีโอ (YouTube)</option>
                  <option value="PDF">ไฟล์ PDF</option>
                  <option value="IMAGE">รูปภาพประกอบ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {editingResource.type === 'VIDEO' ? 'URL ลิงก์วิดีโอ YouTube' :
                   editingResource.type === 'PDF' ? 'ที่อยู่ไฟล์ PDF (เช่น /pdfs/ebook_xxx.pdf)' :
                   editingResource.type === 'IMAGE' ? 'ลิงก์รูปภาพ' :
                   editingResource.type === 'HTML' ? 'โค้ด HTML' : 'เนื้อหาบทเรียน'}
                </label>
                {editingResource.type === 'VIDEO' || editingResource.type === 'PDF' || editingResource.type === 'IMAGE' ? (
                  <input
                    type="text"
                    value={editingResource.content || ''}
                    onChange={(e) => setEditingResource({ ...editingResource, content: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                ) : (
                  <textarea
                    rows={8}
                    value={editingResource.content || ''}
                    onChange={(e) => setEditingResource({ ...editingResource, content: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 bg-slate-900/40 flex justify-end gap-3 text-xs">
              <button
                onClick={() => setEditingResource(null)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEditedResource}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-Section Quiz Edit Modal */}
      {editingQuizSectionId && editingQuiz && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">⚙️ ตั้งค่าแบบทดสอบท้ายบท (Section Quiz)</h3>
              <button 
                onClick={() => { setEditingQuizSectionId(null); setEditingQuiz(null); }}
                className="text-slate-400 hover:text-white font-black"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              
              {/* Quiz Configuration metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">หัวข้อแบบทดสอบท้ายบท</label>
                  <input
                    type="text"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">เกณฑ์ผ่าน (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingQuiz.passScore}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, passScore: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Questions Area */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">รายการคำถาม ({editingQuiz.questions.length} ข้อ)</h4>
                  <button
                    onClick={handleAddQuestion}
                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-650 text-white rounded text-[10px] font-bold border border-slate-600 transition-colors"
                  >
                    + เพิ่มคำถาม
                  </button>
                </div>

                {editingQuiz.questions.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                    <p className="text-slate-500 text-xs mb-3">ยังไม่มีคำถามท้ายบทสำหรับบทนี้</p>
                    <button
                      onClick={handleAddQuestion}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded"
                    >
                      สร้างคำถามแรก
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editingQuiz.questions.map((question, qIdx) => (
                      <div key={qIdx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
                          <span className="font-bold text-slate-400">คำถามข้อที่ {qIdx + 1}</span>
                          <button
                            onClick={() => handleDeleteQuestion(qIdx)}
                            className="text-[10px] text-rose-500 hover:text-rose-450 font-bold"
                          >
                            ลบคำถาม
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">โจทย์คำถาม</label>
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          <label className="block text-[10px] text-slate-500">ตัวเลือกคำตอบ (เลือกปุ่มเพื่อกำหนดให้เป็นข้อที่ถูกต้อง):</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options.map((option, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`flex items-center gap-2 p-1.5 rounded-lg border ${
                                  option.isCorrect 
                                    ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-400' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct-option-${qIdx}`}
                                  checked={option.isCorrect}
                                  onChange={() => handleSetCorrectOption(qIdx, oIdx)}
                                  className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                                  className="flex-grow bg-transparent text-xs text-slate-200 border-none focus:outline-none focus:ring-0 p-0"
                                />
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

            <div className="p-6 border-t border-slate-700 bg-slate-900/40 flex justify-end gap-3 text-xs">
              <button
                onClick={() => { setEditingQuizSectionId(null); setEditingQuiz(null); }}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveQuiz}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-md"
              >
                💾 บันทึกแบบทดสอบบทนี้
              </button>
            </div>

          </div>
        </div>
      )}

      <ConfirmDialog 
        open={deleteSectionDialogOpen} 
        onOpenChange={setDeleteSectionDialogOpen}
        title="ยืนยันการลบหมวดหมู่?"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${sectionToDelete?.title}"? บทเรียนย่อยและแบบทดสอบทั้งหมดในนี้จะถูกลบไปด้วย`}
        confirmText="ลบหมวดหมู่"
        variant="danger"
        onConfirm={executeDeleteSection}
      />
      
      <ConfirmDialog 
        open={deleteResourceDialogOpen} 
        onOpenChange={setDeleteResourceDialogOpen}
        title="ยืนยันการลบบทเรียน?"
        description={`ต้องการลบบทเรียน "${resourceToDelete?.title}" หรือไม่?`}
        confirmText="ลบบทเรียน"
        variant="danger"
        onConfirm={executeDeleteResource}
      />
    </div>
  );
}
