'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import { fmtTime } from '@/hooks/useTimer';
import { useHealingRecommendation } from '@/hooks/useHealingRecommendation';
import {
  FlameKindling, Flame, Hand, Ear, Wind, RotateCcw, Check,
  CircleDot, Heart, Sparkles, ShieldCheck, Eye, Coffee, BookOpen,
} from 'lucide-react';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XIUWEI_GAINS, type WuxingElement } from '@/lib/cultivation-engine';
import { getClientUserId } from '@/lib/auth';

/* ================================================================
 *  灸疗疏导 · 静禅国灸十大操作流程
 *  中华第一灸，静禅国灸，十大操作流程全程引导
 *  1闻灸→2热敷→3响钟→4药油→5行钟→6摇钟→7定钟→8火灸→9灸感→10心法
 * ================================================================ */

type Phase = 'intro' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7' | 'step8' | 'step9' | 'step10' | 'complete';

interface StepData {
  id: Phase;
  num: number;
  title: string;
  subtitle: string;
  icon: typeof FlameKindling;
  color: string;
  /** 操作话术（引导师说的内容） */
  script: string[];
  /** 操作要点/注意事项 */
  tips: string[];
  /** 预估时长（秒） */
  duration: number;
  /** 属于哪一阶段：preparation / operation / completion */
  stage: 'preparation' | 'operation' | 'completion';
}

const STEPS: StepData[] = [
  {
    id: 'step1', num: 1, title: '闻灸', subtitle: '辨识药灸品质',
    icon: Wind, color: '#8B6914',
    script: [
      '您可以闻一下灸——是否可以闻到淡淡的中草药的味道？',
      '因为它是带"国"字号灸，也称之为药灸——它是由十几味中药，两味藏药，三年以上的黄金艾绒——根据君臣佐使的原理配伍而成。',
      '您可以看一下这是专属静禅国灸的防伪标识——它的效果是市面上普通艾灸的8.4倍。',
    ],
    tips: [
      '引导客人靠近灸条轻嗅，感受药香',
      '展示防伪标识增强信任',
      '重点说明：十几味中药+两味藏药+三年黄金艾绒，君臣佐使配伍',
    ],
    duration: 120, stage: 'preparation',
  },
  {
    id: 'step2', num: 2, title: '热敷药包', subtitle: '排出体表寒湿',
    icon: Coffee, color: '#B8860B',
    script: [
      '现在给你敷的是静禅国灸敷灸宝——这里面都是中药的种子，五谷的种子，艾草的种子——经过加热以后药效散发出来，被我们的皮肤所吸收，达到排出体表寒湿的效果——',
      '姐您感觉温度怎么样？',
    ],
    tips: [
      '将敷灸宝均匀热敷于顾客背部/肩颈/腹部',
      '中药种子经加热后药效透过皮肤吸收',
      '注意询问温度是否适宜，及时调整',
      '热敷时间约8-10分钟，让药效充分渗透',
      '排寒湿顺序：由上至下，由内至外',
    ],
    duration: 600, stage: 'preparation',
  },
  {
    id: 'step3', num: 3, title: '响钟', subtitle: '激活沉睡细胞·唤醒惰性细胞',
    icon: CircleDot, color: '#C4A35A',
    script: [
      '现在给您操作的工具是悬钟：采用无毒医用A类硅胶制作而成，婴儿奶嘴的材质，无明火、无酒精操作安全舒适——',
      '姐，力度是否合适？如果觉得轻重不合适我可以给您调节。',
    ],
    tips: [
      '悬钟材质：无毒医用A类硅胶（婴儿奶嘴同材质）',
      '操作安全：无明火、无酒精',
      '力度由轻到重，先轻叩后加重',
      '关注顾客反馈，随时调节力度',
      '响钟可沿经络走向叩击，激活穴位深层的沉睡细胞',
      '叩击频率均匀，节奏稳定',
    ],
    duration: 300, stage: 'operation',
  },
  {
    id: 'step4', num: 4, title: '药油', subtitle: '疏通经络·引药归经',
    icon: Hand, color: '#27AE60',
    script: [
      '现在给您推的是药油，疏通经络，引药归经——',
      '推脊柱、膀胱、肩颈，约10分钟左右。',
    ],
    tips: [
      '药油沿脊柱、膀胱经、肩颈方向推拿',
      '脊柱（督脉）：由下至上推，力度适中均匀',
      '膀胱经：先推左侧（行气），再推右侧（行血），气推血行',
      '肩颈：以掌根推揉，松解斜方肌和肩胛提肌',
      '药油推按手法：掌推、掌揉、拇指点按交替',
      '速度不宜过快，让药油充分渗入经络',
      '推按过程中关注顾客呼吸节奏，配合深呼气时施力',
    ],
    duration: 600, stage: 'operation',
  },
  {
    id: 'step5', num: 5, title: '行钟', subtitle: '排出经络层毒素',
    icon: CircleDot, color: '#8B4513',
    script: [
      '首先操作的是督脉，督脉是我们的阳气之海——也是男人的龙脉，女人的凤骨——哪里越痛，说明我们相对应的部位经络越淤堵。痛则不通，通则不痛。',
      '膀胱经是我们人体最大的一条代谢通道，左行气右行血，气推血行，所以我会先推您左侧膀胱经再推右侧膀胱经。',
      '现在疏通的是肩胛骨缝——肩胛骨缝最容易受凉、劳损、粘连——不通会引起肩颈问题，同时会影响睡眠——姐，我给您操作的部位是不是挺舒服的啊？',
      '我们的悬钟它可以走到火罐气罐走不到的地方，舒适度非常好的。',
    ],
    tips: [
      '督脉：沿脊柱由下至上推行钟，疏通阳气之海',
      '膀胱经：先左后右，左行气右行血，气推血行',
      '肩胛骨缝：重点疏通，此处最易受凉、劳损、粘连',
      '行钟力度适中，沿经络走行方向推动',
      '痛则不通——疼痛处重点停留，渐进加力',
      '悬钟优势：可到达火罐气罐无法触及的深层经络',
    ],
    duration: 600, stage: 'operation',
  },
  {
    id: 'step6', num: 6, title: '摇钟', subtitle: '剥离粘连组织',
    icon: Hand, color: '#A0522D',
    script: [
      '现在操作的是摇钟，主要是剥离我们肩胛骨缝粘连的经络。',
    ],
    tips: [
      '摇钟手法：沿肩胛骨缝做横向摇拨动作',
      '先做单侧，做完后让顾客活动一下两侧的肩颈',
      '引导顾客感受操作效果——姐做过的这一侧是否轻松？',
      '然后再做另一侧',
      '两侧同时做完后让顾客活动两侧肩颈——问她是否还有发紧的地方',
      '如有发紧处，做定点加强摇拨',
      '摇拨力度由浅入深，逐步剥离粘连',
    ],
    duration: 600, stage: 'operation',
  },
  {
    id: 'step7', num: 7, title: '定钟', subtitle: '拔出体内毒素',
    icon: ShieldCheck, color: '#CD853F',
    script: [
      '现在操作的是定钟，主要就是拔出体内的毒素，我们会根据您的罐印和出痧的颜色，辨识体质，对症搭配穴位。',
    ],
    tips: [
      '定钟（留罐）：主要定膀胱经、肩胛骨、大板经、疼痛部位',
      '定3-5分钟，盖好被子别着凉了',
      '观察罐印颜色辨识体质：',
      '  · 紫黑色——寒凝血瘀',
      '  · 鲜红色——热证',
      '  · 水珠/水泡——湿气重',
      '  · 淡白色——气血虚',
      '  · 红紫色——气滞血瘀',
      '根据罐印对症搭配穴位，精准调理',
    ],
    duration: 360, stage: 'operation',
  },
  {
    id: 'step8', num: 8, title: '病理火灸', subtitle: '点燃药灸·温通经脉',
    icon: Flame, color: '#E74C3C',
    script: [
      '姐，接下来我帮您去点药灸。',
      '姐，我现在开始给您放灸了——这个过程中您千万不要动，如果出现烫、痒或者水珠的现象，您一定要马上告诉我，我可以快速帮您调整，不是越烫越好，有任何不舒服的症状及时跟我说，我会一直在您身边陪伴你的！',
    ],
    tips: [
      '【安全第一】检查灸鼎铁丝网是否有，网是否有破的地方',
      '做灸过程中全程不能离人，房间必需要有人看护',
      '随时关注客人情况，做好灸中记录，引导灸感',
      '一定不能有裸露在外的皮肤，一定要把皮肤盖好',
      '所有灸鼎都用毛巾去固定好',
      '如顾客出现烫伤，责任到人，切记切记切记！',
      '灸的温度不是越烫越好，以顾客舒适为度',
    ],
    duration: 1200, stage: 'operation',
  },
  {
    id: 'step9', num: 9, title: '灸感沟通', subtitle: '讲解灸中反应和灸后反应',
    icon: Eye, color: '#5B9BD5',
    script: [
      '姐，我来给您讲一下灸中可能出现的反应和灸后的注意事项——',
      '灸中反应：出现温热感、传导感、酸麻胀痛，这些都是正常的灸感，说明气血在流通。',
      '灸后反应：灸后可能会口渴、排尿增多、排便增加——这些都是排病反应，是好事，说明身体正在排毒修复。',
      '灸后注意：多喝温水，不要碰冷水，不要吹空调，注意保暖，24小时内不要洗澡。',
    ],
    tips: [
      '灸中正常反应：温热、传导、酸麻胀痛——说明气血在流通',
      '灸后排病反应：口渴、多尿、排便增加——排毒修复',
      '灸后禁忌：多喝温水、不碰冷水、不吹空调、注意保暖',
      '24小时内不要洗澡（尤其是冷水澡）',
      '灸后饮食清淡，忌辛辣生冷',
    ],
    duration: 180, stage: 'completion',
  },
  {
    id: 'step10', num: 10, title: '国灸疗愈心法', subtitle: '以禅定之心·受灸之能量',
    icon: BookOpen, color: '#8B6914',
    script: [
      '姐姐，我们静禅国灸真正的文化是在禅字上，现在灸放在您身上了，我来给您做一个疗愈心法——',
      '现在，我请你跟随我的节奏，慢慢的深呼吸，',
      '吸气～吐气，吸气～吐气，',
      '来，慢慢的把头放下，把心放下，把臀放下，把腿放下，把五脏六腑都放下，',
      '用禅定的心态，安静的感受——',
      '灸给您带来的能量，让我们的每一个毛孔，和每一个细胞都完全的接受它。',
    ],
    tips: [
      '以非常缓慢的节奏和语速讲解心法',
      '可以让顾问来做这一步',
      '引导顾客深呼吸：吸气～吐气，反复3-5次',
      '引导放松：头、心、臀、腿、五脏六腑逐一放松',
      '让顾客安静感受灸的能量，每个毛孔和细胞都接受',
      '静待灸燃尽，全程陪伴',
      '心法核心：禅定——安住当下，静观灸火',
    ],
    duration: 300, stage: 'completion',
  },
];

// ===== 语音合成（慢速，适合引导） =====
function speakSlow(text: string, rate = 0.5, pitch = 0.85) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = rate;
  u.pitch = pitch;
  u.volume = 0.9;
  speechSynthesis.speak(u);
}

export default function GroundingPage() {
  const { hasDiagnosis, recommendedAcupoints, primaryConstitution } = useHealingRecommendation();
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [phaseStartTime, setPhaseStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = STEPS[currentStepIdx];

  // 完成疏导 → 记录修为（灸疗对应土行，火灸温通）
  const recordMoxaGain = useCallback(() => {
    try {
      const gain = XIUWEI_GAINS.moxa_complete;
      const el: WuxingElement = 'fire';
      useCultivationStore.getState().addXiuWei(el, gain);
      useCultivationStore.getState().recordPractice('moxa', Math.floor((Date.now() - phaseStartTime) / 1000), el, gain);
      useCultivationStore.getState().completeTodayStep('moxa');
      // 异步写入 DB
      fetch('/api/cultivation/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getClientUserId(),
          category: 'moxa',
          subCategory: 'grounding',
          element: el,
          durationSec: Math.floor((Date.now() - phaseStartTime) / 1000),
        }),
      }).catch(() => {});
    } catch {}
  }, [phaseStartTime]);

  // 开始疏导
  const startTherapy = useCallback(() => {
    setPhase('step1');
    setCurrentStepIdx(0);
    setScriptIdx(0);
    setPhaseStartTime(Date.now());
    setShowTips(false);
    speakSlow('今天您体验的是中华第一灸，静禅国灸。我们有十大操作流程，现在开始第一步——闻灸。');
  }, []);

  // 下一条话术
  const nextScript = useCallback(() => {
    if (!currentStep) return;
    if (scriptIdx < currentStep.script.length - 1) {
      const next = scriptIdx + 1;
      setScriptIdx(next);
      speakSlow(currentStep.script[next]);
    } else {
      // 当前步骤话术播完，进入下一步骤
      if (currentStepIdx < STEPS.length - 1) {
        const nextIdx = currentStepIdx + 1;
        setCurrentStepIdx(nextIdx);
        setScriptIdx(0);
        setPhase(STEPS[nextIdx].id);
        setShowTips(false);
        speakSlow(STEPS[nextIdx].script[0]);
      } else {
        // 全部完成
        setPhase('complete');
        recordMoxaGain();
        speakSlow('十大流程已全部完成。静禅国灸，以禅入灸，以灸养禅，愿您身心安泰。');
      }
    }
  }, [currentStep, scriptIdx, currentStepIdx, recordMoxaGain]);

  // 上一步
  const prevStep = useCallback(() => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      setScriptIdx(0);
      setPhase(STEPS[prevIdx].id);
      setShowTips(false);
      speakSlow(STEPS[prevIdx].script[0]);
    }
  }, [currentStepIdx]);

  // 重置
  const reset = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setPhase('intro');
    setCurrentStepIdx(0);
    setScriptIdx(0);
    setElapsed(0);
    setShowTips(false);
    speechSynthesis.cancel();
  }, []);

  // 计时器
  useEffect(() => {
    if (phase !== 'intro' && phase !== 'complete') {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - phaseStartTime) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [phase, phaseStartTime]);

  // Canvas 背景（温暖艾烟氛围）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // 烟雾粒子
    const particleCount = 60;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; life: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0.35 + Math.random() * 0.3, y: 0.7 + Math.random() * 0.3,
        vx: (Math.random() - 0.5) * 0.0003, vy: -0.0005 - Math.random() * 0.001,
        r: Math.random() * 8 + 3, alpha: Math.random() * 0.15 + 0.05, life: Math.random(),
      });
    }

    let frameCount = 0;

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      frameCount++;
      const w = canvas!.getBoundingClientRect().width;
      const h = canvas!.getBoundingClientRect().height;
      const time = frameCount * 0.005;

      // 温暖背景
      const bgGrad = ctx.createRadialGradient(w * 0.45, h * 0.7, 0, w * 0.5, h * 0.5, w * 0.8);
      bgGrad.addColorStop(0, '#1a0e04');
      bgGrad.addColorStop(0.5, '#120804');
      bgGrad.addColorStop(1, '#080402');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 艾烟粒子
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.001;
        if (p.life <= 0 || p.y < -0.1) {
          p.x = 0.35 + Math.random() * 0.3;
          p.y = 0.7 + Math.random() * 0.3;
          p.vx = (Math.random() - 0.5) * 0.0003;
          p.vy = -0.0005 - Math.random() * 0.001;
          p.life = 0.8 + Math.random() * 0.2;
          p.alpha = Math.random() * 0.15 + 0.05;
        }
        const glow = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, p.r * 2);
        const flicker = 0.8 + Math.sin(time * 2 + p.x * 100) * 0.2;
        glow.addColorStop(0, `rgba(196, 163, 90, ${p.alpha * flicker})`);
        glow.addColorStop(0.4, `rgba(196, 140, 60, ${p.alpha * flicker * 0.4})`);
        glow.addColorStop(1, 'rgba(196, 140, 60, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(p.x * w - p.r * 2, p.y * h - p.r * 2, p.r * 4, p.r * 4);
      }

      // 艾火微光
      const fireGlow = ctx.createRadialGradient(w * 0.5, h * 0.75, 0, w * 0.5, h * 0.75, 40);
      const pulse = 0.3 + Math.sin(time * 1.5) * 0.1 + Math.sin(time * 3.7) * 0.05;
      fireGlow.addColorStop(0, `rgba(230, 120, 30, ${pulse})`);
      fireGlow.addColorStop(0.3, `rgba(200, 100, 20, ${pulse * 0.5})`);
      fireGlow.addColorStop(1, 'rgba(200, 100, 20, 0)');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(w * 0.5 - 40, h * 0.75 - 40, 80, 80);

      // 步骤进度环
      if (phase !== 'intro' && phase !== 'complete' && currentStep) {
        const cx = w / 2;
        const cy = h * 0.4;
        const radius = Math.min(w, h) * 0.28;
        // 底环
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${currentStep.color}22`;
        ctx.lineWidth = 6;
        ctx.stroke();
        // 步骤进度
        const stepProgress = (currentStepIdx + (scriptIdx + 1) / currentStep.script.length) / STEPS.length;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + stepProgress * Math.PI * 2);
        ctx.strokeStyle = currentStep.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.lineCap = 'butt';
      }
    }
    draw();

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
  }, [phase, currentStep, currentStepIdx, scriptIdx]);

  // 阶段标签
  const stageLabel = (stage: string) => {
    if (stage === 'preparation') return '准备阶段';
    if (stage === 'operation') return '操作阶段';
    return '收尾阶段';
  };

  const stageColor = (stage: string) => {
    if (stage === 'preparation') return '#8B6914';
    if (stage === 'operation') return '#C4A35A';
    return '#5B9BD5';
  };

  return (
    <PageContainer theme="healing">
      <HealingHeader
        title="灸疗疏导"
        subtitle="静禅国灸 · 十大操作流程"
        dark
        rightSlot={phase !== 'intro' ? (
          <button onClick={reset} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
            <RotateCcw size={14} className="text-white/60" />
          </button>
        ) : undefined}
      />

      {hasDiagnosis && recommendedAcupoints && recommendedAcupoints.length > 0 && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/30 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">荐</span>
          <span className="text-xs text-amber-800 font-serif">基于您的{primaryConstitution}，推荐灸疗穴位：</span>
          <div className="flex flex-wrap gap-1">
            {recommendedAcupoints.map((pt, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-serif">{pt}</span>
            ))}
          </div>
        </div>
      )}

      {/* Canvas 背景 */}
      <div className="relative" style={{ height: 180, background: '#080402' }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {/* 中心信息 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {phase === 'intro' ? (
            <div className="text-center">
              <div className="text-xl text-white/30">静禅国灸体验</div>
            </div>
          ) : phase === 'complete' ? (
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: '#C4A35A' }}>安泰</div>
              <div className="text-xs text-white/50 mt-1">静禅国灸 · 十法圆满</div>
            </div>
          ) : currentStep ? (
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: currentStep.color }}>{currentStep.num}</div>
              <div className="text-sm text-white/80 mt-1 font-bold">{currentStep.title}</div>
              <div className="text-[10px] text-white/40">{stageLabel(currentStep.stage)} | {fmtTime(elapsed)}</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28" style={{ background: 'linear-gradient(170deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)' }}>

        {/* ====== 介绍页 ====== */}
        {phase === 'intro' && (
          <div>
            <div className="mb-4 rounded-xl p-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              <h3 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>静禅国灸 · 十大操作流程</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
                今天您体验的是中华第一灸，静禅国灸。我们有十大操作流程，将从闻灸开始，经热敷、响钟、药油、行钟、摇钟、定钟、火灸、灸感沟通，最终以禅定心法收功，全程引导陪伴。
              </p>
            </div>

            {/* 十步流程预览 */}
            <div className="space-y-2 mb-4">
              {STEPS.map((step) => (
                <div key={step.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: '#FDF8F0', borderLeft: `3px solid ${step.color}` }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: step.color + '18', border: `1.5px solid ${step.color}`, color: step.color }}>
                    {step.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs" style={{ color: '#2C1810' }}>{step.title}</div>
                    <div className="text-[10px]" style={{ color: '#8B7355' }}>{step.subtitle}</div>
                  </div>
                  <div className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: stageColor(step.stage) + '12', color: stageColor(step.stage) }}>
                    {stageLabel(step.stage)}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={startTherapy}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition active:scale-95"
              style={{ background: 'linear-gradient(135deg, #8B2500, #C4A35A)' }}
            >
              开始体验
            </button>
          </div>
        )}

        {/* ====== 步骤进行中 ====== */}
        {phase !== 'intro' && phase !== 'complete' && currentStep && (
          <div>
            {/* 步骤进度点 */}
            <div className="flex items-center justify-center gap-1.5 mb-4 overflow-x-auto py-1">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: idx < currentStepIdx ? step.color + '30' : idx === currentStepIdx ? step.color + '18' : '#EDE4D3',
                      border: `2px solid ${idx <= currentStepIdx ? step.color : '#EDE4D3'}`,
                      color: idx <= currentStepIdx ? step.color : '#8B7355',
                    }}
                  >
                    {idx < currentStepIdx ? <Check size={10} /> : step.num}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="w-3 h-0.5 mx-0.5" style={{ background: idx < currentStepIdx ? step.color : '#EDE4D3' }} />
                  )}
                </div>
              ))}
            </div>

            {/* 当前步骤标题 */}
            <div className="mb-3 rounded-xl p-4" style={{ background: currentStep.color + '08', border: `1px solid ${currentStep.color}30` }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                  style={{ backgroundColor: currentStep.color + '18', border: `2px solid ${currentStep.color}`, color: currentStep.color }}>
                  {currentStep.num}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: currentStep.color }}>{currentStep.title}</div>
                  <div className="text-[10px]" style={{ color: '#8B7355' }}>{currentStep.subtitle}</div>
                </div>
              </div>
            </div>

            {/* 话术内容 */}
            <div className="mb-4 rounded-xl p-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: currentStep.color + '15', color: currentStep.color }}>
                  话术 {scriptIdx + 1}/{currentStep.script.length}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#2C1810' }}>
                {currentStep.script[scriptIdx]}
              </p>
              {/* 话术进度 */}
              {currentStep.script.length > 1 && (
                <div className="flex items-center gap-1.5 mt-3">
                  {currentStep.script.map((_, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full" style={{
                      background: i <= scriptIdx ? currentStep.color : '#EDE4D3',
                      opacity: i <= scriptIdx ? 1 : 0.5,
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* 操作要点（可展开） */}
            <div className="mb-4">
              <button
                onClick={() => setShowTips(!showTips)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition"
                style={{ background: '#F0E8D8', color: '#5C3015' }}
              >
                <span>操作要点 ({currentStep.tips.length})</span>
                <span>{showTips ? '收起' : '展开'}</span>
              </button>
              {showTips && (
                <div className="mt-2 space-y-1.5">
                  {currentStep.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: '#FDF8F0', borderLeft: `3px solid ${currentStep.color}` }}>
                      <span className="font-bold flex-shrink-0" style={{ color: currentStep.color }}>{i + 1}</span>
                      <span style={{ color: '#5C3015' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 导航按钮 */}
            <div className="flex gap-2">
              {currentStepIdx > 0 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition active:scale-95"
                  style={{ background: '#EDE4D3', color: '#5C3015' }}
                >
                  上一步
                </button>
              )}
              <button
                onClick={nextScript}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition active:scale-95"
                style={{ background: currentStep.color }}
              >
                {scriptIdx < currentStep.script.length - 1 ? '下一句' : currentStepIdx < STEPS.length - 1 ? '下一步' : '完成'}
              </button>
            </div>
          </div>
        )}

        {/* ====== 完成页 ====== */}
        {phase === 'complete' && (
          <div>
            <div className="mb-4 rounded-xl p-5 text-center" style={{ background: '#FDF8F0', border: '1px solid #C4A35A' }}>
              <div className="text-2xl font-black mb-2" style={{ color: '#5C1A00' }}>十法圆满</div>
              <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
                您已完整体验静禅国灸十大操作流程。闻灸识药、热敷排寒、响钟激活、药油引经、行钟排毒、摇钟松解、定钟拔毒、火灸温通、灸感沟通、禅定心法——十法合一，身心安泰。
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs" style={{ background: '#C4A35A15', color: '#8B7355' }}>
                用时 {fmtTime(elapsed)}
              </div>
            </div>

            {/* 灸后注意事项 */}
            <div className="rounded-xl p-4 mb-4" style={{ background: '#FDF8F0', border: '1px solid #E74C3C30' }}>
              <h4 className="font-bold text-sm mb-2" style={{ color: '#E74C3C' }}>灸后注意事项</h4>
              <div className="space-y-2">
                {[
                  '多喝温水，促进代谢排毒',
                  '不碰冷水，不吹空调，注意保暖',
                  '24小时内不要洗澡（尤其冷水澡）',
                  '饮食清淡，忌辛辣生冷',
                  '灸后排病反应（口渴、多尿、排便增加）属正常现象',
                  '如有不适，及时咨询',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#5C3015' }}>
                    <span style={{ color: '#E74C3C' }}>·</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition active:scale-95"
              style={{ background: 'linear-gradient(135deg, #8B2500, #C4A35A)' }}
            >
              再做一次
            </button>
          </div>
        )}

        {/* 原理说明 */}
        <div className="rounded-xl p-4 mb-4 mt-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
          <h4 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>静禅国灸原理</h4>
          <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
            静禅国灸是中华第一灸，以"国"字号药灸为核心，由十几味中药、两味藏药、三年以上黄金艾绒根据君臣佐使原理配伍而成，效果为普通艾灸的8.4倍。
            十大流程从闻灸辨识品质，经热敷排寒、悬钟激活、药油引经、行钟排毒、摇钟松解、定钟拔毒，到病理火灸温通经脉，灸感沟通了解身体反应，最终以禅定心法收功。
            全程以禅入灸，以灸养禅，实现身心合一的疗愈体验。
          </p>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
