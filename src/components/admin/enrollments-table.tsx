'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export interface EnrollmentItem {
  id: string;
  user: {
    name: string | null;
    email: string | null;
  };
  course: {
    title: string;
  };
  createdAt: string | Date;
}

interface EnrollmentsTableProps {
  enrollments: EnrollmentItem[];
  onUnenroll: (id: string) => void;
}

export function EnrollmentsTable({ enrollments, onUnenroll }: EnrollmentsTableProps) {
  const [search, setSearch] = useState('');
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<EnrollmentItem | null>(null);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      const searchLower = search.toLowerCase();
      const matchSearch = 
        (e.user.name?.toLowerCase().includes(searchLower)) || 
        (e.user.email?.toLowerCase().includes(searchLower)) ||
        (e.course.title.toLowerCase().includes(searchLower));
      
      return matchSearch;
    });
  }, [enrollments, search]);

  const handleDeleteClick = (enrollment: EnrollmentItem) => {
    setEnrollmentToDelete(enrollment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (enrollmentToDelete) {
      onUnenroll(enrollmentToDelete.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="ค้นหาชื่อนักเรียน, อีเมล, หรือชื่อหลักสูตร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">ผู้เรียน (Student)</th>
                <th className="px-4 py-3">หลักสูตร (Course)</th>
                <th className="px-4 py-3">วันที่ลงทะเบียน</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    ไม่พบรายการลงทะเบียน
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((e) => (
                  <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{e.user.name || '-'}</div>
                      <div className="text-xs text-slate-500">{e.user.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200">{e.course.title}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(e.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteClick(e)}
                        className="text-rose-500 hover:text-rose-400 font-bold px-2 py-1 text-xs transition-colors"
                      >
                        นำออก (Unenroll)
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
        title="ยืนยันการนำนักเรียนออกจากหลักสูตร?"
        description={`คุณแน่ใจหรือไม่ว่าต้องการนำ "${enrollmentToDelete?.user.name || enrollmentToDelete?.user.email}" ออกจากหลักสูตร "${enrollmentToDelete?.course.title}"?`}
        confirmText="นำออก"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
