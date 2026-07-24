import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/routing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute top-4 right-8">
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">สวัสดี, {userName}</span>
            <Link href="/profile" className="text-blue-600 font-semibold hover:underline">
              โปรไฟล์ของฉัน
            </Link>
            {((session.user as any).role === 'ADMIN' || (session.user as any).role === 'INSTRUCTOR') && (
              <Link href="/admin" className="text-amber-600 font-semibold hover:underline">
                จัดการระบบ (Admin)
              </Link>
            )}
            <a href="/api/auth/signout?callbackUrl=/" className="text-red-500 font-medium hover:underline">
              ออกจากระบบ
            </a>
          </div>
        ) : null}
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl text-gray-900 drop-shadow-sm flex flex-col gap-2">
          <span className="text-4xl sm:text-5xl text-blue-600">{t('title_prefix')}</span>
          <span>{t('title_main')}</span>
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
        
        {!session ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a href="/api/auth/signin/google" className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.4 7.56l3.88 3C6.22 7.78 8.87 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.67-5.01 3.67-8.64z"/>
                <path fill="#FBBC05" d="M5.28 14.78c-.25-.76-.39-1.57-.39-2.4 0-.83.14-1.64.39-2.4L1.4 6.98C.51 8.76 0 10.74 0 12.8s.51 4.04 1.4 5.82l3.88-3.02z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.04.7-2.38 1.12-4.2 1.12-3.13 0-5.78-2.74-6.72-5.52l-3.88 3.02C3.37 20.35 7.35 23 12 23z"/>
              </svg>
              เข้าสู่ระบบด้วย Google
            </a>
            <Link href="/login" className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-1 transition-all duration-200 block">
              เข้าสู่ระบบ (ทั่วไป)
            </Link>
            <Link href="/register" className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:-translate-y-1 transition-all duration-200 block">
              {t('register')}
            </Link>
          </div>
        ) : (
          <div className="flex justify-center pt-8">
             <Link href="/courses" className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-1 transition-all duration-200 block">
              เข้าสู่บทเรียน
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
