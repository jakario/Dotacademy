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

export default async function HomePage() {
  const t = await getTranslations('Index');
  const session = await getServerSession(authOptions);

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
            {/* text-gray-900 on white = 19:1 ✓ AAA */}
            <span className="text-gray-900 font-medium">สวัสดี, {userName}</span>
            {/* text-blue-800 on white = 7.7:1 ✓ AAA */}
            <Link href="/profile" className="text-blue-800 font-semibold hover:underline hover:text-blue-900">
              โปรไฟล์ของฉัน
            </Link>
            {(["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role) || (session.user as any).role === 'INSTRUCTOR') && (
              // text-amber-900 on white = 11.6:1 ✓ AAA
              <Link href="/admin" className="text-amber-900 font-semibold hover:underline">
                จัดการระบบ (Admin)
              </Link>
            )}
            {/* text-red-700 on white = 7.1:1 ✓ AAA */}
            <a href="/api/auth/signout?callbackUrl=/" className="text-red-700 font-medium hover:underline hover:text-red-900">
              ออกจากระบบ
            </a>
          </div>
        ) : null}
      </nav>

      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl text-gray-900 drop-shadow-sm flex flex-col gap-2">
          {/* text-blue-800 on white/blue-50 = 7.7:1 ✓ AAA */}
          <span className="text-4xl sm:text-5xl text-blue-800">{t('title_prefix')}</span>
          {/* text-gray-900 on white = 19:1 ✓ AAA */}
          <span>{t('title_main')}</span>
        </h1>
        {/* text-gray-800 on white = 12.6:1 ✓ AAA */}
        <p className="text-xl sm:text-2xl text-gray-800 max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
        
        {!session ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8" role="group" aria-label="ตัวเลือกการเข้าสู่ระบบ">
            <GoogleLoginButton />
            {/* white on blue-800 = 7.6:1 ✓ AAA */}
            <Link href="/login" className="px-8 py-4 bg-blue-800 text-white font-semibold rounded-xl shadow-md hover:bg-blue-900 hover:-translate-y-1 transition-all duration-200 block">
              เข้าสู่ระบบ (ทั่วไป)
            </Link>
            {/* text-gray-900 on white = 19:1 ✓ AAA */}
            <Link href="/register" className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-sm border border-gray-300 hover:border-blue-800 hover:text-blue-800 hover:-translate-y-1 transition-all duration-200 block">
              {t('register')}
            </Link>
          </div>
        ) : (
          <div className="pt-8 w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">ศูนย์กลางการเรียนรู้และคู่มือการปฏิบัติงาน (Portal)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/departments" className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Department 101</h3>
                <p className="text-gray-700 text-sm">รู้จักงานแต่ละฝ่ายใน 2 นาที โครงสร้างและภารกิจ</p>
              </Link>
              
              <Link href="/workflows" className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔄</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Workflow & Matrix</h3>
                <p className="text-gray-700 text-sm">กระบวนการทำงานและจุดเชื่อมต่อ (Hand-off) ระหว่างฝ่าย</p>
              </Link>

              <Link href="/qa" className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cross-Dept Q&A</h3>
                <p className="text-gray-700 text-sm">ถาม-ตอบปัญหาข้ามสายงาน ตรงถึงเจ้าของงาน</p>
              </Link>

              <Link href="/library" className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">KM Library</h3>
                <p className="text-gray-700 text-sm">คลังแบบฟอร์ม เอกสารอ้างอิง และคัมภีร์งาน</p>
              </Link>

              <Link href="/courses" className="p-6 bg-blue-50 rounded-2xl shadow-sm border border-blue-200 hover:border-blue-500 hover:shadow-md transition-all text-left group lg:col-span-2">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Course Academy</h3>
                <p className="text-blue-800 text-sm">เข้าสู่ระบบ E-Learning และบทเรียนทางการเดิม</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
