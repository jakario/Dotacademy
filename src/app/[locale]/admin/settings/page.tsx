'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import toast from 'react-hot-toast';

interface SettingsData {
  [key: string]: string;
}

interface SectionConfig {
  label: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'emoji';
    placeholder?: string;
  }[];
}

const SECTIONS: SectionConfig[] = [
  {
    label: '🏠 หน้าหลัก (Portal)',
    fields: [
      { key: 'portal_title', label: 'ชื่อหัวข้อ Portal', type: 'text', placeholder: 'ศูนย์การเรียนรู้และแบ่งปันประสบการณ์' },
    ],
  },
  {
    label: '🎓 Course Academy',
    fields: [
      { key: 'course_academy_icon', label: 'ไอคอน (Emoji)', type: 'emoji' },
      { key: 'course_academy_title', label: 'ชื่อเมนู', type: 'text', placeholder: 'Course Academy' },
      { key: 'course_academy_subtitle', label: 'คำอธิบาย', type: 'textarea', placeholder: 'เข้าสู่ระบบการเรียนรู้ออนไลน์และทดสอบสมรรถนะบุคลากร' },
    ],
  },
  {
    label: '🏢 Department 101',
    fields: [
      { key: 'dept101_icon', label: 'ไอคอน (Emoji)', type: 'emoji' },
      { key: 'dept101_title', label: 'ชื่อเมนู', type: 'text', placeholder: 'Department 101' },
      { key: 'dept101_subtitle', label: 'คำอธิบาย', type: 'textarea', placeholder: 'โครงสร้าง ภารกิจของแต่ละกอง' },
    ],
  },
  {
    label: '📚 KM Library',
    fields: [
      { key: 'km_icon', label: 'ไอคอน (Emoji)', type: 'emoji' },
      { key: 'km_title', label: 'ชื่อเมนู', type: 'text', placeholder: 'KM Library' },
      { key: 'km_subtitle', label: 'คำอธิบาย', type: 'textarea', placeholder: 'คลังแบบฟอร์ม เอกสารอ้างอิง และคัมภีร์งาน' },
    ],
  },
  {
    label: '💬 Q&A',
    fields: [
      { key: 'qa_icon', label: 'ไอคอน (Emoji)', type: 'emoji' },
      { key: 'qa_title', label: 'ชื่อเมนู', type: 'text', placeholder: 'Cross-Dept Q&A' },
      { key: 'qa_subtitle', label: 'คำอธิบาย', type: 'textarea', placeholder: 'ถาม-ตอบปัญหาข้ามสายงาน' },
    ],
  },
  {
    label: '🔄 Workflow',
    fields: [
      { key: 'workflow_icon', label: 'ไอคอน (Emoji)', type: 'emoji' },
      { key: 'workflow_title', label: 'ชื่อเมนู', type: 'text', placeholder: 'Workflow' },
      { key: 'workflow_subtitle', label: 'คำอธิบาย', type: 'textarea', placeholder: 'แผนผังกระบวนการทำงานมาตรฐาน' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch {
      toast.error('โหลดการตั้งค่าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
        setDirty(false);
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              ⚙️ ตั้งค่าระบบ (Site Settings)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">แก้ไขชื่อและคำอธิบายของแต่ละเมนูบนหน้าหลัก</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              &larr; กลับ Admin
            </Link>
            {dirty && (
              <span className="text-xs text-amber-400 font-semibold animate-pulse">● มีการเปลี่ยนแปลง</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors text-sm"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Preview Banner */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-xl">💡</span>
            <div>
              <p className="text-blue-200 font-semibold text-sm">วิธีใช้งาน</p>
              <p className="text-blue-300 text-xs mt-1">แก้ไขข้อความในแต่ละส่วน แล้วกด <strong>"บันทึกการตั้งค่า"</strong> เพื่ออัปเดตหน้าเว็บทันที ไม่ต้องแก้โค้ด</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">กำลังโหลดการตั้งค่า...</div>
        ) : (
          <div className="space-y-6">
            {SECTIONS.map(section => (
              <div key={section.label} className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
                {/* Section Header */}
                <div className="px-6 py-4 bg-slate-800/60 border-b border-slate-700/50">
                  <h2 className="font-bold text-slate-200 text-sm">{section.label}</h2>
                </div>

                {/* Fields */}
                <div className="p-6 space-y-4">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={settings[field.key] || ''}
                          onChange={e => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none placeholder:text-slate-600 transition-colors"
                        />
                      ) : field.type === 'emoji' ? (
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{settings[field.key] || '📌'}</span>
                          <input
                            type="text"
                            value={settings[field.key] || ''}
                            onChange={e => handleChange(field.key, e.target.value)}
                            placeholder="Emoji เช่น 🎓"
                            maxLength={4}
                            className="w-32 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-center text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 transition-colors"
                          />
                          <p className="text-xs text-slate-500">วาง Emoji จากแป้นพิมพ์หรือ copy มาใส่</p>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={settings[field.key] || ''}
                          onChange={e => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Button Bottom */}
        {!loading && (
          <div className="flex justify-end pt-2 pb-8">
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors"
            >
              {saving ? 'กำลังบันทึก...' : '✅ บันทึกการตั้งค่าทั้งหมด'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
