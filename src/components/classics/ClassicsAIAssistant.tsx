'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  X, Search, Sparkles, Send, BookOpen, Loader2, ChevronRight,
} from 'lucide-react';

interface SearchResult {
  type: 'book' | 'content';
  bookId: string;
  bookName: string;
  author: string;
  category: string;
  chapterTitle?: string;
  excerpt: string;
  score: number;
}

interface AISource {
  type: string;
  bookId: string;
  bookName: string;
  chapterTitle?: string;
}

interface Props {
  onClose: () => void;
}

export default function ClassicsAIAssistant({ onClose }: Props) {
  const [tab, setTab] = useState<'ask' | 'search'>('ask');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<AISource[]>([]);
  const [askLoading, setAskLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAsk = useCallback(async () => {
    const q = question.trim();
    if (!q || askLoading) return;
    setAskLoading(true);
    setAnswer('');
    setSources([]);
    try {
      const res = await fetch('/api/classics/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (data.error) {
        setAnswer(`❌ ${data.error}`);
      } else {
        setAnswer(data.answer || '未能生成回答');
        setSources(data.sources || []);
      }
    } catch {
      setAnswer('❌ 网络错误，请重试');
    } finally {
      setAskLoading(false);
    }
  }, [question, askLoading]);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setSearchError('');
    try {
      const res = await fetch('/api/classics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
      setSearchError('检索失败，请检查网络后重试');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const onSearchInput = (val: string) => {
    setSearchQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => handleSearch(val), 350);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)',
}}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-[85vh] md:h-[80vh] md:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden"
        style={{
          background: 'rgba(245,240,232,0.98)',
boxShadow: '0 -4px 40px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(139,69,19,0.1)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a94f, #8a6d3b)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="text-base font-bold" style={{ color: '#2c2416' }}>AI 智能助读</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70" style={{ background: 'rgba(139,69,19,0.06)' }}>
            <X size={16} style={{ color: '#6b5d4d' }} />
          </button>
        </div>

        {/* Tab */}
        <div className="flex gap-1 px-5 py-3" style={{ borderBottom: '1px solid rgba(139,69,19,0.08)' }}>
          <button
            onClick={() => setTab('ask')}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: tab === 'ask' ? '#8a6d3b' : 'transparent',
              color: tab === 'ask' ? '#f5f0e8' : '#6b5d4d',
              fontWeight: tab === 'ask' ? 600 : 400,
            }}
          >
            <span className="flex items-center gap-1.5"><Sparkles size={13} /> 智能问答</span>
          </button>
          <button
            onClick={() => setTab('search')}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: tab === 'search' ? '#8a6d3b' : 'transparent',
              color: tab === 'search' ? '#f5f0e8' : '#6b5d4d',
              fontWeight: tab === 'search' ? 600 : 400,
            }}
          >
            <span className="flex items-center gap-1.5"><Search size={13} /> 全文检索</span>
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          {tab === 'ask' ? (
            <div className="space-y-4">
              {/* 历史回答 */}
              {answer && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(139,69,19,0.04)', border: '1px solid rgba(139,69,19,0.08)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} style={{ color: '#8a6d3b' }} />
                    <span className="text-xs font-bold" style={{ color: '#8a6d3b' }}>知音助读</span>
                  </div>
                  <div className="text-sm leading-[1.8]" style={{ color: '#2c2416', whiteSpace: 'pre-wrap' }}>
                    {answer}
                  </div>
                  {sources.length > 0 && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(139,69,19,0.08)' }}>
                      <div className="text-[11px] opacity-50 mb-2">参考来源</div>
                      <div className="space-y-1">
                        {sources.map((s, i) => (
                          <Link
                            key={i}
                            href={`/classics/${s.bookId}`}
                            onClick={onClose}
                            className="flex items-center gap-1 text-xs hover:opacity-70"
                            style={{ color: '#8a6d3b' }}
                          >
                            <BookOpen size={11} />
                            《{s.bookName}》{s.chapterTitle ? ` · ${s.chapterTitle}` : ''}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 快捷问题 */}
              {!answer && !askLoading && (
                <div className="space-y-2">
                  <div className="text-xs opacity-40">试试这些问题：</div>
                  {[
                    '轻断食有哪些科学依据？',
                    '中医艾灸适合哪些常见病症？',
                    '如何科学地管理体重？',
                    '《黄帝内经》中有哪些四季养生智慧？',
                    '食品安全有哪些常见误区？',
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => { setQuestion(q); }}
                      className="w-full text-left rounded-lg p-3 text-sm transition-all hover:opacity-80"
                      style={{ background: 'rgba(139,69,19,0.03)', color: '#6b5d4d', border: '1px solid rgba(139,69,19,0.06)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* 加载 */}
              {askLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin" style={{ color: '#8a6d3b' }} />
                  <span className="ml-2 text-sm" style={{ color: '#6b5d4d' }}>正在遍阅典籍...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {searchLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin" style={{ color: '#8a6d3b' }} />
                  <span className="ml-2 text-sm" style={{ color: '#6b5d4d' }}>检索中...</span>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <>
                  <div className="text-xs opacity-40">找到 {searchResults.length} 条结果</div>
                  {searchResults.map((r, i) => (
                    <Link
                      key={i}
                      href={`/classics/${r.bookId}`}
                      onClick={onClose}
                      className="block rounded-xl p-3 transition-all hover:opacity-80"
                      style={{ background: 'rgba(139,69,19,0.03)', border: '1px solid rgba(139,69,19,0.06)' }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: r.type === 'content' ? 'rgba(90,143,123,0.12)' : 'rgba(201,169,79,0.12)', color: r.type === 'content' ? '#5a8f7b' : '#8a6d3b' }}>
                          {r.type === 'content' ? '正文' : '书目'}
                        </span>
                        <span className="text-sm font-bold" style={{ color: '#2c2416' }}>《{r.bookName}》</span>
                        <span className="text-[10px]" style={{ color: '#6b5d4d' }}>{r.author}</span>
                      </div>
                      {r.chapterTitle && (
                        <div className="text-xs mb-0.5" style={{ color: '#8a6d3b' }}>{r.chapterTitle}</div>
                      )}
                      <p className="text-xs leading-relaxed" style={{ color: '#6b5d4d', opacity: 0.8 }}>
                        ...{r.excerpt}...
                      </p>
                    </Link>
                  ))}
                </>
              )}

              {!searchLoading && !searchQuery && (
                <div className="text-center py-12">
                  <Search size={32} style={{ color: '#8a6d3b', opacity: 0.2 }} className="mx-auto mb-3" />
                  <p className="text-sm opacity-40">输入关键词，跨52部典籍全文检索</p>
                </div>
              )}

              {!searchLoading && searchQuery && searchResults.length === 0 && !searchError && (
                <div className="text-center py-12">
                  <p className="text-sm opacity-40">未找到相关内容</p>
                </div>
              )}

              {!searchLoading && searchError && (
                <div className="text-center py-12">
                  <p className="text-sm text-red-500">{searchError}</p>
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="mt-2 text-xs underline"
                    style={{ color: '#8a6d3b' }}
                  >重试</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部输入区 */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(139,69,19,0.08)', background: 'rgba(245,240,232,0.96)' }}>
          {tab === 'ask' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAsk(); }}
                placeholder="向知音提问..."
                disabled={askLoading}
                className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none transition"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(139,69,19,0.12)',
                  color: '#2c2416',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              />
              <button
                onClick={handleAsk}
                disabled={askLoading || !question.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #c9a94f, #8a6d3b)' }}
              >
                {askLoading ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={16} className="text-white" />}
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b5d4d', opacity: 0.4 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchInput(e.target.value)}
                placeholder="搜索典籍全文..."
                className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm outline-none transition"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(139,69,19,0.12)',
                  color: '#2c2416',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
