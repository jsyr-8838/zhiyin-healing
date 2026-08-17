import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/lib/phone-verify';
import { prisma } from '@/lib/prisma';
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
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: '该手机号已注册，请直接登录' }, { status: 409 });
    }

    // 2. 校验验证码
    const verifyResult = verifyCode(phone, code);
    if (!verifyResult.valid) {
      return NextResponse.json({ error: verifyResult.message }, { status: 400 });
    }

    // 3. 创建用户（或升级访客账户）
    let user;

    if (visitorId) {
      // 尝试将访客账户升级为注册用户
      const visitor = await prisma.user.findUnique({ where: { id: visitorId } });
      if (visitor && visitor.role === 'visitor' && !visitor.phone) {
        // 迁移访客数据到注册账户
        user = await prisma.user.update({
          where: { id: visitorId },
          data: {
            phone,
            phoneVerified: true,
            name,
            nickname: name,
            gender,
            age,
            role: 'registered',
            lastLoginAt: new Date(),
          },
        });
      }
    }

    if (!user) {
      // 新建注册用户
      user = await prisma.user.create({
        data: {
          phone,
          phoneVerified: true,
          name,
          nickname: name,
          gender,
          age,
          role: 'registered',
          vipLevel: 'pro',
          lastLoginAt: new Date(),
        },
      });
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
