'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from "@/i18n/routing";
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface CourseItem {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  instructorName: string;
  sectionsCount: number;
  hasQuiz: boolean;
}

interface AdminDashboardClientProps {
  initialCourses: CourseItem[];
  stats: {
    total: number;
    published: number;
    draft: number;
  };
}

export default function AdminDashboardClient({ initialCourses, stats }: AdminDashboardClientProps) {
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [loading, setLoading] = useState<string | null>(null);
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{id: string, title: string} | null>(null);
  
  // Search and filter state
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const router = useRouter();

  const filteredCourses = courses.filter(c => {
    const searchLower = search.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(searchLower);
    const descMatch = c.description?.toLowerCase().includes(searchLower);
    const matchSearch = titleMatch || descMatch;
    
    const matchFilter = filter === 'all' || (filter === 'published' && c.isPublished) || (filter === 'draft' && !c.isPublished);
    return matchSearch && matchFilter;
  });

  // Create course handler
  const handleCreateCourse = async () => {
    setLoading('create');
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'หลักสูตรใหม่ที่ยังไม่ได้ตั้งชื่อ',
          description: 'รายละเอียดเนื้อหาของหลักสูตรโดยย่อ'
        })
      });

      const data = await res.json();
      if (data.success && data.course) {
        toast.success('สร้างหลักสูตรเรียบร้อยแล้ว');
        router.push(`/admin/courses/${data.course.id}`);
      } else {
        toast.error('เกิดข้อผิดพลาดในการสร้างหลักสูตร: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      toast.error('ไม่สามารถสร้างหลักสูตรได้ในขณะนี้');
    } finally {
      setLoading(null);
    }
  };

  // Trigger delete dialog
  const promptDeleteCourse = (id: string, title: string) => {
    setCourseToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  // Execute actual deletion
  const executeDeleteCourse = async () => {
    if (!courseToDelete) return;
    const { id } = courseToDelete;

    setLoading(id);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        toast.success('ลบหลักสูตรเรียบร้อยแล้ว');
        setCourses(courses.filter(c => c.id !== id));
      } else {
        toast.error('ไม่สามารถลบหลักสูตรได้: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(null);
      setCourseToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      
      {/* Admin Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-500/20">
              Admin
            </div>
            <div>
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                ระบบจัดการหลังบ้าน DOT Academy
              </h1>
              <p className="text-xs text-slate-400">สำหรับผู้ดูแลระบบและวิทยากรฝึกอบรม</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <Link href="/admin/users" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              จัดการผู้ใช้
            </Link>
            <span className="hidden sm:inline text-slate-700">|</span>
            <Link href="/admin/enrollments" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              จัดการการลงทะเบียน
            </Link>
            <span className="hidden sm:inline text-slate-700">|</span>
            <Link href="/courses" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              ดูหน้าเว็บหลักสูตร &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Stats Panel */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">หลักสูตรทั้งหมด</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl font-bold">📚</div>
          </div>
          
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">เผยแพร่แล้ว</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">{stats.published}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold">✅</div>
          </div>

          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ฉบับร่าง (Draft)</p>
              <h3 className="text-3xl font-black text-amber-400 mt-1">{stats.draft}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl font-bold">📝</div>
          </div>
        </section>

        {/* Course management header with Search/Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <h2 className="text-lg font-bold text-slate-200">รายการหลักสูตรในระบบ</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือรายละเอียด..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                🔍
              </span>
            </div>

            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="published">เผยแพร่แล้ว (Published)</option>
              <option value="draft">ฉบับร่าง (Draft)</option>
            </select>

            <button
              onClick={handleCreateCourse}
              disabled={loading !== null}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all text-sm flex items-center justify-center gap-2 flex-shrink-0"
            >
              {loading === 'create' ? 'กำลังสร้าง...' : (
                <>
                  <span>+</span> สร้างหลักสูตร
                </>
              )}
            </button>
          </div>
        </div>

        {/* Courses Table / Cards */}
        {courses.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
            <p className="text-slate-400 text-sm mb-4">ยังไม่มีหลักสูตรการสอนในระบบ</p>
            <button
              onClick={handleCreateCourse}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition-colors"
            >
              คลิกเพื่อสร้างหลักสูตรแรก
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/10 rounded-2xl border border-dashed border-slate-700/50">
            <p className="text-slate-400 text-sm">ไม่พบหลักสูตรที่ตรงกับการค้นหา</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-between hover:border-slate-600 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      course.isPublished 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[10px] text-slate-500">ID: {course.id}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">{course.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {course.description || 'ไม่มีคำอธิบายสำหรับหลักสูตรนี้'}
                  </p>

                  <div className="flex gap-4 text-xs text-slate-400 mb-6 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1">
                      <span>📁</span>
                      <span>{course.sectionsCount} หมวดหมู่ย่อย</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📝</span>
                      <span>{course.hasQuiz ? 'มีแบบทดสอบ' : 'ไม่มีแบบทดสอบ'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4 mt-auto">
                  <span className="text-xs text-slate-500 truncate max-w-[150px]"></span>
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-500/20 hover:border-blue-500"
                    >
                      แก้ไข/จัดการ
                    </Link>
                    <button
                      onClick={() => promptDeleteCourse(course.id, course.title)}
                      disabled={loading !== null}
                      className="px-3.5 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-rose-500/20 hover:border-rose-500 disabled:opacity-40"
                    >
                      {loading === course.id ? 'กำลังลบ...' : 'ลบ'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <ConfirmDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
        title="ยืนยันการลบหลักสูตร?"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตร "${courseToDelete?.title}"? การกระทำนี้จะไม่สามารถย้อนกลับได้ และบทเรียน/คำถามทั้งหมดจะถูกลบออกถาวร`}
        confirmText="ลบหลักสูตร"
        variant="danger"
        onConfirm={executeDeleteCourse}
      />
    </div>
  );
}
