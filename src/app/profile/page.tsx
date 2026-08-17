'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/lib/store';
import { WUYIN_DETAILS } from '@/lib/tcm-data';
import {
  User, ChevronRight, Settings, Bell, Shield,
  HelpCircle, LogOut, Heart, Clock, Award,
  Stethoscope, FlameKindling, Compass, BookOpen,
  Camera, MessageCircle, ClipboardCheck, Bone,
  Phone, CheckCircle, ArrowRight, Sparkles,
} from 'lucide-react';

interface AuthInfo {
  authenticated: boolean;
  id?: string;
  nickname?: string;
  name?: string;
  phone?: string;
  phoneVerified?: boolean;
  gender?: string;
  age?: number;
  role?: string;
  isRegistered?: boolean;
  vipLevel?: string;
  createdAt?: string;
}

const QUICK_ENTRIES = [
  { icon: Stethoscope, label: '明辨体质', href: '/diagnose', color: 'from-emerald-500 to-teal-600' },
  { icon: Camera, label: 'AI舌诊', href: '/diagnose', color: 'from-green-500 to-emerald-600' },
  { icon: FlameKindling, label: '疗愈方案', href: '/healing', color: 'from-blue-500 to-indigo-600' },
  { icon: Bone, label: '3D经络', href: '/meridian', color: 'from-purple-500 to-pink-600' },
  { icon: MessageCircle, label: 'AI导诊', href: '/diagnosis', color: 'from-amber-400 to-orange-500' },
  { icon: Compass, label: '知几', href: '/divination', color: 'from-purple-500 to-indigo-600' },
  { icon: BookOpen, label: '玄览', href: '/classics', color: 'from-amber-600 to-orange-700' },
  { icon: ClipboardCheck, label: '每日打卡', href: '/checkin', color: 'from-indigo-500 to-purple-500' },
];

const MENU_ITEMS = [
  { icon: Heart, label: '我的收藏', badge: '' },
  { icon: Clock, label: '疗愈记录', badge: '' },
  { icon: Award, label: '成就徽章', badge: '2' },
  { icon: Bell, label: '消息通知', badge: '' },
  { icon: Shield, label: '隐私设置', badge: '' },
  { icon: Settings, label: '系统设置', badge: '' },
  { icon: HelpCircle, label: '帮助与反馈', badge: '' },
];

export default function ProfilePage() {
  const { user, lastProfile, setUser } = useAppStore();
  const router = useRouter();
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 获取当前认证状态
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setAuthInfo(data);
        setAuthLoading(false);
        // 同步到 Zustand store
        if (data.authenticated && data.isRegistered && !user) {
          setUser({
            nickname: data.nickname || data.name || '用户',
            avatar: '',
            vipLevel: (data.vipLevel as 'free' | 'pro') || 'pro',
            joinDate: data.createdAt || new Date().toISOString(),
            testHistory: [],
            streakDays: 0,
            name: data.name,
            phone: data.phone,
            gender: data.gender as 'male' | 'female' | 'other',
            age: data.age,
            role: data.role as 'visitor' | 'registered' | 'admin',
            isRegistered: data.isRegistered,
          });
        }
      })
      .catch(() => setAuthLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isRegistered = authInfo?.isRegistered;

  // 未注册/未登录状态
  const renderGuestHeader = () => (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-12 pb-10 text-white">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <User size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold">游客用户</h2>
          <p className="text-emerald-200 text-sm">注册后同步健康数据</p>
        </div>
      </div>
    </div>
  );

  // 已注册用户头部
  const renderRegisteredHeader = () => (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-12 pb-10 text-white">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
          {authInfo?.gender === 'female' ? '🌸' : '🧘'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{authInfo?.name || authInfo?.nickname || '用户'}</h2>
            <span className="flex items-center gap-1 text-[10px] bg-emerald-400/30 px-2 py-0.5 rounded-full">
              <CheckCircle size={10} /> 已认证
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Phone size={12} className="text-emerald-200" />
            <span className="text-xs text-emerald-200">
              {authInfo?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // 已登录访客头部（有 session 但未注册）
  const renderVisitorHeader = () => (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-12 pb-10 text-white">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <User size={28} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{user?.nickname || '疗愈行者'}</h2>
          <p className="text-emerald-200 text-sm">注册后数据永久保存</p>
        </div>
        <button
          onClick={() => setUser(null)}
          className="p-2"
        >
          <LogOut size={18} className="text-emerald-200" />
        </button>
      </div>
    </div>
  );

  // 注册引导卡片
  const renderRegisterCard = () => (
    <button
      onClick={() => router.push('/auth/login')}
      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
    >
      <Sparkles size={16} />
      手机号注册/登录
      <ArrowRight size={16} />
    </button>
  );

  return (
    <PageContainer theme="healing" className="pb-24">
      {/* 头部区域 */}
      {authLoading ? (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-12 pb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-24 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-32 bg-white/15 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ) : isRegistered ? (
        renderRegisteredHeader()
      ) : user ? (
        renderVisitorHeader()
      ) : (
        renderGuestHeader()
      )}

      <div className="px-4 pt-6 space-y-4">
        {/* 注册引导（未注册用户） */}
        {!isRegistered && (
          <div className="space-y-3">
            {renderRegisterCard()}
            {!user && (
              <p className="text-center text-xs text-gray-400">
                注册后您的体质数据、修为进度将永久保存
              </p>
            )}
          </div>
        )}

        {/* 已注册用户的升级提示 */}
        {isRegistered && lastProfile && (
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700">
            {WUYIN_DETAILS[lastProfile.dominant].name}音·{WUYIN_DETAILS[lastProfile.dominant].element}行体质
          </div>
        )}

        {/* 功能全部开放提示 */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Heart size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-800">全部功能已开放</h3>
              <p className="text-xs text-emerald-600">明辨·疗愈·导诊·知几·玄览 · 全部免费</p>
            </div>
          </div>
        </div>

        {/* 快捷功能入口 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">快捷入口</h3>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ENTRIES.map(({ icon: Icon, label, href, color }) => (
              <Link key={label} href={href} className="text-center hover:opacity-80 transition">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mx-auto mb-1`}>
                  <Icon size={18} />
                </div>
                <p className="text-xs text-gray-600">{label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* 即将上线 */}
        <Link href="/pricing" className="block bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 text-lg">
              🏥
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-800">专家预约</h3>
              <p className="text-xs text-amber-600">一对一 · 线下真实体验 · 极致服务</p>
            </div>
            <ChevronRight size={18} className="text-amber-400" />
          </div>
        </Link>

        {/* 功能菜单 */}
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {MENU_ITEMS.map(({ icon: Icon, label, badge }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition cursor-pointer">
              <Icon size={18} className="text-gray-400" />
              <span className="flex-1 text-sm text-gray-700">{label}</span>
              {badge && (
                <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          ))}
        </div>

        {/* 关于 */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-300">知音 ZhiYin v2.1</p>
          <p className="text-[10px] text-gray-300 mt-1">中医理疗仅供参考，不替代医疗诊断</p>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
