import Link from 'next/link';
import { ArrowLeft, RefreshCw, Calendar } from 'lucide-react';
import type { Step } from './types';

interface DivinationHeaderProps {
  step: Step;
  onGoHome: () => void;
  todayGanZhi: {
    yearGanZhi: string;
    monthGanZhi: string;
    dayGanZhi: string;
    hourGanZhi: string;
  } | null;
}

export function DivinationHeader({ step, onGoHome, todayGanZhi }: DivinationHeaderProps) {
  return (
    <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(150deg, rgba(74,88,128,0.88), rgba(94,66,148,0.90))', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center gap-3 mb-3">
        <Link href="/dashboard" className="text-white/70 hover:text-white"><ArrowLeft size={22} /></Link>
        <h1 className="text-xl font-black text-white" style={{ letterSpacing: '0.08em' }}>知几</h1>
        {step !== 'home' && (
          <button onClick={onGoHome} className="ml-auto text-sm text-white/70 hover:text-white flex items-center gap-1">
            <RefreshCw size={14} /> 重新选择
          </button>
        )}
      </div>
      {todayGanZhi && (
        <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-purple-300" />
            <span className="text-purple-200">今日</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-white/15 px-2 py-0.5 rounded">年{todayGanZhi.yearGanZhi}</span>
            <span className="bg-white/15 px-2 py-0.5 rounded">月{todayGanZhi.monthGanZhi}</span>
            <span className="bg-white/15 px-2 py-0.5 rounded font-bold">日{todayGanZhi.dayGanZhi}</span>
            <span className="bg-white/15 px-2 py-0.5 rounded">时{todayGanZhi.hourGanZhi}</span>
          </div>
        </div>
      )}
    </div>
  );
}
