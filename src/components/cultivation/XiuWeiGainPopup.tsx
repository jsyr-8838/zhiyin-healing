'use client';

import { useEffect, useState } from 'react';
import { ELEMENT_COLORS, ELEMENT_NAMES, type WuxingElement } from '@/lib/cultivation-engine';

interface XiuWeiGainPopupProps {
  element: WuxingElement;
  gain: number;
  source?: string; // 来源描述
  onComplete?: () => void;
}

/**
 * 修为获得弹窗 — 各模块完成时统一使用
 * 显示：+N 修为，对应五行元素，自动 2 秒后消失
 */
export default function XiuWeiGainPopup({ element, gain, source, onComplete }: XiuWeiGainPopupProps) {
  const [visible, setVisible] = useState(true);
  const color = ELEMENT_COLORS[element];
  const name = ELEMENT_NAMES[element];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-float-up text-center" style={{
        animation: 'floatUp 2.5s ease-out forwards',
      }}>
        {/* 修为获得 */}
        <div className="inline-flex flex-col items-center px-6 py-4 rounded-2xl" style={{
          background: `linear-gradient(145deg, rgba(255,255,255,0.95), rgba(250,245,238,0.95))`,
          boxShadow: `0 8px 32px ${color}30, 0 0 0 1px ${color}15`,
        }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2" style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            boxShadow: `0 4px 16px ${color}40`,
          }}>
            <span className="text-xl font-black">+{gain}</span>
          </div>
          <p className="font-black text-base" style={{ color }}>{name}行修为</p>
          {source && (
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-light)', opacity: 0.7 }}>{source}</p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(20px); }
          15% { opacity: 1; transform: translateY(0); }
          70% { opacity: 1; transform: translateY(-10px); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
      `}</style>
    </div>
  );
}

/**
 * 修为获得弹窗触发 Hook
 * 在各模块完成时调用
 */
export function useXiuWeiGain() {
  const [popupState, setPopupState] = useState<{
    element: WuxingElement;
    gain: number;
    source: string;
  } | null>(null);

  const showXiuWeiGain = (element: WuxingElement, gain: number, source: string) => {
    setPopupState({ element, gain, source });
  };

  const XiuWeiGainPopupRender = popupState ? (
    <XiuWeiGainPopup
      element={popupState.element}
      gain={popupState.gain}
      source={popupState.source}
      onComplete={() => setPopupState(null)}
    />
  ) : null;

  return { showXiuWeiGain, XiuWeiGainPopupRender };
}
