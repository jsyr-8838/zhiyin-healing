import React, { memo } from 'react';
import { getMeridianByCode, type Acupoint, type Meridian } from '@/lib/meridian-data';
import { WUXING_COLORS_DISPLAY, getPointBadges, getBadgeColor, getBadgeLabel } from './constants';

interface AcupointDetailProps {
  point: Acupoint;
  meridian: Meridian;
  onClose: () => void;
  infoPanelOpen: boolean;
  onToggleMeridian: (code: string) => void;
}

export const AcupointDetail = memo(function AcupointDetail({
  point,
  meridian,
  onClose,
  infoPanelOpen,
  onToggleMeridian,
}: AcupointDetailProps) {
  const badges = getPointBadges(point);

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 z-50 w-[380px] max-w-[85vw] bg-black/80 border-l border-white/10
        transform transition-transform duration-300 overflow-y-auto
        ${infoPanelOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:top-12 md:bottom-20 md:rounded-l-2xl md:border md:h-auto
        ${point ? 'md:translate-x-0' : 'md:translate-x-full'}`}
    >
      <div className="p-5">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white text-sm"
        >
          ✕
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: WUXING_COLORS_DISPLAY[meridian.wuxing] }}
            />
            <h3 className="text-2xl font-bold text-white">{point.name}</h3>
            <span className="text-sm text-zinc-400 font-mono">{point.code}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-zinc-300">{meridian.name}</span>
            <span className="text-xs text-zinc-500">·</span>
            <span className="text-xs" style={{ color: WUXING_COLORS_DISPLAY[meridian.wuxing] }}>{meridian.wuxing}行</span>
            <span className="text-xs text-zinc-500">·</span>
            <span className="text-xs text-zinc-400">{meridian.organ}</span>
          </div>
        </div>

        {badges.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            {badges.map(b => (
              <span
                key={b}
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{
                  backgroundColor: getBadgeColor(b),
                  color: '#fff',
                }}
              >
                {getBadgeLabel(b)}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">定位</div>
            <div className="text-sm text-white leading-relaxed">
              {point.location || '暂无定位描述'}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              骨度: X={point.cunX}寸 Y={point.cunY}寸 Z={point.cunZ}寸 · {point.side === 'midline' ? '正中线' : point.side === 'left' ? '左侧' : '右侧'}
            </div>
          </div>

          {point.indications && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">主治</div>
              <div className="flex flex-wrap gap-1.5">
                {point.indications.split(/[，,、]/).filter(Boolean).map((ind, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-xs bg-white/8 text-zinc-200 border border-white/10"
                  >
                    {ind.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {point.method && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">取穴方法</div>
              <p className="text-sm text-emerald-200/90 leading-relaxed">{point.method}</p>
            </div>
          )}

          {point.specialPoint && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">特定穴</div>
              <div className="flex flex-wrap gap-1.5">
                {point.specialPoint.split(/[，,、；;]/).filter(Boolean).map((sp: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-200 border border-amber-500/30 font-medium"
                  >
                    {sp.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {point.intersections.length > 0 && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">交会经脉</div>
              <div className="flex flex-wrap gap-1.5">
                {point.intersections.map(code => {
                  const interM = getMeridianByCode(code);
                  return (
                    <button
                      key={code}
                      onClick={() => {
                        if (interM) onToggleMeridian(code);
                      }}
                      className="px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        borderColor: interM ? WUXING_COLORS_DISPLAY[interM.wuxing] : '#666',
                        color: interM ? WUXING_COLORS_DISPLAY[interM.wuxing] : '#999',
                      }}
                    >
                      {interM?.name || code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {point.classicRef && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">古籍摘录</div>
              <p className="text-sm text-amber-200/80 leading-relaxed italic">{point.classicRef}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
