'use client';

import React from 'react';

/**
 * 全局 ErrorBoundary — 捕获渲染崩溃，上报 Evo 进化系统
 * 
 * 功能：
 * 1. 捕获子组件树渲染错误，显示友好降级 UI
 * 2. 自动上报错误到 /api/evo/track（带错误指纹）
 * 3. 提供"重试"按钮，用户可恢复页面
 */

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** 错误降级 UI 的标题 */
  fallbackTitle?: string;
  /** 是否显示重试按钮 */
  showRetry?: boolean;
}

// 生成错误指纹（与 tracker.ts 保持一致）
function fingerprint(msg: string, source?: string): string {
  const raw = `${source || ''}:${msg}`.slice(0, 200);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // 上报到 Evo 进化系统
    const fp = fingerprint(error.message, error.stack?.split('\n')[0]);

    // 构造上报数据
    const trackData = {
      eventType: 'error',
      module: 'general',
      action: 'render_crash',
      detail: {
        message: error.message,
        stack: error.stack?.slice(0, 500),
        componentStack: errorInfo.componentStack?.slice(0, 500),
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
      errorFingerprint: fp,
    };

    // 使用 sendBeacon 确保页面卸载时也能发出
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/evo/track', JSON.stringify(trackData));
    } else {
      fetch('/api/evo/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData),
        keepalive: true,
      }).catch(() => {});
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const title = this.props.fallbackTitle || '页面出了点小问题';

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            {/* 国风降级图标 */}
            <div className="mb-4 text-5xl opacity-40">
              <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#b8860b" strokeWidth="1.5" opacity="0.4" />
                <path d="M32 18v18M32 42v4" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <circle cx="32" cy="32" r="3" fill="#b8860b" opacity="0.5" />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-stone-700 mb-2">{title}</h3>
            <p className="text-sm text-stone-500 mb-1">
              系统已自动记录此问题，进化引擎将分析并修复
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error.message && (
              <p className="text-xs text-red-400 mt-2 mb-3 break-all max-h-24 overflow-auto">
                {this.state.error.message}
              </p>
            )}

            {this.props.showRetry !== false && (
              <button
                onClick={this.handleRetry}
                className="mt-4 px-6 py-2 rounded-full text-sm font-medium text-white bg-stone-700 hover:bg-stone-800 transition-colors"
              >
                重试
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 全局错误回退页面 — 用于 Next.js app-router 的 error.tsx
 * 这是一个客户端组件，配合 ErrorBoundary 使用
 */
export function GlobalErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  // 上报错误
  React.useEffect(() => {
    const fp = fingerprint(error.message, error.stack?.split('\n')[0]);
    const trackData = {
      eventType: 'error',
      module: 'global',
      action: 'app_crash',
      detail: {
        message: error.message,
        stack: error.stack?.slice(0, 500),
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
      errorFingerprint: fp,
    };

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/evo/track', JSON.stringify(trackData));
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
      <div className="text-center max-w-md">
        <div className="mb-6 text-6xl opacity-30">
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto" fill="none">
            <circle cx="40" cy="40" r="36" stroke="#b8860b" strokeWidth="1.5" opacity="0.3" />
            <path d="M40 22v24M40 52v4" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-stone-700 mb-3">应用遇到了意外</h2>
        <p className="text-sm text-stone-500 mb-6">
          知音进化系统已记录此问题，将自动分析与修复
        </p>
        <button
          onClick={reset}
          className="px-8 py-2.5 rounded-full text-sm font-medium text-white bg-stone-700 hover:bg-stone-800 transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
