/**
 * 天籁 — 播放列表管理
 * 基于 Mineradio 的播放队列逻辑，精简重写为 React-friendly 的 TypeScript
 */

import type { WeatherRadioTrack } from './weather-mood';

export type RepeatMode = 'off' | 'all' | 'one';
export type PlayMode = 'radio' | 'local';

export interface PlayerTrack extends WeatherRadioTrack {
  /** 唯一标识 */
  uid: string;
  /** 是否正在播放 */
  isActive?: boolean;
}

export interface PlaylistState {
  /** 播放队列 */
  queue: PlayerTrack[];
  /** 当前播放索引 */
  currentIndex: number;
  /** 循环模式 */
  repeatMode: RepeatMode;
  /** 播放模式 */
  playMode: PlayMode;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前播放时间（秒） */
  currentTime: number;
  /** 音量 0-1 */
  volume: number;
}

/** 为 track 生成唯一 uid */
function trackUid(track: WeatherRadioTrack, index: number): string {
  return `${track.mood}-${track.title}-${index}`;
}

/** 将 WeatherRadioTrack 列表转换为 PlayerTrack 列表 */
export function toPlayerTracks(tracks: WeatherRadioTrack[]): PlayerTrack[] {
  return tracks.map((t, i) => ({
    ...t,
    uid: trackUid(t, i),
  }));
}

/** 计算下一首索引 */
export function getNextIndex(state: PlaylistState): number {
  const { queue, currentIndex, repeatMode } = state;
  if (!queue.length) return -1;

  if (repeatMode === 'one') return currentIndex;

  const next = currentIndex + 1;
  if (next < queue.length) return next;

  if (repeatMode === 'all') return 0;
  return -1; // 停止
}

/** 计算上一首索引 */
export function getPrevIndex(state: PlaylistState): number {
  const { queue, currentIndex, repeatMode } = state;
  if (!queue.length) return -1;

  if (currentIndex > 0) return currentIndex - 1;
  if (repeatMode === 'all') return queue.length - 1;
  return 0;
}

/** 播放列表初始状态 */
export function createInitialPlaylistState(): PlaylistState {
  return {
    queue: [],
    currentIndex: -1,
    repeatMode: 'all',
    playMode: 'radio',
    isPlaying: false,
    currentTime: 0,
    volume: 0.8,
  };
}

/** 播放进度百分比 */
export function getProgress(state: PlaylistState): number {
  const track = state.queue[state.currentIndex];
  if (!track || !track.duration) return 0;
  return Math.min(1, state.currentTime / track.duration);
}
