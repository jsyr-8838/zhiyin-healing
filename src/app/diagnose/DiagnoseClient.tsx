'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore, type DiagnosisFlow } from '@/lib/store';
import { consolidateDiagnosis, type NineConstitutionType } from '@/lib/unified-diagnosis';
import { getClientUserId } from '@/lib/auth';
import { Stethoscope, ClipboardList, Hand, Eye, ScanFace, ArrowRight, Sparkles, FlameKindling, Flame, CheckCircle2, SkipForward, Workflow, Droplets, Palette, Brain, TestTube } from 'lucide-react';
import {
  getPrescriptionsForConstitution,
  CONSTITUTION_PRESCRIPTIONS,
  type ConstitutionKey,
} from '@/lib/jiuliao-data';
import { CONSTITUTION_QUESTIONS } from '@/lib/data/diagnose-questions';
import {
  CONSTITUTION_INFO,
  DIAGNOSIS_CONFIG,
  FLOW_STEP_CONFIG,
  type DiagnosisType,
  type Tab,
} from '@/lib/data/diagnosis-config';
import { ensureUnderSize } from '@/lib/image-compress';

export default function DiagnoseClient() {
  const { lastProfile, setLastProfile, unifiedDiagnosis, setJiuZhongResult, setVisualDiagnosisResult, setWuYinTestResult, diagnosisFlow, advanceDiagnosisFlow, startDiagnosisFlow, exitDiagnosisFlow } = useAppStore();
  const consolidated = useMemo(() => consolidateDiagnosis(unifiedDiagnosis), [unifiedDiagnosis]);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('home');
  const [diagnosisType, setDiagnosisType] = useState<DiagnosisType>('tongue');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<{ primaryType: string; scores: Record<string, number> } | null>(null);

  // 处理 URL 参数：从其他页面跳转过来自动切换 tab
  useEffect(() => {
    const autoTab = searchParams.get('tab');
    const autoType = searchParams.get('type');
    if (autoTab === 'capture' && (autoType === 'tongue' || autoType === 'hand' || autoType === 'face')) {
      setDiagnosisType(autoType);
      setTab('capture');
      setCaptureImage(null);
      setCaptureImagePreview('');
      setCaptureResult(null);
    }
  }, [searchParams]);

  // 通用视觉诊断状态
  const [captureImage, setCaptureImage] = useState<File | null>(null);
  const [captureImagePreview, setCaptureImagePreview] = useState<string>('');
  const [captureLoading, setCaptureLoading] = useState(false);
  const [captureResult, setCaptureResult] = useState<{
    content: string;
    featureA: string;
    featureB: string;
    diagnosis: string;
    constitution: string;
    element: string;
    wuyin: string;
    organ: string;
    offline?: boolean;
    error?: string;
  } | null>(null);

  // 摄像头状态
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);      // 相册选择（无capture）
  const captureInputRef = useRef<HTMLInputElement | null>(null);    // 系统相机（有capture）

  async function handleAnswer(score: number) {
    const newAnswers = { ...answers, [CONSTITUTION_QUESTIONS[currentQ].id]: score };
    setAnswers(newAnswers);

    if (currentQ < CONSTITUTION_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // 计算结果
      const scores: Record<string, number> = {};
      CONSTITUTION_QUESTIONS.forEach(q => {
        scores[q.category] = (scores[q.category] || 0) + (newAnswers[q.id] || 0);
      });

      // 平和质反向处理：其他体质得分越低，平和质越高
      const otherMax = Math.max(...Object.entries(scores).filter(([k]) => k !== '平和质').map(([, v]) => v));
      scores['平和质'] = otherMax <= 6 ? scores['平和质'] + 12 : Math.max(scores['平和质'] - 6, 0);

      const primaryType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
      setResult({ primaryType, scores });

      // 写入统一明辨 store
      setJiuZhongResult({ primaryType: primaryType as NineConstitutionType, scores });

      // 异步保存到数据库
      try {
        const nineToWuyin: Record<string, string> = {
          '平和质': 'gong', '气虚质': 'gong', '阳虚质': 'zhi', '阴虚质': 'yu',
          '痰湿质': 'gong', '湿热质': 'zhi', '血瘀质': 'jiao', '气郁质': 'jiao', '特禀质': 'gong',
        };
        const wuyinScores: Record<string, number> = { jiao: 0, zhi: 0, gong: 0, shang: 0, yu: 0 };
        const dominantWuyin = nineToWuyin[primaryType] || 'gong';
        wuyinScores[dominantWuyin] = 5;
        await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: getClientUserId(),
            scores,
            primaryType,
            dominantWuyin,
            wuyinScores,
            recommendation: CONSTITUTION_INFO[primaryType]?.description || '',
          }),
        });
      } catch { /* 离线不阻塞 */ }

      setTab('result');
    }
  }

  function resetTest() {
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setTab('questionnaire');
  }

  // 图片选择处理（通用）
  const [imageCompressing, setImageCompressing] = useState(false);
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // 超过 1MB 时自动压缩
    if (file.size > 1024 * 1024) {
      setImageCompressing(true);
      try {
        const result = await ensureUnderSize(file, 1024 * 1024);
        setCaptureImage(result.blob);
        setCaptureImagePreview(result.dataUrl);
      } catch {
        // 压缩失败，降级用原始文件
        setCaptureImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => setCaptureImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      } finally {
        setImageCompressing(false);
      }
    } else {
      setCaptureImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCaptureImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  // 关闭摄像头
  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // 打开摄像头
  const [cameraError, setCameraError] = useState('');
  const openCamera = useCallback(async () => {
    setCameraError('');
    try { stopCamera(); } catch {}

    if (!navigator.mediaDevices) {
      setCameraError('浏览器不支持摄像头API，请使用Chrome或Edge');
      return;
    }

    // 跳过 permissions.query —— Edge 在 localhost 下可能返回 denied 但 getUserMedia 仍可工作
    // 直接调用 getUserMedia 让浏览器弹出权限提示
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          cameraVideoRef.current.play();
        }
      }, 100);
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError') {
        setCameraError('摄像头权限被拒绝。请在浏览器弹窗中点击"允许"，或检查地址栏左侧的摄像头图标是否被屏蔽。');
      } else if (e.name === 'NotFoundError') {
        setCameraError('未检测到摄像头设备，请确认摄像头已正确连接。');
      } else if (e.name === 'NotReadableError') {
        setCameraError('摄像头可能被其他应用占用，请关闭其他使用摄像头的程序后重试。');
      } else {
        setCameraError('摄像头打开失败: ' + e.message);
      }
    }
  }, [stopCamera]);

  // 从摄像头拍照
  const capturePhoto = useCallback(() => {
    const video = cameraVideoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${diagnosisType}-capture.jpg`, { type: 'image/jpeg' });
      setCaptureImage(file);
      setCaptureImagePreview(canvas.toDataURL('image/jpeg', 0.85));
      stopCamera();
    }, 'image/jpeg', 0.85);
  }, [stopCamera, diagnosisType]);

  // 通用视觉诊断分析
  async function handleAnalysis() {
    if (!captureImage) return;
    setCaptureLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', captureImage);
      formData.append('type', diagnosisType);
      formData.append('userId', getClientUserId());
      const res = await fetch('/api/visual-diagnosis', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setCaptureResult(data);
        // 写入统一明辨 store
        setVisualDiagnosisResult({
          type: diagnosisType,
          constitution: data.constitution || '平和',
          element: data.element || '土',
          wuyin: data.wuyin || '宫',
          organ: data.organ || '脏腑调和',
          diagnosis: data.diagnosis || '',
          featureA: data.featureA || '',
          featureB: data.featureB || '',
        });
        setTab('capture-result');
      } else {
        setCaptureResult((prev: any) => ({ ...(prev || {}), error: `${DIAGNOSIS_CONFIG[diagnosisType].title}分析失败，请重试` }));
      }
    } catch {
      setCaptureResult((prev: any) => ({ ...(prev || {}), error: '网络异常，请检查连接后重试' }));
    } finally {
      setCaptureLoading(false);
    }
  }

  const progress = ((Object.keys(answers).length) / CONSTITUTION_QUESTIONS.length) * 100;

  // ===== 明辨首页 =====
  if (tab === 'home') {
    const hasAnyDiagnosis = consolidated.completedModules.length > 0;
    const elementColors: Record<string, string> = { '木': '#6e9e74', '火': '#b56b62', '土': '#d9bd75', '金': '#94a3b8', '水': '#5ba89b' };

    // 脏腑能量映射
    const organEnergy: Record<string, number> = { '肝': 0, '心': 0, '脾': 0, '肺': 0, '肾': 0 };
    if (consolidated.primaryConstitution.includes('郁') || consolidated.primaryElement === '木') organEnergy['肝'] = 85;
    if (consolidated.primaryConstitution.includes('火') || consolidated.primaryConstitution.includes('热') || consolidated.primaryElement === '火') organEnergy['心'] = 88;
    if (consolidated.primaryConstitution.includes('虚') && !consolidated.primaryConstitution.includes('阳')) organEnergy['脾'] = 62;
    if (consolidated.primaryConstitution.includes('湿') || consolidated.primaryElement === '土') organEnergy['脾'] = 78;
    if (consolidated.primaryConstitution.includes('瘀') || consolidated.primaryElement === '金') organEnergy['肺'] = 72;
    if (consolidated.primaryConstitution.includes('阴虚') || consolidated.primaryElement === '水') organEnergy['肾'] = 80;
    if (consolidated.primaryConstitution.includes('阳虚')) { organEnergy['肾'] = 58; organEnergy['脾'] = 65; }
    if (consolidated.primaryConstitution.includes('平和')) { organEnergy['肝'] = 82; organEnergy['心'] = 84; organEnergy['脾'] = 86; organEnergy['肺'] = 82; organEnergy['肾'] = 80; }
    // 填充未设置的为默认值
    for (const k of Object.keys(organEnergy)) { if (!organEnergy[k]) organEnergy[k] = 68 + Math.floor(Math.random() * 12); }

    return (
      <PageContainer theme="diagnose" className="pb-24 pattern-clouds">
        {/* 宣纸背景上的毛玻璃头部 */}
        <div className="px-5 pt-12 pb-8" style={{ background: 'linear-gradient(150deg, rgba(93,138,99,0.85), rgba(61,97,66,0.90))',
}}>
          <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '0.12em' }}>明辨</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.72)' }}>体质辨识 · 中医自助诊断 · 综合分析</p>
        </div>

        <div className="px-4 pt-5 space-y-4">
          {/* 综合明辨结果卡片 — 毛玻璃 + 脏腑能量柱 */}
          {hasAnyDiagnosis && (
            <div className="glass-card p-5 animate-breathe">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-1.5" style={{ color: '#456b4e' }}>
                  <Sparkles size={16} /> 综合明辨结果
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: '#456b4e', background: 'rgba(110,158,116,0.15)' }}>
                  {consolidated.completedModules.length}/{consolidated.totalModules} 项已完成
                </span>
              </div>
              <div className="text-center mb-4">
                <p className="text-3xl font-black" style={{ color: '#27342c' }}>{consolidated.primaryConstitution}</p>
                <div className="flex justify-center gap-3 mt-2">
                  <span className="text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ backgroundColor: elementColors[consolidated.primaryElement] || '#6e9e74' }}>
                    {consolidated.primaryElement}行
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: '#6e9e74', background: 'rgba(143,200,189,0.2)' }}>
                    {consolidated.primaryWuYin}音
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: '#6e9e74', background: 'rgba(217,189,117,0.2)' }}>
                    {consolidated.primaryOrgan}
                  </span>
                </div>
              </div>

              {/* 脏腑能量柱 */}
              <div className="mt-4 mb-2">
                <p className="text-xs mb-2" style={{ color: 'rgba(39,52,44,0.62)' }}>脏腑能量</p>
                <div className="grid grid-cols-5 gap-3 items-end" style={{ minHeight: '120px' }}>
                  {Object.entries(organEnergy).map(([name, value]) => (
                    <div key={name} className="grid justify-items-center gap-1">
                      <div className="relative w-10 rounded-full overflow-hidden" style={{ height: '100px', background: 'rgba(255,255,255,0.32)', boxShadow: 'inset 0 0 18px rgba(255,255,255,0.36)' }}>
                        <i className="absolute left-1 right-1 bottom-1 rounded-full" style={{
                          height: `${value}%`,
                          background: 'linear-gradient(180deg, rgba(239,196,159,0.9), rgba(110,158,116,0.9))',
                          boxShadow: '0 -10px 22px rgba(223,190,128,0.28)',
                          animation: 'energy-rise 2.6s ease-out both',
                        }} />
                      </div>
                      <small className="font-medium" style={{ color: '#456b4e' }}>{name}</small>
                      <small style={{ color: 'rgba(39,52,44,0.44)', fontSize: '10px' }}>{value}</small>
                    </div>
                  ))}
                </div>
              </div>

              {/* 各模块完成状态 */}
              <div className="flex gap-1.5 flex-wrap mt-3">
                {['九种体质', '五行体质', '舌诊', '面诊', '手诊', '五音测试'].map(name => {
                  const done = consolidated.completedModules.includes(name);
                  return (
                    <span key={name} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                      color: done ? '#456b4e' : 'rgba(39,52,44,0.38)',
                      background: done ? 'rgba(110,158,116,0.15)' : 'rgba(255,255,255,0.3)',
                    }}>
                      {done ? '✓' : '○'} {name}
                    </span>
                  );
                })}
              </div>
              {/* 疗愈方案入口 + 推荐灸疗处方 */}
              {(() => {
                const cKey = consolidated.primaryConstitution as ConstitutionKey;
                const mapping = CONSTITUTION_PRESCRIPTIONS[cKey];
                if (!mapping) return (
                  <Link
                    href="/healing"
                    className="mt-4 flex items-center justify-center gap-2 py-3 text-white rounded-xl font-bold text-sm"
                    style={{ background: 'linear-gradient(145deg, #6e9e74, #8fc8bd)' }}
                  >
                    <Sparkles size={16} /> 查看个性化疗愈方案
                    <ArrowRight size={16} />
                  </Link>
                );
                const topPrescriptions = getPrescriptionsForConstitution(cKey).slice(0, 3);
                return (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Flame size={14} className="text-amber-600" />
                        <h4 className="text-xs font-bold" style={{ color: '#456b4e' }}>体质推荐灸方</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: '#d9bd75', background: 'rgba(217,189,117,0.2)' }}>{topPrescriptions.length}方</span>
                      </div>
                      <div className="space-y-1.5">
                        {topPrescriptions.map(p => (
                          <Link key={p.id} href={`/jiuliao?highlight=${p.id}`}
                            className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(217,189,117,0.2)' }}>
                            <span className="text-[10px] px-1 py-0.5 rounded bg-red-50 text-red-600">{p.points[0]?.replace('(双)', '')}</span>
                            <span className="text-[11px] font-bold flex-1 truncate" style={{ color: '#27342c' }}>{p.name}</span>
                            <ArrowRight size={12} className="text-gray-300" />
                          </Link>
                        ))}
                      </div>
                    </div>
                    <Link
                      href="/healing"
                      className="flex items-center justify-center gap-2 py-3 text-white rounded-xl font-bold text-sm"
                      style={{ background: 'linear-gradient(145deg, #6e9e74, #8fc8bd)' }}
                    >
                      <Sparkles size={16} /> 查看个性化疗愈方案
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })()}
            </div>
          )}
          {/* 辨证流水线入口 */}
          {!diagnosisFlow.active && (
            <button
              onClick={startDiagnosisFlow}
              className="w-full relative overflow-hidden rounded-2xl p-5 text-left text-white shadow-lg active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg, #4a7c59, #d4a843)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/20 flex-shrink-0">
                  <Workflow size={26} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">辨证流水线</h3>
                  <p className="text-sm mt-0.5 text-white/80">九种体质→五行→舌→手→面→AI综合辨证</p>
                  <p className="text-[10px] mt-1 text-white/60">五步串联，汇总后AI智能出报告</p>
                </div>
                <ArrowRight size={20} className="text-white/60" />
              </div>
              {/* 装饰 */}
              <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10" />
            </button>
          )}

          {/* 流水线进行中提示 */}
          {diagnosisFlow.active && (
            <div className="glass-card p-4 ring-2 ring-emerald-400/40">
              <div className="flex items-center gap-2 mb-3">
                <Workflow size={16} style={{ color: '#456b4e' }} />
                <span className="text-sm font-bold" style={{ color: '#456b4e' }}>辨证流水线进行中</span>
                <span className="text-xs ml-auto" style={{ color: 'rgba(39,52,44,0.5)' }}>第{diagnosisFlow.currentStep + 1}/5步</span>
              </div>
              <div className="flex gap-1 mb-3">
                {FLOW_STEP_CONFIG.map((step, i) => (
                  <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: i < diagnosisFlow.currentStep ? '#456b4e' : i === diagnosisFlow.currentStep ? 'rgba(110,158,116,0.15)' : 'rgba(255,255,255,0.3)',
                        color: i < diagnosisFlow.currentStep ? 'white' : i === diagnosisFlow.currentStep ? '#456b4e' : 'rgba(39,52,44,0.3)',
                        border: i === diagnosisFlow.currentStep ? '2px solid #456b4e' : 'none',
                      }}
                    >
                      {i < diagnosisFlow.currentStep ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span className="text-[9px]" style={{ color: i <= diagnosisFlow.currentStep ? '#456b4e' : 'rgba(39,52,44,0.35)' }}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (diagnosisFlow.currentStep === 0) {
                      setTab('questionnaire');
                    } else if (diagnosisFlow.currentStep === 2) {
                      setDiagnosisType('tongue'); setTab('capture');
                    } else if (diagnosisFlow.currentStep === 3) {
                      setDiagnosisType('hand'); setTab('capture');
                    } else if (diagnosisFlow.currentStep === 4) {
                      setDiagnosisType('face'); setTab('capture');
                    }
                  }}
                  className="flex-1 py-2.5 rounded-lg text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(145deg, #6e9e74, #8fc8bd)' }}
                >
                  继续第{diagnosisFlow.currentStep + 1}步
                </button>
                <button
                  onClick={exitDiagnosisFlow}
                  className="px-3 py-2.5 rounded-lg text-xs border border-gray-200 text-gray-500"
                >
                  退出流水线
                </button>
              </div>
            </div>
          )}

          {/* 体质问卷 */}
          <button
            onClick={() => { if (result) setTab('result'); else setTab('questionnaire'); }}
            className="w-full glass-card p-5 hover:shadow-lg transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(145deg, #6e9e74, #8fc8bd)' }}>
                <ClipboardList size={26} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg" style={{ color: '#27342c' }}>九种体质测评</h3>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(39,52,44,0.62)' }}>22题专业量表 · 含舌象/情绪/温度维度</p>
                {result && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: '#456b4e', background: 'rgba(110,158,116,0.15)' }}>
                    已测评：{result.primaryType}
                  </span>
                )}
              </div>
              <ArrowRight size={20} className="text-gray-300" />
            </div>
          </button>

          {/* 五行体质计算 */}
          <Link
            href="/diagnose/wuxing"
            className="block w-full glass-card p-5 hover:shadow-lg transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(145deg, #d9bd75, #c4a45a)' }}>
                <FlameKindling size={26} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg" style={{ color: '#27342c' }}>五行体质计算</h3>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(39,52,44,0.62)' }}>四柱八字 · 日主强弱 · 用神忌神 · 大运流年</p>
              </div>
              <ArrowRight size={20} className="text-gray-300" />
            </div>
          </Link>

          {/* 中医自助诊断 */}
          <div>
            <h3 className="font-bold mb-3" style={{ color: '#27342c' }}>中医自助诊断</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { setDiagnosisType('tongue'); setTab('capture'); }}
                className="glass-card p-4 hover:shadow-lg transition text-center"
              >
                <Eye size={28} className="mx-auto mb-2" style={{ color: '#b56b62' }} />
                <h4 className="font-bold text-sm" style={{ color: '#27342c' }}>舌诊</h4>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(39,52,44,0.5)' }}>拍舌头·AI辨证</p>
              </button>
              <button
                onClick={() => { setDiagnosisType('face'); setTab('capture'); }}
                className="glass-card p-4 hover:shadow-lg transition text-center"
              >
                <ScanFace size={28} className="mx-auto mb-2" style={{ color: '#d9bd75' }} />
                <h4 className="font-bold text-sm" style={{ color: '#27342c' }}>面诊</h4>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(39,52,44,0.5)' }}>望面色·察五官</p>
              </button>
              <button
                onClick={() => { setDiagnosisType('hand'); setTab('capture'); }}
                className="glass-card p-4 hover:shadow-lg transition text-center"
              >
                <Hand size={28} className="mx-auto mb-2" style={{ color: '#8fc8bd' }} />
                <h4 className="font-bold text-sm" style={{ color: '#27342c' }}>手诊</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">观掌纹·察气色</p>
              </button>
            </div>
          </div>

          {/* 香氛与色彩诊断 */}
          <div>
            <h3 className="font-bold mb-3" style={{ color: '#27342c' }}>香氛与色彩</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/diagnose/aroma-quiz"
                className="glass-card p-4 hover:shadow-lg transition text-center"
              >
                <Droplets size={28} className="mx-auto mb-2" style={{ color: '#5ba09a' }} />
                <h4 className="font-bold text-sm" style={{ color: '#27342c' }}>香氛基因</h4>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(39,52,44,0.5)' }}>5步测评·精油推荐</p>
              </Link>
              <Link
                href="/diagnose/oil-psych"
                className="glass-card p-4 hover:shadow-lg transition text-center"
              >
                <FlameKindling size={28} className="mx-auto mb-2" style={{ color: '#c26158' }} />
                <h4 className="font-bold text-sm" style={{ color: '#27342c' }}>精油心理</h4>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(39,52,44,0.5)' }}>选3款精油·心理画像</p>
              </Link>
              <Link
                href="/diagnose/color-test"
                className="glass-card p-4 hover:shadow-lg transition text-center"
              >
                <Palette size={28} className="mx-auto mb-2" style={{ color: '#c9a94f' }} />
                <h4 className="font-bold text-sm" style={{ color: '#27342c' }}>色彩诊断</h4>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(39,52,44,0.5)' }}>12季型·专属配色</p>
              </Link>
              <Link
                href="/diagnose/personality"
                className="glass-card p-4 hover:shadow-lg transition text-center"
              >
                <Brain size={28} className="mx-auto mb-2" style={{ color: '#5d8a63' }} />
                <h4 className="font-bold text-sm" style={{ color: '#27342c' }}>五维人格</h4>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(39,52,44,0.5)' }}>20题评估·智能辨证</p>
              </Link>
            </div>
          </div>

          {/* 已有结果则显示综合分析入口 */}
          {result && (
            <Link
              href="/healing"
              className="block bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={24} />
                <div>
                  <h3 className="font-bold">查看你的疗愈方案</h3>
                  <p className="text-sm text-emerald-200 mt-0.5">{result.primaryType} · 个性化推荐</p>
                </div>
                <ArrowRight size={20} className="ml-auto" />
              </div>
            </Link>
          )}
        </div>

        <BottomNav />
      </PageContainer>
    );
  }

  // ===== 问卷页 =====
  if (tab === 'questionnaire') {
    const q = CONSTITUTION_QUESTIONS[currentQ];
    return (
      <PageContainer theme="diagnose" className="flex flex-col">
        {/* 进度条 */}
        <div className="bg-white/60 border-b border-[rgba(93,138,99,0.15)] px-5 pt-12 pb-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setTab('home')} className="text-gray-500 text-sm">
              {diagnosisFlow.active ? '退出' : '取消'}
            </button>
            <span className="text-sm text-gray-500">
              {diagnosisFlow.active && <span className="text-emerald-600 font-medium">流水线 1/5 · </span>}
              {currentQ + 1}/{CONSTITUTION_QUESTIONS.length}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-400">
            <span>分类：{q.category}</span>
            <span>维度：{q.dimension}</span>
          </div>
        </div>

        {/* 问题 */}
        <div className="flex-1 px-5 py-8 flex flex-col justify-center">
          <h2 className="text-xl font-black text-gray-900 text-center leading-relaxed">{q.question}</h2>

          <div className="mt-8 space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt.score)}
                className="w-full py-4 px-5 rounded-xl border border-gray-200 bg-white text-left hover:border-emerald-400 hover:bg-emerald-50 transition text-gray-800 font-medium"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <BottomNav />
      </PageContainer>
    );
  }

  // ===== 结果页（流水线模式：只显示"继续"） =====
  if (tab === 'result' && result) {
    // 流水线模式：九种体质完成后，导引到下一步
    if (diagnosisFlow.active && diagnosisFlow.currentStep === 0) {
      return (
        <PageContainer theme="diagnose" className="pb-24">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-5 pt-12 pb-8 text-white">
            <div className="text-center">
              <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-200" />
              <h1 className="text-xl font-black">九种体质已保存</h1>
              <p className="text-emerald-100 text-sm mt-2">{result.primaryType}</p>
            </div>
          </div>
          <div className="px-4 pt-6 space-y-4">
            <p className="text-center text-sm text-gray-500 font-serif">
              下一步：五行体质计算
            </p>
            <Link
              href="/diagnose/wuxing"
              onClick={() => { advanceDiagnosisFlow(); }}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm"
              style={{ background: 'linear-gradient(145deg, #6e9e74, #8fc8bd)' }}
            >
              继续第2步 · 五行体质 <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setTab('home')}
              className="w-full py-3 rounded-xl text-sm text-gray-500 border border-gray-200"
            >
              返回首页
            </button>
          </div>
          <BottomNav />
        </PageContainer>
      );
    }

    // 正常模式：显示完整结果
    const info = CONSTITUTION_INFO[result.primaryType];
    const sortedTypes = Object.entries(result.scores).sort((a, b) => b[1] - a[1]);
    const maxScore = sortedTypes[0]?.[1] || 1;
    const colorMap: Record<string, string> = {
      emerald: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500', blue: 'bg-blue-500',
      yellow: 'bg-yellow-500', orange: 'bg-orange-500', purple: 'bg-purple-500', green: 'bg-green-500', pink: 'bg-pink-500',
    };

    return (
      <PageContainer theme="diagnose" className="pb-24">
        <div className={`bg-gradient-to-br from-emerald-600 to-teal-700 px-5 pt-12 pb-8 text-white`}>
          <div className="text-center">
            <p className="text-emerald-200 text-sm">你的体质类型</p>
            <h1 className="text-3xl font-black mt-1">{info.name}</h1>
            <p className="text-emerald-100 text-sm mt-2 max-w-xs mx-auto">{info.description}</p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-emerald-200">五行</p>
              <p className="font-bold text-sm">{info.wuxing}</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-emerald-200">五音</p>
              <p className="font-bold text-sm">{info.wuyin}</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-emerald-200">脏腑</p>
              <p className="font-bold text-sm">{info.organ}</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-emerald-200">情志</p>
              <p className="font-bold text-sm">{info.emotion}</p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-5 space-y-4">
          {/* 九种体质得分 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">九种体质得分</h3>
            <div className="space-y-2">
              {sortedTypes.map(([type, score]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={`text-xs w-16 text-right ${type === result.primaryType ? 'font-black text-emerald-700' : 'text-gray-500'}`}>
                    {type}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${type === result.primaryType ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-300'}`}
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 推荐灸疗处方 */}
          {(() => {
            const cKey = result.primaryType as ConstitutionKey;
            const mapping = CONSTITUTION_PRESCRIPTIONS[cKey];
            if (!mapping) return null;
            const topPrescriptions = getPrescriptionsForConstitution(cKey).slice(0, 5);
            return (
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={16} className="text-amber-600" />
                  <h3 className="font-bold text-gray-900">推荐灸疗处方</h3>
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{result.primaryType}体质</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{mapping.rationale}</p>
                <div className="space-y-2">
                  {topPrescriptions.map(p => (
                    <Link key={p.id} href={`/jiuliao?highlight=${p.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-amber-100 hover:border-amber-300 hover:bg-amber-50/50 transition">
                      <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold flex-shrink-0">{p.id}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{p.name}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{p.indication}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {p.points.slice(0, 2).map((pt, i) => (
                          <span key={i} className="text-[10px] px-1 py-0.5 rounded bg-red-50 text-red-600">{pt.replace('(双)', '')}</span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href={`/jiuliao?constitution=${encodeURIComponent(result.primaryType)}`}
                  className="flex items-center justify-center gap-1.5 mt-3 py-2 text-amber-700 text-sm font-bold hover:bg-amber-50 rounded-lg transition">
                  查看全部 {getPrescriptionsForConstitution(cKey).length} 个推荐处方 <ArrowRight size={14} />
                </Link>
              </div>
            );
          })()}
          <Link
            href="/healing"
            className="block bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={24} />
              <div>
                <h3 className="font-bold">查看你的个人疗愈方案</h3>
                <p className="text-sm text-emerald-200 mt-0.5">灸疗 · 六字诀 · 五音 · 脉轮 · 颂钵</p>
              </div>
              <ArrowRight size={20} className="ml-auto" />
            </div>
          </Link>

          {/* 重新测试 */}
          <button
            onClick={resetTest}
            className="w-full py-3 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
          >
            重新测评
          </button>
        </div>

        <BottomNav />
      </PageContainer>
    );
  }

  // ===== 通用视觉诊断拍照页 =====
  if (tab === 'capture') {
    const cfg = DIAGNOSIS_CONFIG[diagnosisType];
    const isFlowStep = diagnosisFlow.active && (diagnosisFlow.currentStep === 2 || diagnosisFlow.currentStep === 3 || diagnosisFlow.currentStep === 4);
    return (
      <PageContainer theme="diagnose" className="pb-24">
        <div className={`bg-gradient-to-r ${cfg.gradient} px-5 pt-12 pb-5 text-white`}>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => { stopCamera(); setCaptureImage(null); setCaptureImagePreview(''); setTab('home'); }} className="text-white/70">←</button>
            <h1 className="text-lg font-black">{cfg.title}</h1>
            {isFlowStep && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 ml-auto">
                流水线 第{diagnosisFlow.currentStep + 1}/5步
              </span>
            )}
          </div>
          <p className="text-sm text-white/80">{cfg.subtitle}</p>
        </div>

        <div className="px-4 pt-5 space-y-4">
           {/* 拍照提示 — 舌诊增强为分步检查清单 */}
           {diagnosisType === 'tongue' ? (
             <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)', border: '1px solid #F59E0B' }}>
               <h3 className="font-bold mb-2.5" style={{ color: '#92400E' }}>拍照前检查</h3>
               <div className="space-y-2">
                 {[
                   { step: '光', label: '自然光源在前方', desc: '面对窗户或灯光，避免逆光' },
                   { step: '洁', label: '口腔清洁无染色', desc: '饭后漱口，咖啡/茶/烟后30分钟再拍' },
                   { step: '伸', label: '自然伸舌露舌面', desc: '舌尖微翘，不用力，充分暴露' },
                   { step: '稳', label: '稳定对焦无模糊', desc: '手机稳定持握，等待自动对焦完成' },
                 ].map((item, i) => (
                   <div key={i} className="flex items-start gap-2.5">
                     <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ background: '#F59E0B20', color: '#B45309', border: '1px solid #F59E0B40' }}>
                       {item.step}
                     </span>
                     <div>
                       <span className="text-sm font-bold" style={{ color: '#92400E' }}>{item.label}</span>
                       <span className="text-xs ml-1.5" style={{ color: '#A16207' }}>{item.desc}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           ) : (
             <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
               <h3 className="font-bold text-amber-800 mb-2">拍照要求</h3>
               <ul className="text-sm text-amber-700 space-y-1">
                 {cfg.tips.map((tip, i) => (
                   <li key={i}>{i + 1}. {tip}</li>
                 ))}
               </ul>
             </div>
           )}

           {/* 图片区域 */}
           <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
             {captureImagePreview ? (
               <div>
                 <img src={captureImagePreview} alt="诊断照片" className="max-h-64 mx-auto rounded-xl mb-4" />
                 <div className="flex gap-3 justify-center">
                   <button
                     onClick={() => { setCaptureImage(null); setCaptureImagePreview(''); }}
                     className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                   >
                     重新选择
                   </button>
                   <button
                     onClick={handleAnalysis}
                     disabled={captureLoading}
                     className={`px-6 py-2 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white font-bold text-sm disabled:opacity-50`}
                   >
                     {captureLoading ? 'AI分析中...' : cfg.analyzeLabel}
                   </button>
                 </div>
               </div>
             ) : cameraActive ? (
               /* 摄像头实时预览 */
               <div>
                 <div className="relative rounded-xl overflow-hidden bg-black mx-auto" style={{ maxWidth: '640px' }}>
                   <video
                     ref={cameraVideoRef}
                     autoPlay
                     playsInline
                     muted
                     className="w-full"
                     style={{ transform: 'scaleX(-1)' }}
                   />
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     {diagnosisType === 'tongue' ? (
                       /* 舌诊专属：舌头轮廓引导框 */
                       <svg width="200" height="240" viewBox="0 0 200 240" fill="none" style={{ opacity: 0.55 }}>
                         <path d="M100 8 C62 8, 30 40, 24 80 C18 120, 14 170, 30 200 C42 222, 64 236, 100 236 C136 236, 158 222, 170 200 C186 170, 182 120, 176 80 C170 40, 138 8, 100 8 Z"
                           stroke="white" strokeWidth="2.5" strokeDasharray="8 4" fill="rgba(255,255,255,0.06)" />
                         {/* 舌尖标注 */}
                         <text x="100" y="6" textAnchor="middle" fill="white" fontSize="10" opacity="0.7">舌尖 ↑</text>
                         {/* 中线辅助 */}
                         <line x1="100" y1="30" x2="100" y2="220" stroke="white" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.25" />
                       </svg>
                     ) : diagnosisType === 'face' ? (
                       /* 面诊：椭圆脸型框 */
                       <svg width="200" height="260" viewBox="0 0 200 260" fill="none" style={{ opacity: 0.55 }}>
                         <ellipse cx="100" cy="130" rx="85" ry="115" stroke="white" strokeWidth="2.5" strokeDasharray="8 4" fill="rgba(255,255,255,0.06)" />
                         {/* 中线 */}
                         <line x1="100" y1="20" x2="100" y2="240" stroke="white" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.25" />
                       </svg>
                     ) : (
                       /* 手诊：圆角方形框 */
                       <div className="w-52 h-52 border-2 border-white/50 rounded-3xl" />
                     )}
                   </div>
                   <div className="absolute bottom-3 left-0 right-0 text-center">
                     <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                       {cfg.captureHint}
                     </span>
                   </div>
                 </div>
                 <div className="flex gap-3 justify-center mt-4">
                   <button
                     onClick={stopCamera}
                     className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-bold"
                   >
                     取消
                   </button>
                   <button
                     onClick={capturePhoto}
                     className={`px-6 py-2.5 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white font-bold text-sm`}
                   >
                     拍照
                   </button>
                 </div>
               </div>
             ) : (
               <div className="space-y-3">
                 {cameraError && (
                   <div className="bg-red-50 rounded-xl p-4 border border-red-300">
                     <p className="font-bold text-red-800 text-sm mb-1">摄像头无法使用</p>
                     <p className="text-xs text-red-600">{cameraError}</p>
                     <button
                       onClick={() => window.open('ms-settings:privacy-webcam', '_blank')}
                       className="mt-3 w-full py-2 rounded-lg bg-white border border-red-200 text-xs text-red-700 font-bold hover:bg-red-100 transition"
                     >
                       打开 Windows 摄像头设置检查
                     </button>
                   </div>
                 )}

                 <button
                   onClick={openCamera}
                   className={`w-full py-5 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white font-bold flex items-center justify-center gap-2 hover:shadow-md transition`}
                 >
                   {diagnosisType === 'tongue' ? <Eye size={20} /> : diagnosisType === 'face' ? <ScanFace size={20} /> : <Hand size={20} />}
                   打开相机拍照
                 </button>
                 <div className="flex items-center gap-3 text-gray-300">
                   <div className="flex-1 h-px bg-gray-200" />
                   <span className="text-xs">或</span>
                   <div className="flex-1 h-px bg-gray-200" />
                 </div>
                 <label className="block cursor-pointer">
                   <div className="w-full py-5 rounded-xl border-2 border-dashed border-gray-300 hover:border-amber-400 transition text-center">
                      <p className="font-bold text-gray-600">{imageCompressing ? '压缩中...' : '从相册选择图片'}</p>
                      <p className="text-xs text-gray-400 mt-1">支持 JPG/PNG · 超过1MB自动压缩</p>
                   </div>
                   <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/*"
                     onChange={(e) => {
                       handleImageChange(e);
                       e.target.value = '';
                     }}
                     className="hidden"
                   />
                 </label>
               </div>
             )}
           </div>

           <input
             ref={captureInputRef}
             type="file"
             accept="image/*"
             capture="environment"
             onChange={(e) => {
               handleImageChange(e);
               e.target.value = '';
             }}
             className="hidden"
           />

           {/* 流水线模式：允许跳过 */}
           {isFlowStep && (
             <button
               onClick={() => {
                 const nextStepIdx = diagnosisFlow.currentStep + 1;
                 advanceDiagnosisFlow();
                 const isLast = nextStepIdx >= 5;
                 if (isLast) {
                   window.location.href = '/diagnose/comprehensive';
                 } else if (nextStepIdx === 3) {
                   setDiagnosisType('hand');
                   setCaptureImage(null);
                   setCaptureImagePreview('');
                   setCaptureResult(null);
                   // stay on capture tab for hand
                 } else if (nextStepIdx === 4) {
                   setDiagnosisType('face');
                   setCaptureImage(null);
                   setCaptureImagePreview('');
                   setCaptureResult(null);
                 }
               }}
               className="w-full py-3 rounded-xl text-sm text-gray-400 border border-gray-200 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition"
             >
               <SkipForward size={14} />
               跳过此步骤
             </button>
           )}
         </div>

         <BottomNav />
       </PageContainer>
     );
  }

  // ===== 通用视觉诊断结果页 =====
  if (tab === 'capture-result' && captureResult) {
    // 错误状态展示
    if (captureResult.error) {
      return (
        <PageContainer theme="diagnose" className="pb-24">
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="glass-card p-8 text-center max-w-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold font-serif text-gray-800 mb-2">分析失败</h2>
              <p className="text-sm text-gray-500 mb-6">{captureResult.error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setCaptureResult(null); setTab('capture'); }}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 text-white text-sm font-bold font-serif transition hover:shadow-md"
                >
                  重新拍摄
                </button>
                <button
                  onClick={() => setTab('home')}
                  className="px-6 py-2.5 rounded-lg bg-white text-gray-700 text-sm font-bold font-serif transition hover:shadow-md border border-gray-200"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
          <BottomNav />
        </PageContainer>
      );
    }

    // 流水线模式：视觉诊断完成后，导引到下一步
    if (diagnosisFlow.active && (diagnosisFlow.currentStep === 2 || diagnosisFlow.currentStep === 3 || diagnosisFlow.currentStep === 4)) {
      const nextStepIdx = diagnosisFlow.currentStep + 1;
      advanceDiagnosisFlow();
      const isLast = nextStepIdx >= 5;
      const nextStepName = isLast ? '综合明辨' : FLOW_STEP_CONFIG[nextStepIdx]?.name || '';
      const cfg = DIAGNOSIS_CONFIG[diagnosisType];

      // 判断下一步是否为视觉诊断类型
      const nextIsVisual = nextStepIdx === 3 || nextStepIdx === 4;

      return (
        <PageContainer theme="diagnose" className="pb-24">
          <div className={`bg-gradient-to-r ${cfg.gradient} px-5 pt-12 pb-6 text-white`}>
            <div className="text-center">
              <CheckCircle2 size={48} className="mx-auto mb-3 text-white/60" />
              <h1 className="text-xl font-black">{cfg.resultTitle}已保存</h1>
              <p className="text-white/80 text-sm mt-1">{captureResult.constitution}质 · {captureResult.element}行</p>
            </div>
          </div>
          <div className="px-4 pt-6 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500 font-serif">
                {isLast ? '全部完成，即将AI综合分析' : `下一步：${nextStepName}`}
              </p>
              {/* 流水线进度 */}
              <div className="flex justify-center gap-1">
                {FLOW_STEP_CONFIG.map((step, i) => (
                  <div
                    key={step.key}
                    className="w-8 h-1.5 rounded-full"
                    style={{
                      backgroundColor: i <= diagnosisFlow.currentStep ? '#456b4e' : '#d1d5db',
                    }}
                  />
                ))}
              </div>
            </div>

            {isLast ? (
              <Link
                href="/diagnose/comprehensive"
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm"
                style={{ background: 'linear-gradient(145deg, #d9bd75, #c4a45a)' }}
              >
                <Sparkles size={16} /> 查看AI综合明辨结果 <ArrowRight size={16} />
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (nextStepIdx === 3) {
                    setDiagnosisType('hand');
                    setTab('capture');
                    setCaptureImage(null);
                    setCaptureImagePreview('');
                    setCaptureResult(null);
                  } else if (nextStepIdx === 4) {
                    setDiagnosisType('face');
                    setTab('capture');
                    setCaptureImage(null);
                    setCaptureImagePreview('');
                    setCaptureResult(null);
                  }
                }}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm w-full"
                style={{ background: 'linear-gradient(145deg, #6e9e74, #8fc8bd)' }}
              >
                继续第{nextStepIdx + 1}步 · {nextStepName} <ArrowRight size={16} />
              </button>
            )}

            <button
              onClick={() => { setTab('home'); }}
              className="w-full py-3 rounded-xl text-sm text-gray-500 border border-gray-200"
            >
              返回首页
            </button>
          </div>
          <BottomNav />
        </PageContainer>
      );
    }

    // 正常模式：显示完整结果
    const cfg = DIAGNOSIS_CONFIG[diagnosisType];
    return (
      <PageContainer theme="diagnose" className="pb-24">
        <div className={`bg-gradient-to-r ${cfg.gradient} px-5 pt-12 pb-6 text-white`}>
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => { setTab('capture'); setCaptureResult(null); }} className="text-white/70">←</button>
            <h1 className="text-lg font-black">{cfg.resultTitle}</h1>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-black">{captureResult.constitution}质</h2>
            <p className="text-white/80 text-sm mt-1">{captureResult.diagnosis}</p>
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-white/70">五行</p>
              <p className="font-bold text-sm">{captureResult.element}</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-white/70">五音</p>
              <p className="font-bold text-sm">{captureResult.wuyin}</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-white/70">脏腑</p>
              <p className="font-bold text-sm">{captureResult.organ}</p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-5 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{cfg.featureA}</h4>
                <p className="text-sm text-gray-700">{captureResult.featureA}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{cfg.featureB}</h4>
                <p className="text-sm text-gray-700">{captureResult.featureB}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">诊断结果</h4>
                <p className="text-sm text-gray-700">{captureResult.diagnosis}</p>
              </div>
            </div>
          </div>

          {captureResult.offline && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-center">
              <p className="text-xs text-amber-700">未配置视觉模型API，当前为模拟分析结果</p>
              <p className="text-xs text-amber-600 mt-0.5">配置 VISION_MODEL 后可获得真实AI分析</p>
            </div>
          )}

          {/* 推荐灸疗处方 */}
          {(() => {
            const cKey = captureResult.constitution as ConstitutionKey;
            const mapping = CONSTITUTION_PRESCRIPTIONS[cKey];
            if (!mapping) return null;
            const topPrescriptions = getPrescriptionsForConstitution(cKey).slice(0, 3);
            return (
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={16} className="text-amber-600" />
                  <h3 className="font-bold text-gray-900 text-sm">推荐灸疗处方</h3>
                </div>
                <div className="space-y-2">
                  {topPrescriptions.map(p => (
                    <Link key={p.id} href={`/jiuliao?highlight=${p.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg border border-amber-100 hover:border-amber-300 transition">
                      <span className="text-[10px] px-1 py-0.5 rounded bg-red-50 text-red-600">{p.points[0]?.replace('(双)', '')}</span>
                      <span className="text-xs font-bold text-gray-900 truncate flex-1">{p.name}</span>
                      <ArrowRight size={12} className="text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          <Link
            href="/healing"
            className={`block bg-gradient-to-r ${cfg.gradient} rounded-2xl p-5 text-white`}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={24} />
              <div>
                <h3 className="font-bold">查看你的疗愈方案</h3>
                <p className="text-sm text-white/80 mt-0.5">{captureResult.constitution}质 · {captureResult.wuyin}音调理</p>
              </div>
              <ArrowRight size={20} className="ml-auto" />
            </div>
          </Link>

          <button
            onClick={() => { setTab('capture'); setCaptureResult(null); setCaptureImage(null); setCaptureImagePreview(''); }}
            className="w-full py-3 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
          >
            重新{cfg.title.replace('AI', '')}
          </button>
        </div>

        <BottomNav />
      </PageContainer>
    );
  }

  return null;
}
