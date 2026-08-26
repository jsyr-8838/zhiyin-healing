'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/lib/store';
import { consolidateDiagnosis } from '@/lib/unified-diagnosis';
import { Send, Stethoscope, X, Heart, Sparkles } from 'lucide-react';
import EvoFeedback from '@/components/common/EvoFeedback';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function renderMarkdown(text: string, withAcupointLinks: boolean = false): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$2</li>');
  html = html.replace(/^[-•]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

  // 穴位标记：【穴位:太冲:LR3】→ 可点击标签
  if (withAcupointLinks) {
    html = html.replace(/【穴位:(.+?):(.+?)】/g, (_, name, id) => {
      return `<a href="/jiuliao?highlight=${id}" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold no-underline" style="background:#e8f5e9;color:#456b4e;border:1px solid #c8e6c9">📍${name}</a>`;
    });
  } else {
    // 非情绪模式也清除标记但保留文字
    html = html.replace(/【穴位:(.+?):(.+?)】/g, '$1');
  }

  html = html.replace(/\n{2,}/g, '</p><p class="mt-2">');
  html = html.replace(/\n/g, '<br/>');

  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(145deg, #C4A35A, #B8860B)' }}
      >
        <Stethoscope size={16} className="text-white" />
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]"
        style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full" style={{ background: '#C4A35A', animationDelay: '0ms' }} />
          <span className="typing-dot w-2 h-2 rounded-full" style={{ background: '#C4A35A', animationDelay: '150ms' }} />
          <span className="typing-dot w-2 h-2 rounded-full" style={{ background: '#C4A35A', animationDelay: '300ms' }} />
        </div>
      </div>
      <style>{`
        .typing-dot {
          animation: typingBounce 1.2s ease-in-out infinite;
        }
        @keyframes typingBounce {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

export default function AIDiagnosisPage() {
  const { unifiedDiagnosis } = useAppStore();
  const consolidated = useMemo(() => consolidateDiagnosis(unifiedDiagnosis), [unifiedDiagnosis]);
  const hasDiagnosis = consolidated.completedModules.length > 0;

  const [mode, setMode] = useState<'diagnosis' | 'emotional'>('diagnosis');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickQs, setShowQuickQs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (mode === 'emotional') {
      const emotionalWelcome = hasDiagnosis
        ? `你好，我是知音，你的温暖伙伴 🌿\n\n我看了你的体质档案，${consolidated.primaryConstitution}的朋友，身体和情绪是一体的。不管今天遇到了什么，我都会陪着你。\n\n想聊什么都可以，我在这里。`
        : '你好，我是知音，你的温暖伙伴 🌿\n\n有什么想聊的吗？无论是倾诉、烦闷还是只是想找个人说话，我都在这里。';
      setMessages([{ role: 'assistant', content: emotionalWelcome }]);
    } else {
      const welcome = hasDiagnosis
        ? `你好，我是AI中医导诊助手。根据你已完成的${consolidated.completedModules.length}项辨识（${consolidated.completedModules.join('、')}），你的综合体质为**${consolidated.primaryConstitution}**，五行偏**${consolidated.primaryElement}行**，对应**${consolidated.primaryOrgan}**。\n\n你可以向我咨询体质调理、穴位按摩、五音疗愈、饮食建议等方面的问题，我会基于你的辨识数据给出个性化建议。`
        : '你好，我是AI中医导诊助手。你目前尚未完成任何体质辨识，建议先前往明辨模块完成九种体质问卷或舌诊面诊，这样我可以为你提供更精准的个性化建议。\n\n当然，你也可以直接向我咨询中医养生方面的一般问题。';
      setMessages([{ role: 'assistant', content: welcome }]);
    }
  }, [mode, hasDiagnosis, consolidated.completedModules, consolidated.primaryConstitution, consolidated.primaryElement, consolidated.primaryOrgan]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const quickQuestions = useMemo(() => {
    if (mode === 'emotional') {
      return [
        '今天好烦啊，什么都不想做',
        '工作压力太大了，喘不过气',
        '总是忍不住发脾气，怎么办',
        '最近失眠焦虑，心静不下来',
        '感觉自己什么都做不好',
      ];
    }
    const qs = hasDiagnosis
      ? [
          `我是${consolidated.primaryConstitution}，适合什么疗愈方案？`,
          '推荐一些日常穴位按摩方法',
          `五音疗愈应该听什么？我适合${consolidated.primaryWuYin}音吗？`,
          '饮食上有什么建议？',
          '六字诀呼吸法怎么做？',
        ]
      : [
          '中医九种体质分别是哪些？',
          '如何判断自己的体质类型？',
          '推荐一些日常养生方法',
          '什么是五音疗愈？',
          '穴位按摩有什么好处？',
        ];
    return qs;
  }, [mode, hasDiagnosis, consolidated.primaryConstitution, consolidated.primaryWuYin]);

  async function sendMessage(text?: string) {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput('');
    setShowQuickQs(false);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-healing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          constitution: consolidated.primaryConstitution,
          element: consolidated.primaryElement,
          wuyin: consolidated.primaryWuYin,
          organ: consolidated.primaryOrgan,
          completedModules: consolidated.completedModules,
          context: mode === 'emotional' ? 'emotional' : 'healing',
          history: messages.slice(-10),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      // 检测是否为流式响应
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        // 流式接收
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let buffer = '';

        // 先添加一个空的 assistant 消息
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.content) {
                fullContent += parsed.content;
                // 更新最后一条 assistant 消息
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: fullContent };
                  return updated;
                });
              }
            } catch {}
          }
        }

        // 如果流结束但没有收到内容
        if (!fullContent) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: '抱歉，我暂时无法回复，请稍后再试。' };
            return updated;
          });
        }
      } else {
        // 非流式响应（向后兼容）
        const data = await res.json();
        const content = data.content || data.choices?.[0]?.message?.content || '';
        if (content) {
          setMessages(prev => [...prev, { role: 'assistant', content }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我暂时无法回复，请稍后再试。' }]);
        }
      }
    } catch (err: unknown) {
      let errMsg = '网络异常，请稍后重试。';
      if (err instanceof Error) {
        if (err.name === 'TimeoutError' || err.message.includes('abort') || err.message.includes('timeout')) {
          errMsg = '请求超时，AI正在思考中，请稍后再试。';
        } else {
          errMsg = err.message;
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: `抱歉，连接异常：${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }

  return (
    <PageContainer theme="healing">
      {/* Header */}
      <HealingHeader
        title={mode === 'emotional' ? '知音·情绪陪伴' : 'AI导诊'}
        subtitle={mode === 'emotional' ? '倾听你的心声 · 身心合一的温暖陪伴' : '中医体质明辨 · 个性化疗愈建议'}
        dark
        rightSlot={messages.length > 2 ? (
          <button
            onClick={() => {
              setMessages([]);
              initializedRef.current = false;
              setTimeout(() => { initializedRef.current = true; }, 0);
              const welcome = mode === 'emotional'
                ? (hasDiagnosis
                  ? `你好，我是知音 🌿\n\n${consolidated.primaryConstitution}的朋友，身体和情绪是一体的。想聊什么，我都在。`
                  : '你好，我是知音 🌿\n\n想聊什么都可以，我在这里。')
                : (hasDiagnosis
                  ? `你好，我是AI中医导诊助手。根据你的辨识数据，你的综合体质为**${consolidated.primaryConstitution}**，五行偏**${consolidated.primaryElement}行**。有什么可以帮你的？`
                  : '你好，我是AI中医导诊助手。你可以向我咨询中医养生方面的问题。');
              setMessages([{ role: 'assistant', content: welcome }]);
              setShowQuickQs(true);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10"
            title="重新开始"
          >
            <X size={16} className="text-white" />
          </button>
        ) : undefined}
      />

      {/* Constitution Tags */}
      {hasDiagnosis && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {consolidated.primaryConstitution}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(196,163,90,0.3)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(196,163,90,0.3)' }}
          >
            {consolidated.primaryElement}行
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(110,158,116,0.3)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(110,158,116,0.3)' }}
          >
            {consolidated.primaryWuYin}音
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {consolidated.completedModules.length}/6项诊断
          </span>
        </div>
      )}

      {/* Mode Switch */}
      <div className="flex gap-1 px-4 pb-3">
        <button
          onClick={() => {
            if (mode !== 'diagnosis') {
              setMode('diagnosis');
              setMessages([]);
              initializedRef.current = false;
              setTimeout(() => { initializedRef.current = true; }, 0);
              setShowQuickQs(true);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: mode === 'diagnosis' ? '#5C1A00' : '#FDF8F0',
            color: mode === 'diagnosis' ? '#FDF8F0' : '#8B2500',
            border: mode === 'diagnosis' ? '1px solid #5C1A00' : '1px solid #EDE4D3',
          }}
        >
          <Stethoscope size={12} /> 中医导诊
        </button>
        <button
          onClick={() => {
            if (mode !== 'emotional') {
              setMode('emotional');
              setMessages([]);
              initializedRef.current = false;
              setTimeout(() => { initializedRef.current = true; }, 0);
              setShowQuickQs(true);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: mode === 'emotional' ? '#456b4e' : '#FDF8F0',
            color: mode === 'emotional' ? '#FDF8F0' : '#456b4e',
            border: mode === 'emotional' ? '1px solid #456b4e' : '1px solid #EDE4D3',
          }}
        >
          <Heart size={12} /> 情绪陪伴
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-52" style={{ paddingBottom: showQuickQs ? 280 : 180 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2.5 mb-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: mode === 'emotional' ? 'linear-gradient(145deg, #456b4e, #6e9e74)' : 'linear-gradient(145deg, #C4A35A, #B8860B)' }}
              >
                {mode === 'emotional' ? <Heart size={16} className="text-white" /> : <Stethoscope size={16} className="text-white" />}
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed ${
                msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
              }`}
              style={
                msg.role === 'user'
                  ? { background: 'linear-gradient(145deg, #5C1A00, #8B2500)', color: '#FDF8F0' }
                  : { background: '#FDF8F0', color: '#2C1810', border: '1px solid #EDE4D3' }
              }
            >
              <div
                className="break-words"
                style={{ wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{
                  __html: msg.role === 'assistant' ? renderMarkdown(msg.content, mode === 'emotional') : msg.content.replace(/\n/g, '<br/>'),
                }}
              />
              {/* 最后一条 AI 回复加反馈按钮 */}
              {msg.role === 'assistant' && i === messages.length - 1 && !loading && msg.content.length > 20 && (
                <div className="mt-2 pt-2 border-t border-stone-100">
                  <EvoFeedback module="diagnose" action="ai_chat_reply" detail={{ mode }} />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {showQuickQs && !loading && (
        <div
          className="fixed left-0 right-0 px-3 pb-2 z-10"
          style={{ bottom: 148 }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-semibold" style={{ color: mode === 'emotional' ? '#456b4e' : '#8B2500' }}>
              {mode === 'emotional' ? '倾诉一下' : '快捷提问'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{
                  background: 'rgba(253,248,240,0.95)',
                  color: '#5C1A00',
                  border: '1px solid #EDE4D3',
                  boxShadow: '0 1px 3px rgba(92,26,0,0.06)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div
        className="fixed bottom-16 left-0 right-0 z-20 px-3 pt-3 pb-3"
        style={{
          background: 'linear-gradient(180deg, rgba(245,239,224,0) 0%, rgba(245,239,224,0.95) 12%, #F5EFE0 20%)',
        }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3"
          style={{
            background: '#FDF8F0',
            border: '1px solid #EDE4D3',
            boxShadow: '0 -4px 20px rgba(92,26,0,0.06)',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'emotional' ? '想聊什么都可以，我在这里...' : '向我咨询体质调理、穴位按摩...'}
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{
              color: '#2C1810',
              maxHeight: 120,
              minHeight: 22,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background: input.trim() && !loading
                ? 'linear-gradient(145deg, #5C1A00, #8B2500)'
                : '#EDE4D3',
              color: input.trim() && !loading ? '#FDF8F0' : '#C4A35A',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
