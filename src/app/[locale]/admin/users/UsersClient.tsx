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

  const handleEditUser = (user: UserItem) => {
    // For now just a toast, a full edit modal would be better
    toast('ระบบแก้ไขผู้ใช้อยู่ระหว่างการพัฒนา');
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
    </div>
  );
}
