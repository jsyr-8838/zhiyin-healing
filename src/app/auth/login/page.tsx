'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Music, Phone, Shield, ArrowRight, User, ChevronLeft } from 'lucide-react';

// ── 阶段定义 ──
type AuthMode = 'login' | 'register';
type Step = 'phone' | 'code' | 'profile'; // profile 仅 register

export default function AuthLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<Step>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 表单状态
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 验证码倒计时
  const startCountdown = useCallback(() => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 发送验证码
  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '发送失败');
        return;
      }
      setCodeSent(true);
      setStep('code');
      startCountdown();
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 校验验证码并进入下一步
  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 登录模式：直接调 phone-login API
      if (mode === 'login') {
        const res = await fetch('/api/auth/phone-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '登录失败');
          return;
        }
        // 通过 NextAuth 创建 session
        await signIn('phone', {
          userId: data.userId,
          callbackUrl: '/dashboard',
          redirect: false,
        });
        router.push('/dashboard');
        return;
      }

      // 注册模式：验证码通过后进入个人资料填写
      // 先用 verify-phone 再次校验（内部校验验证码已使用，这里我们信任 code 格式）
      // 改为直接进入 profile 步骤，在最终注册时再统一校验
      setStep('profile');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 注册提交
  const handleRegister = async () => {
    if (!name.trim()) {
      setError('请输入姓名');
      return;
    }
    if (!age || parseInt(age) < 1 || parseInt(age) > 150) {
      setError('请输入有效年龄（1-150）');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code,
          name: name.trim(),
          gender,
          age: parseInt(age),
          // ★ 深度集成：携带游客ID，注册后迁移游客修行/体质数据
          visitorId: (() => {
            if (typeof window === 'undefined') return undefined;
            return localStorage.getItem('heytcm-visitor-id') || undefined;
          })(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '注册失败');
        return;
      }

      // 通过 NextAuth 创建 session
      await signIn('phone', {
        userId: data.userId,
        callbackUrl: '/dashboard',
        redirect: false,
      });
      router.push('/dashboard');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 访客模式快速进入
  const handleVisitorEntry = async () => {
    await signIn('visitor', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf5ee] via-[#f5ede0] to-[#ede4d4] flex flex-col">
      {/* 顶部装饰 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/90 to-teal-800/90" />
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative px-6 pt-16 pb-12 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5 border border-white/10">
            <Music size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-wide mb-2">知音</h1>
          <p className="text-emerald-200/80 text-sm tracking-widest">五行五音 · 身心疗愈</p>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 px-5 -mt-6 relative z-10">
        <div className="bg-white/90 rounded-3xl shadow-xl shadow-black/5 border border-white/60 p-6 max-w-md mx-auto">
          {/* 模式切换 Tab */}
          <div className="flex bg-[#f5ede0] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setStep('phone'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setMode('register'); setStep('phone'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              注册
            </button>
          </div>

          {/* 步骤指示器（注册模式） */}
          {mode === 'register' && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {[
                { key: 'phone', label: '手机号' },
                { key: 'code', label: '验证码' },
                { key: 'profile', label: '资料' },
              ].map((s, i) => (
                <div key={s.key} className="flex items-center">
                  {i > 0 && <div className="w-6 h-px bg-gray-200 mx-1" />}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s.key
                      ? 'bg-emerald-600 text-white'
                      : ['phone','code','profile'].indexOf(step) > i
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Step: 手机号 ── */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">手机号</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="请输入手机号"
                    maxLength={11}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#faf5ee] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <button
                onClick={handleSendCode}
                disabled={loading || phone.length !== 11}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>获取验证码 <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )}

          {/* ── Step: 验证码 ── */}
          {step === 'code' && (
            <div className="space-y-4">
              <button
                onClick={() => { setStep('phone'); setError(''); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition mb-2"
              >
                <ChevronLeft size={16} /> 返回
              </button>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  验证码 <span className="text-gray-400 font-normal">已发送至 {phone}</span>
                </label>
                <div className="relative">
                  <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="请输入6位验证码"
                    maxLength={6}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#faf5ee] border border-gray-200 rounded-xl text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {countdown > 0 ? `${countdown}s 后可重新发送` : ''}
                </span>
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || loading}
                  className="text-emerald-600 font-bold disabled:text-gray-300 disabled:cursor-not-allowed transition"
                >
                  重新发送
                </button>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'login' ? (
                  '登录'
                ) : (
                  <>下一步 <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )}

          {/* ── Step: 个人资料（注册模式） ── */}
          {step === 'profile' && mode === 'register' && (
            <div className="space-y-4">
              <button
                onClick={() => { setStep('code'); setError(''); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition mb-2"
              >
                <ChevronLeft size={16} /> 返回
              </button>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">姓名</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 20))}
                    placeholder="请输入您的姓名"
                    maxLength={20}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#faf5ee] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">性别</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'male' as const, label: '男' },
                    { value: 'female' as const, label: '女' },
                    { value: 'other' as const, label: '其他' },
                  ].map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGender(g.value)}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition ${
                        gender === g.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-[#faf5ee] text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">年龄</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="请输入年龄"
                  min={1}
                  max={150}
                  className="w-full px-4 py-3.5 bg-[#faf5ee] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  '完成注册'
                )}
              </button>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* 开发模式提示 */}
          {process.env.NODE_ENV === 'development' && step === 'code' && (
            <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs text-center">
              开发模式：验证码固定为 888888
            </div>
          )}
        </div>

        {/* 访客入口 */}
        <div className="mt-6 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-transparent text-xs text-gray-400">或</span>
            </div>
          </div>

          <button
            onClick={handleVisitorEntry}
            className="text-gray-500 hover:text-emerald-600 text-sm transition font-medium"
          >
            先去看看，稍后登录
          </button>
        </div>

        {/* 协议提示 */}
        <p className="text-center text-[10px] text-gray-400 mt-6 px-4 leading-relaxed">
          登录/注册即表示您同意
          <span className="text-gray-500">《用户协议》</span>和
          <span className="text-gray-500">《隐私政策》</span>
        </p>
      </div>
    </div>
  );
}
