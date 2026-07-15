import { getTranslations } from "next-intl/server";
import ChatClient from "./ChatClient";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Index' });
  return {
    title: `AI Assistant | DOT Academy`,
  };
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-64px)]">
        <div className="bg-white shadow-xl shadow-blue-900/5 rounded-2xl border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">
              🤖
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">DOT AI Assistant</h1>
              <p className="text-blue-100 text-xs">ถาม-ตอบ ทุกเรื่องเกี่ยวกับกรมการท่องเที่ยว</p>
            </div>
          </div>
          
          <div className="flex-1 relative bg-slate-50">
            <ChatClient />
          </div>
        </div>
      </main>
    </div>
  );
}
