'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import { ArrowLeft, Star, Shield, Clock, Video, Heart, Users, BookOpen } from 'lucide-react';

const SERVICE_FEATURES = [
  {
    icon: Video,
    title: '一对一专属服务',
    desc: '资深疗愈顾问面对面，辨证施治，精准调理',
  },
  {
    icon: Heart,
    title: '个性化调养方案',
    desc: '根据体质与节气，量身定制灸法、食疗、音疗方案',
  },
  {
    icon: Clock,
    title: '定期回访跟踪',
    desc: '专人跟踪调理效果，动态调整养生策略',
  },
  {
    icon: BookOpen,
    title: '经典灸法传承',
    desc: '古法灸术结合九种体质，药食同源指导',
  },
  {
    icon: Users,
    title: '养生社群',
    desc: '同体质养生圈，顾问答疑，经验分享',
  },
  {
    icon: Shield,
    title: '真实资质保障',
    desc: '持证疗愈顾问团队，正宗传承、线下体验',
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <PageContainer theme="healing" className="pb-16">
      {/* 顶部 */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-6 pt-12 pb-10 text-white">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg">专家预约</h1>
        </div>

        <div className="text-center">
          <div className="text-5xl mb-3">🏥</div>
          <h2 className="text-2xl font-black mb-2">线下真实体验 · 一对一极致服务</h2>
          <p className="text-amber-100 text-sm">资深疗愈顾问辨证调理 · 个性化养生指导 · 已可预约</p>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* 功能预览 */}
        <div className="space-y-3">
          {SERVICE_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 特邀名医（保留视觉信息） */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <h3 className="font-bold text-gray-900">特邀名医顾问</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl">👨‍⚕️</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm">张伯礼</h4>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">国医大师</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">心脑血管 · 痰湿体质</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl">👨‍⚕️</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm">王琦</h4>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">国医大师</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">九种体质 · 辨体施治</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl">👨‍⚕️</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm">孙申田</h4>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">国医大师</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">针灸经络 · 疼痛调理</p>
              </div>
            </div>
          </div>
        </div>

        {/* 当前说明 */}
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-center">
          <h3 className="font-bold text-emerald-800 mb-2">线上功能全部免费</h3>
          <p className="text-xs text-emerald-600 leading-relaxed">
            五音疗愈全部6段方案、AI智能导诊、体质测试、每日打卡、节气养生、食材百科
            <br />全部功能均可免费使用，无次数限制
          </p>
        </div>

        {/* 预约按钮 */}
        <Link
          href="/healing/experts"
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
        >
          <Star size={16} className="fill-white" /> 立即预约疗愈顾问
        </Link>

        <p className="text-xs text-gray-400 text-center">
          专家预约为线下体验服务，详情以预约页面为准
        </p>
      </div>
    </PageContainer>
  );
}
