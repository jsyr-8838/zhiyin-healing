'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BottomNav from '@/components/BottomNav';
import {
  ArrowLeft, Plus, Pencil, Trash2, Upload, Save, X,
  GripVertical, Eye, EyeOff, Phone, MessageCircle,
  Image as ImageIcon, ChevronDown,
} from 'lucide-react';

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
  bookingCount?: number;
}

const ELEMENT_OPTIONS = [
  { value: 'wood', label: '木行', color: '#5d8a63' },
  { value: 'fire', label: '火行', color: '#c26158' },
  { value: 'earth', label: '土行', color: '#c9a94f' },
  { value: 'metal', label: '金行', color: '#5ba09a' },
  { value: 'water', label: '水行', color: '#3d7a75' },
];

const EMPTY_EXPERT: Omit<Expert, 'id' | 'bookingCount'> = {
  name: '',
  title: '',
  subtitle: '禅静国灸 · 北京事业部',
  specialty: '',
  tags: [],
  avatar: '',
  element: 'earth',
  bio: '',
  services: [{ name: '', duration: '60分钟', desc: '' }],
  wechatId: '',
  phone: '',
  sortOrder: 0,
  isActive: true,
};

export default function ExpertAdminPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Expert> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 获取专家列表 ──
  const fetchExperts = useCallback(async () => {
    try {
      const res = await fetch('/api/experts?all=1');
      const data = await res.json();
      setExperts(data.experts || []);
    } catch (err) {
      showToast('获取专家列表失败', 'err');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExperts(); }, [fetchExperts]);

  // ── Toast ──
  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ── 新建专家 ──
  const handleNew = () => {
    setEditing({ ...EMPTY_EXPERT });
    setIsNew(true);
  };

  // ── 编辑专家 ──
  const handleEdit = (expert: Expert) => {
    setEditing({ ...expert });
    setIsNew(false);
  };

  // ── 取消编辑 ──
  const handleCancel = () => {
    setEditing(null);
    setIsNew(false);
    setTagInput('');
  };

  // ── 图片上传 ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/experts/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setEditing((prev) => prev ? { ...prev, avatar: data.path } : prev);
        showToast('图片上传成功');
      } else {
        showToast(data.error || '上传失败', 'err');
      }
    } catch {
      showToast('图片上传失败', 'err');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── 保存专家 ──
  const handleSave = async () => {
    if (!editing?.name) {
      showToast('请填写专家姓名', 'err');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...editing };
      if (isNew) {
        const res = await fetch('/api/experts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.expert) {
          showToast('专家创建成功');
          handleCancel();
          fetchExperts();
        } else {
          showToast(data.error || '创建失败', 'err');
        }
      } else {
        const res = await fetch(`/api/experts/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.expert) {
          showToast('专家更新成功');
          handleCancel();
          fetchExperts();
        } else {
          showToast(data.error || '更新失败', 'err');
        }
      }
    } catch {
      showToast('保存失败', 'err');
    } finally {
      setSaving(false);
    }
  };

  // ── 删除专家 ──
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除专家「${name}」吗？此操作不可恢复。`)) return;
    try {
      const res = await fetch(`/api/experts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('专家已删除');
        fetchExperts();
      } else {
        showToast('删除失败', 'err');
      }
    } catch {
      showToast('删除失败', 'err');
    }
  };

  // ── 切换启用状态 ──
  const handleToggleActive = async (expert: Expert) => {
    try {
      const res = await fetch(`/api/experts/${expert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !expert.isActive }),
      });
      const data = await res.json();
      if (data.expert) {
        showToast(expert.isActive ? '已停用' : '已启用');
        fetchExperts();
      }
    } catch {
      showToast('操作失败', 'err');
    }
  };

  // ── 标签操作 ──
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const tags = [...(editing?.tags || [])];
    if (!tags.includes(t)) {
      tags.push(t);
      setEditing((prev) => prev ? { ...prev, tags } : prev);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    const tags = (editing?.tags || []).filter((t) => t !== tag);
    setEditing((prev) => prev ? { ...prev, tags } : prev);
  };

  // ── 服务项目操作 ──
  const addService = () => {
    const services = [...(editing?.services || []), { name: '', duration: '60分钟', desc: '' }];
    setEditing((prev) => prev ? { ...prev, services } : prev);
  };

  const removeService = (idx: number) => {
    const services = (editing?.services || []).filter((_, i) => i !== idx);
    setEditing((prev) => prev ? { ...prev, services } : prev);
  };

  const updateService = (idx: number, field: keyof ExpertService, value: string) => {
    const services = [...(editing?.services || [])];
    services[idx] = { ...services[idx], [field]: value };
    setEditing((prev) => prev ? { ...prev, services } : prev);
  };

  const elementColor = (el: string) => ELEMENT_OPTIONS.find((e) => e.value === el)?.color || '#c9a94f';

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
            href="/healing/experts"
            className="p-2 rounded-xl bg-[#e8e0d0] hover:bg-[#ddd5c5] transition text-[#4a3a2a]"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold font-serif text-[#3a2a1a]">专家管理</h1>
            <p className="text-[10px] text-[#8a7a60] font-serif">增删改查 · 图片上传</p>
          </div>
          <button
            onClick={handleNew}
            className="p-2 rounded-xl bg-[#8b1a1a] hover:bg-[#a02020] transition text-white"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
          style={{
            background: toast.type === 'ok' ? '#5d8a63' : '#c26158',
            color: '#fff',
          }}
        >
          {toast.msg}
        </div>
      )}

      <div className="px-4 py-4">
        {/* ── 编辑表单 ── */}
        {editing && (
          <div className="mb-6 rounded-2xl p-4 space-y-4 border border-[#d0c8b8]" style={{ background: 'rgba(250,245,238,0.97)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-[#3a2a1a]">
                {isNew ? '新建专家' : '编辑专家'}
              </h3>
              <button onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-[#e8e0d0] text-[#8a7a60]">
                <X size={18} />
              </button>
            </div>

            {/* 头像上传 */}
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-[#c0b8a0] flex items-center justify-center cursor-pointer relative shrink-0"
                style={{ background: editing.avatar ? 'transparent' : '#f0ebe0' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {editing.avatar ? (
                  <Image src={editing.avatar} alt="头像" width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={28} className="text-[#b0a080]" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="flex-1">
                <p className="text-xs text-[#8a7a60]">点击头像上传图片</p>
                <p className="text-[10px] text-[#b0a080] mt-0.5">支持 JPG/PNG/WebP，最大 5MB</p>
                {editing.avatar && (
                  <p className="text-[10px] text-[#5ba09a] mt-1 truncate">{editing.avatar}</p>
                )}
              </div>
            </div>

            {/* 基本信息 */}
            <div className="space-y-3">
              {[
                { label: '姓名', key: 'name', placeholder: '请输入专家姓名' },
                { label: '职称', key: 'title', placeholder: '如：资深疗愈顾问' },
                { label: '副标题', key: 'subtitle', placeholder: '如：禅静国灸 · 北京事业部' },
                { label: '专长', key: 'specialty', placeholder: '如：灸法调养 · 体质疏导' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-[#5a4a3a] mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={(editing as Record<string, unknown>)[f.key] as string || ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setEditing((prev) => prev ? { ...prev, [f.key]: e.target.value } : prev)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                  />
                </div>
              ))}

              {/* 五行元素 */}
              <div>
                <label className="block text-xs font-bold text-[#5a4a3a] mb-1">五行属性</label>
                <div className="flex gap-2 flex-wrap">
                  {ELEMENT_OPTIONS.map((el) => (
                    <button
                      key={el.value}
                      onClick={() => setEditing((prev) => prev ? { ...prev, element: el.value } : prev)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: editing.element === el.value ? el.color : `${el.color}15`,
                        color: editing.element === el.value ? '#fff' : el.color,
                        border: `1.5px solid ${editing.element === el.value ? el.color : `${el.color}40`}`,
                      }}
                    >
                      {el.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 简介 */}
              <div>
                <label className="block text-xs font-bold text-[#5a4a3a] mb-1">简介</label>
                <textarea
                  value={editing.bio || ''}
                  placeholder="请输入专家简介"
                  rows={3}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, bio: e.target.value } : prev)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60 resize-none"
                />
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-xs font-bold text-[#5a4a3a] mb-1">标签</label>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {(editing.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f0ebe0] text-[#5a4a3a] flex items-center gap-1"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-[#c26158]">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="输入标签后回车"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#d0c8b8] text-xs text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                  />
                  <button onClick={addTag} className="px-3 py-2 rounded-xl bg-[#f0ebe0] text-xs text-[#5a4a3a] hover:bg-[#e8e0d0]">
                    添加
                  </button>
                </div>
              </div>

              {/* 联系方式 */}
              <div>
                <label className="block text-xs font-bold text-[#5a4a3a] mb-1">微信号</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editing.wechatId || ''}
                    placeholder="用于微信拉起/二维码生成"
                    onChange={(e) => setEditing((prev) => prev ? { ...prev, wechatId: e.target.value } : prev)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                  />
                  <MessageCircle size={16} className="text-[#5ba09a] shrink-0" />
                </div>
                <p className="text-[10px] text-[#b0a080] mt-0.5">用户点击预约时将通过此ID拉起微信</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5a4a3a] mb-1">联系电话</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editing.phone || ''}
                    placeholder="联系电话"
                    onChange={(e) => setEditing((prev) => prev ? { ...prev, phone: e.target.value } : prev)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                  />
                  <Phone size={16} className="text-[#5ba09a] shrink-0" />
                </div>
              </div>

              {/* 服务项目 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#5a4a3a]">服务项目</label>
                  <button onClick={addService} className="text-[10px] text-[#8b1a1a] font-bold flex items-center gap-0.5 hover:underline">
                    <Plus size={10} /> 添加
                  </button>
                </div>
                <div className="space-y-2">
                  {(editing.services || []).map((svc, idx) => (
                    <div key={idx} className="rounded-xl border border-[#d0c8b8] p-3 space-y-2 bg-white/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#8a7a60]">服务 #{idx + 1}</span>
                        <button onClick={() => removeService(idx)} className="text-[#c26158] hover:text-[#a02020]">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={svc.name}
                        placeholder="服务名称"
                        onChange={(e) => updateService(idx, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-[#d0c8b8] text-xs text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={svc.duration}
                          placeholder="时长"
                          onChange={(e) => updateService(idx, 'duration', e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded-lg border border-[#d0c8b8] text-xs text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                        />
                        <input
                          type="text"
                          value={svc.desc}
                          placeholder="描述"
                          onChange={(e) => updateService(idx, 'desc', e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded-lg border border-[#d0c8b8] text-xs text-[#3a2a1a] placeholder-[#b0a080] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 排序 & 启用 */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#5a4a3a] mb-1">排序号</label>
                  <input
                    type="number"
                    value={editing.sortOrder ?? 0}
                    onChange={(e) => setEditing((prev) => prev ? { ...prev, sortOrder: parseInt(e.target.value) || 0 } : prev)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d0c8b8] text-sm text-[#3a2a1a] focus:outline-none focus:border-[#8b1a1a] bg-white/60"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#5a4a3a] mb-1">状态</label>
                  <button
                    onClick={() => setEditing((prev) => prev ? { ...prev, isActive: !prev.isActive } : prev)}
                    className={`w-full px-3 py-2 rounded-xl text-sm font-bold transition ${
                      editing.isActive ? 'bg-[#5d8a63] text-white' : 'bg-[#e8e0d0] text-[#8a7a60]'
                    }`}
                  >
                    {editing.isActive ? '已启用' : '已停用'}
                  </button>
                </div>
              </div>

              {/* 保存按钮 */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #8b1a1a, #a02020)',
                  boxShadow: '0 4px 16px rgba(139,26,26,0.25)',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Save size={14} />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        )}

        {/* ── 专家列表 ── */}
        {!editing && (
          <>
            {loading ? (
              <div className="text-center py-12 text-[#8a7a60] text-sm">加载中...</div>
            ) : experts.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-[#8a7a60] text-sm">暂无专家数据</p>
                <button
                  onClick={handleNew}
                  className="px-4 py-2 rounded-xl bg-[#8b1a1a] text-white text-sm font-bold"
                >
                  添加第一位专家
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {experts.map((expert) => {
                  const ec = elementColor(expert.element);
                  return (
                    <div
                      key={expert.id}
                      className="rounded-2xl p-4 border border-[#d0c8b8] transition-all"
                      style={{
                        background: expert.isActive ? 'rgba(250,245,238,0.95)' : 'rgba(240,236,228,0.6)',
                        opacity: expert.isActive ? 1 : 0.7,
                      }}
                    >
                      <div className="flex gap-3">
                        {/* 头像 */}
                        <div className="relative shrink-0">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-2" style={{ borderColor: `${ec}40` }}>
                            {expert.avatar ? (
                              <Image src={expert.avatar} alt={expert.name} width={64} height={64} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#f0ebe0] flex items-center justify-center">
                                <ImageIcon size={20} className="text-[#b0a080]" />
                              </div>
                            )}
                          </div>
                          <div
                            className="absolute -bottom-1 -right-1 px-1 py-0.5 rounded-full text-[7px] font-bold text-white"
                            style={{ background: ec }}
                          >
                            {ELEMENT_OPTIONS.find((e) => e.value === expert.element)?.label}
                          </div>
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold font-serif text-[#2a1a0a] text-sm">{expert.name}</h3>
                            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${ec}15`, color: ec }}>
                              {expert.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8a7a60] mt-0.5">{expert.specialty || '暂无专长'}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {expert.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 rounded-full text-[8px]" style={{ background: `${ec}15`, color: ec }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                          {/* 微信号/电话 */}
                          <div className="flex gap-3 mt-1.5">
                            {expert.wechatId && (
                              <span className="flex items-center gap-0.5 text-[9px] text-[#5ba09a]">
                                <MessageCircle size={9} /> {expert.wechatId}
                              </span>
                            )}
                            {expert.phone && (
                              <span className="flex items-center gap-0.5 text-[9px] text-[#8a7a60]">
                                <Phone size={9} /> {expert.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleEdit(expert)}
                            className="p-1.5 rounded-lg hover:bg-[#e8e0d0] text-[#5a4a3a] transition"
                            title="编辑"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(expert)}
                            className="p-1.5 rounded-lg hover:bg-[#e8e0d0] transition"
                            title={expert.isActive ? '停用' : '启用'}
                            style={{ color: expert.isActive ? '#5d8a63' : '#b0a080' }}
                          >
                            {expert.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(expert.id, expert.name)}
                            className="p-1.5 rounded-lg hover:bg-[#f5e8e6] text-[#c26158] transition"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* 预约数 & 排序号 */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#e0d8c8]">
                        <span className="text-[9px] text-[#b0a080]">
                          排序: {expert.sortOrder} · 服务: {expert.services?.length || 0}项 · 预约: {expert.bookingCount || 0}次
                        </span>
                        {!expert.isActive && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f5e8e6] text-[#c26158] font-bold">已停用</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
