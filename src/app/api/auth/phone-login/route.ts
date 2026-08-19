import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/lib/phone-verify';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的11位手机号'),
  code: z.string().length(6, '验证码为6位数字'),
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

    const { phone, code } = parsed.data;

    // 1. 校验验证码
    const verifyResult = verifyCode(phone, code);
    if (!verifyResult.valid) {
      return NextResponse.json({ error: verifyResult.message }, { status: 400 });
    }

    // 2. 查找用户
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ error: '该手机号未注册，请先注册' }, { status: 404 });
    }

    // 3. 更新登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json({
      message: '登录成功',
      userId: user.id,
      phone: user.phone,
      name: user.name,
      nickname: user.nickname,
      role: user.role,
    });
  } catch (err) {
    console.error('[phone-login] Error:', err);
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
}
