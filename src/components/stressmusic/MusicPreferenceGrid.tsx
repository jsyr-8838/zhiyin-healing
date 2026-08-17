'use client';

import React from 'react';
import { GENRE_OPTIONS, type MusicGenre } from './types';

/**
 * MusicPreferenceGrid — 10 流派选择网格
 * 移植自 StressMusic 的 .preference-options
 * 适配宣纸底色 + 五行色点缀
 */
export default function MusicPreferenceGrid({
  selected,
  onSelect,
  onConfirm,
  disabled = false,
}: {
  selected: MusicGenre | null;
  onSelect: (genre: MusicGenre) => void;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center w-full">
      <h2
        className="text-xl font-bold mb-6 w-full text-center"
        style={{
          background: 'linear-gradient(135deg, #2D3436 0%, #5ba09a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        请选择您的音乐氛围
      </h2>

      {/* 流派网格 */}
      <div
        className="grid grid-cols-5 gap-2 w-full max-w-lg"
        style={{
          // 移动端适配
        }}
      >
        {GENRE_OPTIONS.map(option => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl cursor-pointer relative overflow-hidden"
              style={{
                background: isSelected ? '#f8f7ff' : 'white',
                border: isSelected ? '2px solid #5ba09a' : '2px solid transparent',
                boxShadow: isSelected
                  ? '0 8px 20px rgba(91,160,154,0.15)'
                  : '0 4px 12px rgba(0,0,0,0.03)',
                transform: isSelected ? 'translateY(-2px)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                }
              }}
            >
              {/* 选中指示点 */}
              {isSelected && (
                <div
                  className="absolute top-1.5 right-1.5 rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: '#5ba09a',
                  }}
                />
              )}
              <span className="text-xl">{option.icon}</span>
              <span className="text-[10px] font-semibold text-[#2D3436] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-0.5">
                {option.labelCn}
              </span>
              <span className="text-[8px] text-[#636E72]">
                {option.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* 确认按钮 */}
      <button
        onClick={onConfirm}
        disabled={!selected || disabled}
        className="mt-6 px-10 py-3.5 rounded-full text-white text-base font-semibold cursor-pointer outline-none"
        style={{
          background: selected && !disabled
            ? 'linear-gradient(135deg, #5ba09a 0%, #3d7a75 100%)'
            : '#dfe6e9',
          color: selected && !disabled ? 'white' : '#b2bec3',
          boxShadow: selected && !disabled
            ? '0 10px 25px rgba(91,160,154,0.3)'
            : 'none',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          cursor: selected && !disabled ? 'pointer' : 'not-allowed',
        }}
      >
        确认选择
      </button>

      {/* 移动端响应式：小屏改为 2 列 */}
      <style jsx>{`
        @media (max-width: 640px) {
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
            max-width: 300px !important;
          }
        }
      `}</style>
    </div>
  );
}
