'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BottomNav from '@/components/BottomNav';
import {
  ArrowLeft, Calendar, Clock, Star, Shield, Heart,
  Phone, MessageCircle, ChevronRight, CheckCircle2,
  Copy, QrCode, Settings,
} from 'lucide-react';
import { smartWechatLaunch, getWechatTextQRCodeUrl, copyWechatId, isMobile } from '@/lib/wechat-launch';

// ═══ 类型定义 ═══
interface ExpertService {
  name: string;
  duration: string;
  desc: string;
}

interface Expert {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  specialty: string;
  tags: string[];
  avatar: string;
  element: string;
  bio: string;
  services: ExpertService[];
  wechatId: string;
  phone: string;
  sortOrder: number;
  isActive: boolean;
}

const ELEMENT_COLORS: Record<string, { main: string; light: string; glow: string; label: string }> = {
  wood:  { main: '#5d8a63', light: '#e8f0e8', glow: '#5d8a6340', label: '木行' },
  fire:  { main: '#c26158', light: '#f5e8e6', glow: '#c2615840', label: '火行' },
  earth: { main: '#c9a94f', light: '#f5f0e0', glow: '#c9a94f40', label: '土行' },
  metal: { main: '#5ba09a', light: '#e6f0ef', glow: '#5ba09a40', label: '金行' },
  water: { main: '#3d7a75', light: '#e0efef', glow: '#3d7a7540', label: '水行' },
};

export default function ExpertBookingPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [selectedServiceIdx, setSelectedServiceIdx] = useState<number | null>(null);
  const [bookingStep, setBookingStep] = useState<'select' | 'service' | 'confirm' | 'wechat'>('select');
  const [submitting, setSubmitting] = useState(false);

  // 预约表单
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    note: '',
  });

  // 微信弹窗
  const [wechatModal, setWechatModal] = useState(false);

  // ── 获取专家列表 ──
  useEffect(() => {
    fetch('/api/experts')
      .then((res) => res.json())
      .then((data) => {
        setExperts(data.experts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selected = experts.find((e) => e.id === selectedExpertId);
  const elColor = selected ? (ELEMENT_COLORS[selected.element] || ELEMENT_COLORS.earth) : ELEMENT_COLORS.earth;

  // ── 微信拉起处理 ──
  const handleWechatLaunch = (expert: Expert) => {
    if (!expert.wechatId) {
      alert('该顾问暂未配置微信号，请电话联系');
      return;
    }

    const mode = smartWechatLaunch(expert.wechatId);
    if (mode === 'qrcode') {
      setWechatModal(true);
    }
    // 'launched' 模式下会自动跳转微信
  };

  // ── 复制微信号 ──
  const handleCopyWechatId = async (wechatId: string) => {
    const ok = await copyWechatId(wechatId);
    if (ok) {
      alert('微信号已复制到剪贴板');
    } else {
      alert('复制失败，请手动复制：' + wechatId);
    }
  };

  // ── 提交预约 ──
  const handleSubmitBooking = async () => {
    if (!selected || selectedServiceIdx === null) return;
    if (!formData.name.trim()) {
      alert('请填写您的姓名');
      return;
    }
    if (!formData.phone.trim()) {
      alert('请填写联系电话');
      return;
    }

    setSubmitting(true);
    try {
      const service = selected.services[selectedServiceIdx];
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: selected.id,
          service: service?.name || '',
          ...formData,
        }),
      });
      const data = await res.json();
      if (data.booking) {
        // 如果专家配置了微信号，自动进入微信联系步骤
        if (selected.wechatId) {
          setBookingStep('wechat');
        } else {
          alert('预约提交成功！疗愈顾问将在24小时内与您联系确认时间。');
          setBookingStep('select');
          setSelectedExpertId(null);
          setSelectedServiceIdx(null);
          setFormData({ name: '', phone: '', preferredDate: '', preferredTime: '', note: '' });
        }
      } else {
        alert(data.error || '预约提交失败，请稍后重试');
      }
    } catch {
      alert('网络异常，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // ═══ 渲染 ═══
  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: 'linear-gradient(180deg, #faf5ee 0%, #f5efe4 40%, #f0e8d8 100%)' }}
    >
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#faf5ee]/90 border-b border-[#e0d8c8]">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <Link
            href="/healing"
            className="p-2 rounded-xl bg-[#e8e0d0] hover:bg-[#ddd5c5] transition text-[#4a3a2a]"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold font-serif text-[#3a2a1a]">专家预约</h1>
            <p className="text-[10px] text-[#8a7a60] font-serif">一对一 · 极致服务</p>
          </div>
          <Link
            href="/healing/experts/admin"
            className="p-2 rounded-xl bg-[#e8e0d0] hover:bg-[#ddd5c5] transition text-[#4a3a2a]"
            title="管理后台"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>

      {/* 品牌标识条 */}
      <div className="px-4 py-3">
        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: 'linear-gradient(135deg, #8b1a1a 0%, #a02020 50%, #6b1515 100%)',
            boxShadow: '0 4px 24px rgba(139,26,26,0.25)',
          }}
        >
          <p className="text-amber-200 text-xs tracking-[0.3em] font-serif">静禅国灸</p>
          <p className="text-amber-100/70 text-[10px] mt-0.5 tracking-wider">JING CHAN GUO JIU</p>
          <div className="h-px bg-amber-200/20 my-2.5" />
          <p className="text-white/90 text-sm font-serif leading-relaxed">源于古法，精于辨证</p>
          <p className="text-white/60 text-[10px] mt-1 font-serif">
            线下真实体验 · 一对一专属服务 · 特邀资深疗愈顾问
          </p>
        </div>
      </div>

      {/* 加载态 */}
      {loading && (
        <div className="text-center py-12 text-[#8a7a60] text-sm">加载专家列表...</div>
      )}

      {/* ═══ 选择步骤 ═══ */}
      {!loading && bookingStep === 'select' && (
        <div className="px-4 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-6 h-6 rounded-full bg-[#8b1a1a] text-white text-xs flex items-center justify-center font-bold">1</div>
            <p className="text-sm font-serif text-[#3a2a1a] font-bold">选择疗愈顾问</p>
          </div>

          {experts.length === 0 ? (
            <div className="text-center py-8 text-[#8a7a60] text-sm">
              暂无可用专家，请前往管理后台添加
            </div>
          ) : (
            experts.map((expert) => {
              const ec = ELEMENT_COLORS[expert.element] || ELEMENT_COLORS.earth;
              const isSelected = selectedExpertId === expert.id;

              return (
                <button
                  key={expert.id}
                  onClick={() => setSelectedExpertId(expert.id)}
                  className="w-full text-left rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${ec.light} 0%, #faf5ee 100%)`
                      : 'rgba(250, 245, 238, 0.92)',
                    border: isSelected ? `1.5px solid ${ec.main}` : '1px solid #d0c8b8',
                    boxShadow: isSelected ? `0 4px 20px ${ec.glow}` : 'none',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="p-4 flex gap-4">
                    {/* 头像 */}
                    <div className="relative shrink-0">
                      <div
                        className="w-20 h-20 rounded-2xl overflow-hidden"
                        style={{ boxShadow: isSelected ? `0 2px 12px ${ec.glow}` : '0 2px 8px rgba(0,0,0,0.08)' }}
                      >
                        {expert.avatar ? (
                          <Image src={expert.avatar} alt={expert.name} width={80} height={80} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#f0ebe0] flex items-center justify-center text-[#b0a080] text-xs">暂无照片</div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white" style={{ background: ec.main }}>
                        {ec.label}
                      </div>
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold font-serif text-[#2a1a0a]">{expert.name}</h3>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: `${ec.main}15`, color: ec.main }}>
                          {expert.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8a7a60] mt-0.5 font-serif">{expert.subtitle}</p>
                      <p className="text-xs text-[#5a4a3a] mt-1.5 font-serif leading-relaxed">{expert.specialty}</p>
                      {/* 微信号标识 */}
                      {expert.wechatId && (
                        <div className="flex items-center gap-1 mt-1">
                          <MessageCircle size={10} style={{ color: '#5ba09a' }} />
                          <span className="text-[9px] text-[#5ba09a]">支持微信联系</span>
                        </div>
                      )}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {expert.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] border" style={{ borderColor: `${ec.main}30`, color: ec.main }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 size={20} className="shrink-0 mt-1" style={{ color: ec.main }} />}
                  </div>
                </button>
              );
            })
          )}

          {selectedExpertId && (
            <button
              onClick={() => setBookingStep('service')}
              className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${elColor.main}, ${elColor.main}dd)`,
                color: '#fff',
                boxShadow: `0 4px 16px ${elColor.glow}`,
              }}
            >
              选择服务项目
              <ChevronRight size={14} className="inline ml-1" />
            </button>
          )}
        </div>
      )}

      {/* ═══ 选择服务步骤 ═══ */}
      {bookingStep === 'service' && selected && (
        <div className="px-4 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <button onClick={() => setBookingStep('select')} className="text-[#8a7a60] hover:text-[#5a4a3a] transition">
              <ArrowLeft size={18} />
            </button>
            <div className="w-6 h-6 rounded-full bg-[#8b1a1a] text-white text-xs flex items-center justify-center font-bold">2</div>
            <p className="text-sm font-serif text-[#3a2a1a] font-bold">选择服务 · {selected.name}</p>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, ${elColor.light} 0%, #faf5ee 100%)`,
              border: `1px solid ${elColor.main}20`,
            }}
          >
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                {selected.avatar ? (
                  <Image src={selected.avatar} alt={selected.name} width={56} height={56} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#f0ebe0]" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold font-serif text-[#2a1a0a]">{selected.name}</h4>
                <p className="text-[10px] text-[#8a7a60]">{selected.title} · {selected.subtitle}</p>
                <p className="text-xs text-[#5a4a3a] mt-2 leading-relaxed font-serif">{selected.bio}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {selected.services.map((service, idx) => (
              <button
                key={idx}
                onClick={() => { setSelectedServiceIdx(idx); setBookingStep('confirm'); }}
                className="w-full text-left rounded-2xl p-4 transition-all hover:shadow-md"
                style={{ background: 'rgba(250, 245, 238, 0.95)', border: '1px solid #d0c8b8' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${elColor.main}15` }}>
                    <Heart size={18} style={{ color: elColor.main }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm font-serif text-[#2a1a0a]">{service.name}</h4>
                    <p className="text-xs text-[#8a7a60] mt-0.5">{service.desc}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-[#8a7a60]">
                        <Clock size={10} /> {service.duration}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#8a7a60]">
                        <Shield size={10} /> 一对一专属
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#b0a080] shrink-0 mt-2" />
                </div>
              </button>
            ))}
          </div>

          {/* 微信快捷联系 */}
          {selected.wechatId && (
            <button
              onClick={() => handleWechatLaunch(selected)}
              className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 border transition"
              style={{ borderColor: '#5ba09a', color: '#5ba09a', background: '#e6f0ef' }}
            >
              <MessageCircle size={16} />
              微信联系 {selected.name}
            </button>
          )}
        </div>
      )}

      {/* ═══ 预约确认步骤 ═══ */}
      {bookingStep === 'confirm' && selected && selectedServiceIdx !== null && (
        <div className="px-4 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <button onClick={() => setBookingStep('service')} className="text-[#8a7a60] hover:text-[#5a4a3a] transition">
              <ArrowLeft size={18} />
            </button>
            <div className="w-6 h-6 rounded-full bg-[#8b1a1a] text-white text-xs flex items-center justify-center font-bold">3</div>
            <p className="text-sm font-serif text-[#3a2a1a] font-bold">确认预约</p>
          </div>

          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(250, 245, 238, 0.95)', border: '1px solid #d0c8b8' }}
          >
            {/* 专家摘要 */}
            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden" style={{ boxShadow: `0 4px 16px ${elColor.glow}` }}>
                {selected.avatar ? (
                  <Image src={selected.avatar} alt={selected.name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#f0ebe0]" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-[#2a1a0a]">{selected.name}</h3>
                <p className="text-xs text-[#8a7a60]">{selected.title}</p>
                <p className="text-xs text-[#5a4a3a] mt-1">
                  {selected.services[selectedServiceIdx]?.name} · {selected.services[selectedServiceIdx]?.duration}
                </p>
              </div>
            </div>

            <div className="h-px bg-[#d0c8b8]" />

            {/* 预约表单 */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5a4a3a] mb-1">您的姓名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="请输入姓名"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5a4a3a] mb-1">联系电话 *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="请输入手机号"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#5a4a3a] mb-1">期望日期</label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData((p) => ({ ...p, preferredDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#5a4a3a] mb-1">期望时段</label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData((p) => ({ ...p, preferredTime: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                  >
                    <option value="">不限</option>
                    <option value="上午">上午 (9:00-12:00)</option>
                    <option value="下午">下午 (14:00-17:00)</option>
                    <option value="晚间">晚间 (18:00-21:00)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5a4a3a] mb-1">备注</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                  placeholder="如有特殊需求请备注"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60 resize-none"
                />
              </div>
            </div>

            <div className="h-px bg-[#d0c8b8]" />

            {/* 提交按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitBooking}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition"
                style={{
                  background: `linear-gradient(135deg, ${elColor.main}, ${elColor.main}dd)`,
                  color: '#fff',
                  boxShadow: `0 4px 16px ${elColor.glow}`,
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <Phone size={14} />
                {submitting ? '提交中...' : '提交预约'}
              </button>
              {selected.wechatId && (
                <button
                  onClick={() => handleWechatLaunch(selected)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border transition"
                  style={{ borderColor: '#5ba09a', color: '#5ba09a' }}
                >
                  <MessageCircle size={14} />
                  微信联系
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ 微信联系步骤 (预约成功后) ═══ */}
      {bookingStep === 'wechat' && selected && (
        <div className="px-4 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <button onClick={() => { setBookingStep('select'); setSelectedExpertId(null); }} className="text-[#8a7a60] hover:text-[#5a4a3a] transition">
              <ArrowLeft size={18} />
            </button>
            <p className="text-sm font-serif text-[#3a2a1a] font-bold">预约成功 · 联系顾问</p>
          </div>

          <div
            className="rounded-2xl p-6 text-center space-y-4"
            style={{ background: 'rgba(250, 245, 238, 0.95)', border: '1px solid #d0c8b8' }}
          >
            <div className="w-14 h-14 rounded-full bg-[#5d8a63] flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-[#2a1a0a]">预约已提交</h3>
              <p className="text-xs text-[#8a7a60] mt-1">疗愈顾问将通过微信与您联系确认时间</p>
            </div>

            {/* 微信二维码 */}
            {selected.wechatId && (
              <div className="space-y-3">
                <div className="rounded-xl p-4 bg-white inline-block mx-auto">
                  <img
                    src={getWechatTextQRCodeUrl(selected.wechatId, 180)}
                    alt="微信二维码"
                    width={180}
                    height={180}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle size={14} className="text-[#5ba09a]" />
                    <span className="text-sm font-bold text-[#2a1a0a]">微信号：{selected.wechatId}</span>
                  </div>
                  <button
                    onClick={() => handleCopyWechatId(selected.wechatId!)}
                    className="mx-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border border-[#d0c8b8] text-[#5a4a3a] hover:bg-[#f0ebe0] transition"
                  >
                    <Copy size={12} /> 复制微信号
                  </button>
                </div>

                {isMobile() && (
                  <button
                    onClick={() => handleWechatLaunch(selected)}
                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
                    style={{ background: '#07c160', color: '#fff' }}
                  >
                    <MessageCircle size={16} />
                    打开微信添加好友
                  </button>
                )}
              </div>
            )}

            {selected.phone && (
              <div className="pt-2">
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-center justify-center gap-1.5 text-xs text-[#8a7a60] hover:text-[#5a4a3a]"
                >
                  <Phone size={12} /> 电话联系：{selected.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ 微信二维码弹窗 ═══ */}
      {wechatModal && selected?.wechatId && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setWechatModal(false)}
        >
          <div
            className="rounded-2xl p-6 mx-4 max-w-sm w-full space-y-4"
            style={{ background: '#faf5ee' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-base font-bold font-serif text-[#2a1a0a]">微信联系 {selected.name}</h3>
              <p className="text-xs text-[#8a7a60] mt-1">扫描二维码或复制微信号添加好友</p>
            </div>

            <div className="rounded-xl p-3 bg-white inline-block mx-auto">
              <img
                src={getWechatTextQRCodeUrl(selected.wechatId, 200)}
                alt="微信二维码"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-[#2a1a0a]">微信号：{selected.wechatId}</p>
              <button
                onClick={() => handleCopyWechatId(selected.wechatId!)}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 mx-auto border border-[#d0c8b8] text-[#5a4a3a] hover:bg-[#f0ebe0]"
              >
                <Copy size={12} /> 复制微信号
              </button>
            </div>

            {isMobile() && (
              <button
                onClick={() => { setWechatModal(false); handleWechatLaunch(selected); }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: '#07c160' }}
              >
                打开微信
              </button>
            )}

            <button
              onClick={() => setWechatModal(false)}
              className="w-full py-2 rounded-xl text-xs text-[#8a7a60] hover:text-[#5a4a3a]"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 底部承诺 */}
      <div className="px-4 mt-6 mb-4">
        <div className="rounded-2xl p-4 bg-[#f5efe4] border border-[#d0c8b8]">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-[#c9a94f]" />
            <p className="text-xs font-bold font-serif text-[#3a2a1a]">服务承诺</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Shield, text: '真实资质验证' },
              { icon: Heart, text: '一对一专属服务' },
              { icon: Clock, text: '按时赴约保证' },
              { icon: Star, text: '满意为止原则' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px] text-[#6a5a40]">
                <item.icon size={11} className="text-[#8a7a60] shrink-0" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
