'use client';

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import {
  VERTEBRA_PARAMS,
  REGION_COLORS,
  WUXING_COLORS,
  spineSolarData,
  type SpineSolarEntry,
  type VertebraType,
} from '@/lib/spine-solar-data';

/**
 * SpineViewer — 交互式脊柱SVG可视化
 *
 * - 25块椎骨按 Gray's Anatomy 参数绘制，Y轴翻转：颈椎在顶部（与人体方向一致）
 * - 自由缩放：滚轮 / 双指捏合 / 按钮，支持拖拽平移、复位全景
 * - 联动反馈：选中节气后自动聚焦放大对应椎体，五行变色 + 光晕脉冲 + 周边压暗
 * - 点击椎骨反查对应节气（双向联动）
 */

interface SpineViewerProps {
  selectedSolarTerm?: string;
  selectedEntry: SpineSolarEntry | null;
  onBoneClick?: (entry: { solarTerm: string } | null) => void;
}

/* ── 布局常量 ── */
const SCALE = 0.42;
const SVG_WIDTH = 220;
const PADDING = 26;
const CX = SVG_WIDTH / 2;
const MIN_W = SVG_WIDTH / 6;      // 最大放大 6x
const MAX_W = SVG_WIDTH * 1.15;   // 允许略缩至全景之外
const ZOOM_FOCUS = 2.1;           // 节气联动聚焦倍率
const BOUND_MARGIN = 44;
const PAN_DRAG_THRESHOLD = 6;     // 超过此屏幕位移视为拖拽（抑制误点击）

interface View { x: number; y: number; w: number; h: number }

interface VertebraLayout {
  key: string;
  type: VertebraType;
  code: string;
  name: string;
  top: number;
  cy: number;
  bottom: number;
  bodyW: number;
  bodyH: number;
  transverseW: number;
  spinousL: number;
}

interface RegionBand {
  type: VertebraType;
  label: string;
  yTop: number;
  yBot: number;
  yMid: number;
}

const REGION_LABELS: Record<VertebraType, string> = {
  cervical: '颈椎',
  thoracic: '胸椎',
  lumbar: '腰椎',
  sacrum: '骶椎',
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function SpineViewer3D({ selectedEntry, onBoneClick }: SpineViewerProps) {
  /* ── 布局计算（Y轴翻转：颈椎在上） ── */
  const { vertebraList, layoutMap, svgHeight, regionBands } = useMemo(() => {
    const raw = Object.entries(VERTEBRA_PARAMS).map(([key, p]) => ({ key, ...p }));
    const maxBottom = Math.max(...raw.map(r => r.y + r.bodyH));

    // 翻转：解剖学 y 越大越靠上（颈椎），渲染时换算为 SVG 顶部坐标
    const list: VertebraLayout[] = raw.map(r => {
      const bodyW = r.bodyW * SCALE;
      const bodyH = r.bodyH * SCALE;
      const top = PADDING + (maxBottom - (r.y + r.bodyH)) * SCALE;
      return {
        key: r.key,
        type: r.type,
        code: r.code,
        name: r.name,
        top,
        cy: top + bodyH / 2,
        bottom: top + bodyH,
        bodyW,
        bodyH,
        transverseW: r.transverseW * SCALE,
        spinousL: r.spinous * SCALE,
      };
    }).sort((a, b) => a.top - b.top); // 顶部（颈椎）在前

    const map: Record<string, VertebraLayout> = {};
    list.forEach(v => { map[v.key] = v; });

    const h = maxBottom * SCALE + PADDING * 2;

    const bands: RegionBand[] = (['cervical', 'thoracic', 'lumbar', 'sacrum'] as VertebraType[])
      .map(t => {
        const vs = list.filter(v => v.type === t);
        if (!vs.length) return null;
        const yTop = Math.min(...vs.map(v => v.top));
        const yBot = Math.max(...vs.map(v => v.bottom));
        return { type: t, label: REGION_LABELS[t], yTop, yBot, yMid: (yTop + yBot) / 2 };
      })
      .filter((b): b is RegionBand => b !== null);

    return { vertebraList: list, layoutMap: map, svgHeight: h, regionBands: bands };
  }, []);

  const ASPECT = svgHeight / SVG_WIDTH;

  /* ── 椎骨 key → 节气 反查表 ── */
  const keyToTerm = useMemo(() => {
    const map: Record<string, string> = {};
    for (const entry of spineSolarData) {
      for (const rawPart of entry.vertebraCode.split('+')) {
        const part = rawPart.trim();
        const key = part === 'S' ? 'sacrum' : part;
        if (VERTEBRA_PARAMS[key] && !map[key]) map[key] = entry.solarTerm;
      }
    }
    return map;
  }, []);

  /* ── 选中状态 ── */
  const selectedKeys = useMemo(() => {
    if (!selectedEntry) return new Set<string>();
    const parts = selectedEntry.vertebraCode.split('+').map(s => s.trim());
    return new Set(parts.map(p => (p === 'S' ? 'sacrum' : p)));
  }, [selectedEntry]);

  const selectedVerts = useMemo(
    () => vertebraList.filter(v => selectedKeys.has(v.key)),
    [vertebraList, selectedKeys]
  );

  const wuxingColor = selectedEntry ? WUXING_COLORS[selectedEntry.wuxing] : '#c9a94f';

  const glowId = useMemo(() => {
    if (!selectedEntry) return '';
    const idx = Object.keys(WUXING_COLORS).indexOf(selectedEntry.wuxing);
    return idx >= 0 ? `spine-glow-${idx}` : '';
  }, [selectedEntry]);

  /* ── 视图（viewBox）状态与动画 ── */
  const [view, setView] = useState<View>(() => ({ x: 0, y: 0, w: SVG_WIDTH, h: svgHeight }));
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);

  const animRef = useRef(0);

  const clampView = useCallback((v: View): View => {
    const w = clamp(v.w, MIN_W, MAX_W);
    const h = w * ASPECT;
    const x = clamp(v.x, -BOUND_MARGIN, SVG_WIDTH + BOUND_MARGIN - w);
    const y = clamp(v.y, -BOUND_MARGIN, svgHeight + BOUND_MARGIN - h);
    return { x, y, w, h };
  }, [ASPECT, svgHeight]);

  const fitView = useCallback((): View => ({ x: 0, y: 0, w: SVG_WIDTH, h: svgHeight }), [svgHeight]);

  const animateTo = useCallback((target: View, dur = 380) => {
    cancelAnimationFrame(animRef.current);
    const start = { ...viewRef.current };
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setView({
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
        w: start.w + (target.w - start.w) * e,
        h: start.h + (target.h - start.h) * e,
      });
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  /* ── 缩放核心：围绕指定点缩放 ── */
  const zoomAt = useCallback((v: View, p: { x: number; y: number }, factor: number): View => {
    const nw = clamp(v.w / factor, MIN_W, MAX_W);
    const nh = nw * ASPECT;
    const x = p.x - (p.x - v.x) * (nw / v.w);
    const y = p.y - (p.y - v.y) * (nh / v.h);
    return clampView({ x, y, w: nw, h: nh });
  }, [ASPECT, clampView]);

  /* ── DOM 引用 ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  /** 屏幕坐标 → SVG 用户坐标（自动处理 letterboxing） */
  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const r = pt.matrixTransform(ctm.inverse());
    return { x: r.x, y: r.y };
  }, []);

  /* ── 滚轮缩放（原生监听以便 preventDefault） ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = svgPoint(e.clientX, e.clientY);
      const factor = Math.exp(-e.deltaY * 0.0018);
      setView(v => zoomAt(v, p, factor));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [svgPoint, zoomAt]);

  /* ── 指针：单指拖拽平移 / 双指捏合缩放 ── */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const lastScreenRef = useRef<{ x: number; y: number } | null>(null);
  const downScreenRef = useRef<{ x: number; y: number } | null>(null);
  const pinchDistRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) {
      lastScreenRef.current = { x: e.clientX, y: e.clientY };
      downScreenRef.current = { x: e.clientX, y: e.clientY };
      dragMovedRef.current = false;
      setIsPanning(true);
    } else if (pointersRef.current.size >= 2) {
      dragMovedRef.current = true; // 双指一律视为手势，抑制后续 click
      lastScreenRef.current = null;
      const pts = [...pointersRef.current.values()];
      pinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1 && lastScreenRef.current) {
      const prev = lastScreenRef.current;
      if (
        downScreenRef.current &&
        Math.hypot(e.clientX - downScreenRef.current.x, e.clientY - downScreenRef.current.y) > PAN_DRAG_THRESHOLD
      ) {
        dragMovedRef.current = true;
      }
      const p0 = svgPoint(prev.x, prev.y);
      const p1 = svgPoint(e.clientX, e.clientY);
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      if (dx !== 0 || dy !== 0) {
        setView(v => clampView({ ...v, x: v.x - dx, y: v.y - dy }));
      }
      lastScreenRef.current = { x: e.clientX, y: e.clientY };
    } else if (pointersRef.current.size >= 2) {
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinchDistRef.current && dist > 1 && pinchDistRef.current > 1) {
        const factor = dist / pinchDistRef.current;
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        const p = svgPoint(midX, midY);
        setView(v => zoomAt(v, p, factor));
      }
      pinchDistRef.current = dist;
    }
  }, [svgPoint, zoomAt, clampView]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchDistRef.current = null;
    if (pointersRef.current.size === 1) {
      const [rest] = [...pointersRef.current.values()];
      lastScreenRef.current = { x: rest.x, y: rest.y };
    } else if (pointersRef.current.size === 0) {
      lastScreenRef.current = null;
      downScreenRef.current = null;
      setIsPanning(false);
      // 延迟复位，让随后的 click 事件读取到"已拖拽"标记
      setTimeout(() => { dragMovedRef.current = false; }, 80);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  /* ── 节气联动：自动聚焦对应椎体（首屏保持全景） ── */
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true; // 首次进入展示全景 + 高亮，不自动放大
      return;
    }
    if (!selectedEntry) return;
    const keys = selectedEntry.vertebraCode
      .split('+')
      .map(s => s.trim())
      .map(p => (p === 'S' ? 'sacrum' : p));
    const primary = layoutMap[keys[0]];
    if (!primary) return;
    const w = SVG_WIDTH / ZOOM_FOCUS;
    const h = w * ASPECT;
    animateTo(clampView({ x: CX - w / 2, y: primary.cy - h / 2, w, h }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntry?.vertebraCode]);

  /* ── 控制按钮 ── */
  const zoomBy = useCallback((factor: number) => {
    const v = viewRef.current;
    const c = { x: v.x + v.w / 2, y: v.y + v.h / 2 };
    setView(zoomAt(v, c, factor));
  }, [zoomAt]);

  const resetView = useCallback(() => {
    animateTo(fitView());
  }, [animateTo, fitView]);

  /* ── 点击椎骨 → 反查节气 ── */
  const handleVertebraClick = useCallback((key: string) => {
    if (dragMovedRef.current) return; // 拖拽结束不触发选择
    const term = keyToTerm[key];
    if (term && term !== selectedEntry?.solarTerm) {
      onBoneClick?.({ solarTerm: term });
    }
  }, [keyToTerm, onBoneClick, selectedEntry]);

  const zoomPercent = Math.round((SVG_WIDTH / view.w) * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] bg-[#faf5ee] rounded-xl overflow-hidden select-none"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
    >
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        aria-label="脊柱椎体交互图（颈椎在上，可缩放）"
      >
        <defs>
          {Object.entries(WUXING_COLORS).map(([wx, color], i) => (
            <radialGradient id={`spine-glow-${i}`} key={wx}>
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="55%" stopColor={color} stopOpacity={0.14} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>

        {/* 中线 */}
        <line
          x1={CX} y1={PADDING - 16}
          x2={CX} y2={svgHeight - PADDING + 16}
          stroke="#d4c5a9" strokeWidth={0.5} strokeDasharray="2 3"
        />

        {/* 人体方位提示：头部在上 / 骨盆在下 */}
        <g opacity={0.45}>
          <ellipse cx={CX} cy={PADDING - 13} rx={15} ry={9} fill="none" stroke="#8b7b6b" strokeWidth={0.8} />
          <text x={CX + 21} y={PADDING - 10} fontSize={7} fill="#8b7b6b">头部 · 上</text>
          <ellipse cx={CX} cy={svgHeight - PADDING + 12} rx={24} ry={8} fill="none" stroke="#8b7b6b" strokeWidth={0.8} />
          <text x={CX + 29} y={svgHeight - PADDING + 14} fontSize={7} fill="#8b7b6b">骨盆 · 下</text>
        </g>

        {/* 区域背景带 + 右侧区域标签（颈椎→骶椎 自上而下） */}
        {regionBands.map(b => {
          const color = REGION_COLORS[b.type];
          return (
            <g key={`band-${b.type}`}>
              <rect
                x={CX - 54} y={b.yTop - 5}
                width={108} height={b.yBot - b.yTop + 10}
                rx={10} fill={color} opacity={0.055}
              />
              <text
                x={SVG_WIDTH - 4} y={b.yMid + 2.5}
                fontSize={7} fill={color} fontWeight={600}
                textAnchor="end" opacity={0.85}
              >
                {b.label}
              </text>
            </g>
          );
        })}

        {/* 椎骨序列（颈椎在上） */}
        {vertebraList.map(v => {
          const isSelected = selectedKeys.has(v.key);
          const color = REGION_COLORS[v.type] || '#8b7b6b';
          const dim = !!selectedEntry && !isSelected;
          return (
            <g
              key={v.key}
              onClick={() => handleVertebraClick(v.key)}
              style={{
                cursor: 'pointer',
                opacity: dim ? 0.42 : 1,
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                transition: 'opacity 240ms ease-out, transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* 横突（左右） */}
              {v.transverseW > 0 && (
                <>
                  <line
                    x1={CX - v.bodyW / 2} y1={v.cy + v.bodyH / 2}
                    x2={CX - v.bodyW / 2 - v.transverseW} y2={v.cy + v.bodyH / 2 + 1}
                    stroke={isSelected ? wuxingColor : color}
                    strokeWidth={1.5}
                    opacity={isSelected ? 0.85 : 0.4}
                    strokeLinecap="round"
                  />
                  <line
                    x1={CX + v.bodyW / 2} y1={v.cy + v.bodyH / 2}
                    x2={CX + v.bodyW / 2 + v.transverseW} y2={v.cy + v.bodyH / 2 + 1}
                    stroke={isSelected ? wuxingColor : color}
                    strokeWidth={1.5}
                    opacity={isSelected ? 0.85 : 0.4}
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* 椎体 */}
              <rect
                x={CX - v.bodyW / 2}
                y={v.top}
                width={v.bodyW}
                height={v.bodyH}
                rx={Math.min(2, v.bodyH / 3)}
                fill={isSelected ? wuxingColor : color}
                fillOpacity={isSelected ? 0.55 : 0.14}
                stroke={isSelected ? wuxingColor : color}
                strokeWidth={isSelected ? 1.6 : 0.8}
              />

              {/* 棘突 */}
              {v.spinousL > 0 && (
                <line
                  x1={CX} y1={v.top}
                  x2={CX - v.spinousL - 2} y2={v.cy + v.bodyH / 2}
                  stroke={isSelected ? wuxingColor : color}
                  strokeWidth={1}
                  opacity={isSelected ? 0.75 : 0.35}
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}

        {/* 选中标记：光晕 + 脉冲环 + 左侧标签 */}
        {selectedVerts.map(v => (
          <g key={`sel-${v.key}`} style={{ pointerEvents: 'none' }}>
            <circle
              cx={CX} cy={v.cy}
              r={v.bodyW / 2 + 16}
              fill={glowId ? `url(#${glowId})` : 'none'}
              className="animate-pulse"
            />
            <circle
              cx={CX} cy={v.cy}
              r={v.bodyW / 2 + 5}
              fill="none"
              stroke={wuxingColor}
              strokeWidth={0.9}
              opacity={0.6}
              className="animate-pulse"
            />
            <text
              x={CX - 34} y={v.cy - 1.5}
              fontSize={7.5} fill={wuxingColor}
              fontWeight={700} textAnchor="end"
            >
              {selectedEntry?.solarTerm}
            </text>
            <text
              x={CX - 34} y={v.cy + 6.5}
              fontSize={6.5} fill="#8b7b6b" textAnchor="end"
            >
              {v.code}
            </text>
          </g>
        ))}
      </svg>

      {/* 缩放控制（右上角） */}
      <div
        className="absolute top-3 right-3 flex flex-col items-center gap-1.5"
        onPointerDown={e => e.stopPropagation()}
      >
        <button
          onClick={() => zoomBy(1.3)}
          title="放大"
          aria-label="放大"
          className="w-8 h-8 rounded-full bg-white/85 backdrop-blur border border-[#e0d4c0] text-[#5a4a3a] flex items-center justify-center hover:bg-white active:scale-95 transition shadow-sm"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => zoomBy(1 / 1.3)}
          title="缩小"
          aria-label="缩小"
          className="w-8 h-8 rounded-full bg-white/85 backdrop-blur border border-[#e0d4c0] text-[#5a4a3a] flex items-center justify-center hover:bg-white active:scale-95 transition shadow-sm"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={resetView}
          title="复位全景"
          aria-label="复位全景"
          className="w-8 h-8 rounded-full bg-white/85 backdrop-blur border border-[#e0d4c0] text-[#5a4a3a] flex items-center justify-center hover:bg-white active:scale-95 transition shadow-sm"
        >
          <Maximize2 size={13} />
        </button>
        <span className="text-[9px] text-[#8b7b6b] bg-white/70 rounded-full px-1.5 py-0.5 border border-[#e0d4c0]">
          {zoomPercent}%
        </span>
      </div>

      {/* 操作提示（左上角） */}
      <div className="absolute top-3 left-3 text-[10px] text-[#8b7b6b]/75 pointer-events-none">
        滚轮/双指缩放 · 拖动查看 · 点击椎骨选节气
      </div>

      {/* 底部状态 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur border border-[#e0d4c0] text-xs text-[#5a4a3a] shadow-sm whitespace-nowrap max-w-[92%] truncate">
        {selectedEntry
          ? `${selectedEntry.solarTerm} · ${selectedEntry.vertebra} · ${selectedEntry.wuxing}行`
          : '选择节气查看对应椎骨'}
      </div>
    </div>
  );
}
