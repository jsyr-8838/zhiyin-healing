'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import { fmtTime } from '@/hooks/useTimer';
import { Play, Pause, RotateCcw, Volume2, Clock, Sparkles, Music } from 'lucide-react';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XIUWEI_GAINS, type WuxingElement } from '@/lib/cultivation-engine';
import { getClientUserId } from '@/lib/auth';

/* ================================================================
 *  推拿引导 · 渐进放松版
 *  融合中医自我推拿手法 + 渐进肌肉放松(PMR)框架
 *  银河系背景 + 金色能量粒子 + 语音引导计时器
 * ================================================================ */

// ===== 身体区域与推拿手法 =====
type BodyRegion = 'head' | 'neck' | 'chest' | 'abdomen' | 'back' | 'arms' | 'legs';

const BODY_REGIONS: { id: BodyRegion; name: string; icon: string; color: string; techniques: Technique[] }[] = [
  {
    id: 'head', name: '头面', icon: '首', color: '#E74C3C',
    techniques: [
      { name: '按揉太阳', desc: '双手拇指按揉太阳穴，余四指扶头', duration: 30, element: '火', organ: '心' },
      { name: '抹额明目', desc: '双手拇指从眉心向两侧分抹至太阳穴', duration: 25, element: '木', organ: '肝' },
      { name: '指压百会', desc: '中指定点按压百会穴，意念下行', duration: 20, element: '火', organ: '心' },
      { name: '搓揉面部', desc: '双手搓热后自下而上搓揉面颊', duration: 30, element: '土', organ: '脾' },
    ],
  },
  {
    id: 'neck', name: '颈肩', icon: '颈', color: '#27AE60',
    techniques: [
      { name: '拿揉风池', desc: '拇指与食指拿揉风池穴及颈后肌群', duration: 30, element: '木', organ: '肝' },
      { name: '滚揉肩井', desc: '对侧手滚揉肩井穴及斜方肌上束', duration: 30, element: '金', organ: '肺' },
      { name: '推桥弓', desc: '拇指沿胸锁乳突肌自上而下推', duration: 25, element: '水', organ: '肾' },
      { name: '摇颈拔伸', desc: '双手托下颌，缓慢向上拔伸颈椎', duration: 20, element: '木', organ: '肝' },
    ],
  },
  {
    id: 'chest', name: '胸胁', icon: '胸', color: '#C0392B',
    techniques: [
      { name: '宽胸理气', desc: '双手掌自胸骨向两侧分推至腋中线', duration: 30, element: '火', organ: '心' },
      { name: '按揉膻中', desc: '中指按揉膻中穴，呼气时加力', duration: 25, element: '火', organ: '心' },
      { name: '擦胁疏肝', desc: '双手掌沿两胁自上而下快速擦动', duration: 25, element: '木', organ: '肝' },
    ],
  },
  {
    id: 'abdomen', name: '腹', icon: '腹', color: '#F39C12',
    techniques: [
      { name: '摩腹健脾', desc: '掌心贴脐，顺时针摩腹36圈', duration: 40, element: '土', organ: '脾' },
      { name: '按揉中脘', desc: '中指按揉中脘穴，配合深呼吸', duration: 25, element: '土', organ: '脾' },
      { name: '推擦带脉', desc: '双手沿带脉自后向前推擦至腹部', duration: 25, element: '土', organ: '脾' },
      { name: '点按天枢', desc: '双手食指同时点按双侧天枢穴', duration: 20, element: '土', organ: '脾' },
    ],
  },
  {
    id: 'back', name: '腰背', icon: '背', color: '#3498DB',
    techniques: [
      { name: '擦肾俞', desc: '双手掌快速擦肾俞至发热为度', duration: 30, element: '水', organ: '肾' },
      { name: '按揉命门', desc: '拇指按揉命门穴，意守丹田', duration: 25, element: '水', organ: '肾' },
      { name: '拍打腰背', desc: '虚掌自上而下拍打腰背两侧膀胱经', duration: 30, element: '水', organ: '肾' },
    ],
  },
  {
    id: 'arms', name: '上肢', icon: '臂', color: '#9B59B6',
    techniques: [
      { name: '拿揉上肢', desc: '对侧手拿揉自肩至腕整条手臂', duration: 30, element: '金', organ: '肺' },
      { name: '按揉合谷', desc: '拇指用力按揉合谷穴至酸胀', duration: 20, element: '金', organ: '肺' },
      { name: '捻揉十指', desc: '拇指食指逐一捻揉十指关节', duration: 30, element: '火', organ: '心' },
    ],
  },
  {
    id: 'legs', name: '下肢', icon: '足', color: '#1ABC9C',
    techniques: [
      { name: '按揉足三里', desc: '拇指按揉足三里穴至酸胀得气', duration: 25, element: '土', organ: '脾' },
      { name: '拿揉小腿', desc: '双手拿揉小腿腓肠肌自上而下', duration: 30, element: '水', organ: '肾' },
      { name: '擦涌泉', desc: '掌心擦涌泉穴至足底发热', duration: 30, element: '水', organ: '肾' },
      { name: '搓揉膝盖', desc: '双手搓揉膝关节及周围韧带', duration: 25, element: '土', organ: '脾' },
    ],
  },
];

interface Technique {
  name: string;
  desc: string;
  duration: number; // seconds
  element: string;
  organ: string;
}

// ===== 预设推拿方案 =====
const TUINA_PRESETS = [
  { name: '全身放松', icon: '全', desc: '头→颈→胸→腹→背→臂→腿', regions: ['head', 'neck', 'chest', 'abdomen', 'back', 'arms', 'legs'] as BodyRegion[], color: '#8E44AD' },
  { name: '疏肝理气', icon: '木', desc: '头面+颈肩+胸胁', regions: ['head', 'neck', 'chest'] as BodyRegion[], color: '#27AE60' },
  { name: '健脾和胃', icon: '土', desc: '腹+下肢', regions: ['abdomen', 'legs'] as BodyRegion[], color: '#F39C12' },
  { name: '强腰固肾', icon: '水', desc: '腰背+下肢', regions: ['back', 'legs'] as BodyRegion[], color: '#3498DB' },
  { name: '安神助眠', icon: '月', desc: '头面+腹+足', regions: ['head', 'abdomen', 'legs'] as BodyRegion[], color: '#2C3E50' },
  { name: '办公室速疗', icon: '速', desc: '头面+颈肩+上肢', regions: ['head', 'neck', 'arms'] as BodyRegion[], color: '#E67E22' },
];

// ===== 语音合成 =====
function speakSlow(text: string, rate = 0.55, pitch = 0.85) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = rate;
  u.pitch = pitch;
  u.volume = 0.9;
  speechSynthesis.speak(u);
}

// ===== 主组件 =====
export default function TuinaGuidePage() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<BodyRegion[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTechIdx, setCurrentTechIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRegionIdx, setCurrentRegionIdx] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // 构建手法队列
  const techniqueQueue = useRef<{ region: BodyRegion; regionName: string; tech: Technique }[]>([]);

  // 推拿完成 → 记录修为（按手法中占比最高的五行元素）
  const recordTuinaGain = useCallback(() => {
    try {
      const queue = techniqueQueue.current;
      if (queue.length === 0) return;
      const elCount: Record<string, number> = {};
      for (const entry of queue) {
        const elMap: Record<string, WuxingElement> = {
          木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water',
        };
        const el = elMap[entry.tech.element];
        if (el) elCount[el] = (elCount[el] || 0) + 1;
      }
      const dominant = (Object.entries(elCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'earth') as WuxingElement;
      const gain = XIUWEI_GAINS.moxa_complete;
      useCultivationStore.getState().addXiuWei(dominant, gain);
      useCultivationStore.getState().recordPractice('tuina', Math.round(queue.reduce((s, e) => s + e.tech.duration, 0)), dominant, gain);
      useCultivationStore.getState().completeTodayStep('tuina');
      // 异步写入 DB
      fetch('/api/cultivation/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getClientUserId(),
          category: 'tuina',
          subCategory: 'tuina-guide',
          element: dominant,
          durationSec: Math.round(queue.reduce((s, e) => s + e.tech.duration, 0)),
        }),
      }).catch(() => {});
    } catch {}
  }, []);

  const buildQueue = useCallback((regions: BodyRegion[]) => {
    const queue: { region: BodyRegion; regionName: string; tech: Technique }[] = [];
    for (const regionId of regions) {
      const region = BODY_REGIONS.find(r => r.id === regionId);
      if (region) {
        for (const tech of region.techniques) {
          queue.push({ region: region.id, regionName: region.name, tech });
        }
      }
    }
    return queue;
  }, []);

  // 开始练习
  const startPractice = useCallback((regions: BodyRegion[]) => {
    // 停止现有
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsPlaying(false);
    setIsPaused(false);

    const queue = buildQueue(regions);
    if (queue.length === 0) return;
    techniqueQueue.current = queue;
    setSelectedRegions(regions);
    setCurrentRegionIdx(0);
    setCurrentTechIdx(0);
    setTimeLeft(queue[0].tech.duration);
    setIsPlaying(true);

    // 开场语音
    speakSlow(`推拿引导即将开始，共${queue.length}个手法，请找到舒适的坐姿或卧姿。`);

    // 启动计时
    let techIdx = 0;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 进入下一个手法
          techIdx++;
          if (techIdx >= queue.length) {
            // 完成
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            setIsPlaying(false);
            recordTuinaGain();
            speakSlow('推拿引导全部完成，愿您身心安泰。');
            return 0;
          }
          const nextTech = queue[techIdx];
          setCurrentTechIdx(techIdx);
          setCurrentRegionIdx(regions.indexOf(nextTech.region));
          // 手法切换语音
          speakSlow(`${nextTech.tech.name}，${nextTech.tech.desc}`);
          return nextTech.tech.duration;
        }
        return prev - 1;
      });
    }, 1000);

    // 语音播报第一个手法
    setTimeout(() => {
      speakSlow(`${queue[0].tech.name}，${queue[0].tech.desc}`);
    }, 3000);
  }, [buildQueue, recordTuinaGain]);

  // 暂停/继续
  const togglePause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      setIsPaused(true);
      speechSynthesis.cancel();
    }
  }, [isPaused]);

  // 停止
  const stopPractice = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsPlaying(false);
    setIsPaused(false);
    speechSynthesis.cancel();
  }, []);

  // 预设点击
  const applyPreset = useCallback((preset: typeof TUINA_PRESETS[number]) => {
    setSelectedPreset(preset.name);
    startPractice(preset.regions);
  }, [startPractice]);

  // 选中区域手动开始
  const manualStart = useCallback(() => {
    if (selectedRegions.length === 0) return;
    startPractice(selectedRegions);
  }, [selectedRegions, startPractice]);

  // 切换区域选择
  const toggleRegion = useCallback((regionId: BodyRegion) => {
    if (isPlaying) return;
    setSelectedRegions(prev =>
      prev.includes(regionId) ? prev.filter(r => r !== regionId) : [...prev, regionId]
    );
    setSelectedPreset(null);
  }, [isPlaying]);

  // 手法倒计时效果 - 暂停时冻结
  useEffect(() => {
    if (isPaused && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    } else if (!isPaused && isPlaying && !timerRef.current) {
      // 恢复后重启计时器
      const queue = techniqueQueue.current;
      let techIdx = currentTechIdx;
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            techIdx++;
            if (techIdx >= queue.length) {
              if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
              setIsPlaying(false);
              recordTuinaGain();
              speakSlow('推拿引导全部完成，愿您身心安泰。');
              return 0;
            }
            const nextTech = queue[techIdx];
            setCurrentTechIdx(techIdx);
            setCurrentRegionIdx(selectedRegions.indexOf(nextTech.region));
            speakSlow(`${nextTech.tech.name}，${nextTech.tech.desc}`);
            return nextTech.tech.duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isPaused, isPlaying, currentTechIdx, selectedRegions, recordTuinaGain]);

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      speechSynthesis.cancel();
    };
  }, []);

  // 当前手法
  const currentEntry = isPlaying ? techniqueQueue.current[currentTechIdx] : null;
  const progress = currentEntry ? 1 - (timeLeft / currentEntry.tech.duration) : 0;

  // ===== Canvas 银河背景（简化版 - 无音频分析） =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const starCount = 200;
    const stars: { x: number; y: number; r: number; brightness: number; twinkleSpeed: number; twinklePhase: number }[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.2 + 0.3,
        brightness: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 1.5 + 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    const nebulaCenters = [
      { x: 0.3, y: 0.35, hue: 260, spread: 0.2 },
      { x: 0.7, y: 0.65, hue: 30, spread: 0.15 },
    ];

    let frameCount = 0;

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      frameCount++;
      const w = canvas!.getBoundingClientRect().width;
      const h = canvas!.getBoundingClientRect().height;
      const time = frameCount * 0.005;

      // 深空背景
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7);
      bgGrad.addColorStop(0, '#0c0a1a');
      bgGrad.addColorStop(0.4, '#080614');
      bgGrad.addColorStop(1, '#03020a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 星云
      for (const nb of nebulaCenters) {
        const cx = nb.x * w; const cy = nb.y * h;
        const radius = nb.spread * w;
        const nebulaGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        nebulaGrad.addColorStop(0, `hsla(${nb.hue}, 60%, 40%, 0.06)`);
        nebulaGrad.addColorStop(0.5, `hsla(${nb.hue}, 50%, 25%, 0.02)`);
        nebulaGrad.addColorStop(1, `hsla(${nb.hue}, 40%, 10%, 0)`);
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      }

      // 旋臂
      ctx.save();
      ctx.translate(w * 0.5, h * 0.5);
      ctx.rotate(time * 0.3);
      ctx.globalAlpha = 0.03;
      ctx.strokeStyle = '#8B7355';
      ctx.lineWidth = 1.5;
      for (let arm = 0; arm < 2; arm++) {
        ctx.beginPath();
        for (let t = 0; t < 6; t += 0.05) {
          const r = t * Math.min(w, h) * 0.08;
          const angle = t * 1.2 + arm * Math.PI;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r * 0.35 + arm * 8 - 4;
          if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // 星星
      for (const s of stars) {
        const twinkle = Math.sin(frameCount * 0.02 * s.twinkleSpeed + s.twinklePhase);
        const alpha = s.brightness * (0.5 + twinkle * 0.3);
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 215, 240, ${alpha})`;
        ctx.fill();
      }

      // 如果正在练习，画进度环
      if (isPlaying && currentEntry) {
        const cx = w / 2; const cy = h / 2;
        const radius = Math.min(w, h) * 0.3;

        // 背景环
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(196, 163, 90, 0.1)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 进度环
        ctx.beginPath();
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        const regionColor = BODY_REGIONS.find(r => r.id === currentEntry.region)?.color || '#C4A35A';
        ctx.strokeStyle = regionColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 内圈发光
        const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius);
        glow.addColorStop(0, `rgba(196, 163, 90, ${0.02 + progress * 0.05})`);
        glow.addColorStop(1, 'rgba(196, 163, 90, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    draw();

    // Canvas resize
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, progress, currentEntry]);

  return (
    <PageContainer theme="healing">
      <HealingHeader
        title="推拿导引"
        subtitle="经络推拿 · 穴位按摩 · 五行配伍"
        dark
        rightSlot={<Music size={20} className="text-white/40" />}
      />

      {/* Canvas 银河背景 + 进度环 */}
      <div className="relative" style={{ height: 200, background: '#03020a' }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {/* 中心信息 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {isPlaying && currentEntry ? (
              <>
                <div className="text-2xl font-black text-white/90">{currentEntry.tech.name}</div>
                <div className="text-3xl font-mono tabular-nums mt-1" style={{ color: BODY_REGIONS.find(r => r.id === currentEntry.region)?.color || '#C4A35A' }}>
                  {timeLeft}s
                </div>
                <div className="text-[10px] text-white/40 mt-1">{currentEntry.regionName} · {currentEntry.tech.element}·{currentEntry.tech.organ}</div>
              </>
            ) : (
              <div className="text-lg text-white/30">选择方案后开始引导</div>
            )}
          </div>
        </div>
        {/* 手法进度 */}
        {isPlaying && (
          <div className="absolute left-3 bottom-3 text-[10px] text-white/50">
            手法 {currentTechIdx + 1}/{techniqueQueue.current.length}
          </div>
        )}
        {/* 控制按钮 */}
        {isPlaying && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button onClick={togglePause} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
              {isPaused ? <Play size={16} className="text-white/80" /> : <Pause size={16} className="text-white/80" />}
            </button>
            <button onClick={stopPractice} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
              <RotateCcw size={16} className="text-red-300" />
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28" style={{ background: 'linear-gradient(170deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)' }}>

        {/* 预设方案 */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: '#8B2500' }} />
            <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>推拿方案</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TUINA_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                disabled={isPlaying}
                className="rounded-xl p-3 border text-center transition hover:shadow-md active:scale-95 disabled:opacity-50"
                style={{
                  background: selectedPreset === preset.name ? preset.color + '15' : '#FDF8F0',
                  borderColor: selectedPreset === preset.name ? preset.color : '#EDE4D3',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-sm font-black"
                  style={{ backgroundColor: preset.color + '18', border: `2px solid ${preset.color}`, color: preset.color }}
                >
                  {preset.icon}
                </div>
                <div className="text-xs font-bold" style={{ color: '#2C1810' }}>{preset.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 区域选择 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>选择部位</h3>
          <div className="flex flex-wrap gap-2">
            {BODY_REGIONS.map((region) => {
              const selected = selectedRegions.includes(region.id);
              return (
                <button
                  key={region.id}
                  onClick={() => toggleRegion(region.id)}
                  disabled={isPlaying}
                  className="px-4 py-2.5 rounded-lg border text-xs transition hover:shadow-sm active:scale-95 disabled:opacity-50"
                  style={{
                    background: selected ? region.color + '15' : '#FDF8F0',
                    borderColor: selected ? region.color : '#EDE4D3',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black" style={{ color: selected ? region.color : '#8B7355' }}>{region.icon}</span>
                    <span className="font-bold" style={{ color: selected ? region.color : '#2C1810' }}>{region.name}</span>
                    <span className="text-[10px]" style={{ color: '#8B7355' }}>{region.techniques.length}法</span>
                  </div>
                </button>
              );
            })}
          </div>
          {!isPlaying && selectedRegions.length > 0 && !selectedPreset && (
            <button
              onClick={manualStart}
              className="mt-3 w-full py-3 rounded-xl font-bold text-sm text-white transition active:scale-95"
              style={{ background: 'linear-gradient(135deg, #8B2500, #C4A35A)' }}
            >
              开始引导 ({buildQueue(selectedRegions).length}个手法)
            </button>
          )}
        </div>

        {/* 当前手法详情 */}
        {isPlaying && currentEntry && (
          <div className="mb-5 rounded-xl p-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                style={{ backgroundColor: (BODY_REGIONS.find(r => r.id === currentEntry.region)?.color || '#C4A35A') + '18',
                  border: `2px solid ${BODY_REGIONS.find(r => r.id === currentEntry.region)?.color || '#C4A35A'}`,
                  color: BODY_REGIONS.find(r => r.id === currentEntry.region)?.color || '#C4A35A' }}>
                {currentEntry.regionName}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: '#2C1810' }}>{currentEntry.tech.name}</div>
                <div className="text-[10px]" style={{ color: '#8B7355' }}>{currentEntry.tech.element}·{currentEntry.tech.organ}</div>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>{currentEntry.tech.desc}</p>
          </div>
        )}

        {/* 手法队列预览 */}
        {isPlaying && techniqueQueue.current.length > 0 && (
          <div className="mb-5">
            <h3 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>手法流程</h3>
            <div className="space-y-1.5">
              {techniqueQueue.current.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: idx === currentTechIdx ? '#C4A35A15' : 'transparent',
                    borderLeft: idx === currentTechIdx ? '3px solid #C4A35A' : '3px solid transparent',
                  }}
                >
                  <span style={{ color: idx === currentTechIdx ? '#C4A35A' : '#8B7355', fontWeight: idx === currentTechIdx ? 700 : 400 }}>
                    {idx + 1}.
                  </span>
                  <span style={{ color: idx === currentTechIdx ? '#2C1810' : '#5C3015', fontWeight: idx === currentTechIdx ? 700 : 400 }}>
                    {entry.tech.name}
                  </span>
                  <span style={{ color: '#8B7355', marginLeft: 'auto' }}>{entry.tech.duration}s</span>
                  {idx < currentTechIdx && <span style={{ color: '#27AE60' }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 推拿原理 */}
        <div className="rounded-xl p-4 mb-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
          <h4 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>推拿引导原理</h4>
          <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
            推拿引导融合中医自我推拿手法与渐进肌肉放松(PMR)框架，每个手法配有语音引导和倒计时。
            《黄帝内经》云："按之则热气至，热气至则痛止矣。" 自我推拿通过按揉经穴、摩擦皮部、
            拿捏筋脉，疏通经络、行气活血、调和脏腑。建议每日早晚各练习一次，
            每个手法以得气（酸胀温热感）为度，循序渐进，持之以恒。
          </p>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
