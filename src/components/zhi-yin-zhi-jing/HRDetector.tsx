'use client';

import { useState } from 'react';
import { Heart, Hand, ChevronRight, X, Bluetooth } from 'lucide-react';
import styles from './zhi-yin-zhi-jing.module.css';

export interface HeartRateData {
  bpm: number;
  hrv: number;
  source: string;
}

interface HRDetectorProps {
  /** 检测完成回调，返回心率数据 */
  onReady: (data: HeartRateData) => void;
  /** 跳过检测回调（默认 BPM 72 走推荐流程） */
  onSkip: () => void;
  /** 关闭按钮回调 */
  onClose: () => void;
  /** 启动完整设备检测（拉起 HeartRateMonitor，支持 BLE/PPG） */
  onLaunchMonitor?: () => void;
}

/**
 * 知音之境 — 心率检测入口
 *
 * 轻量版心率输入面板，提供三种方式：
 *   1. 手动输入 → 滑块选择 40-160 BPM
 *   2. 跳过检测 → 使用默认 72 BPM 推荐月夜境
 *   3. 设备检测 → 由父组件拉起完整 HeartRateMonitor（BLE/PPG）
 *
 * 集成 HeartRateMonitor 的逻辑由父组件处理，本组件只负责
 * "三种入口选择 + 手动滑块"的轻量 UI。
 */
export default function HRDetector({ onReady, onSkip, onClose, onLaunchMonitor }: HRDetectorProps) {
  const [manualBPM, setManualBPM] = useState(72);
  const [mode, setMode] = useState<'choose' | 'manual'>('choose');

  return (
    <div className={styles.hrPanel}>
      <button className={styles.hrClose} onClick={onClose} aria-label="关闭">
        <X size={16} />
      </button>
      <p className={styles.hrTitle}>
        <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
        心率检测
      </p>
      <p className={styles.hrHint}>
        检测心率后将根据 BPM 智能推荐合适的境。也可跳过使用默认推荐。
      </p>

      {mode === 'choose' && (
        <div className={styles.hrOptions}>
          {onLaunchMonitor && (
            <button
              className={styles.hrOption}
              onClick={onLaunchMonitor}
            >
              <Bluetooth size={18} />
              <div>
                <p className={styles.hrOptionTitle}>设备检测</p>
                <p className={styles.hrOptionDesc}>蓝牙心率带 / 摄像头脉搏</p>
              </div>
              <ChevronRight size={14} opacity={0.4} />
            </button>
          )}

          <button
            className={styles.hrOption}
            onClick={() => setMode('manual')}
          >
            <Hand size={18} />
            <div>
              <p className={styles.hrOptionTitle}>手动输入</p>
              <p className={styles.hrOptionDesc}>滑动选择 BPM</p>
            </div>
            <ChevronRight size={14} opacity={0.4} />
          </button>

          <button
            className={styles.hrOption}
            onClick={onSkip}
          >
            <Heart size={18} />
            <div>
              <p className={styles.hrOptionTitle}>跳过检测</p>
              <p className={styles.hrOptionDesc}>使用默认 72 BPM 推荐月夜境</p>
            </div>
            <ChevronRight size={14} opacity={0.4} />
          </button>
        </div>
      )}

      {mode === 'manual' && (
        <div className={styles.hrManual}>
          <div className={styles.hrBpmDisplay}>{manualBPM}<span>BPM</span></div>
          <input
            type="range"
            min={40}
            max={160}
            value={manualBPM}
            onChange={(e) => setManualBPM(Number(e.target.value))}
            className={styles.hrSlider}
            aria-label="手动心率"
          />
          <div className={styles.hrSliderLabels}>
            <span>40</span><span>72</span><span>160</span>
          </div>
          <button
            className={styles.hrConfirm}
            onClick={() => onReady({ bpm: manualBPM, hrv: 30, source: '手动输入' })}
          >
            确认心率为 {manualBPM} BPM
          </button>
        </div>
      )}
    </div>
  );
}
