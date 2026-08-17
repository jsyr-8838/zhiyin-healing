import { User } from 'lucide-react';
import { DIVINATION_METHODS_V2, type DivinationMethod } from '@/lib/taibu-adapter';
import { METHOD_ICONS, NEEDS_BIRTH_DATE, NEEDS_NUMBER } from './types';

interface DivinationSetupProps {
  selectedMethod: DivinationMethod;
  destinee: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthHour: number;
  } | null;
  question: string;
  inputNumber: string;
  birthDate: string;
  birthHour: string;
  gender: 'male' | 'female';
  isLoading: boolean;
  setQuestion: (v: string) => void;
  setInputNumber: (v: string) => void;
  setBirthDate: (v: string) => void;
  setBirthHour: (v: string) => void;
  setGender: (v: 'male' | 'female') => void;
  onDivine: () => void;
  onOpenProfileEditor: () => void;
}

export function DivinationSetup({
  selectedMethod, destinee, question, inputNumber, birthDate, birthHour,
  gender, isLoading, setQuestion, setInputNumber, setBirthDate, setBirthHour,
  setGender, onDivine, onOpenProfileEditor,
}: DivinationSetupProps) {
  const methodInfo = DIVINATION_METHODS_V2.find(m => m.id === selectedMethod)!;

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <h4 className="font-bold text-purple-800 mb-1">{METHOD_ICONS[selectedMethod]} {methodInfo.name}</h4>
        <p className="text-sm text-purple-600">{methodInfo.desc}</p>
        <p className="text-xs text-purple-400 mt-1">出处：{methodInfo.origin}</p>
      </div>

      {destinee && (
        <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {destinee.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-indigo-700 font-bold truncate">为 {destinee.name} 起卦</p>
            <p className="text-[10px] text-indigo-400">{destinee.birthDate} · {destinee.gender === 'male' ? '男' : '女'}</p>
          </div>
          <button onClick={onOpenProfileEditor} className="text-xs text-indigo-500 hover:text-indigo-700 flex-shrink-0">修改</button>
        </div>
      )}
      {!destinee && (
        <button onClick={onOpenProfileEditor}
          className="w-full bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-center gap-3 hover:bg-amber-100 transition">
          <User size={16} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-xs text-amber-700 font-bold">建议先填写命主档案</p>
            <p className="text-[10px] text-amber-500">有生辰信息解读更精准</p>
          </div>
          <span className="text-[10px] text-amber-400">去填写</span>
        </button>
      )}

      {NEEDS_NUMBER.includes(selectedMethod) && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <label className="text-sm text-gray-700 mb-2 block font-bold">输入起卦数字（1-99）</label>
          <input
            type="number" min={1} max={99}
            value={inputNumber}
            onChange={e => setInputNumber(e.target.value)}
            placeholder="留空则随机起卦"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none"
          />
        </div>
      )}

      {NEEDS_BIRTH_DATE.includes(selectedMethod) && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-bold">出生日期（公历）</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-bold">出生时辰（0-23时）</label>
            <input type="number" min={0} max={23} value={birthHour} onChange={e => setBirthHour(e.target.value)}
              placeholder="如：8"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-bold">性别</label>
            <div className="flex gap-2">
              {[{ v: 'male' as const, l: '男' }, { v: 'female' as const, l: '女' }].map(g => (
                <button key={g.v} onClick={() => setGender(g.v)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${gender === g.v ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {g.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <label className="text-sm text-gray-700 mb-2 block font-bold">心中所问</label>
        <textarea
          value={question} onChange={e => setQuestion(e.target.value)}
          placeholder={selectedMethod === 'bazi' || selectedMethod === 'ziwei'
            ? '输入你想了解的方面（如事业、姻缘、健康...）'
            : selectedMethod === 'tarot'
            ? '心中默念问题，塔罗牌会给予指引...'
            : '描述你想知几的问题'}
          rows={3} maxLength={500}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
        />
        <div className="text-right text-xs text-gray-400 mt-1">{question.length}/500</div>
      </div>

      <button
        onClick={onDivine}
        disabled={isLoading || !question.trim()}
        className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition"
      >
        {isLoading ? '☯️ 起卦排盘中...' : `⚡ ${methodInfo.name}·起卦`}
      </button>
    </div>
  );
}
