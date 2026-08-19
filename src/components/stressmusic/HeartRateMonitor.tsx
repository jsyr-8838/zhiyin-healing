'use client';

import React, { useState } from 'react';
import { useBLEHeartRate } from './useBLEHeartRate';
import { usePPGHeartRate } from './usePPGHeartRate';
import { Loader2, Bluetooth, Camera, Heart, AlertCircle, Check, Wifi, WifiOff } from 'lucide-react';

/**
 * HeartRateMonitor — 心率监测设备选择 + 连接界面
 * 
 * 三种监测方式：
 * 1. BLE 蓝牙心率设备（胸带/手表）— 最准确
 * 2. 摄像头 PPG 指尖脉搏 — 零设备备选
 * 3. 手动输入 — 兜底
 * 
 * 使用场景：嵌入 StressMusic detecting 页面
 */

type MonitorMethod = 'ble' | 'ppg' | 'manual' | null;

interface HeartRateMonitorProps {
  onHeartRateReady: (data: {
    bpm: number;
    hrv: number;
    source: string;
  }) => void;
  onSkip?: () => void;
}

export default function HeartRateMonitor({ onHeartRateReady, onSkip }: HeartRateMonitorProps) {
  const [selectedMethod, setSelectedMethod] = useState<MonitorMethod>(null);
  const [manualBPM, setManualBPM] = useState(72);
  const [autoProgress, setAutoProgress] = useState(false);

  const ble = useBLEHeartRate();
  const ppg = usePPGHeartRate();

  // BLE 连接后，持续报告心率数据
  React.useEffect(() => {
    if (selectedMethod === 'ble' && ble.heartRateData && ble.connectionState === 'connected') {
      const hrv = ble.getCurrentHRV();
      const bpm = ble.heartRateData.bpm;
      onHeartRateReady({ bpm, hrv: hrv || 30, source: `BLE: ${ble.deviceName || '心率设备'}` });
    }
  }, [selectedMethod, ble.heartRateData, ble.connectionState, ble.getCurrentHRV, ble.deviceName, onHeartRateReady]);

  // PPG 检测后，持续报告心率数据
  React.useEffect(() => {
    if (selectedMethod === 'ppg' && ppg.heartRateData && ppg.ppgState === 'stable') {
      const bpm = ppg.heartRateData.bpm;
      onHeartRateReady({ bpm, hrv: 30, source: 'PPG 摄像头脉搏' });
    }
  }, [selectedMethod, ppg.heartRateData, ppg.ppgState, onHeartRateReady]);

  // 手动输入确认
  const handleManualConfirm = () => {
    onHeartRateReady({ bpm: manualBPM, hrv: 30, source: '手动输入' });
    setAutoProgress(true);
  };

  // BLE 连接状态指示
  const renderBLEStatus = () => {
    switch (ble.connectionState) {
      case 'disconnected':
        return (
          <button
            onClick={ble.connect}
            className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white border-2 border-[#5ba09a]/20 hover:border-[#5ba09a]/50 transition cursor-pointer"
          >
            <Bluetooth size={24} className="text-[#5ba09a]" />
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-[#2D3436]">蓝牙心率设备</div>
              <div className="text-xs text-[#636E72]">连接胸带、运动手表等 BLE 设备</div>
            </div>
            <span className="px-2 py-1 rounded-full bg-[#5ba09a]/10 text-[#5ba09a] text-[10px] font-semibold">
              推荐
            </span>
          </button>
        );

      case 'scanning':
        return (
          <div className="flex items-center gap-3 w-full p-4 rounded-2xl bg-[#5ba09a]/5 border-2 border-[#5ba09a]/30">
            <Loader2 size={24} className="text-[#5ba09a] animate-spin" />
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-[#2D3436]">搜索设备中...</div>
              <div className="text-xs text-[#636E72]">请在弹窗中选择您的心率设备</div>
            </div>
          </div>
        );

      case 'connecting':
        return (
          <div className="flex items-center gap-3 w-full p-4 rounded-2xl bg-[#5ba09a]/5 border-2 border-[#5ba09a]/30">
            <Loader2 size={24} className="text-[#5ba09a] animate-spin" />
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-[#2D3436]">正在连接 {ble.deviceName}...</div>
              <div className="text-xs text-[#636E72]">建立 GATT 连接</div>
            </div>
          </div>
        );

      case 'connected':
        return (
          <div className="w-full p-4 rounded-2xl bg-[#5ba09a]/10 border-2 border-[#5ba09a]/40">
            <div className="flex items-center gap-3 mb-2">
              <Wifi size={24} className="text-[#5ba09a]" />
              <div className="text-left flex-1">
                <div className="text-sm font-semibold text-[#2D3436]">{ble.deviceName}</div>
                <div className="text-xs text-[#5ba09a]">已连接 · {ble.heartRateData?.bodyLocation}</div>
              </div>
              <button
                onClick={ble.disconnect}
                className="text-xs text-[#c26158] hover:underline"
              >
                断开
              </button>
            </div>
            {/* 实时心率显示 */}
            {ble.heartRateData && (
              <div className="flex items-center justify-center gap-4 mt-3 py-3 rounded-xl bg-white">
                <Heart size={20} className={`${ble.heartRateData.sensorContact ? 'text-[#c26158]' : 'text-[#b2bec3]'} animate-pulse`} />
                <div className="text-3xl font-bold text-[#2D3436] tabular-nums">
                  {ble.heartRateData.bpm}
                </div>
                <div className="text-xs text-[#636E72]">BPM</div>
                {ble.getCurrentHRV() > 0 && (
                  <div className="text-sm text-[#5ba09a] ml-2">
                    HRV: {ble.getCurrentHRV().toFixed(0)}ms
                  </div>
                )}
                {ble.heartRateData.batteryLevel !== null && (
                  <div className="text-[10px] text-[#636E72] ml-2">
                    电量: {ble.heartRateData.batteryLevel}%
                  </div>
                )}
              </div>
            )}
            {/* 传感器接触状态 */}
            {ble.heartRateData && !ble.heartRateData.sensorContact && (
              <p className="text-xs text-[#c26158] mt-2 text-center">
                传感器未检测到皮肤接触，请调整佩戴位置
              </p>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="w-full p-4 rounded-2xl bg-[#c26158]/5 border-2 border-[#c26158]/30">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-[#c26158]" />
              <div className="text-left flex-1">
                <div className="text-sm font-semibold text-[#2D3436]">连接失败</div>
                <div className="text-xs text-[#c26158]">{ble.errorMessage}</div>
              </div>
              <button
                onClick={ble.connect}
                className="text-xs px-3 py-1 rounded-full bg-[#5ba09a]/10 text-[#5ba09a] hover:bg-[#5ba09a]/20 transition"
              >
                重试
              </button>
            </div>
          </div>
        );
    }
  };

  // PPG 检测状态
  const renderPPGStatus = () => {
    switch (ppg.ppgState) {
      case 'idle':
        return (
          <button
            onClick={ppg.startMeasurement}
            className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white border-2 border-[#c9a94f]/20 hover:border-[#c9a94f]/50 transition cursor-pointer"
          >
            <Camera size={24} className="text-[#c9a94f]" />
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-[#2D3436]">指尖脉搏检测</div>
              <div className="text-xs text-[#636E72]">将手指轻放在摄像头+闪光灯上</div>
            </div>
          </button>
        );

      case 'preparing':
        return (
          <div className="flex items-center gap-3 w-full p-4 rounded-2xl bg-[#c9a94f]/5 border-2 border-[#c9a94f]/30">
            <Loader2 size={24} className="text-[#c9a94f] animate-spin" />
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-[#2D3436]">启动摄像头...</div>
              <div className="text-xs text-[#636E72]">请允许摄像头权限</div>
            </div>
          </div>
        );

      case 'measuring':
        return (
          <div className="w-full p-4 rounded-2xl bg-[#c9a94f]/5 border-2 border-[#c9a94f]/30">
            <div className="flex items-center gap-3 mb-2">
              <Camera size={24} className="text-[#c9a94f]" />
              <div className="text-left flex-1">
                <div className="text-sm font-semibold text-[#2D3436]">检测中...</div>
                <div className="text-xs text-[#636E72]">请保持手指稳定覆盖摄像头</div>
              </div>
            </div>
            {ppg.heartRateData && (
              <div className="flex items-center justify-center gap-4 mt-3 py-3 rounded-xl bg-white">
                <Heart size={20} className="text-[#c9a94f] animate-pulse" />
                <div className="text-3xl font-bold text-[#2D3436] tabular-nums">
                  {ppg.heartRateData.bpm}
                </div>
                <div className="text-xs text-[#636E72]">BPM</div>
                <div className="ml-2">
                  <div className="w-24 h-2 bg-[#f0e8d8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c9a94f] rounded-full transition-all"
                      style={{ width: `${ppg.heartRateData.confidence * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#636E72] mt-0.5">
                    信号: {Math.round(ppg.heartRateData.confidence * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'stable':
        return (
          <div className="w-full p-4 rounded-2xl bg-[#5ba09a]/10 border-2 border-[#5ba09a]/40">
            <div className="flex items-center gap-3 mb-2">
              <Check size={24} className="text-[#5ba09a]" />
              <div className="text-left flex-1">
                <div className="text-sm font-semibold text-[#2D3436]">脉搏检测稳定</div>
                <div className="text-xs text-[#5ba09a]">摄像头 PPG 实时监测中</div>
              </div>
              <button
                onClick={ppg.stopMeasurement}
                className="text-xs text-[#c26158] hover:underline"
              >
                停止
              </button>
            </div>
            {ppg.heartRateData && (
              <div className="flex items-center justify-center gap-4 mt-3 py-3 rounded-xl bg-white">
                <Heart size={20} className="text-[#c26158] animate-pulse" />
                <div className="text-3xl font-bold text-[#2D3436] tabular-nums">
                  {ppg.heartRateData.bpm}
                </div>
                <div className="text-xs text-[#636E72]">BPM</div>
              </div>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="w-full p-4 rounded-2xl bg-[#c26158]/5 border-2 border-[#c26158]/30">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-[#c26158]" />
              <div className="text-left flex-1">
                <div className="text-sm font-semibold text-[#2D3436]">检测失败</div>
                <div className="text-xs text-[#c26158]">{ppg.errorMessage}</div>
              </div>
              <button
                onClick={ppg.startMeasurement}
                className="text-xs px-3 py-1 rounded-full bg-[#5ba09a]/10 text-[#5ba09a] hover:bg-[#5ba09a]/20 transition"
              >
                重试
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 方法选择标题 */}
      <h3 className="text-base font-bold text-[#2D3436] mb-4 text-center">
        选择心率监测方式
      </h3>

      {/* BLE 方式 — 始终显示 */}
      <div className="mb-3">
        {ble.isSupported ? (
          renderBLEStatus()
        ) : (
          <div className="flex items-center gap-3 w-full p-4 rounded-2xl bg-[#f0e8d8] border-2 border-[#d0c8b8] opacity-60">
            <WifiOff size={24} className="text-[#b0a080]" />
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-[#4a3a2a]">蓝牙心率设备</div>
              <div className="text-xs text-[#8a7a60]">当前浏览器不支持，请使用 Chrome/Edge</div>
            </div>
          </div>
        )}
      </div>

      {/* PPG 方式 — 始终显示 */}
      <div className="mb-3">
        {renderPPGStatus()}
      </div>

      {/* 手动输入 — 始终显示 */}
      <div className="mb-4">
        <div className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white border-2 border-[#d0c8b8]">
          <Heart size={24} className="text-[#c26158]" />
          <div className="text-left flex-1">
            <div className="text-sm font-semibold text-[#2D3436]">手动输入心率</div>
            <div className="text-xs text-[#636E72]">没有设备？输入您的静息心率</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={40}
              max={160}
              value={manualBPM}
              onChange={e => setManualBPM(Number(e.target.value))}
              className="w-20 accent-[#c26158]"
            />
            <span className="text-lg font-bold text-[#2D3436] tabular-nums w-8 text-right">
              {manualBPM}
            </span>
          </div>
        </div>
        {!autoProgress && (
          <button
            onClick={handleManualConfirm}
            className="mt-2 w-full py-2 rounded-full text-sm text-[#5ba09a] border border-[#5ba09a]/30 hover:bg-[#5ba09a]/10 transition"
          >
            确认心率为 {manualBPM} BPM
          </button>
        )}
      </div>

      {/* 分隔线 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#e0d8c8]" />
        <span className="text-[10px] text-[#b0a080]">或者</span>
        <div className="flex-1 h-px bg-[#e0d8c8]" />
      </div>

      {/* 跳过按钮 */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full py-2.5 rounded-full text-sm text-[#8a7a60] border border-[#d0c8b8] hover:bg-[#f5efe4] transition"
        >
          跳过心率检测，使用默认数据
        </button>
      )}

      {/* 兼容性提示 */}
      <p className="text-[10px] text-[#b0a080] text-center mt-3 leading-relaxed">
        BLE 方式支持 Polar/Garmin/Wahoo 等标准心率胸带及运动手表
        <br />
        PPG 方式需在明亮环境下将指尖覆盖后置摄像头+闪光灯
      </p>
    </div>
  );
}
