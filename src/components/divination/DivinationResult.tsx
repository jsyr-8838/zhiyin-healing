import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { DivineResult } from '@/lib/taibu-adapter';
import { ResultPanel } from './ResultPanel';

interface DivinationResultProps {
  divineResult: DivineResult | null;
  aiContent: string;
  recordId: string;
  onFeedback: (feedback: number) => void;
  onReset: () => void;
}

function formatContent(content: string) {
  const sections = content.split(/(?=\【)/);
  return sections.filter(Boolean).map((section, i) => {
    const match = section.match(/^【(.+?)】([\s\S]*)/);
    if (match) {
      return (
        <div key={i} className="mb-4">
          <h4 className="font-bold text-purple-700 mb-1.5 text-base">【{match[1]}】</h4>
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{match[2].trim()}</p>
        </div>
      );
    }
    return <p key={i} className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-2">{section}</p>;
  });
}

export function DivinationResult({ divineResult, aiContent, recordId, onFeedback, onReset }: DivinationResultProps) {
  if (!divineResult) return null;

  return (
    <div className="space-y-4">
      <ResultPanel divineResult={divineResult} />

      {divineResult.text && divineResult.method !== 'meihua' && divineResult.method !== 'zhouyi' && (
        <details className="bg-white rounded-xl border border-gray-200">
          <summary className="p-4 font-bold text-gray-700 cursor-pointer text-sm">排盘详情（点击展开）</summary>
          <pre className="px-4 pb-4 text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-96">{divineResult.text}</pre>
        </details>
      )}

      {aiContent && (
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" /> AI解读
          </h3>
          <div>{formatContent(aiContent)}</div>
        </div>
      )}

      {recordId && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-700 mb-3">这次知几准吗？你的反馈帮助AI更精准</p>
          <div className="flex gap-3">
            <button onClick={() => onFeedback(1)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition">
              <ThumbsUp size={16} /> 准
            </button>
            <button onClick={() => onFeedback(-1)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition">
              <ThumbsDown size={16} /> 不准
            </button>
          </div>
        </div>
      )}

      <button onClick={onReset}
        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition active:scale-[0.98]">
        再起一卦
      </button>
    </div>
  );
}
