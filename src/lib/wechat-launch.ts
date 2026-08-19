/**
 * 微信拉起工具
 * 
 * 支持两种方式：
 * 1. weixin:// 协议直接拉起微信（移动端）
 * 2. 生成微信二维码，用户扫码添加好友（PC/通用）
 */

// 微信URL scheme
const WEIXIN_SCHEME = 'weixin://';

/**
 * 拉起微信App
 * 移动端通过 weixin:// 协议唤起微信
 * @param wechatId 微信号，用于跳转到添加好友页面
 */
export function launchWechat(wechatId?: string): boolean {
  if (!wechatId) {
    // 只拉起微信，不跳转特定页面
    window.location.href = WEIXIN_SCHEME;
    return true;
  }

  // 尝试通过 weixin://dl/business/ 拉起微信并跳转到添加好友
  // 注意：此方式在新版微信中可能受限，回退方案是显示二维码
  try {
    const link = document.createElement('a');
    link.href = `weixin://dl/business/?t=${wechatId}`;
    link.click();
    return true;
  } catch {
    return false;
  }
}

/**
 * 检测当前环境是否为移动端
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * 检测是否在微信内置浏览器中
 */
export function isWechatBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  return /MicroMessenger/i.test(navigator.userAgent);
}

/**
 * 生成微信二维码 URL
 * 使用第三方 QR Code API 生成可扫码添加微信好友的二维码
 * @param wechatId 微信号
 * @param size 二维码尺寸（像素），默认 200
 */
export function getWechatQRCodeUrl(wechatId: string, size: number = 200): string {
  // 生成 "weixin://" 协议链接的二维码
  // 用户扫码后可直接跳转到微信添加好友
  const content = encodeURIComponent(`weixin://dl/business/?t=${wechatId}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${content}`;
}

/**
 * 生成纯文本微信二维码 URL（更通用，显示微信号让用户手动添加）
 * @param wechatId 微信号
 * @param size 二维码尺寸，默认 200
 */
export function getWechatTextQRCodeUrl(wechatId: string, size: number = 200): string {
  const content = encodeURIComponent(`微信号: ${wechatId}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${content}&color=3d7a75`;
}

/**
 * 综合微信拉起逻辑
 * - 微信浏览器内：直接跳转
 * - 移动端非微信：尝试拉起微信
 * - PC端：显示二维码
 * @param wechatId 微信号
 * @returns 'launched' | 'qrcode' 表示使用的方案
 */
export function smartWechatLaunch(wechatId: string): 'launched' | 'qrcode' {
  if (isWechatBrowser()) {
    // 微信内置浏览器，直接提示用户搜索添加
    return 'qrcode';
  }

  if (isMobile()) {
    // 移动端：尝试拉起微信
    launchWechat(wechatId);
    return 'launched';
  }

  // PC 端：显示二维码
  return 'qrcode';
}

/**
 * 复制微信号到剪贴板
 */
export async function copyWechatId(wechatId: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(wechatId);
    return true;
  } catch {
    // fallback
    try {
      const textArea = document.createElement('textarea');
      textArea.value = wechatId;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
}
