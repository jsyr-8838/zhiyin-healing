'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import { fmtTime } from '@/hooks/useTimer';
import { useHealingRecommendation } from '@/hooks/useHealingRecommendation';
import { getGroundingAudio, GROUNDING_COMPLETE_AUDIO } from '@/lib/healing-guide-audio';
import {
  FlameKindling, Flame, Hand, Ear, Wind, RotateCcw, Check,
  CircleDot, Heart, Sparkles, ShieldCheck, Eye, Coffee, BookOpen,
  Volume2, VolumeX, Play, Pause, Headphones,
} from 'lucide-react';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XIUWEI_GAINS, type WuxingElement } from '@/lib/cultivation-engine';
import { getClientUserId } from '@/lib/auth';

/* ================================================================
 *  灸疗疏导 · 静禅国灸十大操作流程（增强版）
 *  中华第一灸，静禅国灸，十大操作流程全程引导
 *  1闻灸→2热敷→3响钟→4药油→5行钟→6摇钟→7定钟→8火灸静养→9灸感沟通→10心法
 *
 *  总时长：60分钟
 *  语音：Edge TTS 男声 zh-CN-YunjianNeural（云健·沉稳深邃）
 *  三种语音模式：沉浸式 / 深入式 / 顺应自然式
 * ================================================================ */

type Phase = 'intro' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7' | 'step8' | 'step9' | 'step10' | 'complete';

// ===== 语音模式 =====
type VoiceMode = 'immersive' | 'deep' | 'natural';

const VOICE_MODES: { id: VoiceMode; name: string; desc: string; rate: number; icon: string }[] = [
  { id: 'immersive', name: '沉浸式', desc: '全程引导·自然语速', rate: 1.0, icon: '🌊' },
  { id: 'deep', name: '深入式', desc: '深层引导·缓慢呼吸', rate: 0.9, icon: '🔮' },
  { id: 'natural', name: '顺应自然式', desc: '简约引导·留白静养', rate: 1.05, icon: '🍃' },
];

// ===== 语音时长估算 =====
// 云健男声正常语速约 3.5 字/秒，rate=1.0；rate 越低越慢
function estimateSpeechSeconds(text: string, rate: number): number {
  const charCount = text.replace(/[^\u4e00-\u9fa5]/g, '').length;
  return Math.ceil(charCount / (3.5 * rate)) + 2; // +2 秒缓冲
}

interface StepData {
  id: Phase;
  num: number;
  title: string;
  subtitle: string;
  icon: typeof FlameKindling;
  color: string;
  /** 开场话术（步骤开始时播放） */
  openingScript: string;
  /** 中段话术（步骤进行中播放，留白后补充引导） */
  midwayScript?: string;
  /** 收尾话术（步骤结束前过渡到下一步） */
  closingScript?: string;
  /** 操作要点/注意事项 */
  tips: string[];
  /** 时长（秒） */
  duration: number;
  /** 属于哪一阶段 */
  stage: 'preparation' | 'operation' | 'completion';
}

const STEPS: StepData[] = [
  {
    id: 'step1', num: 1, title: '闻灸', subtitle: '辨识药灸品质·开启疗愈',
    icon: Wind, color: '#8B6914', duration: 60, stage: 'preparation',
    openingScript: `欢迎您体验静禅国灸。今天，理疗老师将带您走完十大操作流程，从辨识药灸，到禅定收功，一步一步，身心安泰。
现在，第一步——闻灸。
请您轻轻靠近这根灸条，用鼻子慢慢地闻一闻。
您是否闻到了淡淡的中草药香？这是十几味中药、两味藏药，和三年以上黄金艾绒，按照君臣佐使的原理配伍而成的味道。
它是带「国」字号的药灸，效果是市面上普通艾灸的八点四倍。
请您记住这个味道——它是今天疗愈的开始。`,
    closingScript: `好，闻灸就到这里。接下来，进入第二步——热敷药包，排出体表的寒湿。`,
    tips: [
      '引导客人靠近灸条轻嗅，感受药香',
      '展示防伪标识增强信任',
      '重点说明：十几味中药+两味藏药+三年黄金艾绒，君臣佐使配伍',
    ],
  },
  {
    id: 'step2', num: 2, title: '热敷药包', subtitle: '排出体表寒湿·药力渗透',
    icon: Coffee, color: '#B8860B', duration: 300, stage: 'preparation',
    openingScript: `现在给您敷上的是静禅国灸的敷灸宝。
这里面装的都是中药的种子、五谷的种子、艾草的种子——经过加热以后，药效会缓缓散发出来，被皮肤吸收，达到排出体表寒湿的效果。
请您放松，感受温度慢慢渗透进身体。
您感觉温度怎么样？如果太烫或者不够热，随时告诉理疗老师，理疗老师来帮您调整。`,
    midwayScript: `药包的温度正在帮助您的毛孔打开。
您不需要做什么，只需要安静地躺着，感受热量一点一点渗入皮肤，带走体内的寒气和湿气。
每一次呼气，都可以想象——寒湿之气，正从皮肤表面，慢慢散去。`,
    closingScript: `热敷就到这里。您的体表已经温暖了，毛孔打开了，接下来，用悬钟唤醒沉睡的细胞。`,
    tips: [
      '将敷灸宝均匀热敷于顾客背部/肩颈/腹部',
      '中药种子经加热后药效透过皮肤吸收',
      '注意询问温度是否适宜，及时调整',
      '排寒湿顺序：由上至下，由内至外',
    ],
  },
  {
    id: 'step3', num: 3, title: '响钟', subtitle: '激活沉睡细胞·唤醒惰性细胞',
    icon: CircleDot, color: '#C4A35A', duration: 300, stage: 'operation',
    openingScript: `现在给您操作的工具是悬钟。
它采用无毒医用A类硅胶制作而成，和婴儿奶嘴是同一种材质，无明火、无酒精，安全舒适。
力度是否合适？如果觉得轻重不合适，理疗老师可以随时给您调节。
悬钟会沿您的经络走向叩击，激活穴位深层的沉睡细胞，唤醒那些偷懒的惰性细胞。`,
    midwayScript: `您可能会感觉到一些酸胀或者微微的刺痛——这是正常的，说明沉睡的细胞正在被唤醒。
那些不通的地方，感觉会更明显。痛则不通，通则不痛。
请配合呼吸，叩击到的时候，轻轻呼气，把紧张送出去。`,
    closingScript: `响钟就到这里。您的细胞已经苏醒了，经络也准备好了，接下来，用药油疏通经络。`,
    tips: [
      '悬钟材质：无毒医用A类硅胶（婴儿奶嘴同材质）',
      '操作安全：无明火、无酒精',
      '力度由轻到重，先轻叩后加重',
      '叩击频率均匀，节奏稳定',
    ],
  },
  {
    id: 'step4', num: 4, title: '药油', subtitle: '疏通经络·引药归经',
    icon: Hand, color: '#27AE60', duration: 300, stage: 'operation',
    openingScript: `现在给您推的是药油，疏通经络，引药归经。
理疗老师会沿着您的脊柱、膀胱经和肩颈方向推拿，大约五分钟。
脊柱是督脉，阳气之海，理疗老师会由下往上推；
膀胱经是人体最大的代谢通道，先推左侧运气，再推右侧运血，气推血运。
请您配合呼吸，当理疗老师推的时候，慢慢呼气，让身体更松一些。`,
    midwayScript: `药油正在渗入您的经络。
您不需要用力，只需要让身体完全交给这双手。
感觉到了吗？药油推过的地方，温热感正在向深层扩散。
这就是引药归经——药力不在皮肤表面，而是沿着经络，到达需要它的地方。`,
    closingScript: `药油推拿就到这里。经络已经疏通了，接下来，行钟排出经络层的毒素。`,
    tips: [
      '药油沿脊柱、膀胱经、肩颈方向推拿',
      '脊柱（督脉）：由下至上推，力度适中均匀',
      '膀胱经：先推左侧（行气），再推右侧（行血）',
      '掌推、掌揉、拇指点按交替',
    ],
  },
  {
    id: 'step5', num: 5, title: '行钟', subtitle: '排出经络层毒素·疏通淤堵',
    icon: CircleDot, color: '#8B4513', duration: 300, stage: 'operation',
    openingScript: `现在操作的是行钟。
首先疏通的是督脉——督脉是阳气之海，也是男人的龙脉，女人的凤骨。
哪里越痛，说明那个部位的经络越淤堵。痛则不通，通则不痛。
然后是膀胱经——左运气，右运血，气推血运，所以理疗老师会先推您左侧，再推右侧。
最后是肩胛骨缝——这里最容易受凉、劳损、粘连，不通会引起肩颈问题，也会影响睡眠。
理疗老师给您操作的部位，是不是挺舒服的？`,
    midwayScript: `悬钟可以走到火罐和气罐走不到的地方，舒适度非常好。
如果您感到某个地方特别痛——不要忍，告诉理疗老师，理疗老师会放慢速度，慢慢疏通。
那个痛的地方，就是毒素堆积的地方，也是今天最需要被照顾的地方。`,
    closingScript: `行钟就到这里。经络里的毒素正在排出，接下来，摇钟剥离粘连的组织。`,
    tips: [
      '督脉：沿脊柱由下至上推行钟，疏通阳气之海',
      '膀胱经：先左后右，左行气右行血',
      '肩胛骨缝：重点疏通，最易受凉、劳损、粘连',
      '痛则不通——疼痛处重点停留，渐进加力',
    ],
  },
  {
    id: 'step6', num: 6, title: '摇钟', subtitle: '剥离粘连组织·松解肩胛',
    icon: Hand, color: '#A0522D', duration: 300, stage: 'operation',
    openingScript: `现在操作的是摇钟，主要是剥离肩胛骨缝里粘连的经络。
理疗老师会沿肩胛骨缝做横向的摇拨动作，力度由浅入深，一点一点地，把粘连的地方剥开。
先做这一侧，做完后请您活动一下，感受一下两边是否不一样了。`,
    midwayScript: `粘连不是一天形成的，所以剥离也需要耐心。
您可能会感到一些酸或者胀——那是粘连正在被松开的感觉。
就像撕开粘在一起的胶带，撕开的瞬间会有一点点不适，但之后会非常轻松。
请配合理疗老师，深呼吸，放松。`,
    closingScript: `两侧都做完了。请您活动一下两侧的肩颈——是否还有发紧的地方？
如果还有，理疗老师会做定点加强摇拨。
摇钟就到这里，接下来，定钟拔出体内的毒素。`,
    tips: [
      '摇钟手法：沿肩胛骨缝做横向摇拨动作',
      '先做单侧，做完后让顾客活动肩颈',
      '引导顾客感受操作效果',
      '摇拨力度由浅入深，逐步剥离粘连',
    ],
  },
  {
    id: 'step7', num: 7, title: '定钟', subtitle: '拔出体内毒素·辨识体质',
    icon: ShieldCheck, color: '#CD853F', duration: 300, stage: 'operation',
    openingScript: `现在操作的是定钟，也就是留罐。
主要定在膀胱经、肩胛骨和大板经的位置，拔出体内的深层毒素。
定三到五分钟，期间请盖好被子，别着凉。
拔完之后，理疗老师会根据您的罐印和出痧的颜色，辨识您的体质，对症搭配穴位。`,
    midwayScript: `定钟的过程中，您只需要安静地躺着。
感受皮肤被轻轻吸起，那是毒素正在被拔出的感觉。
不需要说话，不需要动，只需要——等。
等身体自己完成这个排毒的过程。`,
    closingScript: `好了，可以起罐了。
让理疗老师看看您的罐印——
如果是紫黑色，说明寒凝血瘀；
鲜红色，是热证；
有水珠或水泡，是湿气重；
淡白色，是气血虚；
红紫色，是气滞血瘀。
定钟就到这里，接下来，进入今天最核心的——病理火灸。`,
    tips: [
      '定钟（留罐）：主要定膀胱经、肩胛骨、大板经',
      '定3-5分钟，盖好被子别着凉',
      '观察罐印颜色辨识体质：紫黑→寒凝血瘀，鲜红→热证',
      '水珠/水泡→湿气重，淡白→气血虚，红紫→气滞血瘀',
    ],
  },
  {
    id: 'step8', num: 8, title: '病理火灸', subtitle: '点燃药灸·温通经脉·静养时段',
    icon: Flame, color: '#E74C3C', duration: 540, stage: 'operation',
    openingScript: `接下来理疗老师帮您点燃药灸。
这是今天最核心的环节——病理火灸。
理疗老师现在开始给您放灸了。在这个过程中，您千万不要动。
如果出现烫、痒或者水珠的现象，您一定要马上告诉理疗老师，理疗老师可以快速帮您调整。
不是越烫越好，有任何不舒服的症状及时跟理疗老师说，理疗老师会一直在您身边陪伴您。
现在，请闭上眼睛，让灸火温暖您的经脉。
这是属于您的静养时间——什么都不用做，只是躺着，感受灸的能量。`,
    midwayScript: `灸火正在温通您的经脉。
您可能会感觉到热力从皮肤表面慢慢渗透到深层，那是药力正在到达需要它的地方。
如果感到温暖而舒适，就让它继续。
如果感到灼烫，不要忍——告诉理疗老师，理疗老师马上调整。
这段时间，属于您和灸火的对话。安静地，感受它。`,
    closingScript: `静养就到这里。灸火已经温通了您的经脉。
接下来，我们进入灸感沟通——理疗老师来给您讲讲，灸中和灸后，您的身体可能会出现哪些反应。`,
    tips: [
      '【安全第一】检查灸鼎铁丝网是否完好',
      '做灸过程中全程不能离人，房间必须有人看护',
      '随时关注客人情况，做好灸中记录',
      '一定不能有裸露在外的皮肤，把皮肤盖好',
      '灸的温度不是越烫越好，以顾客舒适为度',
    ],
  },
  {
    id: 'step9', num: 9, title: '灸感沟通', subtitle: '讲解灸中反应和灸后注意事项（两轮）',
    icon: Eye, color: '#5B9BD5', duration: 600, stage: 'completion',
    openingScript: `理疗老师来给您讲一下灸中可能出现的反应和灸后的注意事项。
第一轮——灸中反应：
在灸的过程中，您可能会出现温热感、传导感、酸麻胀痛——这些都是正常的灸感，说明气血正在流通。
温热感，是灸火在温暖经脉；
传导感，是热力沿着经络在走；
酸麻胀痛，是淤堵的地方正在被疏通。
这些感觉来了，不用紧张，让它们来，也让它们走。`,
    midwayScript: `第二轮——灸后反应和注意事项：
灸后您可能会口渴、排尿增多、排便增加——这些都是排病反应，是好事，说明身体正在排毒修复。
灸后请注意：
多喝温水，促进代谢；
不要碰冷水，不要吹空调，注意保暖；
二十四小时内不要洗澡，尤其不能洗冷水澡；
饮食清淡，忌辛辣生冷。
这些话，请您记在心里。`,
    closingScript: `灸感沟通就到这里。
现在，进入最后一个环节——国灸疗愈心法。请您跟随理疗老师的声音，进入禅定。`,
    tips: [
      '灸中正常反应：温热、传导、酸麻胀痛——说明气血在流通',
      '灸后排病反应：口渴、多尿、排便增加——排毒修复',
      '灸后禁忌：多喝温水、不碰冷水、不吹空调、注意保暖',
      '24小时内不要洗澡（尤其是冷水澡）',
      '灸后饮食清淡，忌辛辣生冷',
    ],
  },
  {
    id: 'step10', num: 10, title: '国灸疗愈心法', subtitle: '以禅定之心·受灸之能量',
    icon: BookOpen, color: '#8B6914', duration: 600, stage: 'completion',
    openingScript: `静禅国灸真正的文化，是在一个「禅」字上。
现在，灸已经放在您身上了，理疗老师来给您做一个疗愈心法。
请您跟随理疗老师的节奏，慢慢地深呼吸——
吸气……吐气……
吸气……吐气……
来，慢慢地，把头放下，把心放下，把臀放下，把腿放下，把五脏六腑，都放下。
用禅定的心态，安静地感受——灸给您带来的能量。
让我们的每一个毛孔，每一个细胞，都完全地接受它。`,
    midwayScript: `您不需要做什么。
不需要想着对错，不需要想着时间，不需要想着任何事情。
只是在这里。
灸火在燃，您在呼吸，能量在流动。
这一切，不需要您的参与，只需要您的——允许。
允许自己被照顾，允许自己被温暖，允许自己——放下。`,
    closingScript: `吸气……吐气……
安住当下，静观灸火。
静禅国灸，以禅入灸，以灸养禅。
十大操作流程，到此圆满。
请您慢慢睁开双眼，感受此刻身心的清明与安宁。`,
    tips: [
      '以非常缓慢的节奏和语速讲解心法',
      '引导顾客深呼吸：吸气～吐气，反复3-5次',
      '引导放松：头、心、臀、腿、五脏六腑逐一放松',
      '让顾客安静感受灸的能量，每个毛孔和细胞都接受',
      '心法核心：禅定——安住当下，静观灸火',
    ],
  },
];

export default function GroundingPage() {
  const { hasDiagnosis, recommendedAcupoints, primaryConstitution } = useHealingRecommendation();
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepElapsed, setStepElapsed] = useState(0); // 当前步骤已过秒数
  const [totalElapsed, setTotalElapsed] = useState(0); // 总已过秒数
  const [showTips, setShowTips] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('immersive');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentScriptPart, setCurrentScriptPart] = useState<'opening' | 'midway' | 'closing'>('opening');

  // ===== 预生成 MP3 语音导引（与六字诀模块同架构） =====
  // 使用 new Audio(url).play() 在用户点击的同步上下文中播放，手机不会拦截
  const guideAudioRef = useRef<HTMLAudioElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const midwayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseStartTimeRef = useRef<number>(0);
  const totalStartTimeRef = useRef<number>(0);
  const effectiveDurationRef = useRef<number>(0); // 语音让步后的有效步骤时长

  const currentStep = STEPS[currentStepIdx];
  const modeConfig = VOICE_MODES.find(m => m.id === voiceMode)!;

  // ===== 计算步骤有效时长（语音时间让步） =====
  // 逻辑：先算所有话术语音需要多少时间，再加上留白时间，取"语音总时长+留白"和"原始时长"中较大者
  const getEffectiveDuration = useCallback((step: StepData, rate: number, mode: VoiceMode): number => {
    const openSec = estimateSpeechSeconds(step.openingScript, rate);
    const midSec = step.midwayScript ? estimateSpeechSeconds(step.midwayScript, rate) : 0;
    const closeSec = step.closingScript ? estimateSpeechSeconds(step.closingScript, rate) : 0;
    if (mode === 'natural') {
      // 顺应自然式：只播开场 + 收尾，中间大段留白
      const speechTotal = openSec + closeSec;
      const silenceNeeded = 30; // 最少 30 秒留白
      return Math.max(step.duration, speechTotal + silenceNeeded);
    }
    // 沉浸式 / 深入式：开场 + 留白 + 中段 + 留白 + 收尾
    const speechTotal = openSec + midSec + closeSec;
    const silenceNeeded = 40; // 留白时间合计至少 40 秒
    return Math.max(step.duration, speechTotal + silenceNeeded);
  }, []);

  // 当前步骤的有效时长（用于 UI 和计时器）
  const effectiveDuration = currentStep ? getEffectiveDuration(currentStep, modeConfig.rate, voiceMode) : 0;

  // ===== 播放预生成 MP3 话术 =====
  const playGuideAudio = useCallback((url: string, onEnded?: () => void) => {
    // 停止上一个音频
    if (guideAudioRef.current) {
      guideAudioRef.current.pause();
      guideAudioRef.current.onended = null;
      guideAudioRef.current = null;
    }
    if (!audioEnabled || !url) {
      onEnded?.();
      return;
    }
    const audio = new Audio(url);
    audio.volume = 0.85;
    guideAudioRef.current = audio;
    if (onEnded) audio.onended = onEnded;
    audio.play().catch(() => {});
  }, [audioEnabled]);

  // ===== 停止语音 =====
  const stopGuideAudio = useCallback(() => {
    if (guideAudioRef.current) {
      guideAudioRef.current.pause();
      guideAudioRef.current.onended = null;
      guideAudioRef.current = null;
    }
  }, []);

  // ===== 进入一个新步骤（使用预生成 MP3 + onended 链式播放） =====
  const enterStep = useCallback((idx: number) => {
    if (idx >= STEPS.length) {
      setPhase('complete');
      return;
    }
    const step = STEPS[idx];
    const rate = VOICE_MODES.find(m => m.id === voiceMode)!.rate;
    const effDur = getEffectiveDuration(step, rate, voiceMode);
    const audioUrls = getGroundingAudio(step.id);

    setCurrentStepIdx(idx);
    setPhase(step.id);
    setStepElapsed(0);
    setShowTips(false);
    setCurrentScriptPart('opening');
    phaseStartTimeRef.current = Date.now();
    effectiveDurationRef.current = effDur;

    // 清理之前的定时器和音频
    if (midwayTimeoutRef.current) { clearTimeout(midwayTimeoutRef.current); midwayTimeoutRef.current = null; }
    if (closingTimeoutRef.current) { clearTimeout(closingTimeoutRef.current); closingTimeoutRef.current = null; }
    stopGuideAudio();

    if (!audioUrls) return;

    // 播放开场话术 MP3，用 onended 链式调度后续段落
    setCurrentScriptPart('opening');

    if (voiceMode !== 'natural' && audioUrls.midway) {
      // 沉浸式 / 深入式：开场 → 15秒留白 → 中段 → 15秒留白 → 收尾
      playGuideAudio(audioUrls.opening, () => {
        midwayTimeoutRef.current = setTimeout(() => {
          setCurrentScriptPart('midway');
          playGuideAudio(audioUrls.midway!, () => {
            if (audioUrls.closing) {
              closingTimeoutRef.current = setTimeout(() => {
                setCurrentScriptPart('closing');
                playGuideAudio(audioUrls.closing);
              }, 15000);
            }
          });
        }, 15000);
      });
    } else if (audioUrls.closing) {
      // 顺应自然式 或 无中段：开场 → 留白 → 收尾
      playGuideAudio(audioUrls.opening, () => {
        const silenceMs = voiceMode === 'natural' ? 30000 : 20000;
        closingTimeoutRef.current = setTimeout(() => {
          setCurrentScriptPart('closing');
          playGuideAudio(audioUrls.closing);
        }, silenceMs);
      });
    } else {
      playGuideAudio(audioUrls.opening);
    }
  }, [playGuideAudio, stopGuideAudio, voiceMode, getEffectiveDuration]);

  // ===== 开始疏导 =====
  const startTherapy = useCallback(() => {
    setCurrentStepIdx(0);
    setStepElapsed(0);
    setTotalElapsed(0);
    setShowTips(false);
    setIsPaused(false);
    totalStartTimeRef.current = Date.now();
    enterStep(0);
  }, [enterStep]);

  // ===== 暂停/继续 =====
  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const newPaused = !prev;
      if (newPaused) {
        stopGuideAudio();
      } else {
        // 继续：重置 phaseStartTime 以补偿暂停时间
        phaseStartTimeRef.current = Date.now() - stepElapsed * 1000;
      }
      return newPaused;
    });
  }, [stepElapsed, stopGuideAudio]);

  // ===== 上一步 =====
  const prevStep = useCallback(() => {
    if (currentStepIdx > 0) {
      stopGuideAudio();
      enterStep(currentStepIdx - 1);
    }
  }, [currentStepIdx, enterStep, stopGuideAudio]);

  // ===== 下一步（手动跳过） =====
  const nextStep = useCallback(() => {
    stopGuideAudio();
    if (currentStepIdx < STEPS.length - 1) {
      enterStep(currentStepIdx + 1);
    } else {
      // 记录修为
      try {
        const gain = XIUWEI_GAINS.moxa_complete;
        const el: WuxingElement = 'fire';
        useCultivationStore.getState().addXiuWei(el, gain);
        useCultivationStore.getState().recordPractice('moxa', totalElapsed, el, gain);
        useCultivationStore.getState().completeTodayStep('moxa');
        fetch('/api/cultivation/practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: getClientUserId(),
            category: 'moxa',
            subCategory: 'grounding',
            element: el,
            durationSec: totalElapsed,
          }),
        }).catch(() => {});
      } catch {}
      setPhase('complete');
      if (audioEnabled) {
        playGuideAudio(GROUNDING_COMPLETE_AUDIO);
      }
    }
  }, [currentStepIdx, totalElapsed, audioEnabled, enterStep, stopGuideAudio, playGuideAudio]);

  // ===== 重置 =====
  const reset = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (midwayTimeoutRef.current) { clearTimeout(midwayTimeoutRef.current); midwayTimeoutRef.current = null; }
    if (closingTimeoutRef.current) { clearTimeout(closingTimeoutRef.current); closingTimeoutRef.current = null; }
    stopGuideAudio();
    setPhase('intro');
    setCurrentStepIdx(0);
    setStepElapsed(0);
    setTotalElapsed(0);
    setShowTips(false);
    setIsPaused(false);
  }, [stopGuideAudio]);

  // ===== 计时器（每秒更新 + 自动推进） =====
  useEffect(() => {
    if (phase === 'intro' || phase === 'complete' || isPaused) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      const stepNow = Math.floor((Date.now() - phaseStartTimeRef.current) / 1000);
      const totalNow = Math.floor((Date.now() - totalStartTimeRef.current) / 1000);
      setStepElapsed(stepNow);
      setTotalElapsed(totalNow);

      // 自动推进到下一步（使用语音让步后的有效时长）
      const effDur = effectiveDurationRef.current || (currentStep?.duration ?? 0);
      if (currentStep && stepNow >= effDur) {
        stopGuideAudio();
        if (currentStepIdx < STEPS.length - 1) {
          enterStep(currentStepIdx + 1);
        } else {
          // 记录修为
          try {
            const gain = XIUWEI_GAINS.moxa_complete;
            const el: WuxingElement = 'fire';
            useCultivationStore.getState().addXiuWei(el, gain);
            useCultivationStore.getState().recordPractice('moxa', totalNow, el, gain);
            useCultivationStore.getState().completeTodayStep('moxa');
            fetch('/api/cultivation/practice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: getClientUserId(),
                category: 'moxa',
                subCategory: 'grounding',
                element: el,
                durationSec: totalNow,
              }),
            }).catch(() => {});
          } catch {}
          setPhase('complete');
          if (audioEnabled) {
            playGuideAudio(GROUNDING_COMPLETE_AUDIO);
          }
        }
      }
    }, 1000);

    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [phase, isPaused, currentStep, currentStepIdx, audioEnabled, modeConfig.rate, enterStep, stopGuideAudio, playGuideAudio]);

  // ===== 清理 =====
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (midwayTimeoutRef.current) clearTimeout(midwayTimeoutRef.current);
      if (closingTimeoutRef.current) clearTimeout(closingTimeoutRef.current);
      stopGuideAudio();
    };
  }, [stopGuideAudio]);

  // ===== Canvas 背景（温暖艾烟氛围） =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

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

      const bgGrad = ctx.createRadialGradient(w * 0.45, h * 0.7, 0, w * 0.5, h * 0.5, w * 0.8);
      bgGrad.addColorStop(0, '#1a0e04');
      bgGrad.addColorStop(0.5, '#120804');
      bgGrad.addColorStop(1, '#080402');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

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

      const fireGlow = ctx.createRadialGradient(w * 0.5, h * 0.75, 0, w * 0.5, h * 0.75, 40);
      const pulse = 0.3 + Math.sin(time * 1.5) * 0.1 + Math.sin(time * 3.7) * 0.05;
      fireGlow.addColorStop(0, `rgba(230, 120, 30, ${pulse})`);
      fireGlow.addColorStop(0.3, `rgba(200, 100, 20, ${pulse * 0.5})`);
      fireGlow.addColorStop(1, 'rgba(200, 100, 20, 0)');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(w * 0.5 - 40, h * 0.75 - 40, 80, 80);

      if (phase !== 'intro' && phase !== 'complete' && currentStep) {
        const cx = w / 2;
        const cy = h * 0.4;
        const radius = Math.min(w, h) * 0.28;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${currentStep.color}22`;
        ctx.lineWidth = 6;
        ctx.stroke();
        // 步骤时间进度（基于 stepElapsed / 有效时长）
        const effDur = effectiveDurationRef.current || currentStep.duration;
        const timeProgress = Math.min(stepElapsed / effDur, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + timeProgress * Math.PI * 2);
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
  }, [phase, currentStep, stepElapsed]);

  // ===== 辅助 =====
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

  const stepRemaining = currentStep ? Math.max(0, effectiveDuration - stepElapsed) : 0;
  const stepProgress = currentStep ? Math.min(stepElapsed / effectiveDuration, 1) : 0;
  const totalDuration = STEPS.reduce((sum, s) => sum + getEffectiveDuration(s, modeConfig.rate, voiceMode), 0);
  const totalProgress = Math.min(totalElapsed / totalDuration, 1);

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
              <div className="text-[10px] text-white/40">{stageLabel(currentStep.stage)} | {fmtTime(stepElapsed)}/{fmtTime(effectiveDuration)}</div>
            </div>
          ) : null}
        </div>
        {/* 倒计时角标 */}
        {phase !== 'intro' && phase !== 'complete' && currentStep && (
          <div className="absolute right-3 top-3 rounded px-2 py-1 font-mono text-xs tabular-nums" style={{ background: 'rgba(8,4,2,0.7)', color: currentStep.color }}>
            {fmtTime(stepRemaining)}
          </div>
        )}
        {/* 总进度 */}
        {phase !== 'intro' && phase !== 'complete' && (
          <div className="absolute left-3 top-3 rounded px-2 py-1 font-mono text-[10px] tabular-nums" style={{ background: 'rgba(8,4,2,0.7)', color: '#C4A35A' }}>
            总 {fmtTime(totalElapsed)}/{fmtTime(totalDuration)}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28" style={{ background: 'linear-gradient(170deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)' }}>

        {/* ====== 介绍页 ====== */}
        {phase === 'intro' && (
          <div>
            <div className="mb-4 rounded-xl p-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              <h3 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>静禅国灸 · 十大操作流程</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
                今天您体验的是中华第一灸，静禅国灸。十大操作流程，从闻灸辨识品质开始，经热敷、响钟、药油、行钟、摇钟、定钟，到病理火灸温通经脉，灸感沟通了解身体反应，最终以禅定心法收功。全程男性磁性嗓音引导陪伴，自然真实的人声语速，沉浸式疗愈体验。
              </p>
            </div>

            {/* 语音模式选择 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Headphones size={14} style={{ color: '#8B2500' }} />
                <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>语音模式</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {VOICE_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setVoiceMode(m.id)}
                    className="rounded-xl p-3 border text-center transition active:scale-95"
                    style={{
                      background: voiceMode === m.id ? '#5C1A00' : '#FDF8F0',
                      borderColor: voiceMode === m.id ? '#5C1A00' : '#EDE4D3',
                      color: voiceMode === m.id ? '#FDF8F0' : '#2C1810',
                    }}
                  >
                    <div className="text-lg mb-0.5">{m.icon}</div>
                    <div className="text-xs font-bold">{m.name}</div>
                    <div className="text-[9px] mt-0.5 opacity-70">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 音效开关 */}
            <div className="mb-4 flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: '#F0E8D8' }}>
              <span className="text-xs font-bold" style={{ color: '#5C3015' }}>语音引导</span>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition"
                style={{
                  background: audioEnabled ? '#5C1A00' : '#EDE4D3',
                  color: audioEnabled ? '#FDF8F0' : '#8B7355',
                }}
              >
                {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                {audioEnabled ? '已开启' : '已关闭'}
              </button>
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
                  <div className="text-[10px] font-mono tabular-nums" style={{ color: '#8B7355' }}>
                    {step.duration >= 60 ? `${Math.floor(step.duration / 60)}分` : `${step.duration}秒`}{' ≈'}</div>
                </div>
              ))}
            </div>

            <button
              onClick={startTherapy}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition active:scale-95"
              style={{ background: 'linear-gradient(135deg, #8B2500, #C4A35A)' }}
            >
              开始体验 · 全程语音引导
            </button>
          </div>
        )}

        {/* ====== 步骤进行中 ====== */}
        {phase !== 'intro' && phase !== 'complete' && currentStep && (
          <div>
            {/* 步骤进度点 */}
            <div className="flex items-center justify-center gap-1.5 mb-3 overflow-x-auto py-1">
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

            {/* 总进度条 */}
            <div className="mb-3">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EDE4D3' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${totalProgress * 100}%`, background: 'linear-gradient(to right, #8B2500, #C4A35A)' }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px]" style={{ color: '#8B7355' }}>
                <span>{fmtTime(totalElapsed)}</span>
                <span>{fmtTime(totalDuration)}</span>
              </div>
            </div>

            {/* 当前步骤标题 */}
            <div className="mb-3 rounded-xl p-4" style={{ background: currentStep.color + '08', border: `1px solid ${currentStep.color}30` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                  style={{ backgroundColor: currentStep.color + '18', border: `2px solid ${currentStep.color}`, color: currentStep.color }}>
                  {currentStep.num}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color: currentStep.color }}>{currentStep.title}</div>
                  <div className="text-[10px]" style={{ color: '#8B7355' }}>{currentStep.subtitle}</div>
                </div>
                {/* 播放/暂停 */}
                <button onClick={togglePause}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition active:scale-90"
                  style={{ background: currentStep.color + '15', border: `1px solid ${currentStep.color}30` }}>
                  {isPaused ? <Play size={14} style={{ color: currentStep.color }} /> : <Pause size={14} style={{ color: currentStep.color }} />}
                </button>
              </div>
              {/* 步骤倒计时进度条 */}
              <div className="h-1 rounded-full overflow-hidden" style={{ background: currentStep.color + '15' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${stepProgress * 100}%`, background: currentStep.color }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px] font-mono" style={{ color: '#8B7355' }}>
                <span>{fmtTime(stepElapsed)}</span>
                <span>{fmtTime(effectiveDuration)}</span>
              </div>
            </div>

            {/* 当前话术内容 */}
            <div className="mb-4 rounded-xl p-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: currentStep.color + '15', color: currentStep.color }}>
                  {currentScriptPart === 'opening' ? '开场引导' : currentScriptPart === 'midway' ? '中段引导' : '收尾过渡'}
                </span>
                {audioEnabled && (
                  <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#8B7355' }}>
                    <Volume2 size={10} /> 男声播放中
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#2C1810' }}>
                {currentScriptPart === 'opening' ? currentStep.openingScript
                  : currentScriptPart === 'midway' && currentStep.midwayScript ? currentStep.midwayScript
                  : currentScriptPart === 'closing' && currentStep.closingScript ? currentStep.closingScript
                  : currentStep.openingScript}
              </p>
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
                onClick={nextStep}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition active:scale-95"
                style={{ background: currentStep.color }}
              >
                {currentStepIdx < STEPS.length - 1 ? '下一步' : '完成'}
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
                用时 {fmtTime(totalElapsed)}
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
            全程语音引导，以禅入灸，以灸养禅，实现身心合一的疗愈体验。
          </p>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
