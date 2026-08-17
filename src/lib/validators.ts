import { z } from 'zod/v4';

// ===== 通用校验 =====
export const userIdSchema = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// ===== 打卡 API =====
export const checkinPostSchema = z.object({
  userId: userIdSchema,
  sleepHours: z.number().min(0).max(24),
  bedtime: z.string().regex(/^\d{2}:\d{2}$/).optional().default('22:30'),
  mood: z.number().int().min(1).max(5),
  exercise: z.number().int().min(1).max(5),
  diet: z.number().int().min(1).max(5),
  symptoms: z.string().max(500).optional().default(''),
  note: z.string().max(1000).optional().default(''),
});

export const checkinGetSchema = z.object({
  userId: userIdSchema,
  days: z.coerce.number().int().min(1).max(90).optional().default(7),
});

// ===== 体质测评 API =====
export const NINE_CONSTITUTIONS = ['平和质', '气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质'] as const;

export const assessmentPostSchema = z.object({
  userId: userIdSchema,
  scores: z.object({
    pinghe: z.number().int().min(0).max(40),
    qixue: z.number().int().min(0).max(40),
    yangxu: z.number().int().min(0).max(40),
    yinxu: z.number().int().min(0).max(40),
    tanshi: z.number().int().min(0).max(40),
    shire: z.number().int().min(0).max(40),
    xueyu: z.number().int().min(0).max(40),
    qiyu: z.number().int().min(0).max(40),
    tebing: z.number().int().min(0).max(40),
  }),
  primaryType: z.enum(NINE_CONSTITUTIONS),
  dominantWuyin: z.enum(['jiao', 'zhi', 'gong', 'shang', 'yu']).optional().default('gong'),
  wuyinScores: z.record(z.string(), z.number()).optional().default({}),
  recommendation: z.string().max(2000).optional().default(''),
});

// ===== 导诊 API =====
export const diagnosisPostSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(2000),
  })).min(1).max(50),
  profile: z.any().optional(),
  userId: userIdSchema.optional(),
  tongueDiagnosis: z.object({
    tongueBody: z.string().max(500),
    tongueCoating: z.string().max(500),
    diagnosis: z.string().max(500),
    constitution: z.string().max(100),
    element: z.string().max(50),
    wuyin: z.string().max(50),
    organ: z.string().max(100),
  }).optional(),
  diagnosisSummary: z.string().max(5000).optional(),
});

// ===== 健康计划 API =====
export const planPostSchema = z.object({
  userId: userIdSchema,
  constitution: z.enum(NINE_CONSTITUTIONS).optional(),
});

// ===== TTS API =====
export const ttsPostSchema = z.object({
  text: z.string().min(1).max(5000),
  voice: z.string().max(64).optional(),
  speed: z.number().min(0.25).max(4.0).optional(),
});

// ===== 占卜 API =====
export const DIVINATION_METHODS = ['meihua', 'zhouyi', 'liuyao', 'qimen', 'daliuren', 'bazi', 'xiaoliuren', 'ziwei', 'taiyi', 'tarot'] as const;

// ===== AI 疗愈对话 API =====
export const aiHealingSchema = z.object({
  userId: z.string().max(64).optional(),
  constitution: z.string().max(50).optional(),
  element: z.string().max(20).optional(),
  wuyin: z.string().max(20).optional(),
  organ: z.string().max(50).optional(),
  completedModules: z.array(z.string().max(50)).max(10).optional(),
  message: z.string().min(1).max(5000),
  context: z.enum(['healing', 'guasha', 'tuina', 'general', 'emotional']).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  })).max(30).optional(),
});

// ===== StressMusic API =====
export const generateMusicSchema = z.object({
  bpm: z.number().min(30).max(220).optional(),
  hrv: z.number().min(0).max(500).optional(),
  genre: z.string().max(50).optional(),
  element: z.string().max(20).optional(),
  source: z.string().max(50).optional(),
});

export const confirmPreferenceSchema = z.object({
  bpm: z.number().min(30).max(220).optional(),
  hrv: z.number().min(0).max(500).optional(),
  genre: z.string().max(50).optional(),
  element: z.string().max(20).optional(),
  source: z.string().max(50).optional(),
});

export const startMeasurementSchema = z.object({
  duration: z.number().min(10).max(600).optional(),
  mode: z.enum(['ble', 'ppg', 'manual']).optional(),
});

// ===== 典籍 API =====
export const classicsAskSchema = z.object({
  question: z.string().min(1).max(2000),
});

export const classicsSearchSchema = z.object({
  query: z.string().min(1).max(200),
});

// ===== 预约 API =====
export const bookingCreateSchema = z.object({
  userId: userIdSchema,
  expertId: userIdSchema,
  service: z.string().max(200).optional().default(''),
  name: z.string().max(100).optional().default(''),
  phone: z.string().max(30).optional().default(''),
  preferredDate: z.string().max(20).optional().default(''),
  preferredTime: z.string().max(20).optional().default(''),
  note: z.string().max(1000).optional().default(''),
});

export const divinationPostSchema = z.object({
  userId: userIdSchema,
  method: z.enum(DIVINATION_METHODS),
  question: z.string().min(1).max(500),
  inputParams: z.record(z.string(), z.any()).optional().default({}),
  profile: z.any().optional(),
  destinee: z.object({
    name: z.string(),
    gender: z.enum(['male', 'female']),
    birthDate: z.string(),
    birthHour: z.number(),
    isLunar: z.boolean().optional().default(false),
  }).optional(),
});

export const divinationFeedbackSchema = z.object({
  id: userIdSchema,
  userId: userIdSchema,
  feedback: z.number().int().min(-1).max(1),
});

export const divinationGetSchema = z.object({
  userId: userIdSchema,
  method: z.enum(DIVINATION_METHODS).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

// ===== 验证辅助 =====
export function validateOrError<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data };
  }
  const firstError = result.error.issues[0];
  return { error: firstError ? `${firstError.path.join('.')}: ${firstError.message}` : '参数格式错误' };
}
