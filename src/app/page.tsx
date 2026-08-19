'use client';

import Link from 'next/link';
import {
  Music, Heart, Sparkles, ArrowRight, Shield,
  Volume2, Brain, Star
} from 'lucide-react';

const FEATURES = [
  { icon: Music, title: '五音疗愈', desc: '角徵宫商羽对应肝心脾肺肾，古法今用', color: 'wuxing-wood' },
  { icon: Brain, title: 'AI体质辨识', desc: '智能分析你的五行体质与脏腑状态', color: 'wuxing-fire' },
  { icon: Volume2, title: '专业音疗', desc: '双频Solfeggio+泛音合成真实疗愈声波', color: 'wuxing-water' },
  { icon: Shield, title: '中医循证', desc: '基于《黄帝内经》五音疗疾理论体系', color: 'wuxing-earth' },
];

const TESTIMONIALS = [
  { name: '李女士', age: 42, text: '连续使用两周，失眠明显改善，现在每天听羽音入睡', avatar: '🌸' },
  { name: '王先生', age: 35, text: '工作压力大容易烦躁，角音理肝后情绪稳定了很多', avatar: '🎋' },
  { name: '张阿姨', age: 58, text: '脾胃不好，宫音健脾加上食疗方案真的很管用', avatar: '🌾' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f5f0e8' }}>
      {/* 导航栏 — 毛玻璃墨色 */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        background: 'rgba(245,240,232,0.88)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(30,45,38,0.06)',
      }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold" style={{
              background: '#c23a2b',
              color: '#f5f0e8',
              fontFamily: "'ZCOOL KuaiLe', 'KaiTi', serif",
              transform: 'rotate(-3deg)',
              boxShadow: '1px 1px 3px rgba(0,0,0,0.15)',
            }}>
              知
            </div>
            <span className="font-bold tracking-wider" style={{ color: '#1e2d26', fontFamily: "'Noto Serif SC', serif" }}>知音</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3a5545', fontFamily: "'Noto Serif SC', serif" }}>
              进入应用
            </Link>
            <Link
              href="/dashboard"
              className="text-sm px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
              style={{ background: '#1e2d26', color: '#f5f0e8', fontFamily: "'Noto Serif SC', serif" }}
            >
              立即体验
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero — 墨韵流金 × 五行生克 ═══ */}
      <section className="relative pt-28 pb-20 overflow-hidden" style={{ minHeight: '92vh' }}>
        {/* 宣纸纹理底层 */}
        <div className="absolute inset-0 -z-10" style={{ background: '#f5f0e8' }} />
        <div className="absolute inset-0 -z-10 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
        }} />

        {/* 水墨晕散装饰 — 五行色光晕 */}
        <div className="absolute top-12 left-[8%] w-80 h-80 rounded-full opacity-[0.07] blur-[80px]" style={{ background: 'var(--wood)' }} />
        <div className="absolute top-32 right-[12%] w-64 h-64 rounded-full opacity-[0.07] blur-[80px]" style={{ background: 'var(--fire)' }} />
        <div className="absolute bottom-20 left-[25%] w-72 h-72 rounded-full opacity-[0.06] blur-[80px]" style={{ background: 'var(--earth)' }} />
        <div className="absolute bottom-8 right-[5%] w-56 h-56 rounded-full opacity-[0.07] blur-[80px]" style={{ background: 'var(--water)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-[0.05] blur-[60px]" style={{ background: 'var(--metal)' }} />

        {/* 五行流转圆环 — 气韵生生 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] opacity-[0.06] pointer-events-none hero-wuxing-ring">
          <svg viewBox="0 0 520 520" className="w-full h-full animate-slow-rotate">
            <circle cx="260" cy="260" r="250" fill="none" stroke="var(--wood)" strokeWidth="0.8" strokeDasharray="6 12" />
            <circle cx="260" cy="260" r="220" fill="none" stroke="var(--fire)" strokeWidth="0.6" strokeDasharray="4 16" />
            <circle cx="260" cy="260" r="190" fill="none" stroke="var(--earth)" strokeWidth="0.5" strokeDasharray="3 20" />
          </svg>
        </div>

        {/* 远山剪影 */}
        <svg className="absolute bottom-0 left-0 right-0 w-full opacity-[0.035] pointer-events-none" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '120px' }}>
          <path d="M0,120 L0,70 Q180,10 360,55 Q540,90 720,35 Q900,0 1080,45 Q1260,75 1440,30 L1440,120Z" fill="#1e2d26" />
        </svg>

        <div className="relative max-w-4xl mx-auto px-4 text-center flex flex-col items-center justify-center" style={{ minHeight: 'calc(92vh - 192px)' }}>
          <div className="w-full animate-fade-up" style={{ animationDuration: '0.7s', animationTimingFunction: 'ease-out', animationFillMode: 'both' }}>
            {/* 朱砂印章徽 */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full" style={{
              background: 'rgba(194,58,43,0.06)',
              border: '1px solid rgba(194,58,43,0.15)',
            }}>
              <div className="w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold" style={{
                background: '#c23a2b',
                color: '#f5f0e8',
                fontFamily: "'ZCOOL KuaiLe', serif",
                transform: 'rotate(-2deg)',
              }}>经</div>
              <span className="text-xs tracking-widest" style={{ color: '#9c4440', fontFamily: "'Noto Serif SC', serif" }}>
                基于《黄帝内经》五音疗疾理论 · 全部免费
              </span>
            </div>

            {/* ═══ 核心标题 — 五行分色 ═══ */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[1.15] mb-4 tracking-wider" style={{ fontFamily: "'Noto Serif SC', 'Source Han Serif SC', serif" }}>
              <span className="hero-char" style={{ color: 'var(--wood)' }}>听</span>
              <span className="hero-char" style={{ color: 'var(--earth)' }}>五</span>
              <span className="hero-char" style={{ color: 'var(--water)' }}>音</span>
              <span className="hero-divider">，</span>
              <span className="hero-char" style={{ color: 'var(--earth)' }}>调</span>
              <span className="hero-char" style={{ color: 'var(--fire)' }}>五</span>
              <span className="hero-char" style={{ color: 'var(--metal)' }}>行</span>
            </h1>

            {/* 金线横批 */}
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-px w-16 md:w-24" style={{ background: 'linear-gradient(to right, transparent, var(--earth), transparent)' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--earth)', opacity: 0.6 }} />
              <div className="h-px w-16 md:w-24" style={{ background: 'linear-gradient(to right, transparent, var(--earth), transparent)' }} />
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[1.15] mb-8 tracking-wider" style={{ fontFamily: "'Noto Serif SC', 'Source Han Serif SC', serif" }}>
              <span className="hero-char" style={{ color: 'var(--metal)' }}>养</span>
              <span className="hero-char" style={{ color: 'var(--earth)' }}>五</span>
              <span className="hero-char" style={{ color: 'var(--wood)' }}>脏</span>
              <span className="hero-divider">，</span>
              <span className="hero-char" style={{ color: 'var(--fire)' }}>愈</span>
              <span className="hero-char" style={{ color: 'var(--water)' }}>身</span>
              <span className="hero-char" style={{ color: 'var(--wood)' }}>心</span>
            </h1>

            {/* 副标题 — 古法今释 */}
            <p className="text-base md:text-lg max-w-xl mx-auto mb-10 leading-loose tracking-wider" style={{ color: 'var(--ink-light)', fontFamily: "'Noto Serif SC', serif", opacity: 0.75 }}>
              角音疏肝 · 徵音养心 · 宫音健脾 · 商音清肺 · 羽音固肾
            </p>

            {/* 行动按钮 — 丹砂+墨色 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/test" className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-base hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2" style={{
                background: 'linear-gradient(135deg, var(--wood), var(--wood-deep))',
                color: '#f5f0e8',
                fontFamily: "'Noto Serif SC', serif",
                boxShadow: '0 6px 24px rgba(93,138,99,0.25)',
              }}>
                免费测体质 <ArrowRight size={18} />
              </Link>
              <Link href="/healing" className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2" style={{
                background: 'transparent',
                color: 'var(--ink-main)',
                border: '1.5px solid var(--ink-main)',
                fontFamily: "'Noto Serif SC', serif",
                opacity: 0.85,
              }}>
                <Volume2 size={18} /> 体验疗愈
              </Link>
            </div>
            <p className="text-xs mt-5 tracking-wider" style={{ color: 'var(--ink-light)', opacity: 0.4, fontFamily: "'Noto Serif SC', serif" }}>
              无需注册，即刻体验 · 全部功能免费开放
            </p>
          </div>

          <div className="mt-8 animate-fade-scale" style={{ animationDuration: '1s', animationDelay: '0.4s', animationTimingFunction: 'ease-out', animationFillMode: 'both' }}>
            <div className="relative w-52 h-52 md:w-64 md:h-64">
              {/* 生克连线 */}
              <svg className="absolute inset-0 w-full h-full animate-slow-rotate" viewBox="0 0 260 260">
                <polygon points="130,20 240,100 210,230 50,230 20,100" fill="none" stroke="var(--ink-main)" strokeWidth="0.5" opacity="0.08" strokeDasharray="4 6" />
              </svg>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md" style={{ background: 'var(--fire)', fontFamily: "'Noto Serif SC', serif" }}>
                <div><div className="text-center">徵</div><div className="text-[8px] opacity-70 text-center">心</div></div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md" style={{ background: 'var(--metal)', fontFamily: "'Noto Serif SC', serif" }}>
                <div><div className="text-center">商</div><div className="text-[8px] opacity-70 text-center">肺</div></div>
              </div>
              <div className="absolute bottom-0 left-[58%] -translate-x-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md" style={{ background: 'var(--water)', fontFamily: "'Noto Serif SC', serif" }}>
                <div><div className="text-center">羽</div><div className="text-[8px] opacity-70 text-center">肾</div></div>
              </div>
              <div className="absolute bottom-0 left-[42%] -translate-x-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md" style={{ background: 'var(--wood)', fontFamily: "'Noto Serif SC', serif" }}>
                <div><div className="text-center">角</div><div className="text-[8px] opacity-70 text-center">肝</div></div>
              </div>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xs font-bold shadow-md" style={{ background: 'linear-gradient(135deg, var(--earth), var(--earth-deep))', color: '#fff', fontFamily: "'Noto Serif SC', serif" }}>
                <div><div className="text-center">宫</div><div className="text-[8px] opacity-70 text-center">脾</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 痛点 — 亚健康四象 */}
      <section className="py-16 relative" style={{ background: '#faf6ef' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E")`,
        }} />
        <div className="max-w-4xl mx-auto px-4 relative">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 tracking-wider" style={{ color: 'var(--ink-main)', fontFamily: "'Noto Serif SC', serif" }}>现代人的<span style={{ color: 'var(--fire)' }}>亚健康</span>困境</h2>
          <p className="text-center mb-12 text-sm tracking-wider" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>超过 75% 的城市人群处于亚健康状态</p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: '肝气郁结', desc: '压力、焦虑、失眠——肝木不舒的信号', color: 'var(--wood)', bg: 'var(--wood-50)' },
              { title: '心火旺盛', desc: '心悸、多梦、焦躁——心火上炎扰心神', color: 'var(--fire)', bg: 'var(--fire-50)' },
              { title: '脾胃虚弱', desc: '倦怠、消化不良——脾土运化失常', color: 'var(--earth)', bg: 'var(--earth-50)' },
              { title: '肺肾亏虚', desc: '气短、腰膝酸软——金水不足根基动摇', color: 'var(--water)', bg: 'var(--water-50)' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl transition-all hover:shadow-md" style={{ background: item.bg, borderLeft: `3px solid ${item.color}` }}>
                <div className="w-2 h-2 rounded-full mt-2.5 shrink-0" style={{ background: item.color }} />
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--ink-main)', fontFamily: "'Noto Serif SC', serif" }}>{item.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--ink-light)', opacity: 0.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 — 四艺 */}
      <section className="py-16" style={{ background: '#f5f0e8' }}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 tracking-wider" style={{ color: 'var(--ink-main)', fontFamily: "'Noto Serif SC', serif" }}>四大核心能力</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-2xl p-6 transition-all hover:shadow-lg" style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.6)',
              }}>
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white mb-4 shadow-sm`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--ink-main)', fontFamily: "'Noto Serif SC', serif" }}>{title}</h3>
                <p className="text-sm" style={{ color: 'var(--ink-light)', opacity: 0.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 流程 — 三步 */}
      <section className="py-16" style={{ background: '#faf6ef' }}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 tracking-wider" style={{ color: 'var(--ink-main)', fontFamily: "'Noto Serif SC', serif" }}>三步开启<span style={{ color: 'var(--wood)' }}>疗愈之旅</span></h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {[
              { step: 1, title: '测体质', desc: 'AI 辨识你的五行偏性', color: 'var(--wood)' },
              { step: 2, title: '听五音', desc: '个性化双频声波调理', color: 'var(--earth)' },
              { step: 3, title: '见效方', desc: '持续优化疗愈方案', color: 'var(--water)' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl mb-4 relative shadow-sm" style={{
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}-deep)`.replace('-deep)', '-deep)'.replace('var(', 'var(')),
                  color: '#f5f0e8',
                  fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 900,
                }}>
                  {['壹','贰','叁'][i]}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ background: 'var(--ink-main)', color: '#f5f0e8' }}>{item.step}</div>
                </div>
                <h3 className="font-bold mb-1" style={{ color: 'var(--ink-main)', fontFamily: "'Noto Serif SC', serif" }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>{item.desc}</p>
                {i < 2 && <div className="hidden md:block mt-3 text-lg" style={{ color: 'var(--ink-light)', opacity: 0.3 }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 评价 */}
      <section className="py-16" style={{ background: '#f5f0e8' }}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 tracking-wider" style={{ color: 'var(--ink-main)', fontFamily: "'Noto Serif SC', serif" }}>他们的<span style={{ color: 'var(--wood)' }}>真实体验</span></h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl p-6" style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.6)',
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'var(--wood-50)', border: '1px solid var(--wood-100)' }}>{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--ink-main)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-light)', opacity: 0.5 }}>{t.age}岁</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-light)' }}>{t.text}</p>
                <div className="flex gap-0.5 mt-3">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} style={{ color: 'var(--earth)' }} className="fill-current" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — 墨色沉浸 */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'var(--ink-main)' }}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }} />
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="absolute top-10 left-[15%] w-48 h-48 rounded-full border" style={{ borderColor: 'var(--earth)', animation: 'pulse 3s infinite' }} />
          <div className="absolute bottom-10 right-[10%] w-64 h-64 rounded-full border" style={{ borderColor: 'var(--wood)', animation: 'pulse 3s infinite 1s' }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 text-center" style={{ color: '#f5f0e8' }}>
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-wider" style={{ fontFamily: "'Noto Serif SC', serif" }}>开启你的五音疗愈之旅</h2>
          <p className="mb-8 text-lg tracking-wider" style={{ color: 'var(--wood-200)' }}>千年智慧，一键触达。全部功能免费开放</p>
          <Link href="/test" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all" style={{
            background: 'var(--earth)',
            color: 'var(--ink-main)',
            fontFamily: "'Noto Serif SC', serif",
          }}>免费开始 <ArrowRight size={18} /></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ borderBottom: 'none', borderTop: '1px solid rgba(30,45,38,0.06)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold" style={{
              background: '#c23a2b',
              color: '#f5f0e8',
              fontFamily: "'ZCOOL KuaiLe', serif",
              transform: 'rotate(-2deg)',
            }}>知</div>
            <span className="font-semibold text-sm" style={{ color: 'var(--ink-main)', fontFamily: "'Noto Serif SC', serif" }}>知音 ZhiYin</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--ink-light)', opacity: 0.4 }}>基于中医五行理论 · 仅供参考，不替代医疗诊断</p>
           <p className="text-xs mt-1" style={{ color: 'var(--ink-light)', opacity: 0.3 }}>&copy; 2026 ZhiYin</p>
        </div>
      </footer>

      {/* ═══ 页面专属样式 ═══ */}
      <style jsx global>{`
        .hero-char {
          display: inline-block;
          transition: transform 0.3s ease, text-shadow 0.3s ease;
          font-weight: 900;
        }
        .hero-char:hover {
          transform: translateY(-4px) scale(1.05);
        }
        .hero-divider {
          display: inline-block;
          color: var(--ink-light);
          opacity: 0.35;
          margin: 0 2px;
        }
        @keyframes slow-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-rotate {
          animation: slow-rotate 120s linear infinite;
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation-name: fade-up; }
        @keyframes fade-scale {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-scale { animation-name: fade-scale; }
      `}</style>
    </div>
  );
}
