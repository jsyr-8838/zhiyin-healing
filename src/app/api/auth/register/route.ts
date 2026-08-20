import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/lib/phone-verify';
import { db, generateId, now } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的11位手机号'),
  code: z.string().length(6, '验证码为6位数字'),
  name: z.string().min(1, '请输入姓名').max(20, '姓名不超过20字'),
  gender: z.enum(['male', 'female', 'other'], { message: '请选择性别' }),
  age: z.number().int().min(1, '请输入有效年龄').max(150, '年龄不超过150'),
  // 可选：访客ID，用于将访客数据迁移到注册用户
  visitorId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || '参数错误' },
        { status: 400 }
      );
    }

    const { phone, code, name, gender, age, visitorId } = parsed.data;

    // 1. 先检查手机号是否已注册（避免浪费验证码）
    const existing = await db.findOne<{ id: string }>(
      'SELECT id FROM User WHERE phone = ?',
      [phone]
    );
    if (existing) {
      return NextResponse.json({ error: '该手机号已注册，请直接登录' }, { status: 409 });
    }

    // 2. 校验验证码
    const verifyResult = verifyCode(phone, code);
    if (!verifyResult.valid) {
      return NextResponse.json({ error: verifyResult.message }, { status: 400 });
    }

    // 3. 创建用户（或升级访客账户）
    const ts = now();
    let user: { id: string; phone: string | null; name: string | null } | null = null;

    if (visitorId) {
      // 尝试将访客账户升级为注册用户
      const visitor = await db.findOne<{ id: string; role: string; phone: string | null }>(
        'SELECT id, role, phone FROM User WHERE id = ?',
        [visitorId]
      );
      if (visitor && visitor.role === 'visitor' && !visitor.phone) {
        // 迁移访客数据到注册账户
        await db.execute(
          `UPDATE User SET phone = ?, phoneVerified = 1, name = ?, nickname = ?, gender = ?, age = ?, role = 'registered', lastLoginAt = ?, updatedAt = ? WHERE id = ?`,
          [phone, name, name, gender, age, ts, ts, visitorId]
        );
        user = { id: visitor.id, phone, name };
      }
    }

    if (!user) {
      // 新建注册用户
      const id = generateId();
      await db.execute(
        `INSERT INTO User (id, nickname, avatar, vipLevel, vipExpireAt, createdAt, updatedAt, name, gender, age, birthDate, phone, phoneVerified, passwordHash, role, lastLoginAt)
         VALUES (?, ?, '', 'pro', NULL, ?, ?, ?, ?, ?, NULL, ?, 1, NULL, 'registered', ?, ?)`,
        [id, name, ts, ts, name, gender, age, phone, ts, ts]
      );
      user = { id, phone, name };
    }

    return NextResponse.json({
      message: '注册成功',
      userId: user.id,
      phone: user.phone,
      name: user.name,
    });
  } catch (err) {
    console.error('[register] Error:', err);
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 });
  }
}
