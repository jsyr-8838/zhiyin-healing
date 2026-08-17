'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * ColorPicker — HSL 色彩选择器
 *
 * 交互流程（源自 CS2 项目）：
 * 1. 先拖动色相滑条选择色相
 * 2. 色相交互后，显示饱和度/亮度画布
 * 3. 在画布上拖动选取具体颜色
 * 4. 内部用 HSV 坐标再转 HSL 输出
 */

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

interface ColorPickerProps {
  value: HSLColor;
  onChange: (hsl: HSLColor) => void;
  /** 情绪标签（显示在选择器上方） */
  emotionLabel?: string;
  /** 是否显示五行映射提示 */
  showWuxingHint?: boolean;
}

export default function ColorPicker({
  value,
  onChange,
  emotionLabel,
  showWuxingHint = true,
}: ColorPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [hueInteracted, setHueInteracted] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // 绘制饱和度/亮度画布
  const drawPalette = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const h = value.h;

    ctx.clearRect(0, 0, width, height);

    // 水平方向：白 → 纯色（饱和度）
    const gradH = ctx.createLinearGradient(0, 0, width, 0);
    gradH.addColorStop(0, '#fff');
    gradH.addColorStop(1, `hsl(${h}, 100%, 50%)`);
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, width, height);

    // 垂直方向：透明 → 黑（亮度）
    const gradV = ctx.createLinearGradient(0, 0, 0, height);
    gradV.addColorStop(0, 'rgba(0,0,0,0)');
    gradV.addColorStop(1, '#000');
    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, width, height);
  }, [value.h]);

  // HSV位置 → HSL值
  const updateHSLFromPosition = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.width || 1;
      const height = canvas.height || 1;

      const safeX = Math.max(0, Math.min(x, width));
      const safeY = Math.max(0, Math.min(y, height));

      // Canvas 坐标 → HSV
      const s_hsv = safeX / width;
      const v_hsv = 1 - safeY / height;
      const h = value.h;

      // HSV → HSL
      let l = v_hsv * (1 - s_hsv / 2);
      let s_hsl = 0;
      if (l > 0 && l < 1) {
        s_hsl = (v_hsv - l) / Math.min(l, 1 - l);
      }

      onChange({
        h,
        s: Math.round(s_hsl * 100),
        l: Math.round(l * 100),
      });
    },
    [value.h, onChange],
  );

  // 色相滑条变化
  const handleHueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!hueInteracted) setHueInteracted(true);
      const newH = parseInt(e.target.value);
      onChange({ ...value, h: newH });
    },
    [hueInteracted, value, onChange],
  );

  // Canvas 交互：鼠标/触摸
  const getCanvasPos = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      const pos = getCanvasPos(e.clientX, e.clientY);
      lastPosRef.current = pos;
      updateHSLFromPosition(pos.x, pos.y);
    },
    [getCanvasPos, updateHSLFromPosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const pos = getCanvasPos(e.clientX, e.clientY);
      lastPosRef.current = pos;
      updateHSLFromPosition(pos.x, pos.y);
    },
    [getCanvasPos, updateHSLFromPosition],
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // 初始化画布尺寸和绘制
  useEffect(() => {
    if (!hueInteracted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const resizeAndDraw = () => {
      canvas.width = container.offsetWidth;
      canvas.height = 220;
      drawPalette();
    };

    resizeAndDraw();

    // 监听尺寸变化
    const observer = new ResizeObserver(resizeAndDraw);
    observer.observe(container);

    return () => observer.disconnect();
  }, [hueInteracted, drawPalette]);

  // 色相变化时重绘画布
  useEffect(() => {
    if (hueInteracted) drawPalette();
  }, [value.h, hueInteracted, drawPalette]);

  // HSV → cursor 位置（反向映射）
  const getCursorStyle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hueInteracted) return { left: '50%', top: '50%' };

    // HSL → HSV
    const s_hsl = value.s / 100;
    const l_hsl = value.l / 100;
    const v_hsv = l_hsl + s_hsl * Math.min(l_hsl, 1 - l_hsl);
    const s_hsv = v_hsv === 0 ? 0 : 2 * (1 - l_hsl / v_hsv);

    const rect = canvas.getBoundingClientRect();
    const leftPercent = s_hsv * 100;
    const topPercent = (1 - v_hsv) * 100;

    return {
      left: `${Math.max(0, Math.min(100, leftPercent))}%`,
      top: `${Math.max(0, Math.min(100, topPercent))}%`,
    };
  }, [value.s, value.l, hueInteracted]);

  // 五行色名提示
  const getWuxingHint = () => {
    const h = value.h;
    const s = value.s;
    const l = value.l;

    if (s < 18 && l > 68) return '白·金';
    if (l < 22) return '黑·水';
    if (h >= 90 && h < 165) return '青·木';
    if ((h >= 345 || h < 30)) return '赤·火';
    if (h >= 30 && h < 90) return '黄·土';
    if (h >= 200 && h < 285) return '玄·水';
    return '五行和合';
  };

  const colorString = `hsl(${value.h}, ${value.s}%, ${value.l}%)`;

  return (
    <div className="w-full space-y-4">
      {/* 情绪标签 */}
      {emotionLabel && (
        <div className="text-center">
          <h3 className="text-xl font-black font-serif text-gray-800 tracking-wider">
            {emotionLabel}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            选择您感受到此情绪时的代表色彩
          </p>
        </div>
      )}

      {/* 色彩预览 */}
      <div className="flex items-center justify-center gap-4">
        <div
          className="w-16 h-16 rounded-full border-4 border-white shadow-lg transition-colors duration-200"
          style={{ backgroundColor: hueInteracted ? colorString : '#e5e7eb' }}
        />
        {showWuxingHint && hueInteracted && (
          <span className="text-xs font-serif text-gray-500 px-2 py-1 rounded-full bg-white/60">
            {getWuxingHint()}
          </span>
        )}
      </div>

      {/* 色相滑条 */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 text-center">
          {!hueInteracted ? '拖动滑条选择色相 →' : '继续调整或在下方画布中选取'}
        </p>
        <div className="relative px-1">
          <input
            type="range"
            min={0}
            max={360}
            value={value.h}
            onChange={handleHueChange}
            className="w-full h-4 rounded-full appearance-none cursor-pointer"
            style={{
              background:
                'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }}
          />
        </div>
      </div>

      {/* 饱和度/亮度画布（色相交互后显示） */}
      {hueInteracted && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="relative rounded-xl overflow-hidden shadow-inner border border-gray-200/40">
            <canvas
              ref={canvasRef}
              className="w-full touch-none cursor-crosshair"
              style={{ height: 220 }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
            {/* 光标圆圈 */}
            <div
              ref={cursorRef}
              className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
              style={{
                ...getCursorStyle(),
                backgroundColor: colorString,
              }}
            />
          </div>

          {/* HSL 数值 */}
          <div className="flex justify-center gap-6 text-xs text-gray-500 font-mono">
            <span>
              H: <span className="font-bold text-gray-700">{value.h}</span>
            </span>
            <span>
              S: <span className="font-bold text-gray-700">{value.s}%</span>
            </span>
            <span>
              L: <span className="font-bold text-gray-700">{value.l}%</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
