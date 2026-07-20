'use client';

import { useState, useEffect, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import toast from 'react-hot-toast';

interface RewardClaim {
  id: string;
  user: { name: string | null; email: string | null };
  course: { title: string };
  status: string;
  claimedAt: string;
}

export function RewardsClient() {
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/admin/rewards');
      const data = await res.json();
      if (data.success) {
        setClaims(data.claims);
      } else {
        toast.error('ไม่สามารถโหลดรายการได้: ' + data.error);
      }
    } catch {
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/rewards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('อัปเดตสถานะเรียบร้อย!');
        setClaims(prev =>
          prev.map(c => (c.id === id ? { ...c, status: 'DELIVERED' } : c))
        );
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch {
      toast.error('Error updating');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return claims.filter(
      c =>
        c.user.name?.toLowerCase().includes(q) ||
        c.user.email?.toLowerCase().includes(q) ||
        c.course.title.toLowerCase().includes(q)
    );
  }, [claims, search]);

  const pending = claims.filter(c => c.status === 'PENDING').length;
  const delivered = claims.filter(c => c.status === 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              🏆 ผู้ได้รับรางวัล — 20 คนแรกที่สอบผ่าน
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              จัดการรายชื่อและสถานะการจัดส่งรางวัล
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตประวัติผู้ได้รับรางวัลทั้งหมด? (การกระทำนี้ไม่สามารถย้อนกลับได้)')) {
                  try {
                    const res = await fetch('/api/admin/rewards/reset', { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                      toast.success(`รีเซ็ตสำเร็จ! ลบข้อมูลไปแล้ว ${data.count} รายการ`);
                      fetchClaims();
                    } else {
                      toast.error('ไม่สามารถรีเซ็ตได้: ' + data.error);
                    }
                  } catch {
                    toast.error('Error connecting to server');
                  }
                }
              }}
              className="text-sm font-bold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              ⚠️ รีเซ็ตรางวัลทั้งหมด
            </button>
            <Link
              href="/admin"
              className="text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg transition-all"
            >
              &larr; กลับหน้า Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-white">{claims.length}</div>
            <div className="text-xs text-slate-400 mt-1">ผู้ได้สิทธิ์ทั้งหมด</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-amber-400">{pending}</div>
            <div className="text-xs text-slate-400 mt-1">รอส่งของรางวัล</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-emerald-400">{delivered}</div>
            <div className="text-xs text-slate-400 mt-1">ส่งแล้ว</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล, หรือชื่อหลักสูตร..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">ผู้ได้รับรางวัล</th>
                    <th className="px-4 py-3">หลักสูตร</th>
                    <th className="px-4 py-3">วันที่ผ่านการทดสอบ</th>
                    <th className="px-4 py-3">สถานะ</th>
                    <th className="px-4 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        ยังไม่มีผู้ได้รับรางวัล
                      </td>
                    </tr>
                  ) : (
                    filtered.map((claim, idx) => (
                      <tr
                        key={claim.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-200">
                            {claim.user.name || '-'}
                          </div>
                          <div className="text-xs text-slate-500">{claim.user.email}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-300">
                          {claim.course.title}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {new Date(claim.claimedAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {claim.status === 'DELIVERED' ? (
                            <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ✅ ส่งแล้ว
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              ⏳ รอดำเนินการ
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {claim.status !== 'DELIVERED' && (
                              <button
                                onClick={() => handleMarkDelivered(claim.id)}
                                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 rounded px-2 py-1 transition-all"
                              >
                                ✓ ส่งแล้ว
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (confirm('ต้องการลบประวัติการรับรางวัลนี้ใช่หรือไม่?')) {
                                  try {
                                    const res = await fetch(`/api/admin/rewards/${claim.id}`, { method: 'DELETE' });
                                    const data = await res.json();
                                    if (data.success) {
                                      toast.success('ลบประวัติเรียบร้อย');
                                      setClaims(prev => prev.filter(c => c.id !== claim.id));
                                    } else {
                                      toast.error('ลบไม่สำเร็จ: ' + data.error);
                                    }
                                  } catch {
                                    toast.error('Error connecting to server');
                                  }
                                }
                              }}
                              className="text-xs font-semibold text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/5 hover:bg-rose-500/10 rounded px-2 py-1 transition-all"
                              title="ลบข้อมูลเพื่อรีเซ็ตสิทธิ์ให้คนนี้"
                            >
                              ✕ ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {claims.length >= 20 && (
          <div className="text-center p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
            🔒 ครบ 20 คนแล้ว — ระบบจะไม่บันทึกผู้ได้รับรางวัลเพิ่มเติมอีกต่อไป
          </div>
        )}
      </main>
    </div>
  );
}
