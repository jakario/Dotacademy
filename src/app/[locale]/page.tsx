import type { Metadata } from 'next';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/routing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export const metadata: Metadata = {
  title: "หน้าแรก | DOT Academy ระบบการเรียนรู้ออนไลน์ กรมการท่องเที่ยว",
  description: "ยินดีต้อนรับสู่บ้านหลังใหม่ กรมการท่องเที่ยว แหล่งเรียนรู้ออนไลน์ด้านการท่องเที่ยวและมาตรฐานธุรกิจนำเที่ยว",
};

export const dynamic = 'force-dynamic';

const DEFAULTS: Record<string, string> = {
  portal_title: 'ศูนย์การเรียนรู้และแบ่งปันประสบการณ์',
  course_academy_title: 'Course Academy',
  course_academy_subtitle: 'เข้าสู่ระบบการเรียนรู้ออนไลน์และทดสอบสมรรถนะบุคลากร',
  course_academy_icon: '🎓',
  dept101_title: 'Department 101',
  dept101_subtitle: 'โครงสร้าง ภารกิจของแต่ละกอง',
  dept101_icon: '🏢',
  km_title: 'KM Library',
  km_subtitle: 'คลังแบบฟอร์ม เอกสารอ้างอิง และคัมภีร์งาน',
  km_icon: '📚',
  qa_title: 'Cross-Dept Q&A',
  qa_subtitle: 'ถาม-ตอบปัญหาข้ามสายงาน ตรงถึงเจ้าของงาน',
  qa_icon: '💬',
  workflow_title: 'Workflow',
  workflow_subtitle: 'แผนผังกระบวนการทำงานมาตรฐาน (SOPs) ของแต่ละกอง',
  workflow_icon: '🔄',
};

async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSettings.findMany();
    const s = { ...DEFAULTS };
    for (const row of rows) { s[row.key] = row.value; }
    return s;
  } catch {
    return DEFAULTS;
  }
}

export default async function HomePage() {
  const t = await getTranslations('Index');
  const session = await getServerSession(authOptions);
  const s = await getSiteSettings();

  let userName = session?.user?.name;
  if (session && (session.user as any).id) {
    const dbUser = await prisma.user.findUnique({ 
      where: { id: (session.user as any).id }, 
      select: { name: true } 
    });
    if (dbUser?.name) userName = dbUser.name;
  }
  
  return (
    <main id="main-content" className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-b from-blue-50 to-white">
      <nav aria-label="การนำทางหลัก" className="absolute top-4 right-8">
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-900 font-medium">สวัสดี, {userName}</span>
            <Link href="/profile" className="text-blue-800 font-semibold hover:underline hover:text-blue-900">
              โปรไฟล์ของฉัน
            </Link>
            {(["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role) || (session.user as any).role === 'INSTRUCTOR') && (
              <Link href="/admin" className="text-amber-900 font-semibold hover:underline">
                จัดการระบบ (Admin)
              </Link>
            )}
            <a href="/api/auth/signout?callbackUrl=/" className="text-red-700 font-medium hover:underline hover:text-red-900">
              ออกจากระบบ
            </a>
          </div>
        ) : null}
      </nav>

      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl text-gray-900 drop-shadow-sm flex flex-col gap-2">
          <span className="text-4xl sm:text-5xl text-blue-800">{t('title_prefix')}</span>
          <span>{t('title_main')}</span>
        </h1>
        <p className="text-xl sm:text-2xl text-gray-800 max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
        
        {!session ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8" role="group" aria-label="ตัวเลือกการเข้าสู่ระบบ">
            <GoogleLoginButton />
            <Link href="/login" className="px-8 py-4 bg-blue-800 text-white font-semibold rounded-xl shadow-md hover:bg-blue-900 hover:-translate-y-1 transition-all duration-200 block">
              เข้าสู่ระบบ (ทั่วไป)
            </Link>
            <Link href="/register" className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-sm border border-gray-300 hover:border-blue-800 hover:text-blue-800 hover:-translate-y-1 transition-all duration-200 block">
              {t('register')}
            </Link>
          </div>
        ) : (
          <div className="pt-8 w-full">
            {/* Course Academy — Hero Card */}
            <Link href="/courses" className="mb-8 block p-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl shadow-lg border border-blue-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all text-left group w-full">
              <div className="flex items-center gap-6">
                <div className="text-6xl group-hover:scale-110 transition-transform bg-white/20 p-4 rounded-xl">{s.course_academy_icon}</div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">{s.course_academy_title}</h3>
                  <p className="text-blue-100 text-lg">{s.course_academy_subtitle}</p>
                </div>
              </div>
            </Link>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">{s.portal_title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/departments" className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{s.dept101_icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.dept101_title}</h3>
                <p className="text-gray-700 text-sm">{s.dept101_subtitle}</p>
              </Link>
              
              <Link href="/library" className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{s.km_icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.km_title}</h3>
                <p className="text-gray-700 text-sm">{s.km_subtitle}</p>
              </Link>

              <Link href="/qa" className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{s.qa_icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.qa_title}</h3>
                <p className="text-gray-700 text-sm">{s.qa_subtitle}</p>
              </Link>

              <Link href="/workflows" className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{s.workflow_icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.workflow_title}</h3>
                <p className="text-gray-700 text-sm">{s.workflow_subtitle}</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
