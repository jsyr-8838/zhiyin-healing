'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import CultivationTree from '@/components/cultivation/CultivationTree';
import XiuWeiOverview from '@/components/cultivation/XiuWeiOverview';
import RankDisplay from '@/components/cultivation/RankDisplay';
import MeridianMap from '@/components/cultivation/MeridianMap';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Tab = 'tree' | 'rank' | 'meridian';

export default function CultivationPage() {
  const [tab, setTab] = useState<Tab>('tree');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tree', label: '修为树' },
    { key: 'rank', label: '段位' },
    { key: 'meridian', label: '经络图' },
  ];

  return (
    <div className="min-h-screen pb-24 bg-home texture-paper texture-ink-wash">
      {/* 头部 */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(30,45,38,0.05)' }}>
            <ArrowLeft size={18} style={{ color: 'var(--ink-main)' }} />
          </Link>
          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--ink-main)' }}>五行修为</h1>
            <p className="text-xs" style={{ color: 'var(--ink-light)' }}>日日不辍，功到自成</p>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'rgba(30,45,38,0.04)' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: tab === t.key ? 'white' : 'transparent',
                color: tab === t.key ? 'var(--ink-main)' : 'var(--ink-light)',
                boxShadow: tab === t.key ? '0 2px 8px rgba(30,45,38,0.08)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-4 space-y-5">
        {tab === 'tree' && (
          <>
            <CultivationTree />
            <XiuWeiOverview />
          </>
        )}
        {tab === 'rank' && <RankDisplay />}
        {tab === 'meridian' && <MeridianMap />}
      </div>

      <BottomNav />
    </div>
  );
}
