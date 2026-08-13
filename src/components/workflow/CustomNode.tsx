import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function CustomNode({ data }: { data: any }) {
  // Extract data with defaults
  const { 
    label, 
    icon = '📄', 
    department = 'ทั่วไป', 
    sla, 
    isHandoff = false,
    color = 'blue'
  } = data;

  // Determine colors based on department/color prop
  let bgClass = 'bg-white';
  let borderClass = 'border-slate-200';
  let textClass = 'text-slate-800';
  let badgeClass = 'bg-slate-100 text-slate-600';

  if (color === 'green' || department === 'ผู้ประกอบการ') {
    borderClass = 'border-green-300';
    badgeClass = 'bg-green-100 text-green-700';
  } else if (color === 'blue' || department.includes('กองทะเบียน')) {
    borderClass = 'border-blue-300';
    badgeClass = 'bg-blue-100 text-blue-700';
  } else if (color === 'amber' || isHandoff) {
    borderClass = 'border-amber-400';
    bgClass = 'bg-amber-50';
    badgeClass = 'bg-amber-100 text-amber-800';
  }

  return (
    <div className={`px-4 py-3 shadow-md rounded-xl border-2 ${borderClass} ${bgClass} min-w-[250px] relative`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-slate-400" />
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {department}
          </span>
          {isHandoff && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse">
              Hand-off 🔄
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          <div className="text-2xl">{icon}</div>
          <div className={`text-sm font-bold ${textClass} leading-tight`}>
            {label}
          </div>
        </div>

        {sla && (
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1">
            ⏱️ <span className="font-medium">SLA:</span> {sla}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-slate-400" />
    </div>
  );
}
