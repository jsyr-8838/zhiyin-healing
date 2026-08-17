'use client';

/**
 * 通用疗愈子页面骨架屏
 * 宋韵极简风格：宣纸暖白底 + 脉冲动画
 */
interface HealingSkeletonProps {
  /** 是否深色沉浸式页面（如天籁） */
  dark?: boolean;
  /** 标题行数 */
  titleLines?: number;
  /** 内容卡片数 */
  cardCount?: number;
  /** 是否显示标签栏 */
  showTabs?: boolean;
}

export default function HealingSkeleton({
  dark = false,
  titleLines = 1,
  cardCount = 4,
  showTabs = true,
}: HealingSkeletonProps) {
  const bg = dark ? 'bg-gray-950' : 'bg-[#fafaf9]';
  const cardBg = dark ? 'bg-white/5' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const tagBg = dark ? 'bg-white/10' : 'bg-gray-100';
  const headerFrom = dark ? 'from-gray-900' : 'from-emerald-600';
  const headerTo = dark ? 'to-gray-800' : 'to-teal-700';
  const titleBarBg = dark ? 'bg-white/10' : 'bg-white/20';
  const pb = dark ? 'pb-32' : 'pb-24';

  return (
    <div className={`min-h-screen ${bg} ${pb}`}>
      {/* 头部区域 */}
      <div className={`bg-gradient-to-br ${headerFrom} ${headerTo} px-6 pt-12 pb-8`}>
        {Array.from({ length: titleLines }).map((_, i) => (
          <div
            key={i}
            className={`h-${i === 0 ? '8' : '4'} ${titleBarBg} rounded w-${i === 0 ? '28' : '40'} mb-2 animate-pulse`}
          />
        ))}
      </div>

      {/* 标签栏 */}
      {showTabs && (
        <div className="px-4 pt-4 flex gap-2 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-16 h-8 ${tagBg} rounded-full`} />
          ))}
        </div>
      )}

      {/* 内容卡片 */}
      <div className="px-4 pt-4 space-y-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div key={i} className={`${cardBg} rounded-2xl p-5 border ${border} animate-pulse`}>
            <div className={`h-5 ${tagBg} rounded w-3/4 mb-3`} />
            <div className={`h-3 ${tagBg} rounded w-full mb-2`} />
            <div className={`h-3 ${tagBg} rounded w-2/3`} />
          </div>
        ))}
      </div>
    </div>
  );
}
