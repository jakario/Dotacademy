'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string | Date;
}

interface UsersTableProps {
  users: UserItem[];
  onDeleteUser: (id: string) => void;
  onEditUser: (user: UserItem) => void;
}

export function UsersTable({ users, onDeleteUser, onEditUser }: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = search.toLowerCase();
      const matchSearch = 
        (user.name?.toLowerCase().includes(searchLower)) || 
        (user.email?.toLowerCase().includes(searchLower));
      
      const matchRole = roleFilter === 'ALL' || user.role === roleFilter;
      
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const handleDeleteClick = (user: UserItem) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรืออีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">ทุกบทบาท (All Roles)</option>
          <option value="STUDENT">ผู้เรียน (Student)</option>
          <option value="INSTRUCTOR">ผู้สอน (Instructor)</option>
          <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">ชื่อ (Name)</th>
                <th className="px-4 py-3">อีเมล (Email)</th>
                <th className="px-4 py-3">บทบาท (Role)</th>
                <th className="px-4 py-3">วันที่สมัคร</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    ไม่พบข้อมูลผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">{user.name || '-'}</td>
                    <td className="px-4 py-3">{user.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wide ${
                        user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        user.role === 'INSTRUCTOR' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onEditUser(user)}
                        className="text-blue-400 hover:text-blue-300 px-2 py-1 text-xs transition-colors"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-rose-500 hover:text-rose-400 font-bold px-2 py-1 text-xs transition-colors"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="ยืนยันการลบผู้ใช้งาน?"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน "${userToDelete?.name || userToDelete?.email}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ลบบัญชีนี้"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
