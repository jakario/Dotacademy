'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import toast from 'react-hot-toast';

interface Department { id: string; name: string; }
interface Document {
  id: string; title: string; type: string; url: string; category: string;
  department?: { name: string } | null; departmentId?: string | null;
}

const CATEGORIES = ['ทั่วไป', 'แบบฟอร์ม', 'คู่มือการปฏิบัติงาน', 'นโยบาย/ระเบียบ', 'กฎหมาย', 'รายงาน'];
const TYPES = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'LINK', 'VDO'];

const emptyForm = { title: '', type: 'PDF', url: '', category: 'ทั่วไป', departmentId: '' };

export default function AdminLibraryPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, deptsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/departments'),
      ]);
      const [docsData, deptsData] = await Promise.all([docsRes.json(), deptsRes.json()]);
      setDocs(Array.isArray(docsData) ? docsData : []);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (doc: Document) => {
    setEditingId(doc.id);
    setForm({ title: doc.title, type: doc.type, url: doc.url, category: doc.category, departmentId: doc.departmentId || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error('กรุณากรอกชื่อเอกสารและ URL');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/documents/${editingId}` : '/api/documents', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, departmentId: form.departmentId || null }),
      });
      if (res.ok) {
        toast.success(editingId ? 'อัปเดตเอกสารแล้ว' : 'เพิ่มเอกสารแล้ว');
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      toast.error('ไม่สามารถบันทึกได้');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`ลบเอกสาร "${title}" ใช่ไหม?`)) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('ลบเรียบร้อย'); fetchData(); }
      else toast.error('ลบไม่สำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  };

  const typeIcon = (type: string) => ({ PDF: '📄', DOCX: '📝', XLSX: '📊', PPTX: '📑', VDO: '🎬', LINK: '🔗' }[type] || '📁');

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              📚 จัดการคลังความรู้ (KM Library)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">เพิ่ม แก้ไข และลบเอกสารในคลังความรู้</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              &larr; กลับ Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <input
            type="text"
            placeholder="🔍 ค้นหาเอกสาร..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
          <button
            onClick={openCreate}
            className="flex-shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-sm"
          >
            + เพิ่มเอกสารใหม่
          </button>
        </div>

        {/* Documents Table */}
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-slate-500">กำลังโหลด...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-slate-400">ยังไม่มีเอกสารในระบบ</p>
              <button onClick={openCreate} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors">
                เพิ่มเอกสารแรก
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3">เอกสาร</th>
                    <th className="px-5 py-3">ประเภท</th>
                    <th className="px-5 py-3">หมวดหมู่</th>
                    <th className="px-5 py-3">กอง</th>
                    <th className="px-5 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filtered.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{typeIcon(doc.type)}</span>
                          <div>
                            <p className="font-semibold text-white text-sm">{doc.title}</p>
                            <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline truncate block max-w-xs">
                              {doc.url}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs font-bold rounded-lg">{doc.type}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{doc.category}</td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{doc.department?.name || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(doc)} className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-bold rounded-lg border border-blue-500/30 hover:border-blue-500 transition-all">
                            แก้ไข
                          </button>
                          <button onClick={() => handleDelete(doc.id, doc.title)} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-bold rounded-lg border border-rose-500/30 hover:border-rose-500 transition-all">
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">{editingId ? 'แก้ไขเอกสาร' : 'เพิ่มเอกสารใหม่'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">ชื่อเอกสาร *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="เช่น คู่มือการขอใบอนุญาต ..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">URL ลิงก์ / ที่อยู่ไฟล์ *</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">ประเภทไฟล์</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">หมวดหมู่</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">กองที่รับผิดชอบ (ถ้ามี)</label>
                <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="">— ส่วนกลาง / ไม่ระบุ —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors text-sm">
                ยกเลิก
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm">
                {saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มเอกสาร'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
