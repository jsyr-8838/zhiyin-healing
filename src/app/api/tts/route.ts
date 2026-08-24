import { NextRequest, NextResponse } from 'next/server';
import { ttsPostSchema, validateOrError } from '@/lib/validators';

/**
 * TTS API 路由 — 代理 Edge TTS 服务
 * 前端 → /api/tts → Edge TTS (/v1/audio/speech) → 返回 MP3 音频
 * 
 * 优质中文音色：
 *   女声：zh-CN-XiaoxiaoNeural（晓晓，温柔知性）
 *   男声：zh-CN-YunjianNeural（云健，沉稳厚重，低沉磁性，强感染力）
 *   默认回退声音：男声云健（禁止用女声引导疗愈）
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateOrError(ttsPostSchema, body);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { text, voice, speed, pitch } = validation.data;

    const ttsBase = process.env.TTS_API_BASE;

    if (ttsBase) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15秒超时

      try {
        const response = await fetch(`${ttsBase}/audio/speech`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'tts-1',
            voice: voice || 'zh-CN-YunjianNeural',
            input: text,
            response_format: 'mp3',
            speed: speed ?? 1.0,
            pitch: pitch ?? 0.7,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          return new NextResponse(audioBuffer, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': audioBuffer.byteLength.toString(),
              'Cache-Control': 'no-cache',
            },
          });
        }

        const errText = await response.text().catch(() => '');
        console.error('Edge TTS upstream error:', response.status, errText);
        // 上游失败，回退到浏览器 speechSynthesis
        return NextResponse.json({ fallback: true, message: 'Edge TTS 服务暂不可用' }, { status: 503 });
      } finally {
        clearTimeout(timeout);
      }
    }

    // 无 Edge TTS 服务 → 返回 fallback 标记
    return NextResponse.json({
      fallback: true,
      message: 'TTS服务未配置，将使用浏览器内置语音',
    }, { status: 200 });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json({ fallback: true, error: 'TTS服务异常' }, { status: 503 });
  }
}
