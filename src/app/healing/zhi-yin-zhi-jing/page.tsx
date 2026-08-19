import type { Metadata } from 'next';
import HealingHeader from '@/components/layout/HealingHeader';
import BottomNav from '@/components/BottomNav';
import ZhiYinZhiJingClient from '@/components/zhi-yin-zhi-jing/ZhiYinZhiJingClient';

export const metadata: Metadata = {
  title: '知音之境 | 知音',
  description: '九境沉浸式口语疗愈解说：深海·雨夜·钟声·宇宙·山林·篝火·雪夜·月夜·晨雾，男士大师级自然引导，心率联动智能推荐，进入深层平静。',
};

export const viewport = {
  themeColor: '#11141a',
};

/**
 * 知音之境 — 沉浸式液态禅意冥想空间
 *
 * 移植自 FlowHaven（心流之境），更名知音之境。
 * 九境合一：深海 / 雨夜 / 钟声 / 宇宙 / 山林 / 篝火 / 雪夜 / 月夜 / 晨雾，
 * 每境配男士大师级口语疗愈解说。
 * 全屏沉浸体验，呼吸光球 + Web Audio 合成环境音 + Edge TTS 旁白。
 * 心率联动：检测 BPM 后智能推荐境；效果评估闭环：前后心情评分 + 会话追踪 + 情绪打卡联动。
 */
export default function ZhiYinZhiJingPage() {
  return (
    <>
      {/* 沉浸场景（fixed 全屏，最底层） */}
      <ZhiYinZhiJingClient />

      {/* 应用导航层（悬浮于场景之上，仅返回按钮可交互） */}
      <div className="relative z-[60] pointer-events-none">
        <div className="pointer-events-auto inline-block">
          <HealingHeader
            title="知音之境"
            subtitle="九境疗愈 · 沉浸解说"
            backHref="/healing"
            dark
          />
        </div>
      </div>

      <BottomNav />
    </>
  );
}
