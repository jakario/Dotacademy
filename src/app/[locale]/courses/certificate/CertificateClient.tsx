'use client';

import { useState } from 'react';
import { Link } from "@/i18n/routing";

export default function CertificateClient() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [isReadyToPrint, setIsReadyToPrint] = useState(false);

  // Get current date formatted in Thai
  const today = new Date();
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiDate = `ให้ไว้ ณ วันที่ ${today.getDate()} ${thaiMonths[today.getMonth()]} พ.ศ. ${today.getFullYear() + 543}`;

  const handlePrint = () => {
    if (!name.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล ของคุณเพื่อออกใบรับรอง');
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 flex flex-col items-center justify-center print:p-0 print:bg-white print:text-black">
      
      {/* CSS print override blocks */}
      <style jsx global>{`
        .print-area {
          background-color: white !important;
          background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTYwIDEwMCI+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM3ODM1MGYiIG9wYWNpdHk9IjAuMDQiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiB0cmFuc2Zvcm09InJvdGF0ZSgtMjUsIDgwLCA1MCkiPkRPVCBBY2FkZW15PC90ZXh0Pjwvc3ZnPg==") !important;
          background-repeat: repeat !important;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            border: 15px double #b45309 !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
          @page {
            size: A4 landscape;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Screen Control Panel (Hidden during printing) */}
      <div className="no-print w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2">
              🎓 ออกใบรับรองการอบรม
            </h1>
            <p className="text-xs text-slate-400 mt-1">กรอกชื่อ นามสกุล และตำแหน่งเพื่อจัดทำใบรับรองความรู้ทั่วไปเกี่ยวกับกรมการท่องเที่ยว</p>
          </div>
          <Link href="/courses" className="text-xs text-slate-400 hover:text-white transition-colors border border-slate-700 rounded-lg px-3 py-1.5 self-start sm:self-auto">
            &larr; กลับหน้าหลักสูตร
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 md:col-span-1">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ชื่อ - นามสกุล</label>
              <input
                type="text"
                placeholder="เช่น สมชาย ใจดี"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ตำแหน่ง</label>
              <input
                type="text"
                placeholder="เช่น มัคคุเทศก์ / นักศึกษา"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <button
              onClick={handlePrint}
              disabled={!name.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
            >
              🖨️ ดาวน์โหลด / พิมพ์ใบรับรอง (PDF)
            </button>
            <p className="text-[10px] text-slate-500 leading-normal">
              * เมื่อเปิดกล่องพิมพ์ ให้เลือกบันทึกเป็น PDF (Save as PDF) และตั้งค่าการพิมพ์เป็น <b>แนวนอน (Landscape)</b> เพื่อจัดเก็บเป็นไฟล์ใบรับรองระดับพรีเมียม
            </p>
          </div>

          {/* Explanation / Live Preview Hint */}
          <div className="md:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center items-center text-center">
            <span className="text-3xl mb-2">👁️</span>
            <h4 className="text-xs font-bold text-slate-300">ตัวอย่างใบรับรองสด (Live Preview)</h4>
            <p className="text-[10px] text-slate-500 mt-1 max-w-sm">ข้อมูลที่คุณพิมพ์ในช่องด้านซ้ายจะถูกสะท้อนลงในแบบใบรับรองด้านล่างแบบเรียลไทม์</p>
          </div>
        </div>
      </div>

      <div className="print-area w-full max-w-[297mm] aspect-[1.414] bg-white text-slate-950 border-[15px] border-double border-amber-800 p-8 sm:p-14 flex flex-col justify-between items-center shadow-2xl relative select-none overflow-hidden">
        
        {/* Decorative Gold Corners (Using pure CSS) */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600 z-10"></div>
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600 z-10"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600 z-10"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600 z-10"></div>

        {/* Top: Department of Tourism Logo & Title */}
        <div className="flex flex-col items-center text-center z-10">
          <img 
            src="/logo-dot.png" 
            className="w-40 h-40 object-contain mb-2 print:mb-2" 
            alt="โลโก้กรมการท่องเที่ยว" 
          />
          <h2 className="text-xs font-bold tracking-widest text-amber-800 uppercase mb-0.5">
            Department of Tourism
          </h2>
          <h1 className="text-2xl font-black tracking-wide text-slate-900">
            กรมการท่องเที่ยว
          </h1>
        </div>

        {/* Center: Certification statement */}
        <div className="flex flex-col items-center text-center my-3 print:my-2 z-10">
          <p className="text-sm text-slate-500 italic mb-2.5 tracking-wide">
            ใบรับรองการผ่านการฝึกอบรมฉบับนี้ออกไว้ให้เพื่อแสดงว่า
          </p>
          <h3 className="text-3xl font-black text-amber-900 border-b-2 border-dashed border-amber-300 pb-2 px-12 min-w-[300px] leading-tight">
            {name.trim() || '[ กรุณากรอกชื่อ - นามสกุล ]'}
          </h3>
          {position.trim() && (
            <p className="text-sm text-slate-600 mt-2.5 font-bold bg-slate-100 px-4 py-1 rounded-full print:bg-transparent">
              ตำแหน่ง: {position}
            </p>
          )}
          <p className="text-base text-slate-800 font-bold max-w-xl mt-5 leading-relaxed">
            ได้เข้าร่วมและผ่านการทดสอบในคอร์สเรียนออนไลน์<br/>
            เรื่อง <span className="text-amber-800 font-black text-lg">ความรู้ทั่วไปเกี่ยวกับกรมการท่องเที่ยว</span>
          </p>
          <p className="text-xs text-slate-500 mt-2.5">
            เป็นผู้ผ่านการอบรมตามกรอบการพัฒนาบุคลากรเบื้องต้น
          </p>
        </div>

        {/* Footer: Date and Signature Placeholder */}
        <div className="w-full flex justify-between items-end px-10 mt-3 print:mt-1 text-xs z-10">
          <div className="text-left flex items-center gap-4">
            <img 
              src="/logo-external.png" 
              className="h-12 w-12 object-contain opacity-95" 
              alt="โลโก้ใส่หนังสือภายนอก" 
            />
            <div className="flex flex-col justify-center">
              <p className="text-slate-700 font-bold text-xs">{thaiDate}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">เลขใบรับรอง: DOT-CERT-{today.getFullYear() + 543}-{Math.floor(1000 + Math.random() * 9000)}</p>
            </div>
          </div>
          
          <div className="text-center flex flex-col items-center">
            {/* Signature styled like Donald Trump's vertical, jagged, compressed handwriting */}
            <div className="w-full flex items-end justify-center text-amber-900 opacity-90 pb-2 pt-8 px-6">
              <span style={{ 
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', 'Impact', cursive", 
                fontSize: "2rem", 
                fontWeight: "900",
                transform: "scaleX(0.6) scaleY(2.2) rotate(-4deg)",
                display: "inline-block",
                transformOrigin: "bottom center",
                whiteSpace: "nowrap",
                letterSpacing: "-0.5px"
              }}>
                Administrator
              </span>
            </div>
            <div className="w-auto px-4 border-t border-slate-400 pt-1.5 font-bold text-slate-900 whitespace-nowrap text-sm">
              ( ผู้ดูแลระบบ DOT Academy )
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ผู้จัดการอบรม</p>
          </div>
        </div>

      </div>

    </div>
  );
}
