'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, HeartPulse, Flame, User, Compass, BookOpen } from 'lucide-react';

// 应用核心逻辑：明辨 → 解析 → 疗愈方案 → 交互疗愈模块
const NAV_ITEMS = [
  { href: '/dashboard', icon: HeartPulse, label: '首页', activeColor: 'var(--wood)' },
  { href: '/diagnose', icon: Stethoscope, label: '明辨', activeColor: 'var(--wood)' },
  { href: '/healing', icon: Flame, label: '疗愈', activeColor: 'var(--fire)' },
  { href: '/divination', icon: Compass, label: '知几', activeColor: 'var(--indigo)' },
  { href: '/classics', icon: BookOpen, label: '玄览', activeColor: 'var(--ochre)' },
  { href: '/profile', icon: User, label: '我的', activeColor: 'var(--ink-light)' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // 知几页和天籁使用暗色导航栏
  const isDarkPage = pathname === '/divination' || pathname.startsWith('/divination/') || pathname === '/healing/mineradio';
  // intro 页面使用暖色导航栏（非暗色）
  const isIntroPage = pathname.startsWith('/intro/');
  const navBg = isDarkPage
    ? 'linear-gradient(180deg, rgba(26,37,48,0.90), rgba(26,37,48,0.96))'
    : 'linear-gradient(180deg, rgba(253,248,240,0.88), rgba(244,237,224,0.94))';
  const navBorder = isDarkPage
    ? 'rgba(74,104,128,0.18)'
    : 'rgba(139,115,85,0.07)';
  const inactiveColor = isDarkPage
    ? 'rgba(180,195,210,0.40)'
    : 'rgba(92,48,21,0.28)';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
      style={{
        background: navBg,
        borderTop: `1px solid ${navBorder}`,
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label, activeColor }) => {
          const isActive = !pathname.startsWith('/intro/') && (pathname === href || pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300"
              style={{
                color: isActive ? activeColor : inactiveColor,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.6}
                style={isActive ? { filter: `drop-shadow(0 2px 4px ${activeColor}40)` } : {}}
              />
              <span
                className="text-[10px]"
                style={{
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: isActive ? '0.05em' : '0',
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
