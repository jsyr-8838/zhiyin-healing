'use client';

import { Check, Crown, Star } from 'lucide-react';
import type { PricingPlan } from '@/types';

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (plan: PricingPlan) => void;
}

const VIP_ICONS = {
  free: Star,
  pro: Crown,
};

const VIP_COLORS = {
  free: 'from-gray-400 to-gray-500',
  pro: 'from-amber-400 to-orange-500',
};

export default function PricingCard({ plan, onSelect }: PricingCardProps) {
  const Icon = VIP_ICONS[plan.vipLevel];
  const gradient = VIP_COLORS[plan.vipLevel];
  const isFree = plan.price === 0;
  const discount = isFree ? 0 : Math.round((1 - plan.price / plan.originalPrice) * 100);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        plan.highlighted
          ? 'ring-2 ring-amber-400 shadow-lg'
          : 'ring-1 ring-gray-200 shadow'
      }`}
    >
      {/* 推荐标签 */}
      {plan.highlighted && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
          推荐
        </div>
      )}

      {/* 折扣标签 */}
      {!isFree && discount > 0 && (
        <div className="absolute top-0 left-0">
          <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg">
            省{discount}%
          </div>
        </div>
      )}

      <div className="bg-white p-4">
        {/* 图标与名称 */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
            <Icon size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{plan.name}</h3>
            <p className="text-[10px] text-gray-400">{plan.period}</p>
          </div>
        </div>

        {/* 价格 */}
        <div className="mb-4">
          {isFree ? (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">免费</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs text-gray-400">¥</span>
                <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                <span className="text-xs text-gray-400">/{plan.period}</span>
              </div>
              <div className="text-[10px] text-gray-400 line-through mt-0.5">
                原价 ¥{plan.originalPrice}/{plan.period}
              </div>
            </>
          )}
        </div>

        {/* 功能列表 */}
        <ul className="space-y-2 mb-4">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-1.5 text-xs text-gray-600">
              <Check size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* 按钮 */}
        <button
          onClick={() => onSelect(plan)}
          className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
            plan.highlighted
              ? `bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl`
              : isFree
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isFree ? '当前方案' : '立即开通'}
        </button>
      </div>
    </div>
  );
}
