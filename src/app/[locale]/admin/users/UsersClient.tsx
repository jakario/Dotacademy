'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { UsersTable, UserItem } from '@/components/admin/users-table';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';

export function UsersClient() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error('Failed to load users: ' + data.error);
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('ลบผู้ใช้งานสำเร็จ');
        setUsers(users.filter(u => u.id !== id));
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState<string>('STUDENT');

  const handleEditUser = (user: UserItem) => {
    setEditingUser(user);
    setNewRole(user.role || 'STUDENT');
  };

  const submitEditUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('อัปเดตสิทธิ์ผู้ใช้งานสำเร็จ');
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u));
        setEditingUser(null);
      } else {
        toast.error(data.error || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black text-white">จัดการผู้ใช้งาน (Users)</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              &larr; กลับหน้า Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : (
          <UsersTable 
            users={users} 
            onDeleteUser={handleDeleteUser} 
            onEditUser={handleEditUser} 
          />
        )}
      </main>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">เปลี่ยนสิทธิ์ผู้ใช้งาน</h3>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">อีเมล</label>
              <div className="text-slate-200">{editingUser.email}</div>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">เลือกสิทธิ์ใหม่</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="STUDENT">ผู้เรียน (STUDENT)</option>
                <option value="INSTRUCTOR">ผู้สอน (INSTRUCTOR)</option>
                <option value="ADMIN">แอดมิน (ADMIN)</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={submitEditUser}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
