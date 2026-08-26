'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackAction } from '@/lib/evo/tracker';

/**
 * 会员体系 Hook — 免费门槛机制
 * 
 * 策略：
 * - 免费用户可使用全部基础功能
 * - "进阶内容"（专家级题目、深度医案）需解锁
 * - 解锁方式：邀请1位好友 OR 累计打卡7天 OR 分享3次
 * - 所有数据存 localStorage，不依赖付费
 */

export type UnlockMethod = 'invite' | 'checkin_streak' | 'share_count';

interface MemberState {
  /** 是否已解锁进阶内容 */
  unlocked: boolean;
  /** 邀请好友数 */
  inviteCount: number;
  /** 连续打卡天数 */
  checkinStreak: number;
  /** 分享次数 */
  shareCount: number;
  /** 解锁时间 */
  unlockedAt: string | null;
  /** 解锁方式 */
  unlockedBy: UnlockMethod | null;
}

const STORAGE_KEY = 'evo-member-state';

const DEFAULT_STATE: MemberState = {
  unlocked: false,
  inviteCount: 0,
  checkinStreak: 0,
  shareCount: 0,
  unlockedAt: null,
  unlockedBy: null,
};

// 解锁条件：满足任一即可
const UNLOCK_THRESHOLDS = {
  invite: 1,       // 邀请1位好友
  checkin_streak: 7, // 连续打卡7天
  share_count: 3,   // 分享3次
};

function loadState(): MemberState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: MemberState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useMember() {
  const [state, setState] = useState<MemberState>(DEFAULT_STATE);

  useEffect(() => {
    setState(loadState());
  }, []);

  const checkUnlock = useCallback((s: MemberState): MemberState => {
    if (s.unlocked) return s;

    // 检查是否满足任一解锁条件
    if (s.inviteCount >= UNLOCK_THRESHOLDS.invite) {
      const newState = { ...s, unlocked: true, unlockedAt: new Date().toISOString(), unlockedBy: 'invite' as UnlockMethod };
      saveState(newState);
      trackAction('general', 'member_unlocked', { method: 'invite' });
      return newState;
    }
    if (s.checkinStreak >= UNLOCK_THRESHOLDS.checkin_streak) {
      const newState = { ...s, unlocked: true, unlockedAt: new Date().toISOString(), unlockedBy: 'checkin_streak' as UnlockMethod };
      saveState(newState);
      trackAction('general', 'member_unlocked', { method: 'checkin_streak' });
      return newState;
    }
    if (s.shareCount >= UNLOCK_THRESHOLDS.share_count) {
      const newState = { ...s, unlocked: true, unlockedAt: new Date().toISOString(), unlockedBy: 'share_count' as UnlockMethod };
      saveState(newState);
      trackAction('general', 'member_unlocked', { method: 'share_count' });
      return newState;
    }
    return s;
  }, []);

  const recordInvite = useCallback(() => {
    setState(prev => {
      const next = { ...prev, inviteCount: prev.inviteCount + 1 };
      saveState(next);
      return checkUnlock(next);
    });
  }, [checkUnlock]);

  const recordCheckin = useCallback((streak: number) => {
    setState(prev => {
      const next = { ...prev, checkinStreak: streak };
      saveState(next);
      return checkUnlock(next);
    });
  }, [checkUnlock]);

  const recordShare = useCallback(() => {
    setState(prev => {
      const next = { ...prev, shareCount: prev.shareCount + 1 };
      saveState(next);
      return checkUnlock(next);
    });
  }, [checkUnlock]);

  return {
    ...state,
    thresholds: UNLOCK_THRESHOLDS,
    recordInvite,
    recordCheckin,
    recordShare,
    /** 是否有权限访问进阶内容 */
    canAccessAdvanced: state.unlocked,
  };
}
