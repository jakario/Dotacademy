'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useChat } from 'ai/react';
import toast from 'react-hot-toast';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'สวัสดีครับ ผมคือ Mr. Wick มีคำถามอะไรเกี่ยวกับบทเรียนหรือการท่องเที่ยว สอบถามผมได้เลยครับ'
      }
    ],
    onError: (error) => {
      console.error('Chat Error:', error);
      toast.error('ขออภัยครับ เกิดข้อผิดพลาด: ' + (error.message || 'ไม่สามารถเชื่อมต่อได้'));
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Popup Window */}
      <div 
        className={`mb-4 bg-white w-[350px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none absolute bottom-16'
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
              <Image src="/mr-wick.jpg" alt="Mr. Wick" fill className="object-cover" />
            </div>
            <div>
              <div className="font-semibold text-sm">Mr. Wick Assistant</div>
              <div className="text-blue-100 text-xs">ถาม-ตอบ ทุกเรื่องเกี่ยวกับการท่องเที่ยว</div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-blue-100 hover:text-white transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm text-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
              }`}>
                <div className="prose prose-sm prose-p:leading-relaxed max-w-none whitespace-pre-wrap break-words" style={{ color: 'inherit' }}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="พิมพ์คำถาม..."
              className="flex-1 bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-1 top-1 bottom-1 aspect-square bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Tooltip (Only show if popup is closed) */}
      {!isOpen && (
        <div 
          className={`mb-3 bg-white px-4 py-2 rounded-2xl shadow-lg border border-blue-100 transition-all duration-300 transform origin-bottom-right ${
            isHovered ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
          }`}
        >
          <div className="text-sm font-semibold text-slate-800">Mr. Wick</div>
          <div className="text-xs text-slate-500">มีคำถามอะไร ถามผมได้เลยครับ!</div>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-blue-100 transform rotate-45"></div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 ring-4 ring-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20">
          <Image src="/mr-wick.jpg" alt="Mr. Wick Chatbot" fill className="object-cover" />
        </div>
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
          </span>
        )}
      </button>
    </div>
  );
}
