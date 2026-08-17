/**
 * useWuxing300Audio — 外部五行养生音源懒加载 Hook
 *
 * 从 /api/wuxing-audio/catalog 加载 F:\heytcm-audio\ 下的音频索引，
 * 合并到本地 healing-music-catalog 中。
 *
 * 使用方式：
 *   const { extendedTracks, loading, error, count } = useWuxing300Audio();
 *
 * 或与本地 catalog 合并：
 *   const localTracks = getTracksForTone('jiao');
 *   const { extendedTracks } = useWuxing300Audio();
 *   const allTracks = [...localTracks, ...extendedTracks.filter(t => t.element === 'jiao')];
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WuYinKey } from './five-tone-data';
import type { InstrumentType } from './healing-music-catalog';

export interface Wuxing300Track {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  instrument: InstrumentType;
  element: WuYinKey;
  color: string;
  duration?: number;
  credit?: string;
  source: 'wuxing300';
  sizeBytes?: number;
}

interface CatalogResponse {
  tracks: Wuxing300Track[];
  total: number;
  available: boolean;
  root?: string;
}

const CACHE_KEY = 'zhiyin-wuxing300-catalog';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CachedCatalog {
  timestamp: number;
  data: CatalogResponse;
}

export function useWuxing300Audio() {
  const [tracks, setTracks] = useState<Wuxing300Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async (forceRefresh = false) => {
    // Check localStorage cache
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedCatalog = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL && parsed.data.available) {
            setTracks(parsed.data.tracks);
            return;
          }
        }
      } catch {}
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/wuxing-audio/catalog');
      const data: CatalogResponse = await res.json();

      if (data.available && data.tracks.length > 0) {
        setTracks(data.tracks);
        // Cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
        } catch {}
      } else {
        setTracks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const getTracksForTone = useCallback(
    (toneKey: WuYinKey): Wuxing300Track[] => {
      return tracks.filter((t) => t.element === toneKey);
    },
    [tracks]
  );

  return {
    extendedTracks: tracks,
    loading,
    error,
    count: tracks.length,
    getTracksForTone,
    refresh: () => fetchCatalog(true),
  };
}

/**
 * 非Hook版本：获取缓存的外部曲目（用于组件外）
 */
export function getCachedWuxing300Tracks(): Wuxing300Track[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CachedCatalog = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL && parsed.data.available) {
        return parsed.data.tracks;
      }
    }
  } catch {}
  return [];
}
