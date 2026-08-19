'use client';

import { useCultivationStore } from '@/lib/cultivation-store';
import {
  ELEMENT_COLORS, ELEMENT_NAMES, ELEMENT_ORGANS, ELEMENT_LIUZIJUE,
  getTreeStage, TREE_STAGE_LABELS, TreeStage,
  type WuxingElement,
} from '@/lib/cultivation-engine';

const ELEMENTS: WuxingElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];

/**
 * 五行在太极图中的方位（标准五行方位）
 * 木→东(右), 火→南(下), 土→中, 金→西(左), 水→北(上)
 * SVG 坐标：中心 (100,100)，半径 70
 */
const ELEMENT_POSITIONS: Record<WuxingElement, { x: number; y: number; label: string }> = {
  earth:   { x: 100, y: 100, label: '中' },  // 中
  wood:    { x: 165, y: 72,  label: '东' },   // 东
  fire:    { x: 135, y: 158, label: '南' },   // 南
  metal:   { x: 35,  y: 72,  label: '西' },   // 西
  water:   { x: 65,  y: 42,  label: '北' },   // 北
};

/** 根据修为阶段返回树的 SVG 路径 */
function TreeIcon({ stage, color }: { stage: TreeStage; color: string }) {
  switch (stage) {
    case TreeStage.Seed: // 种子：一个小圆点
      return <circle cx="0" cy="0" r="3" fill={color} opacity={0.5} />;
    case TreeStage.Sprout: // 发芽：小嫩芽
      return (
        <g>
          <line x1="0" y1="8" x2="0" y2="0" stroke={color} strokeWidth="1.5" />
          <ellipse cx="0" cy="-2" rx="4" ry="6" fill={color} opacity={0.6} />
        </g>
      );
    case TreeStage.Branch: // 枝干
      return (
        <g>
          <line x1="0" y1="10" x2="0" y2="-4" stroke={color} strokeWidth="2" />
          <line x1="0" y1="2" x2="-8" y2="-8" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="0" x2="7" y2="-7" stroke={color} strokeWidth="1.5" />
          <circle cx="-8" cy="-8" r="3" fill={color} opacity={0.4} />
          <circle cx="7" cy="-7" r="3" fill={color} opacity={0.4} />
        </g>
      );
    case TreeStage.Leaf: // 繁叶
      return (
        <g>
          <line x1="0" y1="12" x2="0" y2="-6" stroke={color} strokeWidth="2.5" />
          <line x1="0" y1="3" x2="-10" y2="-10" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="0" x2="9" y2="-9" stroke={color} strokeWidth="1.5" />
          <ellipse cx="-10" cy="-12" rx="7" ry="5" fill={color} opacity={0.35} transform="rotate(-20,-10,-12)" />
          <ellipse cx="10" cy="-11" rx="6" ry="4.5" fill={color} opacity={0.35} transform="rotate(15,10,-11)" />
          <ellipse cx="0" cy="-10" rx="8" ry="5" fill={color} opacity={0.3} />
        </g>
      );
    case TreeStage.Bloom: // 开花
      return (
        <g>
          <line x1="0" y1="12" x2="0" y2="-8" stroke={color} strokeWidth="2.5" />
          <line x1="0" y1="4" x2="-12" y2="-12" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="2" x2="11" y2="-11" stroke={color} strokeWidth="1.5" />
          <ellipse cx="-12" cy="-14" rx="8" ry="5" fill={color} opacity={0.3} transform="rotate(-20,-12,-14)" />
          <ellipse cx="11" cy="-13" rx="7" ry="5" fill={color} opacity={0.3} transform="rotate(15,11,-13)" />
          <ellipse cx="0" cy="-12" rx="9" ry="6" fill={color} opacity={0.25} />
          {/* 花朵 */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <circle
              key={i}
              cx={Math.cos((angle * Math.PI) / 180) * 4}
              cy={Math.sin((angle * Math.PI) / 180) * 4 - 18}
              r="2.5"
              fill={color}
              opacity={0.7}
            />
          ))}
          <circle cx="0" cy="-18" r="1.5" fill="white" opacity={0.8} />
        </g>
      );
    case TreeStage.Fruit: // 贯通：大圆满树
      return (
        <g>
          <line x1="0" y1="14" x2="0" y2="-10" stroke={color} strokeWidth="3" />
          <line x1="0" y1="5" x2="-14" y2="-14" stroke={color} strokeWidth="2" />
          <line x1="0" y1="3" x2="13" y2="-13" stroke={color} strokeWidth="2" />
          {/* 树冠 */}
          <circle cx="0" cy="-14" r="14" fill={color} opacity={0.2} />
          <circle cx="-8" cy="-16" r="8" fill={color} opacity={0.25} />
          <circle cx="8" cy="-15" r="7" fill={color} opacity={0.25} />
          {/* 果实 */}
          <circle cx="-5" cy="-20" r="2.5" fill={color} opacity={0.9} />
          <circle cx="6" cy="-18" r="2.5" fill={color} opacity={0.9} />
          <circle cx="0" cy="-22" r="2" fill={color} opacity={0.9} />
          {/* 光环 */}
          <circle cx="0" cy="-8" r="18" fill="none" stroke={color} strokeWidth="0.5" opacity={0.3} />
        </g>
      );
  }
}

export default function CultivationTree() {
  const { xiuwei } = useCultivationStore();

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        {/* 太极图背景 */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--ink-main)" strokeWidth="0.3" opacity={0.1} />
        <circle cx="100" cy="100" r="70" fill="none" stroke="var(--ink-main)" strokeWidth="0.2" opacity={0.06} />

        {/* 五行连线：相生顺序 木→火→土→金→水→木 */}
        <g opacity={0.08}>
          <line x1={ELEMENT_POSITIONS.wood.x} y1={ELEMENT_POSITIONS.wood.y}
                x2={ELEMENT_POSITIONS.fire.x} y2={ELEMENT_POSITIONS.fire.y} stroke="var(--ink-main)" strokeWidth="0.5" />
          <line x1={ELEMENT_POSITIONS.fire.x} y1={ELEMENT_POSITIONS.fire.y}
                x2={ELEMENT_POSITIONS.earth.x} y2={ELEMENT_POSITIONS.earth.y} stroke="var(--ink-main)" strokeWidth="0.5" />
          <line x1={ELEMENT_POSITIONS.earth.x} y1={ELEMENT_POSITIONS.earth.y}
                x2={ELEMENT_POSITIONS.metal.x} y2={ELEMENT_POSITIONS.metal.y} stroke="var(--ink-main)" strokeWidth="0.5" />
          <line x1={ELEMENT_POSITIONS.metal.x} y1={ELEMENT_POSITIONS.metal.y}
                x2={ELEMENT_POSITIONS.water.x} y2={ELEMENT_POSITIONS.water.y} stroke="var(--ink-main)" strokeWidth="0.5" />
          <line x1={ELEMENT_POSITIONS.water.x} y1={ELEMENT_POSITIONS.water.y}
                x2={ELEMENT_POSITIONS.wood.x} y2={ELEMENT_POSITIONS.wood.y} stroke="var(--ink-main)" strokeWidth="0.5" />
        </g>

        {/* 五棵修为树 */}
        {ELEMENTS.map(el => {
          const pos = ELEMENT_POSITIONS[el];
          const val = xiuwei[el];
          const stage = getTreeStage(val);
          const color = ELEMENT_COLORS[el];

          return (
            <g key={el} transform={`translate(${pos.x}, ${pos.y})`}>
              {/* 底圈 */}
              <circle cx="0" cy="0" r="22" fill={color} opacity={0.04} />
              <circle cx="0" cy="0" r="22" fill="none" stroke={color} strokeWidth="0.5" opacity={0.15} />

              {/* 树 */}
              <TreeIcon stage={stage} color={color} />

              {/* 标签 */}
              <text x="0" y="20" textAnchor="middle" fontSize="8" fontWeight="700" fill={color}>
                {ELEMENT_NAMES[el]}·{ELEMENT_ORGANS[el]}
              </text>
              <text x="0" y="28" textAnchor="middle" fontSize="6" fill={color} opacity={0.6}>
                {TREE_STAGE_LABELS[stage]} {val}/100
              </text>
            </g>
          );
        })}

        {/* 中心太极 */}
        <g transform="translate(100, 100)">
          <circle cx="0" cy="0" r="12" fill="var(--ink-main)" opacity={0.04} />
          <text x="0" y="2" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="800" fill="var(--ink-main)" opacity={0.3}>
            太极
          </text>
        </g>
      </svg>
    </div>
  );
}
