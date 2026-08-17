import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import AudioPlayerProvider from "@/components/providers/AudioPlayerProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "知音 - 中医五行五音疗愈 | ZhiYin",
  description: "知音：基于中医五行理论的五音疗愈应用，通过角徵宫商羽五音调理肝心脾肺肾，AI智能体质辨识，个性化疗愈方案。",
  keywords: "知音,五音疗愈,中医,五行,音乐疗法,体质辨识,AI导诊,养生,角徵宫商羽",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "知音",
  },
  openGraph: {
    title: "知音 - 中医五行五音疗愈",
    description: "角徵宫商羽五音调理肝心脾肺肾，AI智能体质辨识",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-full flex flex-col bg-[#fafaf9]">
        {children}
        <AudioPlayerProvider />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 非 localhost 环境：阻止 HMR WebSocket 疯狂重连（Cloudflare Tunnel 不支持 WS）
              if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                var _origWS = window.WebSocket;
                window.WebSocket = function(url, protocols) {
                  if (url && url.indexOf('/_next/webpack-hmr') !== -1) {
                    return { readyState: 3, onopen: null, onerror: null, onclose: null, onmessage: null, close: function(){}, send: function(){} };
                  }
                  return protocols ? new _origWS(url, protocols) : new _origWS(url);
                };
                window.WebSocket.prototype = _origWS.prototype;
                window.WebSocket.CONNECTING = 0;
                window.WebSocket.OPEN = 1;
                window.WebSocket.CLOSING = 2;
                window.WebSocket.CLOSED = 3;
              }
              // Service Worker registration
              // Skip in local dev to avoid stale cache and false offline pages
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                    navigator.serviceWorker.register('/sw.js');
                  } else {
                    // Local dev: unregister any existing SW and clear caches
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      regs.forEach(function(r) { r.unregister(); });
                    });
                    if (window.caches && caches.keys) {
                      caches.keys().then(function(keys) {
                        keys.forEach(function(k) { caches.delete(k); });
                      });
                    }
                  }
                });
                // Listen for SW unregister message
                navigator.serviceWorker.addEventListener('message', function(event) {
                  if (event.data && event.data.type === 'UNREGISTER_SW') {
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      regs.forEach(function(r) { r.unregister(); });
                    });
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
