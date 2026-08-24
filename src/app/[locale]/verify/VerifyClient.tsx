'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle, XCircle, Award, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

type CertificateData = {
  id: string;
  certNo: string;
  issuedAt: string;
  user: { name: string; image: string | null; email: string };
  course: { title: string };
};

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  
  const [certNo, setCertNo] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    data?: CertificateData;
  } | null>(null);

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certNo.trim()) {
      handleVerify(certNo.trim());
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(\/api/certificates/verify/\\);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setResult({ success: true, data: data.certificate });
      } else {
        setResult({ success: false, error: data.error || 'ไม่พบข้อมูลใบประกาศนียบัตร' });
      }
    } catch (error) {
      setResult({ success: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-['Noto_Sans_Thai']">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/images/logo-dot.png" alt="DOT Logo" width={80} height={80} className="mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">ตรวจสอบใบประกาศนียบัตร</h1>
          <p className="text-slate-600">กรมการท่องเที่ยว (Department of Tourism)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="mb-8">
              <label htmlFor="certNo" className="block text-sm font-medium text-slate-700 mb-2">
                กรอกรหัสอ้างอิงใบประกาศนียบัตร (Certificate Number)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="certNo"
                  value={certNo}
                  onChange={(e) => setCertNo(e.target.value)}
                  placeholder="เช่น DOT-2026-XXXXXX"
                  className="flex-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !certNo.trim()}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  ตรวจสอบ
                </button>
              </div>
            </form>

            {result && (
              <div className={\ounded-xl border \ p-6 transition-all animate-in fade-in slide-in-from-bottom-4\}>
                {result.success && result.data ? (
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-900 mb-1">ใบประกาศนียบัตรถูกต้อง (Valid)</h3>
                    <p className="text-green-700 text-sm mb-6">ออกโดยระบบ e-Learning กรมการท่องเที่ยว</p>
                    
                    <div className="bg-white rounded-lg p-5 text-left shadow-sm border border-green-100">
                      <div className="flex flex-col gap-4">
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">รหัสอ้างอิง</p>
                          <p className="text-lg font-mono font-bold text-slate-900">{result.data.certNo}</p>
                        </div>
                        <div className="w-full h-px bg-slate-100"></div>
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">ผู้รับใบประกาศนียบัตร</p>
                          <p className="text-base font-medium text-slate-900">{result.data.user.name}</p>
                          <p className="text-sm text-slate-500">{result.data.user.email}</p>
                        </div>
                        <div className="w-full h-px bg-slate-100"></div>
                        <div className="flex gap-3">
                          <Award className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">หลักสูตรที่สำเร็จการศึกษา</p>
                            <p className="text-sm font-medium text-slate-900">{result.data.course.title}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">วันที่สำเร็จการศึกษา</p>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(result.data.issuedAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-900 mb-2">ไม่พบข้อมูล (Not Found)</h3>
                    <p className="text-red-700 text-sm">
                      {result.error || 'รหัสใบประกาศนียบัตรไม่ถูกต้อง หรือไม่มีอยู่ในระบบ โปรดตรวจสอบความถูกต้องอีกครั้ง'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center">
              ระบบตรวจสอบใบประกาศนียบัตรนี้ใช้สำหรับตรวจสอบความถูกต้องของเอกสารที่ออกโดย DOT Academy เท่านั้น
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}