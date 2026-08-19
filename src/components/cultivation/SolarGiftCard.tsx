'use client';

import { useState, useEffect } from 'react';
import { getCurrentSolarTerm } from '@/lib/solar-terms-data';
import { ELEMENT_COLORS, ELEMENT_NAMES, type WuxingElement } from '@/lib/cultivation-engine';
import { Sparkles, Gift, Leaf } from 'lucide-react';

const GIFT_KEY = 'heytcm-solar-gift';

/** 节气礼遇类型 */
interface SolarGift {
  termName: string;
  element: WuxingElement;
  title: string;
  blessing: string;     // 祝福语
  practice: string;     // 推荐功法
  food: string;          // 推荐饮食
  href: string;          // 跳转链接
}

/** 节气 → 礼遇映射 */
const TERM_GIFTS: Record<string, Omit<SolarGift, 'termName'>> = {
  '立春': { element: 'wood', title: '春生万物', blessing: '东风解冻，蛰虫始振。宜疏肝理气，顺应春生。', practice: '嘘字诀 · 角音疗愈', food: '春笋、菠菜、枸杞', href: '/healing/liuzijue' },
  '雨水': { element: 'wood', title: '润物无声', blessing: '春雨润泽，草木萌动。宜养肝护脾，温和调理。', practice: '呼字诀 · 宫音和胃', food: '山药、红枣、小米', href: '/healing/liuzijue' },
  '惊蛰': { element: 'wood', title: '雷动风行', blessing: '春雷惊蛰，万物舒展。宜疏泄肝气，活动筋骨。', practice: '嘘字诀 · 角音疏肝', food: '芹菜、梨、菊花茶', href: '/healing/liuzijue' },
  '春分': { element: 'wood', title: '阴阳相半', blessing: '昼夜均分，寒暑平。宜调和阴阳，疏肝健脾。', practice: '嘘字诀 · 角音疗愈', food: '荠菜、香椿、蜂蜜', href: '/healing/liuzijue' },
  '清明': { element: 'wood', title: '天清地明', blessing: '气清景明，万物皆显。宜踏青养肝，舒畅情志。', practice: '角音疗愈 · 经络导引', food: '荠菜、桑葚、绿茶', href: '/healing/wuyin' },
  '谷雨': { element: 'wood', title: '雨生百谷', blessing: '雨润百谷，春将归。宜健脾祛湿，承春启夏。', practice: '呼字诀 · 宫音健脾', food: '薏米、红豆、茯苓', href: '/healing/liuzijue' },
  '立夏': { element: 'fire', title: '夏长之道', blessing: '夏日初长，心火渐旺。宜养心安神，清补为主。', practice: '呵字诀 · 徵音养心', food: '苦瓜、绿豆、莲子', href: '/healing/liuzijue' },
  '小满': { element: 'fire', title: '小得盈满', blessing: '物至于此小得盈满。宜清心降火，适度劳作。', practice: '呵字诀 · 徵音清心', food: '黄瓜、西瓜、菊花', href: '/healing/liuzijue' },
  '芒种': { element: 'fire', title: '芒种忙种', blessing: '有芒之谷可种。宜养心清热，不贪凉饮冷。', practice: '呵字诀 · 知音之境', food: '酸梅汤、荷叶粥', href: '/healing/zhi-yin-zhi-jing' },
  '夏至': { element: 'fire', title: '日长至极', blessing: '日长之至，阳气极盛。宜养心固肾，阴生阳消。', practice: '呵字诀 · 徵音安神', food: '绿豆汤、莲子心茶', href: '/healing/liuzijue' },
  '小暑': { element: 'fire', title: '温风渐至', blessing: '温风至，蟋蟀居壁。宜静心养神，避暑防湿。', practice: '知音之境 · 雨夜', food: '莲藕、冬瓜、薄荷', href: '/healing/zhi-yin-zhi-jing' },
  '大暑': { element: 'earth', title: '暑气至极', blessing: '暑气极盛，湿土当令。宜清热祛湿，养护脾胃。', practice: '呼字诀 · 宫音健脾', food: '薏仁、山药、扁豆', href: '/healing/liuzijue' },
  '立秋': { element: 'metal', title: '秋收之始', blessing: '凉风至，白露降。宜润肺养阴，收敛神气。', practice: '呬字诀 · 商音润肺', food: '梨、百合、银耳', href: '/healing/liuzijue' },
  '处暑': { element: 'metal', title: '暑退凉生', blessing: '暑气渐消，秋意渐浓。宜清肺润燥，安神定志。', practice: '呬字诀 · 商音清肺', food: '秋梨、蜂蜜、芝麻', href: '/healing/liuzijue' },
  '白露': { element: 'metal', title: '露凝为白', blessing: '阴气渐重，露凝为白。宜润肺防燥，养阴益气。', practice: '商音疗愈 · 经络导引', food: '雪梨、银耳、龙眼', href: '/healing/wuyin' },
  '秋分': { element: 'metal', title: '昼夜均分', blessing: '阴阳相半，秋高气爽。宜平衡阴阳，润燥养肺。', practice: '呬字诀 · 商音润肺', food: '秋梨膏、百合、莲藕', href: '/healing/liuzijue' },
  '寒露': { element: 'metal', title: '露寒将凝', blessing: '寒露凝霜，凉意渐深。宜温肺散寒，养阴润燥。', practice: '呬字诀 · 知音之境', food: '板栗、核桃、红枣', href: '/healing/zhi-yin-zhi-jing' },
  '霜降': { element: 'earth', title: '霜降气肃', blessing: '气肃而凝，露结为霜。宜补脾养胃，为冬藏备。', practice: '呼字诀 · 宫音补脾', food: '山药、南瓜、红枣', href: '/healing/liuzijue' },
  '立冬': { element: 'water', title: '冬藏之始', blessing: '水始冰，地始冻。宜养藏固肾，温补阳气。', practice: '吹字诀 · 羽音固肾', food: '羊肉、黑豆、核桃', href: '/healing/liuzijue' },
  '小雪': { element: 'water', title: '闭塞成冬', blessing: '虹藏不见，闭塞成冬。宜温肾固精，少食生冷。', practice: '吹字诀 · 羽音温肾', food: '黑芝麻、桂圆、栗子', href: '/healing/liuzijue' },
  '大雪': { element: 'water', title: '鹖鴠不鸣', blessing: '大雪纷飞，万物闭藏。宜温补肾阳，静养身心。', practice: '吹字诀 · 知音之境', food: '羊肉汤、黑米粥', href: '/healing/zhi-yin-zhi-jing' },
  '冬至': { element: 'water', title: '日短至极', blessing: '日短之至，阴极阳生。宜温补藏阳，冬至进补。', practice: '吹字诀 · 羽音养肾', food: '饺子、羊肉、汤圆', href: '/healing/liuzijue' },
  '小寒': { element: 'water', title: '寒气尚小', blessing: '寒尚小，未至极。宜补肾温阳，御寒养藏。', practice: '吹字诀 · 羽音暖阳', food: '腊八粥、生姜红枣', href: '/healing/liuzijue' },
  '大寒': { element: 'water', title: '寒至极点', blessing: '寒至极点，冬将尽。宜大补藏阳，迎春待发。', practice: '知音之境 · 篝火', food: '火锅、药膳、姜汤', href: '/healing/zhi-yin-zhi-jing' },
};

export default function SolarGiftCard() {
  const [opened, setOpened] = useState(false);
  const [gift, setGift] = useState<SolarGift | null>(null);

  const solarTerm = getCurrentSolarTerm();

  useEffect(() => {
    const giftData = TERM_GIFTS[solarTerm.name];
    if (giftData) {
      setGift({ ...giftData, termName: solarTerm.name });
    }
    // 检查今天是否已开过
    const today = new Date().toISOString().slice(0, 10);
    const lastOpened = localStorage.getItem(GIFT_KEY);
    if (lastOpened === today) setOpened(true);
  }, [solarTerm]);

  const handleOpen = () => {
    setOpened(true);
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(GIFT_KEY, today);
  };

  if (!gift) return null;

  const color = ELEMENT_COLORS[gift.element];

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: `linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.35))`,
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.6)',
      boxShadow: '0 8px 32px rgba(30,45,38,0.08)',
    }}>
      {!opened ? (
        /* 未开：展示礼遇封面 */
        <button onClick={handleOpen} className="w-full p-5 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
              <Gift size={18} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--ink-main)' }}>{gift.termName} · 节气礼遇</p>
              <p className="text-[10px]" style={{ color: 'var(--ink-light)' }}>{gift.title}</p>
            </div>
            <Sparkles size={16} style={{ color, marginLeft: 'auto' }} className="animate-pulse" />
          </div>
          <div className="text-center py-4">
            <p className="text-base font-bold" style={{ color }}>轻启礼遇</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--ink-light)' }}>获取当令节气专属养生建议</p>
          </div>
        </button>
      ) : (
        /* 已开：展示内容 */
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Leaf size={14} style={{ color }} />
            <span className="font-bold text-sm" style={{ color: 'var(--ink-main)' }}>{gift.termName} · {gift.title}</span>
          </div>
          <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--ink-light)' }}>{gift.blessing}</p>

          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}10`, color }}>功法</span>
              <span className="text-xs" style={{ color: 'var(--ink-main)' }}>{gift.practice}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}10`, color }}>食养</span>
              <span className="text-xs" style={{ color: 'var(--ink-main)' }}>{gift.food}</span>
            </div>
          </div>

          <a href={gift.href} className="block w-full py-2.5 rounded-xl text-center text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            开始今日功法
          </a>
        </div>
      )}
    </div>
  );
}
