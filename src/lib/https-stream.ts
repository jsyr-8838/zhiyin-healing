/**
 * 共享 HTTPS 流式 POST 工具函数
 *
 * 使用 Node.js 原生 https 模块发流式请求，
 * 绕开 Next.js dev 模式对 fetch 的拦截导致的外部 API 挂起。
 * 同时使用 stream: true 解决 NVIDIA API 非 stream 模式下长请求挂起的问题。
 *
 * 被 ai-healing 和 comprehensive-diagnosis 等路由共用。
 */

import https from 'https';
import { Readable } from 'stream';

export function httpsStreamPost(
  url: string,
  headers: Record<string, string>,
  body: string,
  timeoutMs: number,
): Readable {
  const urlObj = new URL(url);
  const options: https.RequestOptions = {
    hostname: urlObj.hostname,
    port: urlObj.port || 443,
    path: urlObj.pathname + urlObj.search,
    method: 'POST',
    headers: {
      ...headers,
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const wrapper = new Readable({ read() {} });

  const req = https.request(options);

  // Connection timeout: only applies until response headers arrive.
  // Once streaming starts, each data chunk resets the idle timer.
  let connTimer: NodeJS.Timeout | null = setTimeout(() => {
    req.destroy(new Error('Connection timeout'));
  }, timeoutMs);

  let idleTimer: NodeJS.Timeout | null = null;

  const clearAllTimers = () => {
    if (connTimer) { clearTimeout(connTimer); connTimer = null; }
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
  };

  // Set up response handler BEFORE writing request body
  req.on('response', (res) => {
    console.log(`[https-stream] Response: HTTP ${res.statusCode}`);

    // Connection established - clear connection timeout
    if (connTimer) { clearTimeout(connTimer); connTimer = null; }

    // Start idle timeout (60s between chunks; reasoning models pause while thinking)
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.error('[https-stream] Idle timeout (60s no data)');
        res.destroy(new Error('Stream idle timeout'));
      }, 60000);
    };
    resetIdle();

    if (res.statusCode !== 200) {
      // Non-200: collect error body and push as error event
      let errBody = '';
      res.on('data', (chunk: Buffer) => { errBody += chunk.toString('utf-8'); });
      res.on('end', () => {
        clearAllTimers();
        console.error(`[https-stream] API error ${res.statusCode}: ${errBody.substring(0, 200)}`);
        wrapper.push(Buffer.from(`data: ${JSON.stringify({ error: true, status: res.statusCode, message: errBody.substring(0, 500) })}\n\n`));
        wrapper.push(Buffer.from('data: [DONE]\n\n'));
        wrapper.push(null);
      });
      return;
    }

    // 200 OK: pipe data through, reset idle timer on each chunk
    res.on('data', (chunk: Buffer) => {
      resetIdle();
      wrapper.push(chunk);
    });
    res.on('end', () => {
      clearAllTimers();
      wrapper.push(null);
    });
    res.on('error', (err: Error) => {
      clearAllTimers();
      wrapper.destroy(err);
    });
  });

  req.on('error', (err: Error) => {
    clearAllTimers();
    console.error('[https-stream] Request error:', err.message);
    wrapper.destroy(err);
  });

  req.on('close', () => {
    clearAllTimers();
  });

  // Write request body (after handlers are set up)
  req.write(body);
  req.end();

  return wrapper;
}