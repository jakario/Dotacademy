'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { Edit2, X, Check, User } from "lucide-react";

type Department = {
  id: string;
  name: string;
};

type UserItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  departmentId: string | null;
  department: { name: string } | null;
  createdAt: string;
};

export function UsersClient() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resDepts] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/departments")
      ]);
      const dataUsers = await resUsers.json();
      const dataDepts = await resDepts.json();
      if (dataUsers.users) setUsers(dataUsers.users);
      if (dataDepts.departments) setDepartments(dataDepts.departments);
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState<string>('STUDENT');
  const [newDept, setNewDept] = useState<string>('');

  const handleEditUser = (user: UserItem) => {
    setEditingUser(user);
    setNewRole(user.role || 'STUDENT');
    setNewDept(user.departmentId || '');
  };

  const submitEditUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, departmentId: newDept })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('อัปเดตข้อมูลผู้ใช้งานสำเร็จ');
        await fetchData();
        setEditingUser(null);
      } else {
        toast.error(data.error || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-800">User Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              &larr; Back to Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Department</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : <User />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{user.name || "Unknown User"}</p>
                            <p className="text-slate-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {user.department?.name || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Edit User Details</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User Name</label>
                <input
                  type="text"
                  readOnly
                  value={editingUser.name || ""}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="text"
                  readOnly
                  value={editingUser.email || ""}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                >
                  <option value="">None</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitEditUser}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
