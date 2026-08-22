"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Scan, ZoomIn } from "lucide-react";
import type { Acupoint, Meridian } from "@/lib/acupoint-data";
import type { AcupointViewer } from "@/lib/three/viewer";

type Props = {
  meridian: Meridian;
  autoRotate: boolean;
  onAutoRotate: (v: boolean) => void;
  selected: Acupoint | null;
  onSelect: (p: Acupoint | null) => void;
  showBilateral: boolean;
  /** When true, meridian changes preserve the current selection (search-jump fix). */
  keepSelection?: boolean;
};

export function BodyViewer({
  meridian,
  autoRotate,
  onAutoRotate,
  selected,
  onSelect,
  showBilateral,
  keepSelection = false,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<AcupointViewer | null>(null);
  const [hovered, setHovered] = useState<Acupoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Stash the latest callbacks in refs so the viewer always sees fresh values
  // without needing to re-create the viewer on every render.
  const onSelectRef = useRef(onSelect);
  const keepSelectionRef = useRef(keepSelection);
  onSelectRef.current = onSelect;
  keepSelectionRef.current = keepSelection;

  useEffect(() => {
    let cancelled = false;
    let viewer: AcupointViewer | null = null;

    void import("@/lib/three/viewer").then(({ AcupointViewer: Viewer }) => {
      if (cancelled || !mountRef.current) return;
      viewer = new Viewer(mountRef.current, {
        onSelect: (p: Acupoint | null) => onSelectRef.current(p),
        onHover: setHovered,
        onLoading: (isLoading, value) => {
          setLoading(isLoading);
          setProgress(value);
        },
      });
      viewerRef.current = viewer;
      viewer.setAutoRotate(autoRotate);
      viewer.setMeridian(meridian, showBilateral, keepSelectionRef.current);
    });

    return () => {
      cancelled = true;
      viewerRef.current = null;
      viewer?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  useEffect(() => {
    viewerRef.current?.setMeridian(meridian, showBilateral, keepSelection);
  }, [meridian, showBilateral, keepSelection]);

  useEffect(() => {
    viewerRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    if (selected) viewerRef.current?.focusPoint(selected);
  }, [selected]);

  const calloutRef = useCallback((node: HTMLDivElement | null) => {
    viewerRef.current?.attachCallout(node);
  }, []);

  const label = selected ?? hovered;
  const showLoader = loading && progress < 0.98;

  return (
    <section className="acupoints-viewport">
      <div className="acupoints-viewport-stage" ref={mountRef} />

      {showLoader && (
        <div className="acupoints-viewport-loader" role="status">
          <div className="acupoints-loader-ring" />
          <p>加载人体模型…</p>
          <small>{Math.round(progress * 100)}%</small>
        </div>
      )}

      <div
        className="acupoints-callout"
        ref={calloutRef}
        style={{ opacity: selected ? 1 : 0 }}
        aria-hidden={!selected}
      >
        {selected && (
          <>
            <strong>{selected.name}</strong>
            <span>{selected.code}</span>
          </>
        )}
      </div>

      <div className="acupoints-viewport-tools">
        <button
          type="button"
          className={autoRotate ? "active" : ""}
          onClick={() => onAutoRotate(!autoRotate)}
          title="自动旋转"
        >
          <Scan size={16} />
          旋转
        </button>
        <button type="button" onClick={() => viewerRef.current?.resetView()} title="复位视角">
          <RotateCcw size={16} />
          复位
        </button>
        <button type="button" title="滚轮缩放" disabled>
          <ZoomIn size={16} />
          缩放
        </button>
      </div>

      <div className="acupoints-viewport-hint">
        <span className="acupoints-hint-dot" style={{ background: meridian.accent }} />
        三维经络标本 · 穴位已吸附体表
        {label && (
          <em>
            {label.name} · {label.pinyin}
          </em>
        )}
      </div>

      <div className="acupoints-viewport-stamp">
        <b>{meridian.shortName}</b>
        <small>{meridian.element}</small>
      </div>
    </section>
  );
}
