'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

export default function FloatingChatbot() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Tooltip */}
      <div 
        className={"mb-3 bg-white px-4 py-2 rounded-2xl shadow-lg border border-blue-100 transition-all duration-300 transform origin-bottom-right "}
      >
        <div className="text-sm font-semibold text-slate-800">Mr.Wick</div>
        <div className="text-xs text-slate-500">มีคำถามอะไร ถามผมได้เลยครับ!</div>
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-blue-100 transform rotate-45"></div>
      </div>

      {/* Floating Button */}
      <Link 
        href="/chat"
        className="relative group flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 ring-4 ring-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20">
          <Image
            src="/mr-wick.jpg"
            alt="Mr.Wick Chatbot"
            fill
            className="object-cover"
          />
        </div>
        
        {/* Notification Dot */}
        <span className="absolute top-0 right-0 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
        </span>
      </Link>
    </div>
  );
}
