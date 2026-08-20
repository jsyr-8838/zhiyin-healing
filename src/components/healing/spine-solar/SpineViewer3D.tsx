'use client';

import React from 'react';

/**
 * SpineViewer3D (2D版) — 替代原 R3F 3D 脊柱模型
 * 显示简化2D脊柱图，纯SVG实现，零依赖
 */

interface SpineViewer3DProps {
  selectedSolarTerm: string;
  selectedEntry: { solarTerm: string; vertebra: string; wuxing: string; season: string } | null;
  onBoneClick?: (entry: { solarTerm: string } | null) => void;
}

const REGION_COLORS: Record<string, string> = {
  sacrum: '#c97b63',
  lumbar: '#c9a94f',
  thoracic: '#5d8a63',
  cervical: '#5ba09a',
};

export default function SpineViewer3D({ selectedEntry }: SpineViewer3DProps) {
  const vertebrae = [
    { name: '颈椎', type: 'cervical', count: 7, y: 20 },
    { name: '胸椎', type: 'thoracic', count: 12, y: 90 },
    { name: '腰椎', type: 'lumbar', count: 5, y: 220 },
    { name: '骶椎', type: 'sacrum', count: 1, y: 300 },
  ];

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[#faf5ee] rounded-xl p-4">
      <svg viewBox="0 0 120 380" className="w-full max-w-[120px] h-auto" style={{ opacity: 0.9 }}>
        {vertebrae.map((region) => {
          const blockH = region.count * 12;
          const color = REGION_COLORS[region.type] || '#8b7b6b';
          const isSelected = selectedEntry?.vertebra?.includes(region.name);
          return (
            <g key={region.name}>
              <rect
                x="40" y={region.y} width="40" height={blockH}
                rx="6" fill={isSelected ? color : 'none'}
                stroke={color} strokeWidth="2" opacity={isSelected ? 0.3 : 0.6}
              />
              <text x="92" y={region.y + blockH / 2 + 4} fontSize="10" fill={color} fontWeight="bold">
                {region.name}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-[#8b7b6b] mt-3 text-center">
        {selectedEntry ? `${selectedEntry.solarTerm} · ${selectedEntry.vertebra}` : '选择节气查看对应椎骨'}
      </p>
    </div>
  );
}
