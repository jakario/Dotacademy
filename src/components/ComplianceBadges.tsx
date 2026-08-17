// Compliance Badges Component — แสดงผลมาตรฐานที่ผ่านการตรวจสอบ
// แสดงที่ด้านล่างของหน้าหลัก (Footer area)

interface BadgeProps {
  logo: string;
  title: string;
  level: string;
  score: string;
  color: string; // Tailwind border/text color class
  description: string;
}

const BADGES: BadgeProps[] = [
  {
    logo: '♿',
    title: 'WCAG 2.1',
    level: 'Level AA',
    score: '82/100',
    color: 'blue',
    description: 'Web Content Accessibility\nGuidelines — การเข้าถึงสำหรับทุกคน',
  },
  {
    logo: '🛡️',
    title: 'OWASP',
    level: 'Top 10 Compliant',
    score: '9/10',
    color: 'emerald',
    description: 'Open Web Application\nSecurity Project — ความปลอดภัยเว็บ',
  },
  {
    logo: '🇹🇭',
    title: 'สกมช.',
    level: 'พ.ศ. 2568',
    score: '80/100',
    color: 'amber',
    description: 'มาตรฐานการรักษาความมั่นคง\nปลอดภัยสำหรับเว็บไซต์ภาครัฐ',
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; badge: string; dot: string }> = {
  blue: {
    border: 'border-blue-200 hover:border-blue-400',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
  },
  emerald: {
    border: 'border-emerald-200 hover:border-emerald-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
  },
  amber: {
    border: 'border-amber-200 hover:border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
};

export function ComplianceBadges() {
  return (
    <section className="w-full mt-8 pt-8 border-t border-gray-200" aria-label="มาตรฐานที่ผ่านการตรวจสอบ">
      <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
        มาตรฐานที่ผ่านการตรวจสอบ
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {BADGES.map((badge) => {
          const c = colorMap[badge.color];
          return (
            <div
              key={badge.title}
              className={`group relative rounded-2xl border-2 ${c.border} ${c.bg} p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              {/* Verified dot */}
              <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${c.dot}`} title="ผ่านการตรวจสอบ" />

              <div className="text-3xl mb-2">{badge.logo}</div>
              <h3 className={`font-black text-base ${c.text}`}>{badge.title}</h3>
              <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${c.badge}`}>
                {badge.level}
              </span>
              <p className="text-gray-500 text-[10px] mt-2 whitespace-pre-line leading-relaxed">
                {badge.description}
              </p>
              <p className={`text-xs font-bold mt-2 ${c.text}`}>คะแนน: {badge.score}</p>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[10px] text-gray-400 mt-4">
        ตรวจสอบ ณ สิงหาคม 2568 — Code Audit โดย AI • ควรตรวจสอบซ้ำโดยผู้เชี่ยวชาญ
      </p>
    </section>
  );
}
