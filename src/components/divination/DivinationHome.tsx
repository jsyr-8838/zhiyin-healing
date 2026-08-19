import Link from 'next/link';
import { User } from 'lucide-react';
import { DIVINATION_METHODS_V2, type DivinationMethod } from '@/lib/taibu-adapter';
import { METHOD_ICONS, difficultyLabel } from './types';

interface DivinationHomeProps {
  destinee: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthHour: number;
    isLunar: boolean;
  } | null;
  onSelectMethod: (method: DivinationMethod) => void;
  onOpenProfileEditor: () => void;
}

export function DivinationHome({ destinee, onSelectMethod, onOpenProfileEditor }: DivinationHomeProps) {
  return (
    <div>
      {destinee ? (
        <button
          onClick={onOpenProfileEditor}
          className="w-full bg-white rounded-xl p-4 border border-purple-100 mb-4 hover:shadow-md transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {destinee.name ? destinee.name[0] : '命'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 truncate">{destinee.name || '未命名'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-500">
                  {destinee.gender === 'male' ? '男' : '女'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {destinee.birthDate || '未填生日'} {destinee.birthHour !== undefined && destinee.birthDate ? `· ${destinee.birthHour}时` : ''}
                {destinee.isLunar ? ' · 农历' : ''}
              </p>
            </div>
            <span className="text-[10px] text-purple-400 flex-shrink-0">修改</span>
          </div>
        </button>
      ) : (
        <button
          onClick={onOpenProfileEditor}
          className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-dashed border-purple-200 mb-4 hover:border-purple-400 transition text-center"
        >
          <User size={20} className="mx-auto text-purple-400 mb-1.5" />
          <p className="text-sm font-bold text-purple-700">填写命主档案</p>
          <p className="text-xs text-purple-400 mt-0.5">姓名+生辰八字，知几更精准</p>
        </button>
      )}

      <h3 className="font-bold mb-3" style={{ color: 'rgba(40,36,58,0.85)' }}>选择术数</h3>
      <div className="space-y-2.5">
        {DIVINATION_METHODS_V2.map(m => {
          const diff = difficultyLabel(m.difficulty);
          return (
            <button
              key={m.id}
              onClick={() => onSelectMethod(m.id)}
              className="w-full bg-white rounded-xl p-4 border border-gray-100 hover:border-purple-200 hover:shadow-md transition flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                {METHOD_ICONS[m.id]}
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900">{m.name}</h4>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${diff.cls}`}>{diff.text}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-500">{m.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <h3 className="font-bold mt-6 mb-3" style={{ color: 'rgba(40,36,58,0.85)' }}>堪舆</h3>
      <Link
        href="/divination/fengshui"
        className="w-full bg-white rounded-xl p-4 border border-gray-100 hover:border-amber-200 hover:shadow-md transition flex items-center gap-4 block"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg flex-shrink-0">
          🧭
        </div>
        <div className="text-left flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">风水堪舆</h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">堪舆</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">宅命配·游年九星·玄空飞星·趋吉避凶</p>
        </div>
      </Link>
    </div>
  );
}
