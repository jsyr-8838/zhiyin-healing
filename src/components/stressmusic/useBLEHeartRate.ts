'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useBLEHeartRate — Web Bluetooth API 连接 BLE 心率监测设备
 * 
 * 标准 BLE Heart Rate Service UUID: 0x180D
 * Heart Rate Measurement Characteristic UUID: 0x2A37
 * 
 * 支持设备：
 * - Polar H7/H9/H10 心率胸带
 * - Garmin 心率胸带
 * - Wahoo TICKR
 * - 百锐达 S2+ 等标准 BLE HRM 设备
 * - 部分运动手表（露出标准 HRM Service 时）
 * 
 * BLE HRM 数据格式 (0x2A37):
 * - Byte 0: Flags
 *   - Bit 0: Heart Rate Format (0=UINT8, 1=UINT16)
 *   - Bit 1-2: Sensor Contact Status
 *   - Bit 3: Energy Expended Present
 *   - Bit 4: RR-Interval Present
 * - Byte 1 (or 1-2): Heart Rate Value
 * - Optional: Energy Expended (UINT16)
 * - Optional: RR-Interval(s) (UINT16, 1/1024 second units)
 */

// BLE UUIDs
const HRM_SERVICE_UUID = 0x180D;
const HRM_MEASUREMENT_UUID = 0x2A37;
const HRM_BODY_SENSOR_LOCATION_UUID = 0x2A38;
const BATTERY_SERVICE_UUID = 0x180F;
const BATTERY_LEVEL_UUID = 0x2A19;

export interface BLEHeartRateData {
  bpm: number;
  rrIntervals: number[];  // ms
  sensorContact: boolean;
  bodyLocation: string;
  batteryLevel: number | null;
  timestamp: number;
}

export type BLEConnectionState = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

// Web Bluetooth 类型声明（浏览器扩展）
interface BluetoothRemoteGATTCharacteristicExtended extends BluetoothRemoteGATTCharacteristic {
  addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;
  removeEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;
}

export function useBLEHeartRate() {
  const [connectionState, setConnectionState] = useState<BLEConnectionState>('disconnected');
  const [heartRateData, setHeartRateData] = useState<BLEHeartRateData | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hrvHistory, setHrvHistory] = useState<Array<{ timestamp: number; bpm: number; rr: number[] }>>([]);
  const [isSupported, setIsSupported] = useState(false);

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristicExtended | null>(null);
  const hrHistoryRef = useRef<Array<{ timestamp: number; bpm: number }>>([]);
  const notificationHandlerRef = useRef<((event: Event) => void) | null>(null);

  // 检测 Web Bluetooth 支持
  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && 'bluetooth' in navigator);
  }, []);

  // 心率历史用于 HRV 计算
  useEffect(() => {
    hrHistoryRef.current = hrHistoryRef.current;
  }, [hrvHistory]);

  /**
   * 计算 HRV (RMSSD) — Root Mean Square of Successive Differences
   * 基于 RR-Interval 序列
   */
  const calculateHRV = useCallback((rrIntervals: number[]): number => {
    if (rrIntervals.length < 2) return 0;
    const successiveDiffs: number[] = [];
    for (let i = 1; i < rrIntervals.length; i++) {
      successiveDiffs.push(rrIntervals[i] - rrIntervals[i - 1]);
    }
    const sumSquares = successiveDiffs.reduce((sum, diff) => sum + diff * diff, 0);
    return Math.sqrt(sumSquares / successiveDiffs.length);
  }, []);

  /**
   * 解析 BLE Heart Rate Measurement 数据
   */
  const parseHRMData = useCallback((dataView: DataView): Partial<BLEHeartRateData> => {
    const flags = dataView.getUint8(0);
    const isUINT16 = (flags & 0x01) !== 0;
    const sensorContactSupported = (flags & 0x04) !== 0;
    const sensorContactDetected = (flags & 0x02) !== 0;
    const energyExpendedPresent = (flags & 0x08) !== 0;
    const rrIntervalPresent = (flags & 0x10) !== 0;

    let offset = 1;
    let bpm: number;
    if (isUINT16) {
      bpm = dataView.getUint16(offset, true);
      offset += 2;
    } else {
      bpm = dataView.getUint8(offset);
      offset += 1;
    }

    if (energyExpendedPresent) {
      offset += 2; // 跳过 Energy Expended
    }

    const rrIntervals: number[] = [];
    if (rrIntervalPresent) {
      while (offset + 1 < dataView.byteLength) {
        const rrRaw = dataView.getUint16(offset, true);
        // RR-Interval 单位是 1/1024 秒，转为毫秒
        rrIntervals.push(Math.round(rrRaw * 1000 / 1024));
        offset += 2;
      }
    }

    return {
      bpm,
      rrIntervals,
      sensorContact: sensorContactSupported ? sensorContactDetected : true,
      timestamp: Date.now(),
    };
  }, []);

  /**
   * 读取设备身体传感器位置
   */
  const readBodyLocation = useCallback(async (
    service: BluetoothRemoteGATTService
  ): Promise<string> => {
    try {
      const char = await service.getCharacteristic(HRM_BODY_SENSOR_LOCATION_UUID);
      const value = await char.readValue();
      const location = value.getUint8(0);
      const locations = [
        '其他', '胸部', '手腕', '手指', '手', '耳垂', '脚',
      ];
      return locations[location] || '未知';
    } catch {
      return '未提供';
    }
  }, []);

  /**
   * 读取电池电量
   */
  const readBatteryLevel = useCallback(async (
    server: BluetoothRemoteGATTServer
  ): Promise<number | null> => {
    try {
      const service = await server.getPrimaryService(BATTERY_SERVICE_UUID);
      const char = await service.getCharacteristic(BATTERY_LEVEL_UUID);
      const value = await char.readValue();
      return value.getUint8(0);
    } catch {
      return null;
    }
  }, []);

  /**
   * 连接 BLE 心率设备
   */
  const connect = useCallback(async () => {
    if (!isSupported) {
      setErrorMessage('当前浏览器不支持 Web Bluetooth API，请使用 Chrome 或 Edge');
      return;
    }

    setConnectionState('scanning');
    setErrorMessage(null);

    try {
      // 请求蓝牙设备（筛选 HRM Service）
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [HRM_SERVICE_UUID] },        // 标准 HRM 设备
        ],
        optionalServices: [BATTERY_SERVICE_UUID],   // 可选电池服务
      });

      deviceRef.current = device;
      setDeviceName(device.name || '未知设备');
      setConnectionState('connecting');

      // 监听断连
      device.addEventListener('gattserverdisconnected', () => {
        setConnectionState('disconnected');
        setDeviceName(null);
        characteristicRef.current = null;
      });

      // 连接 GATT Server（带超时保护）
      const gatt = device.gatt;
      if (!gatt) {
        throw new Error('设备不支持 GATT，无法连接');
      }
      const connectPromise = gatt.connect();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('连接超时(15秒)，请确认设备已开机且在范围内')), 15000)
      );
      const server = await Promise.race([connectPromise, timeoutPromise]);

      // 获取 Heart Rate Service
      const hrmService = await server.getPrimaryService(HRM_SERVICE_UUID);

      // 读取身体传感器位置
      const bodyLocation = await readBodyLocation(hrmService);

      // 读取电池电量
      const batteryLevel = await readBatteryLevel(server);

      // 获取 Heart Rate Measurement Characteristic
      const hrmCharacteristic = await hrmService.getCharacteristic(HRM_MEASUREMENT_UUID) as BluetoothRemoteGATTCharacteristicExtended;
      characteristicRef.current = hrmCharacteristic;

      // 订阅通知
      const handleHRMNotification = (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristicExtended;
        if (!target.value) return;

        const parsed = parseHRMData(target.value);
        if (parsed.bpm) {
          const data: BLEHeartRateData = {
            bpm: parsed.bpm,
            rrIntervals: parsed.rrIntervals || [],
            sensorContact: parsed.sensorContact ?? true,
            bodyLocation,
            batteryLevel,
            timestamp: parsed.timestamp || Date.now(),
          };

          setHeartRateData(data);

          // 记录历史
          hrHistoryRef.current.push({ timestamp: Date.now(), bpm: data.bpm });
          if (hrHistoryRef.current.length > 300) {
            hrHistoryRef.current = hrHistoryRef.current.slice(-300);
          }

          setHrvHistory(prev => {
            const next = [...prev, { timestamp: Date.now(), bpm: data.bpm, rr: data.rrIntervals }];
            return next.length > 300 ? next.slice(-300) : next;
          });
        }
      };

      hrmCharacteristic.addEventListener('characteristicvaluechanged', handleHRMNotification);
      notificationHandlerRef.current = handleHRMNotification;
      await hrmCharacteristic.startNotifications();

      setConnectionState('connected');
    } catch (error) {
      const err = error as Error;
      if (err.name === 'NotFoundError') {
        // 用户取消了设备选择
        setConnectionState('disconnected');
      } else if (err.name === 'NetworkError') {
        setErrorMessage('蓝牙连接丢失，请确保设备在范围内且已开机');
        setConnectionState('error');
      } else {
        setErrorMessage(`连接失败: ${err.message}`);
        setConnectionState('error');
      }
    }
  }, [isSupported, parseHRMData, readBodyLocation, readBatteryLevel]);

  /**
   * 断开连接
   */
  const disconnect = useCallback(async () => {
    try {
      // 移除通知监听
      if (characteristicRef.current && notificationHandlerRef.current) {
        characteristicRef.current.removeEventListener(
          'characteristicvaluechanged',
          notificationHandlerRef.current
        );
        notificationHandlerRef.current = null;
      }
      // 停止通知
      if (characteristicRef.current) {
        try {
          await characteristicRef.current.stopNotifications();
        } catch {
          // 忽略：可能已断开
        }
      }
      // 断开 GATT
      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
    } catch (e) {
      console.warn('断开连接时出错:', e);
    } finally {
      characteristicRef.current = null;
      deviceRef.current = null;
      setConnectionState('disconnected');
      setDeviceName(null);
      setHeartRateData(null);
    }
  }, []);

  /**
   * 获取当前 HRV (基于最近 N 个 RR-Interval)
   */
  const getCurrentHRV = useCallback((): number => {
    if (hrvHistory.length < 2) return 0;
    const recent = hrvHistory.slice(-20);
    const allRR = recent.flatMap(h => h.rr).filter(rr => rr > 0);
    return calculateHRV(allRR);
  }, [hrvHistory, calculateHRV]);

  /**
   * 获取平均 BPM（最近 30 秒）
   */
  const getAverageBPM = useCallback((): number => {
    const now = Date.now();
    const recent30s = hrHistoryRef.current.filter(h => now - h.timestamp < 30000);
    if (recent30s.length === 0) return heartRateData?.bpm || 0;
    return Math.round(recent30s.reduce((sum, h) => sum + h.bpm, 0) / recent30s.length);
  }, [heartRateData]);

  // 组件卸载时断开
  useEffect(() => {
    return () => {
      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
    };
  }, []);

  return {
    // 状态
    connectionState,
    heartRateData,
    deviceName,
    errorMessage,
    isSupported,
    hrvHistory,
    getCurrentHRV,
    getAverageBPM,

    // 方法
    connect,
    disconnect,
  };
}
