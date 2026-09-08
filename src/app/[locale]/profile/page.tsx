import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import { getLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'โปรไฟล์ของฉัน | DOT Knowledge',
  description: 'ข้อมูลส่วนตัวและความคืบหน้าการเรียนรู้ กรมการท่องเที่ยว',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return <ProfileClient />;
}
