/**
 * 手机验证码服务（开发模式 — 模拟短信）
 * 
 * 生产环境应替换为真实短信服务商（阿里云/腾讯云 SMS）
 * 开发模式下：
 * - 验证码固定为 888888（可配置）
 * - 同时在控制台打印验证码便于调试
 * - 内存存储，5分钟过期
 */

const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5分钟
const DEV_CODE = '888888'; // 开发模式固定验证码
const RATE_LIMIT_MS = 60 * 1000; // 1分钟内只能发一次

interface CodeRecord {
  code: string;
  createdAt: number;
  verified: boolean; // 已验证的码不可再用
}

// 内存存储：phone → CodeRecord
const codeStore = new Map<string, CodeRecord>();
// 限流：phone → lastSentAt
const rateLimitStore = new Map<string, number>();

/**
 * 生成6位随机验证码
 */
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * 发送验证码（开发模式 — 仅打印到控制台）
 */
export async function sendVerificationCode(phone: string): Promise<{
  success: boolean;
  message: string;
}> {
  // 1. 限流检查
  const lastSent = rateLimitStore.get(phone);
  if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSent)) / 1000);
    return { success: false, message: `操作频繁，请${waitSec}秒后再试` };
  }

  // 2. 手机号格式校验（中国大陆11位）
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { success: false, message: '请输入正确的手机号' };
  }

  // 3. 生成验证码
  const isDev = process.env.NODE_ENV === 'development';
  const code = isDev ? DEV_CODE : generateCode();

  // 4. 存储
  codeStore.set(phone, {
    code,
    createdAt: Date.now(),
    verified: false,
  });
  rateLimitStore.set(phone, Date.now());

  // 5. 发送（开发模式打印到控制台）
  if (isDev) {
    console.log(`[SMS DEV] 手机号 ${phone} 的验证码: ${code}（开发模式固定 888888）`);
  } else {
    // TODO: 生产环境接入短信服务商
    // await smsClient.send(phone, `您的知音验证码是${code}，5分钟内有效。`);
    console.log(`[SMS] 手机号 ${phone} 的验证码: ${code}`);
  }

  return { success: true, message: '验证码已发送' };
}

/**
 * 校验验证码
 */
export function verifyCode(phone: string, inputCode: string): {
  valid: boolean;
  message: string;
} {
  const record = codeStore.get(phone);

  if (!record) {
    return { valid: false, message: '请先获取验证码' };
  }

  if (record.verified) {
    return { valid: false, message: '验证码已使用，请重新获取' };
  }

  if (Date.now() - record.createdAt > CODE_EXPIRY_MS) {
    codeStore.delete(phone);
    return { valid: false, message: '验证码已过期，请重新获取' };
  }

  if (record.code !== inputCode) {
    return { valid: false, message: '验证码错误' };
  }

  // 标记已使用
  record.verified = true;
  return { valid: true, message: '验证成功' };
}

// 定期清理过期记录
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of codeStore) {
    if (now - record.createdAt > CODE_EXPIRY_MS) {
      codeStore.delete(phone);
      rateLimitStore.delete(phone);
    }
  }
}, 60 * 1000);
