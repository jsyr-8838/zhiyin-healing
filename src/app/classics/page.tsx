'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import { CLASSICS_CATEGORIES, type ClassicBook } from '@/lib/classics-data';
import { hasClassicText } from '@/lib/classics-loader';
import ClassicsAIAssistant from '@/components/classics/ClassicsAIAssistant';
import {
  ArrowLeft, BookOpen, Search, ChevronRight, Library, Sparkles,
} from 'lucide-react';

export default function ClassicsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiOpen, setAiOpen] = useState(false);

  const categories = CLASSICS_CATEGORIES;

  const filteredCategories = searchQuery
    ? categories.map(cat => ({
        ...cat,
        books: cat.books.filter(b => b.name.includes(searchQuery) || b.description.includes(searchQuery)),
      })).filter(cat => cat.books.length > 0)
    : selectedCategory
    ? categories.filter(c => c.id === selectedCategory)
    : categories;

  const totalBooks = categories.reduce((sum, cat) => sum + cat.books.length, 0);

  return (
    <PageContainer theme="classics" className="texture-paper pattern-meander pb-24">
      <div className="px-5 pt-12 pb-5 text-white" style={{ background: 'linear-gradient(135deg, #8a6d3b, #6b5030)' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => window.history.back()} className="text-white/70 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-black">玄览</h1>
          <button
            onClick={() => setAiOpen(true)}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.15)',
}}
          >
            <Sparkles size={13} />
            <span>AI助读</span>
          </button>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>山医命相卜养 · 六类{totalBooks}部典籍智慧</p>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* AI 智能问答入口 */}
        <button
          onClick={() => setAiOpen(true)}
          className="w-full glass-card p-4 text-left flex items-center gap-3 hover:scale-[1.01] transition-transform"
          style={{ background: 'linear-gradient(135deg, rgba(201,169,79,0.08), rgba(90,143,123,0.06))' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c9a94f, #8a6d3b)' }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm" style={{ color: 'var(--ink-main)' }}>AI 智能助读</h4>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-light)', opacity: 0.7 }}>跨书检索 · 全文搜索 · 智能问答</p>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--ink-light)', opacity: 0.3 }} />
        </button>

        {/* 搜索 */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-light)', opacity: 0.4 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSelectedCategory(null) }}
            placeholder="搜索典籍书目..."
            className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition"
            style={{
              background: 'rgba(255,255,255,0.6)',
              borderColor: 'rgba(201,169,79,0.2)',
              color: 'var(--ink-main)',
}}
          />
        </div>

        {/* 六术分类 */}
        {!searchQuery && !selectedCategory && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="glass-card p-3 text-center hover:scale-[1.02] transition-transform"
              >
                <div className="text-xl mb-1">{cat.icon}</div>
                <div className="font-bold text-sm" style={{ color: 'var(--ink-main)' }}>{cat.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>{cat.label} · {cat.books.length}本</div>
              </button>
            ))}
          </div>
        )}

        {/* 分类返回 */}
        {selectedCategory && !searchQuery && (
          <button onClick={() => setSelectedCategory(null)} className="text-sm flex items-center gap-1" style={{ color: 'var(--ochre)' }}>
            <ArrowLeft size={14} /> 全部分类
          </button>
        )}

        {/* 书目列表 */}
        {filteredCategories.map(cat => (
          <div key={cat.id} className="space-y-2">
            {!selectedCategory && !searchQuery && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <h3 className="font-bold" style={{ color: 'var(--ink-main)' }}>{cat.name}·{cat.label}</h3>
                </div>
                <button onClick={() => setSelectedCategory(cat.id)} className="text-xs flex items-center gap-0.5" style={{ color: 'var(--ochre)' }}>
                  全部{cat.books.length}本 <ChevronRight size={12} />
                </button>
              </div>
            )}
            {(selectedCategory || searchQuery ? cat.books : cat.books.slice(0, 3)).map(book => (
              <Link
                key={book.id}
                href={`/classics/${book.id}`}
                className="w-full glass-card p-4 text-left flex items-center gap-3 hover:scale-[1.01] transition-transform block"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #8b4513, #6b3410)' }}
                >
                  {book.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm" style={{ color: 'var(--ink-main)' }}>{book.name}</h4>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--ink-light)' }}>{book.dynasty} · {book.author}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--ink-light)', opacity: 0.7 }}>{book.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <ChevronRight size={16} style={{ color: 'var(--ink-light)', opacity: 0.3 }} />
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: hasClassicText(book.id) ? 'rgba(90,143,123,0.1)' : 'rgba(194,138,90,0.1)',
                      color: hasClassicText(book.id) ? 'var(--jade)' : 'var(--ochre)',
                    }}
                  >
                    {hasClassicText(book.id) ? '完整' : '整理中'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ))}

        {/* 统计 */}
        <div className="glass-card p-4 text-center" style={{ borderStyle: 'dashed', borderColor: 'rgba(139,69,19,0.15)' }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Library size={14} style={{ color: 'var(--ochre)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--ink-main)' }}>山医命相卜养 · {totalBooks}部典籍</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-light)' }}>
            中式美学阅读器 · 附带释义笔记 · 五音疗愈伴读 · AI智能助读 · 支持竖排横排
          </p>
        </div>
      </div>

      {/* AI 智能助读弹窗 */}
      {aiOpen && <ClassicsAIAssistant onClose={() => setAiOpen(false)} />}

      <BottomNav />
    </PageContainer>
  );
}
