'use client';

/**
 * 中式美学疗愈阅读器
 * 基于 cn-healing-reader 技能模板，转换为 Next.js React 组件
 * 风格：水墨宣纸 × 朱砂印章 × 五音疗愈
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import { type ClassicTextData, type ReaderChapter } from '@/lib/classics-loader';
import { FIVE_TONES } from '@/lib/five-tone-data';
import {
  ArrowLeft, Search, ChevronLeft, ChevronRight,
  Type, Music, X, PenLine, Share2, BookOpen,
  Sun, Moon, AlignVerticalSpaceAround, Highlighter,
} from 'lucide-react';

/* ========== Props ========== */
interface HealingReaderProps {
  book: ClassicTextData;
}

/* ========== Note 类型 ========== */
interface Note {
  text: string;
  time: string;
  chapterIndex: number;
}

/* ========== 五音音轨 ========== */
const FIVE_TONE_TRACKS = FIVE_TONES.map(t => ({
  id: t.key,
  name: `${t.char} · ${t.element}`,
  element: t.element,
  url: t.mp3Path || '',
}));

/* ========== 主组件 ========== */
export default memo(function HealingReader({ book }: HealingReaderProps) {
  /* ----- 状态 ----- */
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [isVertical, setIsVertical] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'interpret' | 'notes' | 'share'>('interpret');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [matchedInterp, setMatchedInterp] = useState<{ key: string; meaning: string } | null>(null);
  const [musicOpen, setMusicOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentTone, setCurrentTone] = useState(book.musicTone || 'gong');
  const [volume, setVolume] = useState(25);
  const [nowPlaying, setNowPlaying] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [shareQuote, setShareQuote] = useState('');
  const [highlightMode, setHighlightMode] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(300);
  const dragRef = useRef<{ type: 'left' | 'right'; startX: number; startWidth: number } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textBodyRef = useRef<HTMLDivElement>(null);

  const chapter: ReaderChapter = book.chapters[currentChapter];

  /* ----- 加载笔记 ----- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`reader_notes_${book.id}`);
      if (stored) setNotes(JSON.parse(stored));
    } catch {}
  }, [book.id]);

  /* ----- 保存笔记 ----- */
  useEffect(() => {
    try {
      localStorage.setItem(`reader_notes_${book.id}`, JSON.stringify(notes));
    } catch {}
  }, [notes, book.id]);

  /* ----- 章节切换 ----- */
  const goToChapter = useCallback((idx: number) => {
    if (idx < 0 || idx >= book.chapters.length) return;
    setCurrentChapter(idx);
    setSelectedText('');
    setMatchedInterp(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [book.chapters.length]);

  /* ----- 文本选择 → 释义 ----- */
  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() || '';
      if (text.length < 2 || text.length > 200) return;
      setSelectedText(text);
      // 匹配内置释义
      if (chapter.interpretations) {
        const interp = chapter.interpretations.find(i => text.includes(i.key) || i.key.includes(text));
        setMatchedInterp(interp || null);
      } else {
        setMatchedInterp(null);
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [chapter]);

  /* ----- 键盘快捷键 ----- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToChapter(currentChapter - 1);
      if (e.key === 'ArrowRight') goToChapter(currentChapter + 1);
      if (e.key === 'Escape') { setSearchOpen(false); setShareOpen(false); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [currentChapter, goToChapter]);

  /* ----- 音乐 ----- */
  const toggleMusic = () => {
    if (!musicOpen) { setMusicOpen(true); return; }
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      const track = FIVE_TONE_TRACKS.find(t => t.id === currentTone);
      if (track?.url) {
        audio.src = track.url;
        audio.volume = volume / 100;
        audio.play().then(() => {
          setMusicPlaying(true);
          setNowPlaying(track.name);
        }).catch(() => {});
      }
    }
  };

  const selectTone = (tone: string) => {
    setCurrentTone(tone);
    const track = FIVE_TONE_TRACKS.find(t => t.id === tone);
    if (!track?.url) return;
    const audio = audioRef.current;
    if (audio) {
      audio.src = track.url;
      audio.volume = volume / 100;
      audio.load();
      audio.play().then(() => {
        setMusicPlaying(true);
        setNowPlaying(track.name);
      }).catch(() => {
        setNowPlaying(`点击播放：${track.name}`);
      });
    }
  };

  /* ----- 划线标注 ----- */
  const highlightSelection = (color: string) => {
    const sel = window.getSelection();
    if (!sel?.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.className = `hl-${color}`;
    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    sel.removeAllRanges();
  };

  /* ----- 分栏拖拽 ----- */
  const handleDividerMouseDown = (type: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { type, startX: e.clientX, startWidth: type === 'left' ? leftWidth : rightWidth };
    document.addEventListener('mousemove', handleDividerMouseMove);
    document.addEventListener('mouseup', handleDividerMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleDividerMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return;
    const { type, startX, startWidth } = dragRef.current;
    const delta = e.clientX - startX;
    if (type === 'left') {
      setLeftWidth(Math.min(350, Math.max(150, startWidth + delta)));
    } else {
      setRightWidth(Math.min(450, Math.max(200, startWidth - delta)));
    }
  }, []);

  const handleDividerMouseUp = useCallback(() => {
    dragRef.current = null;
    document.removeEventListener('mousemove', handleDividerMouseMove);
    document.removeEventListener('mouseup', handleDividerMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleDividerMouseMove]);

  /* ----- 笔记 ----- */
  const addNote = () => {
    const text = noteInput.trim();
    if (!text) return;
    setNotes(prev => [{ text, time: new Date().toLocaleString('zh-CN'), chapterIndex: currentChapter }, ...prev]);
    setNoteInput('');
  };

  /* ----- 搜索 ----- */
  const searchResults = searchQuery.length >= 1
    ? book.chapters
        .map((ch, i) => {
          const idx = ch.content.indexOf(searchQuery);
          if (ch.title.includes(searchQuery) || idx >= 0) {
            const excerpt = idx >= 0 ? ch.content.substring(Math.max(0, idx - 20), idx + searchQuery.length + 20) : '';
            return { title: ch.title, excerpt, index: i };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  /* ----- 分享 ----- */
  const openShareCard = () => {
    const sel = window.getSelection()?.toString().trim() || selectedText;
    if (sel) setShareQuote(sel);
    setShareOpen(true);
  };

  const copyShareText = () => {
    const text = `${shareQuote}\n——《${book.title}·${chapter.title}》`;
    navigator.clipboard.writeText(text).then(() => {
      setShareOpen(false);
    }).catch(() => {});
  };

  /* ========== 渲染 ========== */
  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        background: isDark ? '#1a1814' : '#f5f0e8',
        color: isDark ? '#d4c9b8' : '#2c2416',
        fontFamily: "'Noto Serif SC', 'Source Han Serif SC', 'SimSun', serif",
      }}
    >
      {/* 宣纸纹理 */}
      {!isDark && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* ===== 顶部标题栏 ===== */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:px-6"
        style={{
          background: isDark ? 'rgba(26,24,20,0.96)' : 'rgba(245,240,232,0.96)',
borderBottom: '1px solid rgba(139,69,19,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/classics"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
          >
            <ArrowLeft size={16} style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#6b5d4d' }} />
          </Link>
          {/* 朱砂印章 */}
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
            style={{
              background: '#c23a2b',
              color: '#f5f0e8',
              fontFamily: "'ZCOOL KuaiLe', 'KaiTi', 'STKaiti', serif",
              transform: 'rotate(-3deg)',
              boxShadow: '1px 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {book.title.charAt(0)}
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-wider">{book.title}</h1>
            <p className="text-[11px] opacity-50">{book.dynasty} · {book.author}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(true)} className="icon-btn-healing" title="搜索">
            <Search size={16} />
          </button>
          <button onClick={() => setIsDark(!isDark)} className="icon-btn-healing" title="日夜模式">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="icon-btn-healing hidden md:flex" title="目录">
            <BookOpen size={16} />
          </button>
        </div>
      </header>

      {/* ===== 三栏布局（左目录 | 中正文 | 右释义） ===== */}
      <div className="max-w-[1400px] mx-auto relative z-1 flex" style={{ minHeight: 'calc(100vh - 61px)' }}>

        {/* 左侧目录 + 拖拽条 */}
        {sidebarOpen && (
          <>
            <aside
              className="hidden md:block shrink-0 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto py-5"
              style={{
                width: leftWidth,
                minWidth: 150,
                maxWidth: 350,
                borderRight: '1px solid rgba(139,69,19,0.08)',
                background: isDark ? 'rgba(26,24,20,0.96)' : 'rgba(245,240,232,0.96)',
                transition: 'width 0.05s ease',
              }}
            >
              <div className="px-5 pb-3 text-xs tracking-widest opacity-40 border-b" style={{ borderColor: 'rgba(139,69,19,0.08)' }}>
                目 录 · {book.chapterCount}章
              </div>
              <ul className="py-2">
                {book.chapters.map((ch, i) => (
                  <li key={i}>
                    <button
                      onClick={() => goToChapter(i)}
                      className="w-full text-left px-5 py-2.5 text-sm transition-all border-l-[3px]"
                      style={{
                        borderLeftColor: i === currentChapter ? '#8b4513' : 'transparent',
                        color: i === currentChapter ? (isDark ? '#c5a55a' : '#8b4513') : (isDark ? '#9a8b78' : '#6b5d4d'),
                        fontWeight: i === currentChapter ? 600 : 400,
                        background: i === currentChapter ? (isDark ? 'rgba(197,165,90,0.1)' : 'rgba(139,69,19,0.06)') : 'transparent',
                      }}
                    >
                      {ch.title}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
            {/* 左侧拖拽把手 */}
            <div
              className="hidden md:flex w-1.5 cursor-col-resize items-center justify-center shrink-0 group"
              onMouseDown={(e) => handleDividerMouseDown('left', e)}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(197,165,90,0.08)' : 'rgba(139,69,19,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="w-0.5 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: isDark ? '#c5a55a' : '#8b4513' }} />
            </div>
          </>
        )}

        {/* 中间阅读区 */}
        <main className={`px-5 md:px-12 py-8 md:py-10 flex-1 min-w-0 ${isVertical ? '' : 'max-w-[800px] mx-auto'}`}>
          {/* 章节标题 */}
          <div className="text-center mb-8 pb-6" style={{ borderBottom: '1px solid rgba(139,69,19,0.12)' }}>
            <h2 className="text-xl md:text-2xl font-bold tracking-[4px] mb-2">{chapter.title}</h2>
            {chapter.sub && <p className="text-sm opacity-40 tracking-wider">{chapter.sub}</p>}
          </div>

          {/* 正文 */}
          <div
            ref={textBodyRef}
            className={`leading-[2.2] tracking-wider ${isVertical ? 'vertical-mode' : 'text-justify'}`}
            style={{
              fontSize: `${fontSize}px`,
              writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb',
              ...(isVertical ? {
                height: 'calc(100vh - 180px)',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                lineHeight: '2.2',
                letterSpacing: '2px',
              } : {}),
            }}
          >
            {chapter.content.split('\n').map((p, i) => (
              <p key={i} className="text-indent">{p}</p>
            ))}
          </div>

          {/* 底部导航 */}
          <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: '1px solid rgba(139,69,19,0.1)' }}>
            <button
              onClick={() => goToChapter(currentChapter - 1)}
              disabled={currentChapter === 0}
              className="flex items-center gap-1 text-sm transition-opacity disabled:opacity-20"
              style={{ color: isDark ? '#9a8b78' : '#6b5d4d' }}
            >
              <ChevronLeft size={16} /> 上一章
            </button>
            <span className="text-xs opacity-30">
              {currentChapter + 1} / {book.chapterCount}
            </span>
            <button
              onClick={() => goToChapter(currentChapter + 1)}
              disabled={currentChapter === book.chapters.length - 1}
              className="flex items-center gap-1 text-sm transition-opacity disabled:opacity-20"
              style={{ color: isDark ? '#9a8b78' : '#6b5d4d' }}
            >
              下一章 <ChevronRight size={16} />
            </button>
          </div>
        </main>

        {/* 右侧释义面板 + 拖拽条（竖排模式下隐藏） */}
        {!isVertical && (
          <>
            {/* 右侧拖拽把手 */}
            <div
              className="hidden md:flex w-1.5 cursor-col-resize items-center justify-center shrink-0 group"
              onMouseDown={(e) => handleDividerMouseDown('right', e)}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(197,165,90,0.08)' : 'rgba(139,69,19,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="w-0.5 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: isDark ? '#c5a55a' : '#8b4513' }} />
            </div>
            <aside
              className="hidden md:block shrink-0 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto p-5 z-20"
              style={{
                width: rightWidth,
                minWidth: 200,
                maxWidth: 450,
                background: isDark ? 'rgba(26,24,20,0.96)' : 'rgba(245,240,232,0.96)',
                borderLeft: '1px solid rgba(139,69,19,0.08)',
                transition: 'width 0.05s ease',
              }}
            >
              {/* 面板Tab */}
              <div className="flex gap-1 mb-4 pb-2" style={{ borderBottom: '1px solid rgba(139,69,19,0.1)' }}>
                {(['interpret', 'notes', 'share'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setRightPanelTab(tab)}
                    className="px-3 py-1.5 rounded-full text-xs transition-all"
                    style={{
                      background: rightPanelTab === tab ? (isDark ? '#c5a55a' : '#8b4513') : 'transparent',
                      color: rightPanelTab === tab ? '#f5f0e8' : (isDark ? '#9a8b78' : '#6b5d4d'),
                    }}
                  >
                    {tab === 'interpret' ? '释义' : tab === 'notes' ? '笔记' : '分享'}
                  </button>
                ))}
              </div>

              {/* 释义面板 */}
              {rightPanelTab === 'interpret' && (
                <div className="space-y-3">
                  <div className="rounded-lg p-3" style={{ background: isDark ? 'rgba(197,165,90,0.08)' : 'rgba(139,69,19,0.05)', borderLeft: '3px solid ' + (isDark ? '#c5a55a' : '#8b4513') }}>
                    <div className="text-[11px] opacity-40 tracking-wider mb-1">选中文本</div>
                    <div className="text-sm leading-relaxed italic">{selectedText || '选中文字即可查看释义'}</div>
                  </div>
                  {matchedInterp && (
                    <div className="rounded-lg p-3" style={{ background: isDark ? 'rgba(197,165,90,0.08)' : 'rgba(139,69,19,0.05)', borderLeft: '3px solid ' + (isDark ? '#c5a55a' : '#8b4513') }}>
                      <div className="text-[11px] opacity-40 tracking-wider mb-1">关键词释义</div>
                      <div className="text-sm leading-relaxed">{matchedInterp.meaning}</div>
                    </div>
                  )}
                  {chapter.interpretations && chapter.interpretations.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[11px] opacity-40 tracking-wider mb-2">本章释义索引</div>
                      {chapter.interpretations.map((interp, i) => (
                        <div key={i} className="rounded-lg p-2.5 mb-2" style={{ background: isDark ? 'rgba(197,165,90,0.05)' : 'rgba(139,69,19,0.03)' }}>
                          <span className="text-xs font-bold" style={{ color: isDark ? '#c5a55a' : '#8b4513' }}>{interp.key}</span>
                          <p className="text-xs leading-relaxed mt-1 opacity-70">{interp.meaning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 笔记面板 */}
              {rightPanelTab === 'notes' && (
                <div>
                  <textarea
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="记下你的思考..."
                    className="w-full min-h-[80px] rounded-lg p-3 text-sm resize-y outline-none transition-colors"
                    style={{
                      background: isDark ? 'rgba(197,165,90,0.04)' : 'rgba(139,69,19,0.04)',
                      border: `1px solid ${isDark ? 'rgba(197,165,90,0.12)' : 'rgba(139,69,19,0.12)'}`,
                      color: isDark ? '#d4c9b8' : '#2c2416',
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                  />
                  <button
                    onClick={addNote}
                    className="mt-2 px-4 py-1.5 rounded-full text-xs transition-opacity hover:opacity-85"
                    style={{ background: isDark ? '#c5a55a' : '#8b4513', color: '#f5f0e8' }}
                  >
                    保存笔记
                  </button>
                  <div className="mt-4 space-y-2">
                    {notes.map((n, i) => (
                      <div key={i} className="rounded-lg p-2.5 text-xs leading-relaxed relative" style={{ background: isDark ? 'rgba(197,165,90,0.04)' : 'rgba(139,69,19,0.04)' }}>
                        <button
                          onClick={() => setNotes(notes.filter((_, j) => j !== i))}
                          className="absolute top-2 right-2 opacity-30 hover:opacity-100"
                        >
                          <X size={10} />
                        </button>
                        {n.text}
                        <div className="text-[10px] opacity-30 mt-1">{n.time} · {book.chapters[n.chapterIndex]?.title}</div>
                      </div>
                    ))}
                    {notes.length === 0 && <p className="text-xs opacity-30 text-center py-4">暂无笔记</p>}
                  </div>
                </div>
              )}

              {/* 分享面板 */}
              {rightPanelTab === 'share' && (
                <div>
                  <div className="rounded-lg p-3" style={{ background: isDark ? 'rgba(197,165,90,0.08)' : 'rgba(139,69,19,0.05)', borderLeft: '3px solid ' + (isDark ? '#c5a55a' : '#8b4513') }}>
                    <div className="text-[11px] opacity-40 tracking-wider mb-1">生成分享卡片</div>
                    <div className="text-sm">选中精彩段落，生成中式美学分享卡片</div>
                  </div>
                  <button
                    onClick={openShareCard}
                    className="mt-3 w-full px-4 py-2 rounded-full text-xs transition-opacity hover:opacity-85"
                    style={{ background: isDark ? '#c5a55a' : '#8b4513', color: '#f5f0e8' }}
                  >
                    生成分享卡片
                  </button>
                </div>
              )}
            </aside>
          </>
        )}
      </div>

      {/* ===== 底部工具栏 ===== */}
      <div
        className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-full z-40 md:z-30"
        style={{
          background: isDark ? 'rgba(26,24,20,0.96)' : 'rgba(245,240,232,0.96)',
boxShadow: '0 4px 24px rgba(44,36,22,0.1)',
        }}
      >
        <button onClick={() => setIsVertical(!isVertical)} className="toolbar-healing-btn" title="竖排/横排">
          <AlignVerticalSpaceAround size={14} />
        </button>
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(139,69,19,0.12)' }} />
        <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="toolbar-healing-btn" title="缩小">
          <span className="text-xs font-bold">A-</span>
        </button>
        <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="toolbar-healing-btn" title="放大">
          <span className="text-xs font-bold">A+</span>
        </button>
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(139,69,19,0.12)' }} />
        <button onClick={() => highlightSelection('yellow')} className="toolbar-healing-btn" title="黄色标注">
          <span className="text-xs" style={{ color: '#c5a55a' }}>●</span>
        </button>
        <button onClick={() => highlightSelection('green')} className="toolbar-healing-btn" title="绿色标注">
          <span className="text-xs" style={{ color: '#5a8f7b' }}>●</span>
        </button>
        <button onClick={() => highlightSelection('red')} className="toolbar-healing-btn" title="红色标注">
          <span className="text-xs" style={{ color: '#c23a2b' }}>●</span>
        </button>
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(139,69,19,0.12)' }} />
        <button onClick={() => goToChapter(currentChapter - 1)} disabled={currentChapter === 0} className="toolbar-healing-btn disabled:opacity-20" title="上一章">
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => goToChapter(currentChapter + 1)} disabled={currentChapter === book.chapters.length - 1} className="toolbar-healing-btn disabled:opacity-20" title="下一章">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ===== 移动端底部面板（释义/笔记/分享） ===== */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30">
        {/* 释义浮窗 */}
        {selectedText && !shareOpen && !searchOpen && (
          <div className="mx-3 mb-2 rounded-xl p-3" style={{ background: isDark ? 'rgba(26,24,20,0.96)' : 'rgba(245,240,232,0.96)',
boxShadow: '0 4px 24px rgba(44,36,22,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-0.5 h-4 rounded-full" style={{ background: isDark ? '#c5a55a' : '#8b4513' }} />
              <span className="text-xs font-bold tracking-wider" style={{ color: isDark ? '#c5a55a' : '#8b4513' }}>释义</span>
            </div>
            <p className="text-sm leading-relaxed opacity-70 italic mb-2">"{selectedText}"</p>
            {matchedInterp ? (
              <p className="text-sm leading-relaxed">{matchedInterp.meaning}</p>
            ) : (
              <p className="text-sm opacity-40">该词暂未收录</p>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={openShareCard} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(139,69,19,0.08)', color: isDark ? '#c5a55a' : '#8b4513' }}>
                <Share2 size={12} /> 分享
              </button>
              <button onClick={() => { setRightPanelTab('notes'); setNoteInput(selectedText) }} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(139,69,19,0.08)', color: isDark ? '#c5a55a' : '#8b4513' }}>
                <PenLine size={12} /> 笔记
              </button>
            </div>
          </div>
        )}
      </div>


      <div className="fixed bottom-20 md:bottom-5 right-4 md:right-5 z-40">
        <button
          onClick={toggleMusic}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{
            background: isDark ? '#c5a55a' : '#8b4513',
            color: '#f5f0e8',
            boxShadow: '0 4px 16px rgba(139,69,19,0.3)',
            animation: musicPlaying ? 'pulse 2s infinite' : 'none',
          }}
        >
          <Music size={18} />
        </button>

        {musicOpen && (
          <div
            className="absolute bottom-14 right-0 w-56 rounded-xl p-4"
            style={{
              background: isDark ? 'rgba(26,24,20,0.96)' : 'rgba(245,240,232,0.96)',
boxShadow: '0 4px 24px rgba(44,36,22,0.1)',
            }}
          >
            <div className="text-xs opacity-40 tracking-widest mb-3">五音疗愈</div>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {FIVE_TONE_TRACKS.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTone(t.id)}
                  className="px-2 py-1.5 rounded-full text-[11px] transition-all"
                  style={{
                    border: `1px solid ${currentTone === t.id ? (isDark ? '#c5a55a' : '#8b4513') : 'rgba(139,69,19,0.15)'}`,
                    background: currentTone === t.id ? (isDark ? '#c5a55a' : '#8b4513') : 'transparent',
                    color: currentTone === t.id ? '#f5f0e8' : (isDark ? '#9a8b78' : '#6b5d4d'),
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
            {nowPlaying && <div className="text-[11px] opacity-40 mb-2">{nowPlaying}</div>}
            <div className="flex items-center gap-2 text-[11px] opacity-40">
              <span>🔉</span>
              <input
                type="range" min={0} max={100} value={volume}
                onChange={e => { const v = +e.target.value; setVolume(v); if (audioRef.current) audioRef.current.volume = v / 100; }}
                className="flex-1 h-1 accent-amber-700"
              />
              <span>{volume}%</span>
            </div>
            <button onClick={() => setMusicOpen(false)} className="absolute top-2 right-2 opacity-30 hover:opacity-100">
              <X size={12} />
            </button>
          </div>
        )}
        <audio ref={audioRef} loop preload="auto" />
      </div>

      {/* ===== 搜索弹窗 ===== */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-md mx-4 rounded-2xl overflow-hidden" style={{ background: isDark ? '#1a1814' : '#f5f0e8', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center px-5 py-4 gap-3 border-b" style={{ borderColor: 'rgba(139,69,19,0.08)' }}>
              <Search size={16} className="opacity-40" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索典籍内容..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: isDark ? '#d4c9b8' : '#2c2416', fontFamily: "'Noto Serif SC', serif" }}
                autoFocus
              />
              <button onClick={() => setSearchOpen(false)} className="opacity-40 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {searchResults.map((r: any, i: number) => (
                <button
                  key={r.index}
                  onClick={() => { goToChapter(r.index); setSearchOpen(false); setSearchQuery(''); }}
                  className="w-full text-left p-3 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: isDark ? 'rgba(197,165,90,0.05)' : 'rgba(139,69,19,0.03)' }}
                >
                  <div className="text-sm font-bold">{r.title}</div>
                  <div className="text-xs opacity-40 truncate mt-0.5">...{r.excerpt}...</div>
                </button>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <div className="py-8 text-center text-sm opacity-30">未找到相关内容</div>
      )}

      {/* ===== 音乐播放器 ===== */}
            </div>
          </div>
        </div>
      )}

      {/* ===== 分享卡片弹窗 ===== */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShareOpen(false)}>
          <div className="w-80 mx-4 rounded-xl p-8 text-center" style={{ background: isDark ? '#1a1814' : '#f5f0e8', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div className="text-lg leading-[2] mb-5 italic">{shareQuote || selectedText}</div>
            <div className="text-sm opacity-40 mb-5">——《{book.title}·{chapter.title}》</div>
            <div className="inline-block px-3 py-1 text-xs tracking-widest border-2 rounded" style={{ borderColor: '#c23a2b', color: '#c23a2b', transform: 'rotate(-2deg)' }}>
              浮世书阁
            </div>
            <div className="flex gap-2 justify-center mt-5">
              <button
                onClick={copyShareText}
                className="px-5 py-2 rounded-full text-sm hover:opacity-85 transition-opacity"
                style={{ background: isDark ? '#c5a55a' : '#8b4513', color: '#f5f0e8' }}
              >
                复制文字
              </button>
              <button
                onClick={() => setShareOpen(false)}
                className="px-5 py-2 rounded-full text-sm border hover:opacity-85 transition-opacity"
                style={{ borderColor: isDark ? 'rgba(197,165,90,0.2)' : 'rgba(139,69,19,0.2)', color: isDark ? '#d4c9b8' : '#2c2416' }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 内联样式（划线+动画） ===== */}
      <style jsx>{`
        .icon-btn-healing {
          width: 32px; height: 32px; border: none; background: transparent;
          cursor: pointer; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; transition: all 0.3s ease;
          color: ${isDark ? '#9a8b78' : '#6b5d4d'};
        }
        .icon-btn-healing:hover {
          background: ${isDark ? 'rgba(197,165,90,0.15)' : 'rgba(139,69,19,0.1)'};
          color: ${isDark ? '#c5a55a' : '#8b4513'};
        }
        .toolbar-healing-btn {
          width: 36px; height: 36px; border: none; background: transparent;
          cursor: pointer; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; transition: all 0.3s ease;
          color: ${isDark ? '#9a8b78' : '#6b5d4d'}; font-size: 14px;
        }
        .toolbar-healing-btn:hover:not(:disabled) {
          background: ${isDark ? 'rgba(197,165,90,0.15)' : 'rgba(139,69,19,0.1)'};
          color: ${isDark ? '#c5a55a' : '#8b4513'};
        }
        p.text-indent { text-indent: 2em; margin-bottom: 16px; }
        .vertical-mode p.text-indent { text-indent: 0; margin-bottom: 0; padding-block-end: 1em; }
        .hl-yellow { background: rgba(197,165,90,0.25); border-radius: 2px; padding: 0 2px; }
        .hl-green { background: rgba(90,143,123,0.25); border-radius: 2px; padding: 0 2px; }
        .hl-red { background: rgba(194,58,43,0.15); border-radius: 2px; padding: 0 2px; }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(139,69,19,0.3); }
          50% { box-shadow: 0 4px 28px rgba(139,69,19,0.5); }
        }
      `}</style>
    </div>
  );
});
