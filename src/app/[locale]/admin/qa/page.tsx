'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import toast from 'react-hot-toast';

interface Department { id: string; name: string; }
interface QATicket {
  id: string; question: string; answer?: string | null; status: string;
  isAnonymous: boolean; department: { name: string };
  asker?: { name?: string | null; email?: string | null } | null;
  answerer?: { name?: string | null } | null;
  createdAt: string;
}

export default function AdminQAPage() {
  const [tickets, setTickets] = useState<QATicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ANSWERED'>('ALL');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/qa');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      toast.error('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleAnswer = async (id: string) => {
    if (!answerText.trim()) { toast.error('กรุณาพิมพ์คำตอบ'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/qa/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answerText }),
      });
      if (res.ok) {
        toast.success('ส่งคำตอบเรียบร้อย');
        setAnsweringId(null);
        setAnswerText('');
        fetchTickets();
      } else {
        toast.error('เกิดข้อผิดพลาด');
      }
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ลบคำถามนี้ใช่ไหม?')) return;
    try {
      const res = await fetch(`/api/qa/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('ลบเรียบร้อย'); fetchTickets(); }
      else toast.error('ลบไม่สำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  };

  const filtered = tickets.filter(t => filter === 'ALL' || t.status === filter);
  const pendingCount = tickets.filter(t => t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              💬 จัดการ Cross-Dept Q&amp;A
              {pendingCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">{pendingCount}</span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">ตอบคำถามและจัดการข้อความจากเจ้าหน้าที่</p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            &larr; กลับ Admin
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'ANSWERED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
            >
              {f === 'ALL' ? 'ทั้งหมด' : f === 'PENDING' ? `🟡 รอตอบ (${pendingCount})` : '🟢 ตอบแล้ว'}
            </button>
          ))}
        </div>

        {/* Ticket List */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-slate-400">ไม่มีคำถามในหมวดนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(ticket => (
              <div key={ticket.id} className={`bg-slate-800/40 rounded-2xl border ${ticket.status === 'PENDING' ? 'border-amber-500/40' : 'border-slate-700/50'} p-6`}>
                {/* Ticket Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${ticket.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {ticket.status === 'PENDING' ? '🟡 รอตอบ' : '🟢 ตอบแล้ว'}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs font-bold rounded-full">
                      {ticket.department.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {ticket.isAnonymous ? 'ไม่ระบุตัวตน' : (ticket.asker?.name || ticket.asker?.email || 'ผู้ใช้งาน')}
                      {' · '}{new Date(ticket.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="text-rose-400 hover:text-rose-300 text-xs font-bold flex-shrink-0 transition-colors"
                  >
                    ลบ
                  </button>
                </div>

                {/* Question */}
                <div className="bg-slate-900/60 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">คำถาม</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{ticket.question}</p>
                </div>

                {/* Answer Section */}
                {ticket.status === 'ANSWERED' ? (
                  <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">
                      คำตอบ {ticket.answerer?.name && `· ${ticket.answerer.name}`}
                    </p>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{ticket.answer}</p>
                  </div>
                ) : answeringId === ticket.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={answerText}
                      onChange={e => setAnswerText(e.target.value)}
                      placeholder="พิมพ์คำตอบที่นี่..."
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none placeholder:text-slate-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAnswer(ticket.id)}
                        disabled={saving}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm"
                      >
                        {saving ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
                      </button>
                      <button
                        onClick={() => { setAnsweringId(null); setAnswerText(''); }}
                        className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors text-sm"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAnsweringId(ticket.id); setAnswerText(''); }}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    ✍️ ตอบคำถามนี้
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
