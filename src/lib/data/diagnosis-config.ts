'use client';

import { ClipboardList, FlameKindling, Eye, Hand, ScanFace } from 'lucide-react';

export type DiagnosisType = 'tongue' | 'face' | 'hand';
export type Tab = 'home' | 'questionnaire' | 'result' | 'capture' | 'capture-result';

export interface ConstitutionInfo {
  name: string;
  wuxing: string;
  wuyin: string;
  organ: string;
  emotion: string;
  description: string;
  color: string;
}

export const CONSTITUTION_INFO: Record<string, ConstitutionInfo> = {
  '平和质': { name: '平和质', wuxing: '五行均衡', wuyin: '五音调和', organ: '脏腑调和', emotion: '平和', description: '阴阳气血调和，体态适中，精力充沛，是最健康的体质', color: 'emerald' },
  '气虚质': { name: '气虚质', wuxing: '土行偏弱', wuyin: '宫音(脾)', organ: '脾肺气虚', emotion: '忧思', description: '元气不足，疲乏气短，易感冒，需补气健脾', color: 'amber' },
  '阳虚质': { name: '阳虚质', wuxing: '火行不足', wuyin: '徵音(心)', organ: '脾肾阳虚', emotion: '恐惧', description: '阳气不足，畏寒怕冷，手足不温，需温阳散寒', color: 'red' },
  '阴虚质': { name: '阴虚质', wuxing: '水行偏旺', wuyin: '羽音(肾)', organ: '肝肾阴虚', emotion: '烦躁', description: '阴液亏少，口干咽燥，手足心热，需滋阴清热', color: 'blue' },
  '痰湿质': { name: '痰湿质', wuxing: '土行壅滞', wuyin: '宫音(脾)', organ: '脾虚湿困', emotion: '困倦', description: '痰湿凝聚，体形肥胖，身重困倦，需化痰祛湿', color: 'yellow' },
  '湿热质': { name: '湿热质', wuxing: '火土郁热', wuyin: '徵音(心)', organ: '湿热内蕴', emotion: '急躁', description: '湿热内蕴，面垢油光，口苦口干，需清热祛湿', color: 'orange' },
  '血瘀质': { name: '血瘀质', wuxing: '木行郁滞', wuyin: '角音(肝)', organ: '肝郁血瘀', emotion: '抑郁', description: '血行不畅，肤色晦暗，易有瘀斑，需活血化瘀', color: 'purple' },
  '气郁质': { name: '气郁质', wuxing: '木行偏亢', wuyin: '角音(肝)', organ: '肝气郁结', emotion: '忧郁', description: '气机郁滞，神情抑郁，胸胁胀满，需疏肝解郁', color: 'green' },
  '特禀质': { name: '特禀质', wuxing: '五行失衡', wuyin: '辨质调理', organ: '先天禀赋不足', emotion: '敏感', description: '先天禀赋不足，过敏体质为主，需固本培元', color: 'pink' },
};

export interface DiagnosisTypeConfig {
  title: string;
  subtitle: string;
  gradient: string;
  color: string;
  tips: string[];
  captureHint: string;
  analyzeLabel: string;
  resultTitle: string;
  featureA: string;
  featureB: string;
}

export const DIAGNOSIS_CONFIG: Record<DiagnosisType, DiagnosisTypeConfig> = {
  tongue: {
    title: 'AI舌诊',
    subtitle: '拍照或上传舌头照片，AI分析舌质舌苔',
    gradient: 'from-red-600 to-amber-600',
    color: 'red',
    tips: ['自然光下，面对光源伸舌', '舌尖微翘，充分暴露舌面', '避免刚进食或饮用有色饮料后拍摄', '尽量不用滤镜，保持原色'],
    captureHint: '将舌头对准轮廓，舌尖朝上',
    analyzeLabel: '开始分析',
    resultTitle: '舌诊结果',
    featureA: '舌质特征',
    featureB: '舌苔特征',
  },
  face: {
    title: 'AI面诊',
    subtitle: '拍照或上传面部照片，AI望面色察五官',
    gradient: 'from-amber-600 to-yellow-500',
    color: 'amber',
    tips: ['自然光下，正面面对镜头', '面部放松，表情自然，不化妆', '露出额头、耳朵，头发不要遮挡面部', '保持适当距离，面部清晰可见'],
    captureHint: '请将面部对准框内',
    analyzeLabel: '开始分析',
    resultTitle: '面诊结果',
    featureA: '面色特征',
    featureB: '五官特征',
  },
  hand: {
    title: 'AI手诊',
    subtitle: '拍照或上传手掌照片，AI观掌纹察气色',
    gradient: 'from-purple-600 to-indigo-500',
    color: 'purple',
    tips: ['自然光下，掌心朝上面对镜头', '五指自然张开，充分暴露掌纹', '露出指甲，观察甲色甲形', '保持手部稳定，避免抖动模糊'],
    captureHint: '请将手掌放入框内',
    analyzeLabel: '开始分析',
    resultTitle: '手诊结果',
    featureA: '掌色特征',
    featureB: '掌纹特征',
  },
};

export const FLOW_STEP_CONFIG = [
  { key: 'jiuzhong', name: '九种体质', icon: ClipboardList, nextHref: '/diagnose/wuxing' },
  { key: 'wuxing', name: '五行体质', icon: FlameKindling, nextHref: '/diagnose' },
  { key: 'tongue', name: '舌诊', icon: Eye, nextHref: '/diagnose' },
  { key: 'hand', name: '手诊', icon: Hand, nextHref: '/diagnose' },
  { key: 'face', name: '面诊', icon: ScanFace, nextHref: '/diagnose/comprehensive' },
] as const;
