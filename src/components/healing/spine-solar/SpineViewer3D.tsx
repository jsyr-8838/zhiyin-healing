'use client';

import React, { useMemo } from 'react';
import {
  VERTEBRA_PARAMS,
  REGION_COLORS,
  WUXING_COLORS,
  type VertebraType,
} from '@/lib/spine-solar-data';

/**
 * SpineViewer — 详细脊柱SVG可视化
 * 使用 VERTEBRA_PARAMS (Gray's Anatomy) 逐块绘制25块椎骨
 * 每块椎骨可点击，选中节气对应椎骨高亮
 */

interface SpineViewerProps {
  selectedSolarTerm: string;
  selectedEntry: { solarTerm: string; vertebra: string; vertebraCode: string; wuxing: string; season: string; vertebraType: VertebraType } | null;
  onBoneClick?: (entry: { solarTerm: string } | null) => void;
}

/** 脊柱SVG缩放参数 */
const SCALE = 0.42;
const SVG_WIDTH = 200;
const PADDING_TOP = 20;
const LABEL_OFFSET = 65;

export default function SpineViewer3D({ selectedSolarTerm, selectedEntry, onBoneClick }: SpineViewerProps) {
  /** 按从底到顶排序的椎骨列表 */
  const vertebraList = useMemo(() => {
    return Object.entries(VERTEBRA_PARAMS)
      .map(([key, param]) => ({ key, ...param }))
      .sort((a, b) => a.y - b.y);
  }, []);

  /** 当前选中的椎骨code */
  const selectedCode = selectedEntry?.vertebraCode || '';

  /** 判断某椎骨是否被选中（支持复合code如"S+C1"） */
  const isVertebraSelected = (key: string): boolean => {
    if (!selectedCode) return false;
    return selectedCode.split('+').some(part => part.trim() === key);
  };

  /** SVG总高度 */
  const svgHeight = useMemo(() => {
    const maxY = Math.max(...vertebraList.map(v => v.y + v.bodyH));
    return maxY * SCALE + PADDING_TOP * 2;
  }, [vertebraList]);

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[#faf5ee] rounded-xl p-3 overflow-hidden">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
        className="w-full max-w-[180px] h-auto"
        style={{ opacity: 0.92 }}
      >
        {/* 中线 */}
        <line
          x1={SVG_WIDTH / 2}
          y1={PADDING_TOP - 10}
          x2={SVG_WIDTH / 2}
          y2={svgHeight - PADDING_TOP + 10}
          stroke="#d4c5a9"
          strokeWidth="0.5"
          strokeDasharray="2 3"
        />

        {vertebraList.map((v) => {
          const cx = SVG_WIDTH / 2;
          const cy = PADDING_TOP + v.y * SCALE;
          const bodyW = v.bodyW * SCALE;
          const bodyH = v.bodyH * SCALE;
          const spinousL = v.spinous * SCALE;
          const transverseW = v.transverseW * SCALE;
          const isSelected = isVertebraSelected(v.key);
          const color = REGION_COLORS[v.type] || '#8b7b6b';
          const wuxingColor = selectedEntry ? WUXING_COLORS[selectedEntry.wuxing as keyof typeof WUXING_COLORS] || color : color;

          return (
            <g
              key={v.key}
              onClick={() => onBoneClick?.({ solarTerm: selectedSolarTerm })}
              style={{ cursor: 'pointer' }}
            >
              {/* 横突（左右） */}
              {transverseW > 0 && (
                <>
                  <line
                    x1={cx - bodyW / 2}
                    y1={cy + bodyH / 2}
                    x2={cx - bodyW / 2 - transverseW}
                    y2={cy + bodyH / 2 + 1}
                    stroke={isSelected ? wuxingColor : color}
                    strokeWidth="1.5"
                    opacity={isSelected ? 0.8 : 0.4}
                    strokeLinecap="round"
                  />
                  <line
                    x1={cx + bodyW / 2}
                    y1={cy + bodyH / 2}
                    x2={cx + bodyW / 2 + transverseW}
                    y2={cy + bodyH / 2 + 1}
                    stroke={isSelected ? wuxingColor : color}
                    strokeWidth="1.5"
                    opacity={isSelected ? 0.8 : 0.4}
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* 椎体（主体矩形） */}
              <rect
                x={cx - bodyW / 2}
                y={cy}
                width={bodyW}
                height={bodyH}
                rx={Math.min(2, bodyH / 3)}
                fill={isSelected ? wuxingColor : color}
                fillOpacity={isSelected ? 0.35 : 0.12}
                stroke={isSelected ? wuxingColor : color}
                strokeWidth={isSelected ? 1.5 : 0.8}
              />

              {/* 椎间盘（间隙线） */}
              {spinousL > 0 && (
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx - spinousL - 2}
                  y2={cy + bodyH / 2}
                  stroke={isSelected ? wuxingColor : color}
                  strokeWidth="1"
                  opacity={isSelected ? 0.7 : 0.35}
                  strokeLinecap="round"
                />
              )}

              {/* 选中标记光晕 */}
              {isSelected && (
                <circle
                  cx={cx}
                  cy={cy + bodyH / 2}
                  r={bodyW / 2 + 3}
                  fill="none"
                  stroke={wuxingColor}
                  strokeWidth="0.8"
                  opacity="0.5"
                  className="animate-pulse"
                />
              )}

              {/* 椎骨标签（选中时显示） */}
              {isSelected && (
                <text
                  x={cx + LABEL_OFFSET}
                  y={cy + bodyH / 2 + 3}
                  fontSize="8"
                  fill={wuxingColor}
                  fontWeight="bold"
                  textAnchor="start"
                >
                  {v.code}
                </text>
              )}
            </g>
          );
        })}

        {/* 区域标签（右侧） */}
        {[
          { label: '颈椎', type: 'cervical' as VertebraType, y: 560 },
          { label: '胸椎', type: 'thoracic' as VertebraType, y: 360 },
          { label: '腰椎', type: 'lumbar' as VertebraType, y: 175 },
          { label: '骶椎', type: 'sacrum' as VertebraType, y: 55 },
        ].map(region => {
          const color = REGION_COLORS[region.type];
          return (
            <text
              key={region.label}
              x={SVG_WIDTH - 5}
              y={PADDING_TOP + region.y * SCALE}
              fontSize="7"
              fill={color}
              fontWeight="600"
              textAnchor="end"
              opacity="0.7"
            >
              {region.label}
            </text>
          );
        })}
      </svg>

      {/* 底部状态文字 */}
      <p className="text-xs text-[#8b7b6b] mt-2 text-center">
        {selectedEntry
          ? `${selectedEntry.solarTerm} · ${selectedEntry.vertebra} · ${selectedEntry.wuxing}行`
          : '选择节气查看对应椎骨'
        }
      </p>
    </div>
  );
}
