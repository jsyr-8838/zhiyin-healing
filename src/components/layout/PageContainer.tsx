import { type ReactNode } from 'react';
import { cosUrl } from '@/lib/cos-url';

type PageTheme = 'healing' | 'diagnose' | 'home' | 'divination' | 'classics' | 'dark' | 'custom';

/**
 * PageContainer — 全站统一页面容器
 *
 * 提供统一的背景、最小高度、底部安全距。
 * 每个主题自动在最底层渲染国风山水楼台素描装饰，
 * 位于页面最上方和最下方，z-index: 0，内容层 z: 10，
 * 保证装饰不影响任何功能交互和文字可读性。
 *
 * 主题专属色系：
 *   healing     — 暖色丹炉 + 原色山水
 *   diagnose    — 青绿云气 × 暖光中和 + 青调山水
 *   divination  — 月白宣纸 × 靛蓝点缀 + 靛蓝调山水
 *   classics    — 古籍竹简 + 棕褐调山水
 *   home        — 宋韵宣纸 + 暖调山水
 */
interface PageContainerProps {
  theme?: PageTheme;
  className?: string;
  children: ReactNode;
}

const THEME_BG: Record<PageTheme, string> = {
  healing:     'bg-healing texture-paper',
  diagnose:    'bg-diagnose texture-paper',
  home:        'bg-home texture-paper',
  divination:  'bg-divination texture-paper',
  classics:    'bg-classics texture-paper',
  dark:        'bg-gray-950',
  custom:      '',
};

/** 每个主题的山水装饰专属参数 */
const THEME_SHANSHUI: Record<string, {
  topOpacity: number;
  bottomOpacity: number;
  filter: string;
}> = {
  healing: {
    topOpacity: 0.38,
    bottomOpacity: 0.35,
    filter: 'none',
  },
  diagnose: {
    topOpacity: 0.38,
    bottomOpacity: 0.34,
    filter: 'sepia(0.08) hue-rotate(70deg) saturate(1.3)',
  },
  divination: {
    topOpacity: 0.35,
    bottomOpacity: 0.32,
    filter: 'sepia(0.06) hue-rotate(210deg) saturate(1.2)',
  },
  classics: {
    topOpacity: 0.35,
    bottomOpacity: 0.32,
    filter: 'sepia(0.35) saturate(0.9) brightness(0.92)',
  },
  home: {
    topOpacity: 0.30,
    bottomOpacity: 0.28,
    filter: 'none',
  },
};

export default function PageContainer({
  theme = 'healing',
  className = '',
  children,
}: PageContainerProps) {
  const ss = THEME_SHANSHUI[theme];

  return (
    <div className={`min-h-screen flex flex-col pb-20 relative ${THEME_BG[theme]} ${className}`}>
      {/* ═══ 国风山水楼台素描装饰层（最底层 z-0） ═══ */}
      {ss && (
        <>
          {/* 顶部：云雾松亭仙鹤 — 页面最上方 */}
          <div
            className="absolute left-0 right-0 top-0 h-[280px] sm:h-[350px] md:h-[420px] pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <div
              className="w-full h-full"
              style={{
                opacity: ss.topOpacity,
                mixBlendMode: 'multiply',
                filter: ss.filter,
                backgroundImage: `url('${cosUrl('/textures/shanshui-top.jpg')}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
                backgroundRepeat: 'no-repeat',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.12) 65%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.12) 65%, transparent 100%)',
              }}
            />
          </div>
          {/* 底部：远山亭阁垂柳 — 页面最下方 */}
          <div
            className="absolute left-0 right-0 bottom-0 h-[240px] sm:h-[320px] md:h-[380px] pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <div
              className="w-full h-full"
              style={{
                opacity: ss.bottomOpacity,
                mixBlendMode: 'multiply',
                filter: ss.filter,
                backgroundImage: `url('${cosUrl('/textures/shanshui-bottom.jpg')}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 60%',
                backgroundRepeat: 'no-repeat',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.12) 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.12) 70%, transparent 100%)',
              }}
            />
          </div>
        </>
      )}

      {/* ═══ 内容层（z-10，在山水装饰之上） ═══ */}
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
