/**
 * 灸疗疏导 · 脉轮 · 颂钵 预生成语音导引数据
 *
 * 所有 MP3 均由 Edge TTS 预生成男声（zh-CN-YunjianNeural），
 * 与六字诀模块保持一致的架构：前端直接用 new Audio(url).play()，
 * 在用户点击的同步上下文中播放，避免手机浏览器自动播放策略拦截。
 *
 * B2 存储路径：
 *  - 灸疗疏导：audio/grounding/guide/stepXX_{opening|midway|closing}.mp3
 *  - 脉轮导引：audio/chakra/guide/{chakraId}.mp3
 *  - 颂钵导引：audio/singing-bowl/guide/{freq}.mp3
 */

import { cosUrl } from './cos-url';

// ===== 灸疗疏导 =====
const GROUNDING_BASE = cosUrl('/audio/grounding/guide');

export interface GroundingStepAudio {
  opening: string;
  midway?: string;
  closing?: string;
}

/** 每步话术的 MP3 路径（按 step 编号 + 段落） */
export const GROUNDING_AUDIO: Record<string, GroundingStepAudio> = {
  step1: {
    opening: `${GROUNDING_BASE}/step01_opening.mp3`,
    closing: `${GROUNDING_BASE}/step01_closing.mp3`,
  },
  step2: {
    opening: `${GROUNDING_BASE}/step02_opening.mp3`,
    midway: `${GROUNDING_BASE}/step02_midway.mp3`,
    closing: `${GROUNDING_BASE}/step02_closing.mp3`,
  },
  step3: {
    opening: `${GROUNDING_BASE}/step03_opening.mp3`,
    midway: `${GROUNDING_BASE}/step03_midway.mp3`,
    closing: `${GROUNDING_BASE}/step03_closing.mp3`,
  },
  step4: {
    opening: `${GROUNDING_BASE}/step04_opening.mp3`,
    midway: `${GROUNDING_BASE}/step04_midway.mp3`,
    closing: `${GROUNDING_BASE}/step04_closing.mp3`,
  },
  step5: {
    opening: `${GROUNDING_BASE}/step05_opening.mp3`,
    midway: `${GROUNDING_BASE}/step05_midway.mp3`,
    closing: `${GROUNDING_BASE}/step05_closing.mp3`,
  },
  step6: {
    opening: `${GROUNDING_BASE}/step06_opening.mp3`,
    midway: `${GROUNDING_BASE}/step06_midway.mp3`,
    closing: `${GROUNDING_BASE}/step06_closing.mp3`,
  },
  step7: {
    opening: `${GROUNDING_BASE}/step07_opening.mp3`,
    midway: `${GROUNDING_BASE}/step07_midway.mp3`,
    closing: `${GROUNDING_BASE}/step07_closing.mp3`,
  },
  step8: {
    opening: `${GROUNDING_BASE}/step08_opening.mp3`,
    midway: `${GROUNDING_BASE}/step08_midway.mp3`,
    closing: `${GROUNDING_BASE}/step08_closing.mp3`,
  },
  step9: {
    opening: `${GROUNDING_BASE}/step09_opening.mp3`,
    midway: `${GROUNDING_BASE}/step09_midway.mp3`,
    closing: `${GROUNDING_BASE}/step09_closing.mp3`,
  },
  step10: {
    opening: `${GROUNDING_BASE}/step10_opening.mp3`,
    midway: `${GROUNDING_BASE}/step10_midway.mp3`,
    closing: `${GROUNDING_BASE}/step10_closing.mp3`,
  },
};

/** 完成提示音 */
export const GROUNDING_COMPLETE_AUDIO = `${GROUNDING_BASE}/complete.mp3`;

/** 根据 phase 获取对应步骤的音频 */
export function getGroundingAudio(phase: string): GroundingStepAudio | null {
  return GROUNDING_AUDIO[phase] ?? null;
}

// ===== 脉轮导引 =====
const CHAKRA_BASE = cosUrl('/audio/chakra/guide');

export const CHAKRA_AUDIO: Record<string, string> = {
  root: `${CHAKRA_BASE}/root.mp3`,
  sacral: `${CHAKRA_BASE}/sacral.mp3`,
  solar: `${CHAKRA_BASE}/solar.mp3`,
  heart: `${CHAKRA_BASE}/heart.mp3`,
  throat: `${CHAKRA_BASE}/throat.mp3`,
  third: `${CHAKRA_BASE}/third.mp3`,
  crown: `${CHAKRA_BASE}/crown.mp3`,
};

export const CHAKRA_GENERIC_AUDIO = `${CHAKRA_BASE}/generic.mp3`;

export function getChakraGuideAudio(chakraId: string): string {
  return CHAKRA_AUDIO[chakraId] || CHAKRA_GENERIC_AUDIO;
}

// ===== 颂钵导引 =====
const BOWL_BASE = cosUrl('/audio/singing-bowl/guide');

export const BOWL_AUDIO: Record<number, string> = {
  174: `${BOWL_BASE}/174.mp3`,
  256: `${BOWL_BASE}/256.mp3`,
  288: `${BOWL_BASE}/288.mp3`,
  324: `${BOWL_BASE}/324.mp3`,
  342: `${BOWL_BASE}/342.mp3`,
  384: `${BOWL_BASE}/384.mp3`,
  396: `${BOWL_BASE}/396.mp3`,
  417: `${BOWL_BASE}/417.mp3`,
  432: `${BOWL_BASE}/432.mp3`,
  480: `${BOWL_BASE}/480.mp3`,
  528: `${BOWL_BASE}/528.mp3`,
  639: `${BOWL_BASE}/639.mp3`,
  741: `${BOWL_BASE}/741.mp3`,
  852: `${BOWL_BASE}/852.mp3`,
  963: `${BOWL_BASE}/963.mp3`,
};

export const BOWL_GENERIC_AUDIO = `${BOWL_BASE}/generic.mp3`;

export function getBowlGuideAudio(freq: number): string {
  return BOWL_AUDIO[freq] || BOWL_GENERIC_AUDIO;
}
