import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/routing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const t = await getTranslations('Index');
  const session = await getServerSession(authOptions);
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute top-4 right-8">
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">สวัสดี, {session.user?.name}</span>
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
            <Link href="/login" className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-1 transition-all duration-200 block">
              {t('login')}
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
