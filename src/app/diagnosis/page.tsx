'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, ArrowLeft } from 'lucide-react';
import ChatBubble from '@/components/ChatBubble';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/lib/store';
import { consolidateDiagnosis, getDiagnosisSummary } from '@/lib/unified-diagnosis';
import { searchPrescriptions } from '@/lib/jiuliao-data';
import { generateId } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const QUICK_QUESTIONS = [
  '最近总是失眠怎么办？',
  '经常感到焦虑烦躁',
  '消化不好吃什么调理？',
  '容易疲劳没精神',
  '腰膝酸软怎么养？',
  '咳嗽气短如何调理？',
];

export default function DiagnosisPage() {
  const router = useRouter();
  const { chatMessages, addChatMessage, clearChat, lastProfile, unifiedDiagnosis } = useAppStore();
  const consolidated = consolidateDiagnosis(unifiedDiagnosis);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化欢迎消息
  useEffect(() => {
    if (chatMessages.length === 0) {
      let welcomeText = '你好！我是知音AI导诊助手，精通中医五行理论和五音疗疾术。请告诉我你最近的身体状况或不适症状，我将为你辨识体质并推荐对应的五音疗愈方案。';
      if (consolidated.completedModules.length > 0) {
        welcomeText += `\n\n根据你的综合明辨结果（已完成${consolidated.completedModules.length}项诊断），你的体质为${consolidated.primaryConstitution}，${consolidated.primaryElement}行偏性，推荐${consolidated.primaryWuYin}音调理${consolidated.primaryOrgan}。`;
      } else if (lastProfile) {
        const profileText = `\n\n根据你之前的测试结果，你的体质偏${lastProfile.dominant === 'jiao' ? '木' : lastProfile.dominant === 'zhi' ? '火' : lastProfile.dominant === 'gong' ? '土' : lastProfile.dominant === 'shang' ? '金' : '水'}行，建议重点关注${lastProfile.recommendation.split('，')[0]}。`;
        welcomeText += profileText;
      }
      addChatMessage({
        id: generateId(),
        role: 'assistant',
        content: welcomeText,
        timestamp: Date.now(),
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  async function handleSend(text?: string) {
    const message = text || input.trim();
    if (!message || isLoading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setIsLoading(true);

    try {
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          profile: lastProfile,
          diagnosisSummary: getDiagnosisSummary(unifiedDiagnosis),
        }),
      });

      const data = await response.json();

      if (data.content) {
        addChatMessage({
          id: generateId(),
          role: 'assistant',
          content: data.content,
          timestamp: Date.now(),
        });
      } else if (data.error) {
        addChatMessage({
          id: generateId(),
          role: 'assistant',
          content: `抱歉，暂时无法连接AI服务。${data.error === 'MISSING_API_KEY' ? '请在设置中配置AI API密钥。' : '请稍后再试。'}`,
          timestamp: Date.now(),
        });
      }
    } catch {
      const offlineReply = generateOfflineReply(message);
      addChatMessage({
        id: generateId(),
        role: 'assistant',
        content: offlineReply,
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  }

  function generateOfflineReply(msg: string): string {
    const lower = msg.toLowerCase();
    // 尝试搜索相关灸疗处方
    const jiuliaoResults = searchPrescriptions(msg);
    const jiuliaoHint = jiuliaoResults.length > 0
      ? `\n\n推荐灸疗处方（共${jiuliaoResults.length}方，前3方）：\n${jiuliaoResults.slice(0, 3).map(p => `· ${p.name}：主穴${p.points.slice(0, 3).join('、')}，${p.indication.slice(0, 25)}`).join('\n')}\n→ 前往"灸疗处方"模块查看完整详情`
      : '';

    if (lower.includes('失眠') || lower.includes('睡不着') || lower.includes('入睡')) {
      return '失眠多与心肾不交、肝火上炎有关。\n\n五行分析：心属火，肾属水，水火不济则心神不安。\n\n疗愈建议：\n1. 羽音固肾 - 夜间聆听羽调音乐，滋阴安神\n2. 徵音养心 - 午间静养时听徵调舒缓心阳\n3. 睡前用温水泡脚，引火归元\n4. 避免睡前过度用脑和饮茶\n\n请尝试我们的「羽音固肾·夜间安眠」疗愈方案。' + jiuliaoHint;
    }
    if (lower.includes('焦虑') || lower.includes('烦躁') || lower.includes('易怒') || lower.includes('生气')) {
      return '焦虑烦躁多与肝气郁结有关。\n\n五行分析：肝属木，木性条达，郁则化火，上扰心神。\n\n疗愈建议：\n1. 角音疏肝 - 晨间聆听角调音乐，疏肝解郁\n2. 保持适度运动，促进气血流通\n3. 饮食宜清淡，多食绿色蔬菜\n4. 情志调节：适当表达情绪，勿过度压抑\n\n请尝试我们的「角音疏肝·晨间唤醒」疗愈方案。' + jiuliaoHint;
    }
    if (lower.includes('消化') || lower.includes('胃') || lower.includes('脾') || lower.includes('食欲')) {
      return '消化不良多与脾胃虚弱有关。\n\n五行分析：脾属土，主运化，脾虚则运化失常。\n\n疗愈建议：\n1. 宫音健脾 - 餐后听宫调音乐，助运化\n2. 规律饮食，细嚼慢咽\n3. 适量食用山药、薏米、红枣\n4. 避免生冷寒凉和过度思虑\n\n请尝试我们的「宫音健脾·餐后调养」疗愈方案。' + jiuliaoHint;
    }
    if (lower.includes('疲劳') || lower.includes('乏力') || lower.includes('没精神')) {
      return '疲劳乏力可能是气虚的表现。\n\n五行分析：脾为后天之本，脾虚则气血生化不足。\n\n疗愈建议：\n1. 宫音健脾 - 补益中气\n2. 角音疏肝 - 畅达气机\n3. 规律作息，避免熬夜\n4. 适度运动，不宜过猛\n\n建议先从宫音疗愈开始，配合食疗调养。' + jiuliaoHint;
    }
    if (lower.includes('咳') || lower.includes('气短') || lower.includes('呼吸')) {
      return '咳嗽气短与肺气亏虚有关。\n\n五行分析：肺属金，主气，金气不足则呼吸无力。\n\n疗愈建议：\n1. 商音清肺 - 午后聆听商调音乐\n2. 深呼吸练习，增强肺活量\n3. 百合银耳润肺，梨和白萝卜清热\n4. 注意保暖防寒\n\n请尝试「商音清肺·午后净息」疗愈方案。' + jiuliaoHint;
    }
    if (lower.includes('腰') || lower.includes('膝') || lower.includes('肾')) {
      return '腰膝酸软多与肾精不足有关。\n\n五行分析：肾属水，主骨生髓，肾精亏虚则腰府失养。\n\n疗愈建议：\n1. 羽音固肾 - 夜间聆听羽调音乐\n2. 早睡晚起，养肾藏精\n3. 黑芝麻、核桃、枸杞益精\n4. 适度站桩、打坐固本\n\n请尝试「羽音固肾·夜间安眠」疗愈方案。' + jiuliaoHint;
    }
    return '感谢你的咨询。根据中医五行理论，人体健康与木火土金水五行密切相关。\n\n为了更准确地为你辨证，请告诉我：\n1. 最困扰你的症状是什么？\n2. 这种情况持续多久了？\n3. 有什么加重或缓解的因素？\n\n你也前往"灸疗处方"模块搜索相关病症，或完成五音体质测试后我再结合你的体质给出更精准的建议。' + jiuliaoHint;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <PageContainer theme="healing" className="flex flex-col">
      {/* 顶栏 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">AI导诊</p>
            <p className="text-[10px] text-emerald-500">在线</p>
          </div>
        </div>
        <div className="ml-auto">
          <button onClick={clearChat} className="text-xs text-gray-400 hover:text-gray-600">
            新对话
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {chatMessages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 快捷问题（首屏才显示） */}
      {chatMessages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-emerald-300 hover:text-emerald-600 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你的症状或健康问题..."
            className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 min-h-[40px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-emerald-700 transition flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 mt-2 text-center">AI导诊仅供参考，不替代专业医疗诊断</p>
      </div>
    </PageContainer>
  );
}
