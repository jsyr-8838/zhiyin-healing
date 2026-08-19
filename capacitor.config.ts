import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.heytcm.app',
  appName: '知音',
  // Capacitor 需要静态文件目录，但本项目有 API 路由
  // 方案：构建时 next export 生成静态页面，运行时连接远程后端
  webDir: 'out',
  server: {
    // ⚠️ 重要：将此 URL 改为你的后端服务器地址
    // Docker 部署后填写公网 IP 或域名
    // 留空则使用打包在 APK 内的静态文件（API 功能不可用）
    url: process.env.CAPACITOR_SERVER_URL || '',
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#faf5ee',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#faf5ee',
    },
  },
};

export default config;
