'use client';

import { useState, useCallback } from 'react';

/**
 * EmotionWheel — 色彩情志诊断专用情绪轮
 *
 * 简化版日内瓦情绪轮（GEW），适配中医五志理论：
 * - 15个情绪词，按五行分为5组（每组3个）
 * - 每个情绪3个强度等级（轻/中/重）
 * - 选择后高亮显示
 * - SVG渲染 + 五行色系
 */

// 五行情绪分组
const EMOTION_GROUPS: Array<{
  element: string;
  elementName: string;
  color: string;
  activeColor: string;
  emotions: Array<{ key: string; label: string }>;
}> = [
  {
    element: 'wood',
    elementName: '木·肝·怒',
    color: '#27AE60',
    activeColor: '#1B7A43',
    emotions: [
      { key: '感兴趣', label: '感兴趣' },
      { key: '欢愉', label: '欢愉' },
      { key: '自豪', label: '自豪' },
    ],
  },
  {
    element: 'fire',
    elementName: '火·心·喜',
    color: '#E74C3C',
    activeColor: '#C0392B',
    emotions: [
      { key: '欢乐', label: '欢乐' },
      { key: '愉快', label: '愉快' },
      { key: '忿怒', label: '忿怒' },
    ],
  },
  {
    element: 'earth',
    elementName: '土·脾·思',
    color: '#F39C12',
    activeColor: '#D68910',
    emotions: [
      { key: '满足', label: '满足' },
      { key: '赞赏', label: '赞赏' },
      { key: '爱', label: '爱' },
    ],
  },
  {
    element: 'metal',
    elementName: '金·肺·悲',
    color: '#95A5A6',
    activeColor: '#7F8C8D',
    emotions: [
      { key: '如释重负', label: '如释重负' },
      { key: '同情', label: '同情' },
      { key: '悲伤', label: '悲伤' },
    ],
  },
  {
    element: 'water',
    elementName: '水·肾·恐',
    color: '#2C3E50',
    activeColor: '#1A252F',
    emotions: [
      { key: '恐惧', label: '恐惧' },
      { key: '厌恶', label: '厌恶' },
      { key: '失望', label: '失望' },
    ],
  },
];

// 将15个情绪展平
const ALL_EMOTIONS = EMOTION_GROUPS.flatMap((g) =>
  g.emotions.map((e) => ({ ...e, group: g })),
);

export interface EmotionSelection {
  emotion: string;
  intensity: number; // 1-3
}

interface EmotionWheelProps {
  /** 当前选中的情绪列表 */
  selections: EmotionSelection[];
  /** 选择变化回调 */
  onChange: (selections: EmotionSelection[]) => void;
  /** 最大可选数量 */
  maxSelections?: number;
}

export default function EmotionWheel({
  selections,
  onChange,
  maxSelections = 3,
}: EmotionWheelProps) {
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);

  const toggleEmotion = useCallback(
    (emotionKey: string, intensity: number) => {
      const existing = selections.find((s) => s.emotion === emotionKey);

      if (existing) {
        // 已选：如果点击相同强度，取消选择；否则更新强度
        if (existing.intensity === intensity) {
          onChange(selections.filter((s) => s.emotion !== emotionKey));
        } else {
          onChange(
            selections.map((s) =>
              s.emotion === emotionKey ? { ...s, intensity } : s,
            ),
          );
        }
      } else {
        // 未选：如果已达上限，替换最早的选择
        if (selections.length >= maxSelections) {
          onChange([
            ...selections.slice(1),
            { emotion: emotionKey, intensity },
          ]);
        } else {
          onChange([...selections, { emotion: emotionKey, intensity }]);
        }
      }
    },
    [selections, onChange, maxSelections],
  );

  const isSelected = (emotionKey: string) =>
    selections.some((s) => s.emotion === emotionKey);

  const getIntensity = (emotionKey: string) =>
    selections.find((s) => s.emotion === emotionKey)?.intensity || 0;

  // 为每个情绪计算角度位置
  const size = 320;
  const center = size / 2;
  const innerRadius = 55;
  const outerRadius = 120;

  return (
    <div className="w-full space-y-4">
      {/* 选中状态提示 */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          已选择 {selections.length}/{maxSelections} 个情绪
        </p>
        {selections.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {selections.map((s) => {
              const group = EMOTION_GROUPS.find((g) =>
                g.emotions.some((e) => e.key === s.emotion),
              );
              return (
                <span
                  key={s.emotion}
                  className="text-xs px-2 py-0.5 rounded-full text-white font-serif"
                  style={{ backgroundColor: group?.color || '#999' }}
                >
                  {s.emotion}
                  {'·'.repeat(s.intensity)}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* SVG 情绪轮 */}
      <div className="flex justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="select-none touch-none"
        >
          {/* 五行分组背景扇形 */}
          {EMOTION_GROUPS.map((group, gi) => {
            const startAngle = (gi * 72 - 90) * (Math.PI / 180);
            const endAngle = ((gi + 1) * 72 - 90) * (Math.PI / 180);
            const midAngle = ((gi * 72 + 36) - 90) * (Math.PI / 180);

            // 外圈扇形路径
            const x1o = center + outerRadius * Math.cos(startAngle);
            const y1o = center + outerRadius * Math.sin(startAngle);
            const x2o = center + outerRadius * Math.cos(endAngle);
            const y2o = center + outerRadius * Math.sin(endAngle);
            const x1i = center + innerRadius * Math.cos(startAngle);
            const y1i = center + innerRadius * Math.sin(startAngle);
            const x2i = center + innerRadius * Math.cos(endAngle);
            const y2i = center + innerRadius * Math.sin(endAngle);

            // 是否有该组情绪被选中
            const hasSelection = group.emotions.some((e) =>
              selections.some((s) => s.emotion === e.key),
            );

            return (
              <g key={group.element}>
                {/* 背景扇形 */}
                <path
                  d={`M ${x1i} ${y1i} L ${x1o} ${y1o} A ${outerRadius} ${outerRadius} 0 0 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerRadius} ${innerRadius} 0 0 0 ${x1i} ${y1i}`}
                  fill={group.color}
                  opacity={hasSelection ? 0.25 : 0.08}
                  stroke={group.color}
                  strokeWidth={1}
                  strokeOpacity={0.3}
                />

                {/* 五行标签 */}
                <text
                  x={center + (outerRadius + 25) * Math.cos(midAngle)}
                  y={center + (outerRadius + 25) * Math.sin(midAngle)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fontFamily="serif"
                  fontWeight={hasSelection ? 'bold' : 'normal'}
                  fill={hasSelection ? group.color : '#999'}
                >
                  {group.elementName}
                </text>
              </g>
            );
          })}

          {/* 中心圆 */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 5}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth={1}
          />
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fontFamily="serif"
            fontWeight="bold"
            fill="#9ca3af"
          >
            五志
          </text>
          <text
            x={center}
            y={center + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fill="#d1d5db"
          >
            怒喜思悲恐
          </text>

          {/* 情绪球：每个情绪3个强度圆 */}
          {ALL_EMOTIONS.map((emotion, ei) => {
            const groupAngle =
              (EMOTION_GROUPS.indexOf(emotion.group) * 72 +
                (emotion.group.emotions.indexOf(
                  emotion.group.emotions.find((e) => e.key === emotion.key)!,
                ) +
                  0.5) *
                  24 -
                90) *
              (Math.PI / 180);

            const selected = isSelected(emotion.key);
            const currentIntensity = getIntensity(emotion.key);

            return (
              <g key={emotion.key}>
                {[1, 2, 3].map((intensity) => {
                  const dist =
                    innerRadius + (intensity - 0.5) * ((outerRadius - innerRadius) / 3);
                  const cx = center + dist * Math.cos(groupAngle);
                  const cy = center + dist * Math.sin(groupAngle);
                  const r = 6 + intensity * 2;
                  const isActive = selected && currentIntensity === intensity;

                  return (
                    <circle
                      key={intensity}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={isActive ? emotion.group.activeColor : 'white'}
                      stroke={emotion.group.color}
                      strokeWidth={isActive ? 2.5 : 1}
                      opacity={isActive ? 1 : selected ? 0.3 : 0.7}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => toggleEmotion(emotion.key, intensity)}
                      onMouseEnter={() => setHoveredEmotion(emotion.key)}
                      onMouseLeave={() => setHoveredEmotion(null)}
                    />
                  );
                })}

                {/* 情绪名称标签 */}
                {(() => {
                  const labelDist = outerRadius + 8;
                  const groupIdx = EMOTION_GROUPS.indexOf(emotion.group);
                  const emotionIdx = emotion.group.emotions.findIndex(
                    (e) => e.key === emotion.key,
                  );
                  const angle =
                    ((groupIdx * 72 + emotionIdx * 24 + 12) - 90) *
                    (Math.PI / 180);
                  const lx = center + labelDist * Math.cos(angle);
                  const ly = center + labelDist * Math.sin(angle);

                  return (
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={9}
                      fontFamily="serif"
                      fontWeight={isSelected(emotion.key) ? 'bold' : 'normal'}
                      fill={
                        isSelected(emotion.key)
                          ? emotion.group.color
                          : '#6b7280'
                      }
                      className="pointer-events-none"
                    >
                      {emotion.label}
                    </text>
                  );
                })()}

                {/* 悬停提示 */}
                {hoveredEmotion === emotion.key && (
                  <text
                    x={center}
                    y={center + 24}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontFamily="serif"
                    fill={emotion.group.color}
                    className="pointer-events-none"
                  >
                    {emotion.label} · {emotion.group.elementName.split('·')[1]}·{emotion.group.elementName.split('·')[2]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 强度说明 */}
      <div className="flex justify-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border border-gray-300" />
          轻
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border border-gray-300" />
          中
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full border border-gray-300" />
          重
        </span>
      </div>
    </div>
  );
}
