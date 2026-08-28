"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/routing";
import { Plus, Edit2, Trash2, X, Check, Building2 } from "lucide-react";

type Department = {
  id: string;
  name: string;
  description: string | null;
  duties: string | null;
  icon: string | null;
  createdAt: string;
};

export default function DepartmentsClient() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "", duties: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("กรุณากรอกชื่อกลุ่มงาน");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/departments/${editingId}` : "/api/departments";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editingId ? "แก้ไขเรียบร้อย" : "เพิ่มกลุ่มงานเรียบร้อย");
        setShowForm(false);
        setEditingId(null);
        setForm({ name: "", description: "", icon: "", duties: "" });
        fetchDepartments();
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setForm({ name: dept.name, description: dept.description || "", icon: dept.icon || "", duties: dept.duties || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ยืนยันการลบกลุ่มงาน "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบเรียบร้อยแล้ว");
        fetchDepartments();
      } else {
        toast.error("ลบไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "", icon: "", duties: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-blue-600 hover:underline text-sm">
              ← Admin Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              จัดการกลุ่มงาน / กอง
            </h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "", icon: "", duties: "" }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> เพิ่มกลุ่มงาน
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? "แก้ไขกลุ่มงาน" : "เพิ่มกลุ่มงานใหม่"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกลุ่มงาน *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="เช่น กองกิจการภาพยนตร์"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ไอคอน (Emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  placeholder="เช่น 🏢"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="คำอธิบายสั้นๆ ของกลุ่มงาน"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div><div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">อำนาจหน้าที่ (ขึ้นบรรทัดใหม่เป็นข้อๆ)</label><textarea value={form.duties} onChange={e => setForm({ ...form, duties: e.target.value })} placeholder="1. กำกับดูแล...&#10;2. ตรวจสอบ..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
              >
                <X className="w-4 h-4" /> ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">กำลังโหลด...</div>
        ) : departments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>ยังไม่มีกลุ่มงานในระบบ</p>
            <p className="text-sm mt-1">กดปุ่ม "เพิ่มกลุ่มงาน" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:border-blue-300 transition-colors"
              >
                <div className="text-4xl w-14 h-14 flex items-center justify-center bg-blue-50 rounded-xl flex-shrink-0">
                  {dept.icon || "🏢"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{dept.name}</h3>
                  {dept.description && (
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{dept.description}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id, dept.name)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">ทั้งหมด {departments.length} กลุ่มงาน</p>
      </div>
    </div>
  );
}