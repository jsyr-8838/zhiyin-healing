import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/phone-verify';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的11位手机号'),
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

    const { phone } = parsed.data;
    const result = await sendVerificationCode(phone);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 429 });
    }

    return NextResponse.json({ message: result.message });
  } catch (err) {
    console.error('[verify-phone] Error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
