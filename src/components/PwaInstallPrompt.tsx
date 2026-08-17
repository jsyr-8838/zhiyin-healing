'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS Safari - show manual install guide
    const isIosSafari = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) &&
      /safari/.test(navigator.userAgent.toLowerCase()) &&
      !/crios|fxios/.test(navigator.userAgent.toLowerCase());

    if (isIosSafari && !isInstalled) {
      const dismissed = localStorage.getItem('heytcm-ios-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 5000);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isInstalled]);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem('heytcm-ios-dismissed', '1');
  }

  if (!showBanner || isInstalled) return null;

  const isIosSafari = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) &&
    /safari/.test(navigator.userAgent.toLowerCase());

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 animate-[slide-up_0.3s]">
      <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-500">
        <X size={16} />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <Download size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-sm">添加到主屏幕</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isIosSafari
              ? '点击浏览器底部「分享」按钮，选择「添加到主屏幕」'
              : '安装到手机，全屏运行更流畅'
            }
          </p>
          {!isIosSafari && (
            <button
              onClick={handleInstall}
              className="mt-2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
            >
              立即安装
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
