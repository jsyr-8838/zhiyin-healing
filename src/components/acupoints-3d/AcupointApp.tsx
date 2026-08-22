"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  BookOpen,
  Compass,
  Search,
  Sparkles,
  X,
  LibraryBig,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  getPointDetail,
  meridianById,
  meridians,
  searchPoints,
  type Acupoint,
  type MeridianId,
} from "@/lib/acupoint-data";
import { BodyViewer } from "./BodyViewer";

export function AcupointApp() {
  const [meridianId, setMeridianId] = useState<MeridianId>("li");
  const [autoRotate, setAutoRotate] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Acupoint | null>(null);
  const [showBilateral, setShowBilateral] = useState(true);
  const [mobileLibrary, setMobileLibrary] = useState(false);
  /** Signal to BodyViewer that the next meridian change is a search-jump and
   *  should NOT clear the selection. Reset to false after the change applies. */
  const [keepSelection, setKeepSelection] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const meridian = meridianById[meridianId];
  const detail = selected ? getPointDetail(selected) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return meridians;
    return meridians.filter(
      (m) =>
        m.name.includes(q) ||
        m.shortName.includes(q) ||
        m.element.includes(q) ||
        m.points.some(
          (p) =>
            p.name.includes(q) ||
            p.pinyin.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q),
        ),
    );
  }, [query]);

  const searchHits = useMemo(() => (query.trim().length >= 1 ? searchPoints(query).slice(0, 12) : []), [query]);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current.querySelectorAll("[data-reveal]"),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.42, stagger: 0.03, ease: "power2.out", overwrite: true },
    );
  }, [meridianId, selected?.id]);

  const selectMeridian = useCallback((id: MeridianId) => {
    setMeridianId(id);
    setSelected(null);
    setKeepSelection(false);
    setMobileLibrary(false);
  }, []);

  // Search-jump: set meridian AND keep the selection so focusPoint fires.
  const selectPoint = useCallback((point: Acupoint | null) => {
    if (point && point.meridianId !== meridianId) {
      setMeridianId(point.meridianId);
      setKeepSelection(true);
    }
    setSelected(point);
  }, [meridianId]);

  // Clear keepSelection after meridian update has been applied by BodyViewer.
  useEffect(() => {
    if (keepSelection) {
      const t = setTimeout(() => setKeepSelection(false), 500);
      return () => clearTimeout(t);
    }
  }, [keepSelection]);

  return (
    <main className="acupoints-app-shell">
      <header className="acupoints-topbar">
        <button className="acupoints-brand" type="button" onClick={() => selectMeridian("li")}>
          <strong>
            经络穴位图<sup>✦</sup>
          </strong>
          <em>循经取穴 · 立体明堂</em>
        </button>
        <nav className="acupoints-main-nav" aria-label="主导航">
          <button type="button" className="active">
            <Compass size={17} /> 探索
          </button>
          <button type="button">
            <Activity size={17} /> 十四经
          </button>
          <button type="button">
            <BookOpen size={17} /> 取穴法
          </button>
        </nav>
        <label className="acupoints-search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索穴位、经络、拼音…"
          />
          {query && (
            <button type="button" className="acupoints-clear-q" onClick={() => setQuery("")} aria-label="清除">
              <X size={14} />
            </button>
          )}
        </label>
        <button
          className="acupoints-mobile-library-trigger"
          onClick={() => setMobileLibrary(true)}
          aria-label="打开经络列表"
          type="button"
        >
          <LibraryBig size={20} />
        </button>
      </header>

      {searchHits.length > 0 && (
        <div className="acupoints-search-results">
          {searchHits.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                selectPoint(p);
                setQuery("");
              }}
            >
              <b>{p.name}</b>
              <span>
                {p.code} · {meridianById[p.meridianId].shortName}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="acupoints-workspace">
        <aside className={`acupoints-organ-library ${mobileLibrary ? "open" : ""}`}>
          <div className="acupoints-panel-heading">
            <span>十四经脉</span>
            <button
              aria-label="关闭"
              className="acupoints-mobile-close"
              onClick={() => setMobileLibrary(false)}
              type="button"
            >
              <X size={17} />
            </button>
          </div>
          <div className="acupoints-organ-list">
            {filtered.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`acupoints-organ-item ${meridianId === item.id ? "active" : ""}`}
                onClick={() => selectMeridian(item.id)}
                style={{ "--item-accent": item.accent } as React.CSSProperties}
              >
                <span className="acupoints-organ-glyph" style={{ background: `${item.accent}22`, color: item.accent }}>
                  {item.nature}
                </span>
                <span>
                  <b>{item.shortName}</b>
                  <small>
                    {item.name} · {item.element}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <label className="acupoints-bilateral-toggle">
            <input
              type="checkbox"
              checked={showBilateral}
              onChange={(e) => setShowBilateral(e.target.checked)}
            />
            显示双侧穴位
          </label>
          <blockquote className="acupoints-blockquote">
            <Sparkles size={18} />
            <p>
              经脉者，
              <br />
              所以能决死生…
            </p>
            <em>— 《灵枢·经脉》</em>
          </blockquote>
        </aside>

        <BodyViewer
          meridian={meridian}
          autoRotate={autoRotate}
          onAutoRotate={setAutoRotate}
          selected={selected}
          onSelect={setSelected}
          showBilateral={showBilateral}
          keepSelection={keepSelection}
        />

        <aside className="acupoints-info-panel" ref={contentRef}>
          {detail ? (
            <>
              <div className="acupoints-info-kicker" data-reveal>
                <span className="acupoints-kicker-dot" style={{ background: meridian.accent }} />
                {meridian.name}
              </div>
              <div className="acupoints-info-title-row" data-reveal>
                <div>
                  <h1>{detail.displayName}</h1>
                  <em>
                    {detail.pinyin} · {detail.code}
                  </em>
                </div>
                <span className="acupoints-specimen-stamp" style={{ borderColor: meridian.accent }}>
                  {detail.side === "left" ? "左" : detail.side === "right" ? "右" : "中"}
                </span>
              </div>
              <p className="acupoints-description" data-reveal>
                {detail.overview}
              </p>
              <div className="acupoints-rule" />
              <h2 data-reveal>定位取穴</h2>
              <p className="acupoints-body-text" data-reveal>
                {detail.location}
              </p>
              <h2 data-reveal>主治概要</h2>
              <p className="acupoints-body-text" data-reveal>
                {detail.indications}
              </p>
              {detail.url && (
                <a className="acupoints-lesson-button" data-reveal href={detail.url} target="_blank" rel="noreferrer">
                  查阅医学百科 <ArrowRight size={16} />
                </a>
              )}
              <button className="acupoints-ghost-btn" data-reveal type="button" onClick={() => setSelected(null)}>
                返回经络概览
              </button>
            </>
          ) : (
            <>
              <div className="acupoints-info-kicker" data-reveal>
                <span className="acupoints-kicker-dot" style={{ background: meridian.accent }} />
                {meridian.nature}经 · {meridian.element}
              </div>
              <div className="acupoints-info-title-row" data-reveal>
                <div>
                  <h1>{meridian.shortName}</h1>
                  <em>{meridian.poetic}</em>
                </div>
                <span className="acupoints-specimen-stamp" style={{ borderColor: meridian.accent }}>
                  {meridian.points.filter((p) => p.side !== "left").length}
                  <small>穴</small>
                </span>
              </div>
              <p className="acupoints-description" data-reveal>
                {meridian.description}
              </p>
              <div className="acupoints-rule" />
              <h2 data-reveal>循行提要</h2>
              <p className="acupoints-body-text" data-reveal>
                {meridian.pathHint}
              </p>
              <h2 data-reveal>本经穴位</h2>
              <div className="acupoints-point-grid" data-reveal>
                {meridian.points
                  .filter((p) => p.side === "right" || p.side === "mid")
                  .map((p) => (
                    <button key={p.id} type="button" className="acupoints-point-chip" onClick={() => selectPoint(p)}>
                      <b>{p.name}</b>
                      <small>{p.code}</small>
                    </button>
                  ))}
              </div>
              <div className="acupoints-fun-note" data-reveal>
                <Sparkles size={15} />
                <p>
                  <b>操作提示</b>
                  拖拽旋转人体，滚轮缩放；点击光点或下方穴位名称即可查看详解。
                </p>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* CC BY-SA 4.0 attribution for 3D model */}
      <footer className="acupoints-attribution">
        三维人体模型来源：Z-Anatomy（CC BY-SA 4.0）· 经络穴位代码 MIT · 仅供学习参考
      </footer>
    </main>
  );
}
