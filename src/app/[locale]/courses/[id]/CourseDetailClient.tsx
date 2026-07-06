'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from "@/i18n/routing";
import { useSearchParams } from 'next/navigation';

interface Resource {
  id: string;
  title: string;
  type: string;
  content: string | null;
}

interface Section {
  id: string;
  title: string;
  resources: Resource[];
  quiz: Quiz | null;
}

interface Quiz {
  id: string;
  title: string;
  passScore: number;
}

interface Instructor {
  id: string;
  name: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor: Instructor;
  sections: Section[];
}

interface CourseDetailClientProps {
  course: Course;
}

// Helper to extract YouTube Video ID
function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// YT Iframe Player Wrapper Component
function YouTubePlayer({ videoId, title, onEnded }: { videoId: string; title: string; onEnded: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          // infoDelivery event contains playerState: 0 when video ends
          if (data && data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
            onEnded();
          }
        } catch (e) {
          // Ignore non-JSON messages or parse errors
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onEnded]);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      title={title}
      className="w-full h-[300px] sm:h-[400px]"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  );
}

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const [completedResources, setCompletedResources] = useState<string[]>([]);
  const [passedQuizIds, setPassedQuizIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const searchParams = useSearchParams();

  // Load progress from API on client mount
  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch(`/api/progress?courseId=${course.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.completedIds) setCompletedResources(data.completedIds);
            if (data.passedQuizIds) setPassedQuizIds(data.passedQuizIds);
          }
        }
      } catch (e) {
        console.error("Failed to fetch progress from API:", e);
      } finally {
        setLoaded(true);
      }
    }
    fetchProgress();
  }, [course.id]);

  // Active section logic
  const activeSectionId = searchParams?.get('sectionId') || course.sections[0]?.id;
  const activeSection = course.sections.find(s => s.id === activeSectionId) || course.sections[0];

  // Save progress helper
  const markAsCompleted = async (resourceId: string) => {
    if (completedResources.includes(resourceId)) return;
    const updated = [...completedResources, resourceId];
    setCompletedResources(updated);

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resourceId }),
      });
    } catch (e) {
      console.error("Failed to update progress to API:", e);
    }
  };

  // Find all video resources in course
  const allVideoResources = course.sections.flatMap(s => 
    s.resources.filter(r => r.type === 'VIDEO')
  );

  const totalVideos = allVideoResources.length;
  const completedVideos = allVideoResources.filter(r => completedResources.includes(r.id)).length;

  const allQuizzes = course.sections.map(s => s.quiz).filter(Boolean);
  const totalQuizzes = allQuizzes.length;
  const passedQuizzes = allQuizzes.filter(q => passedQuizIds.includes(q!.id)).length;
  const remainingQuizzes = totalQuizzes - passedQuizzes;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              DOT
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 truncate max-w-[200px] sm:max-w-md">
                {course.title}
              </h1>
            </div>
          </div>
          <Link href="/courses" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
            &larr; กลับหน้ารวม
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar / Menu */}
        <aside className="w-full lg:w-1/3 flex-shrink-0">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden sticky top-24 shadow-xl">
            
            {/* Progress Section */}
            <div className="p-6 bg-slate-800/80 border-b border-slate-700/50">
              <h2 className="text-base font-bold text-slate-200 mb-3">ความคืบหน้าการเรียน</h2>
              
              {totalVideos > 0 ? (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                    <span>ดูวิดีโอประกอบบทเรียน</span>
                    <span className="text-blue-400 font-bold">{completedVideos} / {totalVideos} คลิป</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                      style={{ width: `${totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">หลักสูตรนี้เป็นเนื้อหาประเภทเอกสารอ่าน</p>
              )}
            </div>

            {/* Quiz Progress Section */}
            {totalQuizzes > 0 && (
              <div className="p-6 bg-slate-800/80 border-b border-slate-700/50">
                <h2 className="text-base font-bold text-slate-200 mb-3">ผลการทดสอบ</h2>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                  <span>ทำแบบทดสอบผ่านแล้ว</span>
                  <span className="text-emerald-400 font-bold">{passedQuizzes} / {totalQuizzes} บท</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                  <span>เหลือที่ยังไม่ผ่าน: <span className="text-rose-400 font-semibold">{remainingQuizzes}</span></span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                    style={{ width: `${totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Content list */}
            <div className="p-4 space-y-2.5 max-h-[calc(100vh-320px)] overflow-y-auto">
              {course.sections.map((section, sIdx) => {
                const isActive = activeSection && section.id === activeSection.id;
                
                return (
                  <div key={section.id} className="space-y-1">
                    <Link
                      href={`/courses/${course.id}?sectionId=${section.id}`}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
                          : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
                      }`}
                    >
                      <span className="truncate">ตอนที่ {sIdx + 1}: {section.title}</span>
                      {isActive && <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>}
                    </Link>

                    {isActive && (
                      <ul className="space-y-1 pl-3 mt-1.5 border-l border-slate-700">
                        {section.resources.map((res) => {
                          const isCompleted = completedResources.includes(res.id);
                          const isVideo = res.type === 'VIDEO';
                          
                          return (
                            <li key={res.id}>
                              <a 
                                href={`#resource-${res.id}`} 
                                className="group flex items-center justify-between p-2 rounded-lg text-xs text-slate-400 hover:text-white transition-all"
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <span className="flex-shrink-0">
                                    {isVideo ? (
                                      <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    ) : res.type === 'PDF' ? (
                                      <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="truncate group-hover:translate-x-0.5 transition-transform">{res.title}</span>
                                </div>
                                
                                {loaded && (
                                  <span className="flex-shrink-0">
                                    {isCompleted ? (
                                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[8px] font-bold">✓</span>
                                    ) : isVideo ? (
                                      <span className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-[8px]" title="ยังดูไม่จบ">⏳</span>
                                    ) : (
                                      <button 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          markAsCompleted(res.id);
                                        }}
                                        className="px-1.5 py-0.5 text-[8px] bg-slate-700 hover:bg-blue-600 rounded text-slate-300 hover:text-white transition-colors"
                                      >
                                        อ่านแล้ว
                                      </button>
                                    )}
                                  </span>
                                )}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="w-full lg:w-2/3 space-y-10">
          {activeSection ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-200 border-b border-slate-800 pb-3">
                ตอนที่ {course.sections.indexOf(activeSection) + 1}: {activeSection.title}
              </h2>
              
              {activeSection.resources.map((res) => {
                const isVideo = res.type === 'VIDEO';
                const videoId = isVideo && res.content ? getYouTubeId(res.content) : null;
                const isCompleted = completedResources.includes(res.id);

                return (
                  <div 
                    id={`resource-${res.id}`} 
                    key={res.id} 
                    className="bg-slate-800/30 rounded-2xl border border-slate-700/40 p-6 sm:p-8 scroll-mt-24 shadow-sm hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
                      <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        {isVideo ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        )}
                        {res.title}
                      </h3>
                      
                      {loaded && (
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold flex items-center gap-1">
                              <span>✓</span> เรียนรู้แล้ว
                            </span>
                          ) : isVideo ? (
                            <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 font-semibold">
                              🎬 กรุณารับชมจนจบ
                            </span>
                          ) : (
                            <button
                              onClick={() => markAsCompleted(res.id)}
                              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm"
                            >
                              ทำเครื่องหมายว่าอ่านแล้ว
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {res.type === 'TEXT' && (
                      <div className="prose prose-invert prose-slate max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                        {res.content}
                      </div>
                    )}

                    {res.type === 'PDF' && res.content && (
                      <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
                            PDF
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200">{res.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">เอกสารประกอบการเรียนรู้ (คลิกปุ่มเพื่อเปิดอ่านหรือดาวน์โหลด)</p>
                          </div>
                        </div>
                        <a
                          href={res.content}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => markAsCompleted(res.id)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs text-center transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/10"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          ดาวน์โหลดเอกสาร PDF
                        </a>
                      </div>
                    )}
                    
                    {isVideo && res.content && (
                      <div className="aspect-w-16 aspect-h-9 w-full bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                        {videoId ? (
                          <YouTubePlayer 
                            videoId={videoId} 
                            title={res.title} 
                            onEnded={() => markAsCompleted(res.id)} 
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
                            <p className="text-sm text-slate-400 mb-4">ไม่พบลิงก์วิดีโอในระบบหรือฟอร์แมตไม่ถูกต้อง</p>
                            <a 
                              href={res.content} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={() => markAsCompleted(res.id)}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                            >
                              เปิดดูจากภายนอก
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Section Quiz at the bottom of section content */}
              {activeSection.quiz && loaded && (
                <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-6 text-center space-y-3 mt-6">
                  <h4 className="font-bold text-slate-300">เรียนรู้เนื้อหาของบทนี้ครบถ้วนแล้ว?</h4>
                  <p className="text-xs text-slate-400">กรุณาทำแบบทดสอบท้ายบทเพื่อประเมินผลสัมฤทธิ์ของบทเรียนนี้</p>
                  
                  {(() => {
                    const sectionVideos = activeSection.resources.filter(r => r.type === 'VIDEO');
                    const isSectionQuizUnlocked = sectionVideos.every(v => completedResources.includes(v.id));
                    const isQuizPassed = activeSection.quiz && passedQuizIds.includes(activeSection.quiz.id);

                    return isSectionQuizUnlocked ? (
                      <div className="inline-flex flex-col items-center gap-3">
                        {isQuizPassed && (
                          <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            คุณสอบผ่านบทนี้แล้ว!
                          </span>
                        )}
                        <Link
                          href={`/courses/${course.id}/quiz?sectionId=${activeSection.id}`}
                          className={`inline-block py-2.5 px-6 font-bold rounded-xl text-sm transition-all shadow-lg hover:-translate-y-0.5 ${isQuizPassed ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/50' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/10'}`}
                        >
                          {isQuizPassed ? 'ทำแบบทดสอบอีกครั้ง' : `ทำแบบทดสอบ: ${activeSection.quiz.title}`}
                        </Link>
                      </div>
                    ) : (
                      <div className="inline-flex flex-col items-center gap-2">
                        <span className="py-2 px-5 bg-slate-800 border border-slate-700 text-slate-500 font-bold rounded-xl text-xs cursor-not-allowed">
                          🔒 แบบทดสอบท้ายบท (ล็อกอยู่ - กรุณาชมวิดีโอให้จบก่อน)
                        </span>
                        <button
                          onClick={async () => {
                            const sectionVideoIds = sectionVideos.map(v => v.id);
                            const updated = Array.from(new Set([...completedResources, ...sectionVideoIds]));
                            setCompletedResources(updated);
                            // Call api to save progress for each video
                            for (const vid of sectionVideoIds) {
                              try {
                                await fetch('/api/progress', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ resourceId: vid }),
                                });
                              } catch (e) {
                                console.error("Failed to unlock via progress API:", e);
                              }
                            }
                          }}
                          className="text-[10px] text-amber-500 hover:underline transition-all"
                        >
                          ⚡ กดปลดล็อกเฉพาะบทนี้เพื่อทดสอบทำข้อสอบทันที
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/30 rounded-2xl border border-slate-700/40 p-8 text-center">
              <p className="text-slate-400 text-sm">ไม่พบหัวข้อการเรียนรู้นี้</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
