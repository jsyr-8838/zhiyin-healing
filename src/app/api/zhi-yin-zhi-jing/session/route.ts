import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';
import type { FlowModeId } from '@/lib/zhi-yin-zhi-jing-data';

/**
 * POST /api/zhi-yin-zhi-jing/session
 *
 * 提交一次知音之境疗愈会话，将其摘要写入今日情绪打卡记录的
 * healingDone.zhiYinZhiJing 字段，与情绪打卡模块形成闭环。
 *
 * 请求体：
 *   - userId: string
 *   - modeId: FlowModeId
 *   - durationSec: number
 *   - moodBefore: number  (1-5)
 *   - moodAfter: number   (1-5)
 *   - bpmBefore?: number
 *   - bpmAfter?: number
 *
 * 行为：
 *   1. 若今日打卡记录不存在 → 创建一条只含 healingDone 的最小打卡记录
 *      （mood=3 中性默认，sleepHours=0, exercise=3, diet=3）
 *   2. 若已存在 → 在 healingDone.zhiYinZhiJing 累加本次会话
 *   3. 若 moodAfter 比 moodBefore 有改善，且今日打卡 mood < moodAfter，
 *      则用 moodAfter 升级今日打卡的 mood 字段（让打卡数据反映疗愈效果）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      modeId,
      durationSec,
      moodBefore,
      moodAfter,
    } = body as {
      userId: string;
      modeId: FlowModeId;
      durationSec: number;
      moodBefore: number;
      moodAfter: number;
      bpmBefore?: number;
      bpmAfter?: number;
    };

    if (!userId || !modeId || typeof durationSec !== 'number') {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 });
    }
    const validModes: FlowModeId[] = [
      'deepsea', 'rain', 'temple', 'universe',
      'mountain', 'campfire', 'snow', 'moon', 'mist',
    ];
    if (!validModes.includes(modeId)) {
      return NextResponse.json({ error: '无效的境 id' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // 读取今日打卡
    const existing = await db.findOne<{ healingDone: string; mood: number; moodScore: number }>(
      'SELECT healingDone, mood, moodScore FROM Checkin WHERE userId = ? AND date = ?',
      [userId, today]
    );

    // 解析现有 healingDone JSON
    let healingDone: Record<string, unknown> = {};
    try {
      healingDone = existing?.healingDone ? JSON.parse(existing.healingDone) : {};
    } catch {
      healingDone = {};
    }

    // 累加 zhiYinZhiJing 会话记录
    const zyKey = 'zhiYinZhiJing';
    const prev = (healingDone[zyKey] as Record<string, unknown> | undefined) || {};
    const prevCount = (prev[modeId] as number) || 0;
    const prevDuration = (prev[`${modeId}_duration`] as number) || 0;
    healingDone[zyKey] = {
      ...prev,
      [modeId]: prevCount + 1,
      [`${modeId}_duration`]: prevDuration + durationSec,
      lastSessionAt: Date.now(),
      lastModeId: modeId,
    };

    // 若心情改善，升级今日打卡 mood（取较大值）
    let updatedMood = existing?.mood ?? 3;
    let updatedMoodScore = existing?.moodScore ?? 60;
    if (moodAfter > moodBefore && moodAfter > updatedMood) {
      updatedMood = moodAfter;
      // 简单换算 1-5 → 0-100
      updatedMoodScore = Math.min(100, Math.round((moodAfter - 1) * 25 + 20));
    }

    if (existing) {
      // 更新现有打卡
      await db.execute(
        'UPDATE Checkin SET healingDone = ?, mood = ?, moodScore = ? WHERE userId = ? AND date = ?',
        [JSON.stringify(healingDone), updatedMood, updatedMoodScore, userId, today]
      );
      return NextResponse.json({
        ok: true,
        action: 'updated',
        checkin: {
          mood: updatedMood,
          moodScore: updatedMoodScore,
          healingDone: healingDone[zyKey],
        },
      });
    } else {
      // 创建最小打卡记录（只占位，等用户真正打卡时再补全）
      const id = generateId();
      const ts = now();
      await db.execute(
        `INSERT INTO Checkin (id, userId, date, sleepHours, sleepScore, bedtime, mood, moodScore,
         exercise, exerciseScore, diet, dietScore, healthScore, symptoms, note, healingDone, createdAt)
         VALUES (?, ?, ?, 0, 0, '', ?, ?, 3, 60, 3, 60, 40, '', ?, ?, ?)`,
        [id, userId, today, moodAfter,
         Math.min(100, Math.round((moodAfter - 1) * 25 + 20)),
         `知音之境 · ${modeId} · ${Math.round(durationSec / 60)}分钟`,
         JSON.stringify(healingDone), ts]
      );
      return NextResponse.json({
        ok: true,
        action: 'created',
        checkin: {
          mood: moodAfter,
          moodScore: Math.min(100, Math.round((moodAfter - 1) * 25 + 20)),
          healingDone: healingDone[zyKey],
        },
      });
    }
  } catch (error) {
    console.error('ZhiYin session API error:', error);
    return NextResponse.json({ error: '记录会话失败' }, { status: 500 });
  }
}
