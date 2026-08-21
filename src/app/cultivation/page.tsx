'use client';

import { useState, useEffect, useCallback } from 'react';
import BottomNav from '@/components/BottomNav';
import CultivationTree from '@/components/cultivation/CultivationTree';
import XiuWeiOverview from '@/components/cultivation/XiuWeiOverview';
import RankDisplay from '@/components/cultivation/RankDisplay';
import MeridianMap from '@/components/cultivation/MeridianMap';
import DailyPracticeCard from '@/components/cultivation/DailyPracticeCard';
import { useCultivationStore } from '@/lib/cultivation-store';
import { getClientUserId } from '@/lib/auth';
import { ArrowLeft, RefreshCw, TrendingUp, Clock, Flame } from 'lucide-react';
import Link from 'next/link';

type Tab = 'tree' | 'rank' | 'meridian';

export default function CultivationPage() {
  const [tab, setTab] = useState<Tab>('tree');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const { syncFromDB, totalPractices, totalMinutes, streakDays } = useCultivationStore();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tree', label: '修为树' },
    { key: 'rank', label: '段位' },
    { key: 'meridian', label: '经络图' },
  ];

  // ═══ 深度集成：从 DB 拉取修为数据并同步到本地 store ═══
  const syncFromDBData = useCallback(async () => {
    try {
      setSyncing(true);
      const res = await fetch(`/api/cultivation?userId=${getClientUserId()}`);
      if (res.ok) {
        const data = await res.json();
        const cultivation = data.cultivation;
        if (cultivation) {
          // 将 DB 数据映射到本地 store
          const meridianProgs = (data.meridianProgress || []).map((m: any) => ({
            meridianId: m.meridianId || m.id,
            meridianName: m.meridianName || m.name || '',
            element: m.element || 'earth',
            completion: m.completion ?? 0,
            isCompleted: !!m.isCompleted,
          }));
          syncFromDB({
            xiuwei: {
              wood: cultivation.woodXiuWei ?? 0,
              fire: cultivation.fireXiuWei ?? 0,
              earth: cultivation.earthXiuWei ?? 0,
              metal: cultivation.metalXiuWei ?? 0,
              water: cultivation.waterXiuWei ?? 0,
            },
            rankIndex: cultivation.rank ?? 0,
            rankTitle: cultivation.rankTitle ?? '闻道者',
            totalPractices: cultivation.totalPractices ?? 0,
            totalMinutes: cultivation.totalMinutes ?? 0,
            streakDays: data.streakDays ?? cultivation.streakDays ?? 0,
            lastPracticeDate: cultivation.lastPracticeAt || '',
            meridianProgs,
            diagnosisCount: cultivation.diagnosisCount ?? 0,
          });
          setSyncMsg('已同步云端修行数据');
        }
      }
    } catch {
      // 网络失败静默，使用本地数据
    } finally {
      setSyncing(false);
    }
  }, [syncFromDB]);

  // 进入页面时自动同步
  useEffect(() => {
    syncFromDBData();
  }, [syncFromDBData]);

  return (
    <div className="min-h-screen pb-24 bg-home texture-paper texture-ink-wash">
      {/* 头部 */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(30,45,38,0.05)' }}>
            <ArrowLeft size={18} style={{ color: 'var(--ink-main)' }} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black" style={{ color: 'var(--ink-main)' }}>五行修为</h1>
            <p className="text-xs" style={{ color: 'var(--ink-light)' }}>日日不辍，功到自成</p>
          </div>
          {/* 同步按钮 */}
          <button
            onClick={syncFromDBData}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(30,45,38,0.05)', color: 'var(--ink-light)' }}
            title="同步云端数据"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* 修行数据速览 */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <div className="flex items-center justify-center gap-1 mb-1" style={{ color: 'var(--wood)' }}>
              <Flame size={13} />
              <span className="text-lg font-black tabular-nums" style={{ color: 'var(--ink-main)' }}>{streakDays}</span>
            </div>
            <p className="text-[9px]" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>连续天数</p>
          </div>
          <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <div className="flex items-center justify-center gap-1 mb-1" style={{ color: 'var(--earth)' }}>
              <TrendingUp size={13} />
              <span className="text-lg font-black tabular-nums" style={{ color: 'var(--ink-main)' }}>{totalPractices}</span>
            </div>
            <p className="text-[9px]" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>累计功法</p>
          </div>
          <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <div className="flex items-center justify-center gap-1 mb-1" style={{ color: 'var(--water)' }}>
              <Clock size={13} />
              <span className="text-lg font-black tabular-nums" style={{ color: 'var(--ink-main)' }}>{totalMinutes}</span>
            </div>
            <p className="text-[9px]" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>累计分钟</p>
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

        {syncMsg && (
          <p className="text-[9px] mt-2 text-center" style={{ color: 'var(--wood)' }}>{syncMsg}</p>
        )}
      </div>

      {/* 内容区 */}
      <div className="px-4 space-y-5">
        {/* 今日功法 — 修行主干，每天回来练习的理由 */}
        <DailyPracticeCard />

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