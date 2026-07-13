'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { EnrollmentsTable, EnrollmentItem } from '@/components/admin/enrollments-table';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';

export function EnrollmentsClient() {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/admin/enrollments');
      const data = await res.json();
      if (data.success) {
        setEnrollments(data.enrollments);
      } else {
        toast.error('Failed to load enrollments: ' + data.error);
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('นำนักเรียนออกจากหลักสูตรสำเร็จ');
        setEnrollments(enrollments.filter(e => e.id !== id));
      } else {
        toast.error(data.error || 'Failed to unenroll');
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
              <h1 className="text-xl font-black text-white">จัดการการลงทะเบียน (Enrollments)</h1>
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
          <EnrollmentsTable 
            enrollments={enrollments} 
            onUnenroll={handleUnenroll} 
          />
        )}
      </main>
    </div>
  );
}
