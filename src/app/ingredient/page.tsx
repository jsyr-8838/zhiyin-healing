'use client';

import { useState, useMemo } from 'react';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { INGREDIENTS, INTERACTIONS, findInteractions, getCategories } from '@/lib/ingredient-data';
import type { IngredientItem, IngredientInteraction } from '@/lib/ingredient-data';
import { Search, Leaf, AlertTriangle, Heart, ChevronRight } from 'lucide-react';

const NATURE_COLORS: Record<string, string> = {
  '寒': 'bg-blue-100 text-blue-700',
  '凉': 'bg-cyan-100 text-cyan-700',
  '平': 'bg-gray-100 text-gray-600',
  '温': 'bg-orange-100 text-orange-700',
  '热': 'bg-red-100 text-red-700',
  '微寒': 'bg-blue-50 text-blue-600',
};

export default function IngredientPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const categories = ['全部', ...getCategories()];

  // 搜索过滤
  const filteredIngredients = useMemo(() => {
    let result = INGREDIENTS;
    if (activeCategory !== '全部') {
      result = result.filter((i) => i.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((i) => i.name.includes(q) || i.description.includes(q));
    }
    return result;
  }, [activeCategory, searchQuery]);

  // 选中食材的交互关系
  const selectedInteractions = selectedIngredient
    ? findInteractions(selectedIngredient)
    : [];

  return (
    <PageContainer theme="healing" className="pb-24">
      {/* 头部 */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-6 pt-12 pb-8 text-white">
        <h1 className="text-2xl font-black mb-1">食材百科</h1>
        <p className="text-amber-100 text-sm">相生相克，食养有道</p>

        {/* 搜索框 */}
        <div className="mt-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索食材名称..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/90 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* 分类Tab */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 食材列表 */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {filteredIngredients.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedIngredient(selectedIngredient === item.name ? null : item.name)}
              className={`bg-white rounded-xl p-3 border text-left transition-all ${
                selectedIngredient === item.name
                  ? 'border-amber-300 shadow-md ring-1 ring-amber-200'
                  : 'border-gray-100 hover:border-amber-100 hover:shadow-sm'
              }`}
            >
              <h3 className="font-bold text-gray-900 text-sm mb-1">{item.name}</h3>
              <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${NATURE_COLORS[item.nature] || 'bg-gray-100 text-gray-500'}`}>
                {item.nature}
              </span>
              <span className="inline-block text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded ml-1">
                {item.category}
              </span>
            </button>
          ))}
        </div>

        {/* 交互关系展示 */}
        {selectedIngredient && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Leaf size={16} className="text-amber-500" />
              「{selectedIngredient}」的搭配宜忌
            </h3>

            {selectedInteractions.length === 0 ? (
              <p className="text-sm text-gray-400 bg-white rounded-xl p-4 border border-gray-100">
                暂无该食材的搭配数据
              </p>
            ) : (
              <>
                {/* 相生 */}
                {selectedInteractions.filter((i) => i.type === '相生').length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-emerald-600 mb-2 flex items-center gap-1">
                      <Heart size={14} /> 相生·推荐搭配
                    </h4>
                    <div className="space-y-2">
                      {selectedInteractions.filter((i) => i.type === '相生').map((interaction, idx) => (
                        <InteractionCard key={idx} interaction={interaction} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 相克 */}
                {selectedInteractions.filter((i) => i.type === '相克').length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-red-500 mb-2 flex items-center gap-1">
                      <AlertTriangle size={14} /> 相克·不宜搭配
                    </h4>
                    <div className="space-y-2">
                      {selectedInteractions.filter((i) => i.type === '相克').map((interaction, idx) => (
                        <InteractionCard key={idx} interaction={interaction} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 底部统计 */}
        <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            共收录 {INGREDIENTS.length} 种食材 · {INTERACTIONS.length} 条搭配关系
          </p>
          <p className="text-[10px] text-gray-300 mt-1">数据基于中医理论，仅供参考</p>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}

function InteractionCard({ interaction }: { interaction: IngredientInteraction }) {
  const isGood = interaction.type === '相生';
  return (
    <div className={`rounded-xl p-4 border ${
      isGood ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          isGood ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'
        }`}>
          {interaction.severity}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {interaction.item1Name} + {interaction.item2Name}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-1">{interaction.effect}</p>
      <p className="text-xs text-gray-400 mb-2">{interaction.basis}</p>
      <p className="text-xs font-medium text-gray-600">
        {isGood ? '💡' : '⚠️'} {interaction.recommendation}
      </p>
    </div>
  );
}
