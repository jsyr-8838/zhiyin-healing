/**
 * SyntheticAnalyser — 合成频谱分析器
 *
 * 替代 Web Audio API 的 AnalyserNode，解决跨域音频（B2 预签名 URL）
 * 无 CORS 响应头导致 createMediaElementSource() 静音的问题。
 *
 * 原理：基于曲目已知频率（五音主频/副频/泛音或颂钵频率），
 * 用数学模型生成逼真的频谱数据，完全绕过 CORS 限制。
 *
 * 鸭子类型兼容 AnalyserNode：提供 frequencyBinCount、getByteFrequencyData、
 * getByteTimeDomainData，消费方代码无需修改。
 */

export interface TrackFrequencies {
  /** 主频率 Hz */
  mainFreq: number;
  /** 副频率 Hz */
  subFreq: number;
  /** 泛音频率 Hz */
  overtoneFreq: number;
}

// ── 常量 ──────────────────────────────────────────────────────────

const FFT_SIZE = 2048;
const SAMPLE_RATE = 44100;
const BIN_HZ = SAMPLE_RATE / FFT_SIZE; // ≈ 21.53 Hz per bin

// ── SyntheticAnalyser ─────────────────────────────────────────────

export class SyntheticAnalyser {
  /** 与标准 AnalyserNode 一致 */
  readonly frequencyBinCount = FFT_SIZE / 2; // 1024
  readonly fftSize = FFT_SIZE;

  private freqs: TrackFrequencies = { mainFreq: 432, subFreq: 528, overtoneFreq: 852 };
  private isPlaying = false;
  private volume = 0.85;
  // 可视化增益倍数：即使音量较低，可视化仍然保持足够的能量
  private visBoost = 1.6;

  /** 设置可视化增益（0.5~3.0，值越大可视化越强） */
  setVisBoost(boost: number): void {
    this.visBoost = Math.max(0.5, Math.min(3.0, boost));
  }

  // 内部时钟（每帧递增）
  private frame = 0;

  // 预计算的 bin 索引缓存
  private mainBin = 0;
  private subBin = 0;
  private overtoneBin = 0;

  constructor() {
    this.recomputeBins();
  }

  /** 设置当前曲目的频率参数 */
  setTrack(freqs: TrackFrequencies): void {
    this.freqs = freqs;
    this.recomputeBins();
  }

  /** 设置播放状态 */
  setPlaying(playing: boolean): void {
    this.isPlaying = playing;
    if (playing) this.frame = 0; // 重新开始计时
  }

  /** 设置音量（0~1） */
  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * 填充频域数据（与 AnalyserNode.getByteFrequencyData 签名兼容）
   * 生成 0-255 的 Uint8Array，峰值出现在 mainFreq/subFreq/overtoneFreq 对应的 bin
   */
  getByteFrequencyData(array: Uint8Array): void {
    const len = Math.min(array.length, this.frequencyBinCount);
    if (!this.isPlaying || this.volume <= 0) {
      // 静止状态：极低的本底噪声（模拟真实环境底噪）
      for (let i = 0; i < len; i++) {
        array[i] = 0;
      }
      return;
    }

    const t = this.frame * 0.016; // ~60fps 时间步长
    const vol = Math.max(this.volume, 0.3); // 最低保留30%可视化能量
    const vb = this.visBoost;

    // ── 节奏调制：模拟音乐呼吸感 ──
    // 慢速呼吸（0.15Hz = ~6.7秒周期）+ 中速脉动（0.5Hz = 2秒周期）
    const slowPulse = 0.7 + 0.3 * Math.sin(t * 0.15 * Math.PI * 2);
    const fastPulse = 0.85 + 0.15 * Math.sin(t * 0.5 * Math.PI * 2);

    // ── 清零 ──
    for (let i = 0; i < len; i++) array[i] = 0;

    // ── 1. 低频环境噪声（bins 0-8，模拟低频氛围）──
    for (let i = 0; i < 8 && i < len; i++) {
      const baseNoise = 20 + 12 * Math.sin(t * 0.3 + i * 0.5);
      array[i] = Math.max(0, Math.min(255, baseNoise * vol * slowPulse * vb));
    }

    // ── 2. 主频率峰值（高斯钟形）──
    this.addPeak(array, len, this.mainBin, 220, 3, vol * slowPulse * fastPulse * vb, t);
    // 主频泛音（2x, 3x, 4x, 5x）
    this.addPeak(array, len, this.mainBin * 2, 100, 4, vol * slowPulse * fastPulse * 0.7 * vb, t);
    this.addPeak(array, len, this.mainBin * 3, 55, 5, vol * slowPulse * fastPulse * 0.5 * vb, t);
    this.addPeak(array, len, this.mainBin * 4, 35, 6, vol * slowPulse * fastPulse * 0.35 * vb, t);
    this.addPeak(array, len, this.mainBin * 5, 25, 7, vol * slowPulse * fastPulse * 0.25 * vb, t);

    // ── 3. 副频率峰值 ──
    this.addPeak(array, len, this.subBin, 180, 3, vol * fastPulse * vb, t);
    this.addPeak(array, len, this.subBin * 2, 80, 4, vol * fastPulse * 0.6 * vb, t);
    this.addPeak(array, len, this.subBin * 3, 40, 5, vol * fastPulse * 0.4 * vb, t);

    // ── 4. 泛音频率峰值 ──
    this.addPeak(array, len, this.overtoneBin, 150, 3, vol * slowPulse * vb, t);
    this.addPeak(array, len, this.overtoneBin * 2, 65, 4, vol * slowPulse * 0.5 * vb, t);

    // ── 5. 随机微抖动（模拟自然声学波动）──
    for (let i = 0; i < len; i++) {
      const flutter = (Math.random() - 0.5) * 10 * vol;
      array[i] = Math.max(0, Math.min(255, array[i] + flutter));
    }

    // ── 6. 高频递减包络（真实音频高频能量自然衰减）──
    for (let i = 100; i < len; i++) {
      const decay = 1 - (i / len) * 0.7;
      array[i] = Math.max(0, array[i] * decay);
    }

    this.frame++;
  }

  /**
   * 填充时域数据（与 AnalyserNode.getByteTimeDomainData 签名兼容）
   * 生成 0-255 的波形数据，128 = 静音
   */
  getByteTimeDomainData(array: Uint8Array): void {
    const len = Math.min(array.length, this.frequencyBinCount);
    if (!this.isPlaying || this.volume <= 0) {
      // 静止：平直线在 128
      for (let i = 0; i < len; i++) array[i] = 128;
      return;
    }

    const t = this.frame * 0.016;
    const vol = this.volume;

    for (let i = 0; i < len; i++) {
      const timeInCycle = i / len;

      // 主频率正弦波
      const mainWave = Math.sin(timeInCycle * Math.PI * 2 * this.mainBin) * 40 * vol;

      // 副频率叠加（不同相位）
      const subWave = Math.sin(timeInCycle * Math.PI * 2 * this.subBin + t * 0.5) * 25 * vol;

      // 泛音叠加
      const overtoneWave = Math.sin(timeInCycle * Math.PI * 2 * this.overtoneBin + t * 0.3) * 20 * vol;

      // 低频包络
      const envelope = 0.7 + 0.3 * Math.sin(t * 0.15 * Math.PI * 2);

      // 合成波形（128 为中心线）
      const sample = 128 + (mainWave + subWave + overtoneWave) * envelope;

      // 微抖动
      const flutter = (Math.random() - 0.5) * 3 * vol;

      array[i] = Math.max(0, Math.min(255, Math.round(sample + flutter)));
    }

    this.frame++;
  }

  // ── 内部方法 ──────────────────────────────────────────────────

  private recomputeBins(): void {
    this.mainBin = Math.round(this.freqs.mainFreq / BIN_HZ);
    this.subBin = Math.round(this.freqs.subFreq / BIN_HZ);
    this.overtoneBin = Math.round(this.freqs.overtoneFreq / BIN_HZ);
  }

  /**
   * 在 freqData 数组中添加一个高斯钟形峰值
   */
  private addPeak(
    array: Uint8Array,
    len: number,
    centerBin: number,
    amplitude: number,
    width: number,
    multiplier: number,
    t: number
  ): void {
    if (centerBin < 0 || centerBin >= len) return;

    // 时间相关的幅度调制（模拟自然音量波动）
    const modulation = 0.85 + 0.15 * Math.sin(t * (2 + centerBin * 0.01));
    const peakAmp = amplitude * multiplier * modulation;

    const start = Math.max(0, centerBin - width * 2);
    const end = Math.min(len, centerBin + width * 2 + 1);

    for (let i = start; i < end; i++) {
      const dist = Math.abs(i - centerBin);
      // 高斯函数：exp(-dist² / (2σ²))
      const gaussian = Math.exp(-(dist * dist) / (2 * width * width));
      const value = peakAmp * gaussian;
      array[i] = Math.max(0, Math.min(255, array[i] + value));
    }
  }
}
