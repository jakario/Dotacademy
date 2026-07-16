'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import toast from 'react-hot-toast';

interface EnrollmentInfo {
  courseId: string;
  title: string;
  enrolledAt: string;
  completion: {
    total: number;
    completed: number;
    lastActivity: string | null;
  };
  isCompleted: boolean;
}

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  memberSince: string;
  enrollments: EnrollmentInfo[];
}

function formatThaiDate(dateStr: string | null) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function getInitials(name: string | null, email: string | null) {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }
  return email ? email.substring(0, 2).toUpperCase() : 'U';
}

export default function ProfileClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (!res.ok) {
        // API returned an error — log it but don't crash the UI
        console.error('[Profile] API error:', data);
        toast.error('โหลดข้อมูลโปรไฟล์ไม่สำเร็จ: ' + (data?.error || res.status));
        return;
      }
      setProfile(data);
      setNameInput(data.name || '');
    } catch (err) {
      console.error('[Profile] Fetch error:', err);
      toast.error('โหลดข้อมูลโปรไฟล์ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!nameInput.trim()) {
      toast.error('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
        setEditing(false);
        fetchProfile();
        router.refresh();
      } else {
        toast.error(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          กำลังโหลด...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="text-4xl">⚠️</div>
        <p className="text-sm">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้</p>
        <button
          onClick={() => { setLoading(true); fetchProfile(); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  const completedCourses = profile.enrollments.filter(e => e.isCompleted);
  const inProgressCourses = profile.enrollments.filter(e => !e.isCompleted);
  const certEligibleDate = completedCourses.length > 0
    ? completedCourses.reduce((latest, e) => {
        const d = new Date(e.completion.lastActivity || e.enrolledAt);
        return d > latest ? d : latest;
      }, new Date(0))
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/courses" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-500/20">
              DOT
            </div>
            <span className="text-sm font-semibold text-slate-400 group-hover:text-white transition-colors hidden sm:block">
              ← กลับหน้าหลักสูตร
            </span>
          </Link>
          <h1 className="text-base font-bold text-white">โปรไฟล์ของฉัน</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Profile Card */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden">
          {/* Cover gradient */}
          <div className="h-24 bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] bg-repeat" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name || ''} className="w-20 h-20 rounded-2xl border-4 border-slate-950 object-cover shadow-xl" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-4 border-slate-950 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                    {getInitials(profile.name, profile.email)}
                  </div>
                )}
                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-950 ${profile.role === 'ADMIN' ? 'bg-amber-500' : profile.role === 'INSTRUCTOR' ? 'bg-purple-500' : 'bg-emerald-500'}`} title={profile.role} />
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                profile.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                profile.role === 'INSTRUCTOR' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {profile.role === 'ADMIN' ? '👑 ผู้ดูแลระบบ' : profile.role === 'INSTRUCTOR' ? '🎓 ผู้สอน' : '📚 ผู้เรียน'}
              </span>
            </div>

            {/* Name & Email */}
            <div className="space-y-3">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSave()}
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="w-full sm:w-80 bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      {saving ? 'กำลังบันทึก...' : '✓ บันทึก'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setNameInput(profile.name || ''); }}
                      className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-xl transition-all"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-white">{profile.name || <span className="text-slate-500 italic text-base">ยังไม่ได้ตั้งชื่อ</span>}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">{profile.email}</p>
                    <p className="text-xs text-slate-600 mt-1">สมาชิกตั้งแต่ {formatThaiDate(profile.memberSince)}</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-sm text-slate-300 hover:text-white transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไขชื่อ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
          {[
            { label: 'หลักสูตรทั้งหมด', value: profile.enrollments.length, icon: '📚', color: 'from-blue-600/20 to-blue-700/10 border-blue-500/20' },
            { label: 'กำลังเรียน', value: inProgressCourses.length, icon: '⏳', color: 'from-amber-600/20 to-amber-700/10 border-amber-500/20' },
            { label: 'เรียนจบแล้ว', value: completedCourses.length, icon: '✅', color: 'from-emerald-600/20 to-emerald-700/10 border-emerald-500/20' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-4 text-center`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Certificate Status */}
        {completedCourses.length > 0 && (
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎓</div>
              <div>
                <h3 className="font-bold text-amber-300 text-base">ต้องเรียนครบ ถึงมีสิทธิ์รับใบรับรองการอบรม</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {certEligibleDate ? `ได้รับใบรับรอง เมื่อวันที่ ${formatThaiDate(certEligibleDate.toISOString())}` : 'รอการอนุมัติใบรับรอง'}
                </p>
              </div>
            </div>
            <Link
              href="/courses/certificate"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap"
            >
              🎓 รับใบรับรอง (PDF)
            </Link>
          </div>
        )}

        {/* Enrolled Courses */}
        <div>
          <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full inline-block"></span>
            หลักสูตรที่ลงทะเบียน
          </h2>

          {profile.enrollments.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl py-16 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-slate-400">ยังไม่ได้ลงทะเบียนหลักสูตรใด</p>
              <Link href="/courses" className="mt-4 inline-block px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all">
                ดูหลักสูตรทั้งหมด
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.enrollments.map((enrollment) => {
                const pct = enrollment.completion.total > 0
                  ? Math.round((enrollment.completion.completed / enrollment.completion.total) * 100)
                  : 0;
                return (
                  <div key={enrollment.courseId} className="bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/60 rounded-2xl p-5 transition-all">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-slate-100 text-sm truncate">{enrollment.title}</h3>
                          {enrollment.isCompleted ? (
                            <span className="text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full font-medium whitespace-nowrap">✓ เรียนจบแล้ว</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full font-medium whitespace-nowrap">⏳ กำลังเรียน</span>
                          )}
                        </div>

                        {/* Timeline info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-slate-400 font-medium">ลงทะเบียน:</span> {formatThaiDate(enrollment.enrolledAt)}
                          </span>
                          {enrollment.completion.lastActivity && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="text-slate-400 font-medium">เรียนล่าสุด:</span> {formatThaiDate(enrollment.completion.lastActivity)}
                            </span>
                          )}
                          {enrollment.isCompleted && enrollment.completion.lastActivity && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                              <span className="text-amber-400 font-medium">ได้รับ Cert:</span> {formatThaiDate(enrollment.completion.lastActivity)}
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        {enrollment.completion.total > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                              <span>ความคืบหน้า</span>
                              <span className={`font-semibold ${enrollment.isCompleted ? 'text-emerald-400' : 'text-blue-400'}`}>
                                {enrollment.completion.completed}/{enrollment.completion.total} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${enrollment.isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/courses/${enrollment.courseId}`}
                        className="px-4 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all whitespace-nowrap"
                      >
                        {enrollment.isCompleted ? '👁 ดูอีกครั้ง' : '▶ เรียนต่อ'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
