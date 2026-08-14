"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import toast from "react-hot-toast";

interface Department {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: string;
}

export default function DepartmentsAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (dept: Department | null = null) => {
    setEditingDept(dept);
    setName(dept ? dept.name : "");
    setDescription(dept?.description || "");
    setIcon(dept?.icon || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDept(null);
    setName("");
    setDescription("");
    setIcon("");
  };

  const saveDepartment = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      const url = editingDept 
        ? `/api/departments/${editingDept.id}` 
        : "/api/departments";
      const method = editingDept ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, icon }),
      });

      if (res.ok) {
        toast.success(editingDept ? "Department updated" : "Department created");
        closeModal();
        fetchDepartments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const deleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Department deleted");
        fetchDepartments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              Dept
            </div>
            <div>
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                Department Management
              </h1>
            </div>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            &larr; Back to Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-200">Departments</h2>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center gap-2"
          >
            <span>+</span> Create Department
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading...</div>
        ) : departments.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
            <p className="text-slate-400 text-sm mb-4">No departments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div 
                key={dept.id} 
                className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-between shadow-sm hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="text-4xl mb-4">{dept.icon || "🏢"}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{dept.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {dept.description || "No description provided"}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => openModal(dept)}
                    className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-500/20 hover:border-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDepartment(dept.id, dept.name)}
                    className="flex-1 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-rose-500/20 hover:border-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingDept ? "Edit Department" : "Create Department"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Engineering"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Department purpose and scope"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 💻"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={closeModal}
                disabled={saving}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDepartment}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
