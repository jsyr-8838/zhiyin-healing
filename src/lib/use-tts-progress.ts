'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * TTS 播放进度持久化 Hook
 * 
 * 功能：
 * 1. 记住每段音频的播放位置
 * 2. 重新打开页面时恢复到上次位置
 * 3. 支持多段音频（按 key 区分）
 */

interface PlaybackPosition {
  currentTime: number;
  duration: number;
  timestamp: string;
}

const STORAGE_PREFIX = 'evo-tts-pos-';
const MAX_ENTRIES = 50; // 最多记住 50 条音频进度

export function useTTSProgress(key: string) {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const [savedPosition, setSavedPosition] = useState<PlaybackPosition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 加载已保存的位置
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const pos = JSON.parse(raw) as PlaybackPosition;
        // 如果超过 7 天的记录，清除
        const age = Date.now() - new Date(pos.timestamp).getTime();
        if (age > 7 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(storageKey);
        } else {
          setSavedPosition(pos);
        }
      }
    } catch {
      // ignore
    }

    // 清理过多的旧记录
    cleanupOldEntries();
  }, [storageKey]);

  // 绑定音频元素
  const bindAudio = useCallback((audio: HTMLAudioElement | null) => {
    audioRef.current = audio;
    if (!audio) return;

    // 恢复上次位置
    if (savedPosition && savedPosition.currentTime > 0) {
      audio.addEventListener('loadedmetadata', () => {
        if (savedPosition.currentTime < audio.duration) {
          audio.currentTime = savedPosition.currentTime;
        }
      }, { once: true });
    }

    // 定期保存进度（每5秒）
    const interval = setInterval(() => {
      if (!audio.paused && audio.currentTime > 0) {
        savePosition(audio.currentTime, audio.duration);
      }
    }, 5000);

    // 暂停时保存
    const onPause = () => {
      if (audio.currentTime > 0) {
        savePosition(audio.currentTime, audio.duration);
      }
    };

    audio.addEventListener('pause', onPause);

    return () => {
      clearInterval(interval);
      audio.removeEventListener('pause', onPause);
    };
  }, [savedPosition]);

  const savePosition = useCallback((currentTime: number, duration: number) => {
    const pos: PlaybackPosition = {
      currentTime,
      duration: duration || 0,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(pos));
      setSavedPosition(pos);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const clearPosition = useCallback(() => {
    localStorage.removeItem(storageKey);
    setSavedPosition(null);
  }, [storageKey]);

  return {
    savedPosition,
    bindAudio,
    savePosition,
    clearPosition,
    /** 是否有可恢复的位置 */
    hasResumePoint: savedPosition !== null && savedPosition.currentTime > 5,
  };
}

function cleanupOldEntries() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    if (keys.length <= MAX_ENTRIES) return;

    // 按时间戳排序，删除最旧的
    const entries = keys.map(k => {
      try {
        const pos = JSON.parse(localStorage.getItem(k) || '{}');
        return { key: k, timestamp: pos.timestamp || '' };
      } catch {
        return { key: k, timestamp: '' };
      }
    });

    entries.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));

    const toRemove = entries.slice(0, entries.length - MAX_ENTRIES);
    toRemove.forEach(e => localStorage.removeItem(e.key));
  } catch {
    // ignore
  }
}
