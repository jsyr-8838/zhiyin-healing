'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import kgRaw from '@/data/tcm/knowledge_graph.json';

// 节点类型配色
const TYPE_COLORS: Record<string, string> = {
  symptom: '#c26158',       // 症状-火行红
  syndrome: '#c9a94f',      // 证候-土行金
  six_meridian: '#3d7a75',  // 六经-水行青
  herb: '#5d8a63',          // 中药-木行绿
  meridian: '#5ba09a',      // 经脉-金行蓝
  acupoint: '#c26158',      // 穴位-火行红
  dong_acupoint: '#8b5cf6', // 董氏奇穴-紫
  classic_text: '#8b7355',  // 古籍-棕
  ni_comment: '#f59e0b',    // 倪师注释-琥珀
  formula: '#3b82f6',       // 方剂-蓝
  shennong_classic: '#6b8e23', // 神农本草-橄榄绿
};

const TYPE_LABELS: Record<string, string> = {
  symptom: '症状', syndrome: '证候', six_meridian: '六经', herb: '中药',
  meridian: '经脉', acupoint: '穴位', dong_acupoint: '董氏奇穴',
  classic_text: '古籍', ni_comment: '倪师注释', formula: '方剂', shennong_classic: '神农本草',
};

interface KGNode {
  id: string; name: string; type: string; description: string; category: string;
  x: number; y: number; vx: number; vy: number;
}

interface KGEdge {
  source: string; target: string; type: string; weight: number;
}

export default function ZhiShiClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedType, setSelectedType] = useState<string>('全部');
  const [hoveredNode, setHoveredNode] = useState<KGNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null);
  const nodesRef = useRef<KGNode[]>([]);
  const edgesRef = useRef<KGEdge[]>([]);
  const animRef = useRef<number>(0);
  const alphaRef = useRef(1.0);
  const isDragging = useRef(false);
  const dragNode = useRef<KGNode | null>(null);

  // 解析数据
  const { rawNodes, rawEdges, types, nodeMap } = useMemo(() => {
    const kg = kgRaw as { nodes: Array<{ id: string; name: string; type: string; description: string; category: string }>; edges: KGEdge[] };
    const nodes: KGNode[] = kg.nodes.map((n, i) => ({
      ...n,
      x: 400 + Math.cos((i / kg.nodes.length) * Math.PI * 2) * (180 + Math.random() * 80),
      y: 300 + Math.sin((i / kg.nodes.length) * Math.PI * 2) * (180 + Math.random() * 80),
      vx: 0, vy: 0,
    }));
    const types = new Set(nodes.map(n => n.type));
    const map = new Map<string, KGNode>();
    for (const n of nodes) map.set(n.id, n);
    return { rawNodes: nodes, rawEdges: kg.edges, types: Array.from(types), nodeMap: map };
  }, []);

  // 筛选
  const filteredIds = useMemo(() => {
    if (selectedType === '全部') return null;
    return new Set(rawNodes.filter(n => n.type === selectedType).map(n => n.id));
  }, [selectedType, rawNodes]);

  useEffect(() => {
    nodesRef.current = rawNodes.map(n => ({ ...n }));
    edgesRef.current = rawEdges;
    alphaRef.current = 1.0; // reset alpha on filter change
  }, [rawNodes, rawEdges, selectedType]);

  // 力导向图仿真 + 渲染
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 2);
    const H = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 2);
    const dpr = window.devicePixelRatio || 2;
    ctx.scale(dpr, dpr);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // Build adjacency for highlight
    const edgeLookup = new Map<string, string[]>();
    for (const e of rawEdges) {
      if (!edgeLookup.has(e.source)) edgeLookup.set(e.source, []);
      if (!edgeLookup.has(e.target)) edgeLookup.set(e.target, []);
      edgeLookup.get(e.source)!.push(e.target);
      edgeLookup.get(e.target)!.push(e.source);
    }

    function simulate() {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const alpha = alphaRef.current;
      if (alpha < 0.001) return; // simulation cooled down

      // 斥力
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const repulse = 1200 / (dist * dist);
          const fx = (dx / dist) * repulse;
          const fy = (dy / dist) * repulse;
          a.vx -= fx * alpha; a.vy -= fy * alpha;
          b.vx += fx * alpha; b.vy += fy * alpha;
        }
      }

      // 弹簧力（使用nodeMap加速查找）
      for (const e of edges) {
        const a = nodeMap.get(e.source);
        const b = nodeMap.get(e.target);
        if (!a || !b) continue;
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 100;
        const force = (dist - targetDist) * 0.015;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx * alpha; a.vy += fy * alpha;
        b.vx -= fx * alpha; b.vy -= fy * alpha;
      }

      // 中心引力 + 衰减
      for (const n of nodes) {
        n.vx += (w / 2 - n.x) * 0.005 * alpha;
        n.vy += (h / 2 - n.y) * 0.005 * alpha;
        n.vx *= 0.85; n.vy *= 0.85;
        if (!isDragging.current || dragNode.current !== n) {
          n.x += n.vx; n.y += n.vy;
        }
        n.x = Math.max(40, Math.min(w - 40, n.x));
        n.y = Math.max(40, Math.min(h - 40, n.y));
      }

      alphaRef.current = alpha * 0.995; // decay
    }

    function draw() {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const hoverId = hoveredNode?.id;
      const selectId = selectedNode?.id;
      const focusId = hoverId || selectId;
      // Highlight neighbors
      const highlightSet = focusId ? new Set<string>() : null;
      if (focusId && edgeLookup.has(focusId)) {
        highlightSet!.add(focusId);
        for (const nid of edgeLookup.get(focusId)!) highlightSet!.add(nid);
      }

      // 绘制边
      for (const e of edges) {
        const a = nodeMap.get(e.source);
        const b = nodeMap.get(e.target);
        if (!a || !b) continue;
        if (filteredIds && (!filteredIds.has(a.id) && !filteredIds.has(b.id))) continue;

        const isHighlight = highlightSet && highlightSet.has(a.id) && highlightSet.has(b.id);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isHighlight ? 'rgba(139, 115, 85, 0.45)' : 'rgba(139, 115, 85, 0.1)';
        ctx.lineWidth = isHighlight ? e.weight * 1.2 : e.weight * 0.5;
        ctx.stroke();
      }

      // 绘制节点
      for (const n of nodes) {
        if (filteredIds && !filteredIds.has(n.id)) continue;
        const color = TYPE_COLORS[n.type] || '#888';
        const isHover = n.id === hoverId;
        const isSelected = n.id === selectId;
        const isFocus = isHover || isSelected;
        const dimmed = highlightSet && !highlightSet.has(n.id);
        const r = n.type === 'formula' ? 8 : n.type === 'herb' ? 7 : n.type === 'six_meridian' ? 9 : 6;

        // 光晕（hover/selected）
        if (isFocus) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.15;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
          ctx.globalAlpha = dimmed ? 0.2 : 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;

        // 标签：全部显示，dimmed时降低透明度
        ctx.font = `${isFocus ? 'bold' : 'normal'} 10px sans-serif`;
        ctx.fillStyle = dimmed ? 'rgba(26,26,26,0.2)' : '#1a1a1a';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, n.x, n.y - r - 4);
      }

      simulate();
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [filteredIds, hoveredNode, selectedNode, rawEdges, nodeMap]);

  // 鼠标hover检测
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const nodes = nodesRef.current;
    let found: KGNode | null = null;
    for (const n of nodes) {
      if (filteredIds && !filteredIds.has(n.id)) continue;
      const dx = n.x - mx, dy = n.y - my;
      if (dx * dx + dy * dy < 20 * 20) {
        found = n;
        break;
      }
    }
    setHoveredNode(found);
    canvas.style.cursor = found ? 'pointer' : 'default';
  }, [filteredIds]);

  const handleClick = useCallback(() => {
    if (hoveredNode) setSelectedNode(hoveredNode);
    else setSelectedNode(null);
  }, [hoveredNode]);

  // 选中节点的关联信息
  const nodeRelations = useMemo(() => {
    if (!selectedNode) return { edges: [], neighbors: [] };
    const edges = rawEdges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
    const neighborIds = new Set<string>();
    for (const e of edges) {
      neighborIds.add(e.source);
      neighborIds.add(e.target);
    }
    neighborIds.delete(selectedNode.id);
    const neighbors = rawNodes.filter(n => neighborIds.has(n.id));
    return { edges, neighbors };
  }, [selectedNode, rawNodes, rawEdges]);

  return (
    <div className="min-h-screen bg-[#faf5ee]">
      {/* 顶部 */}
      <div className="sticky top-0 z-30 bg-[#faf5ee]/95 border-b border-[#e8ddd0]/60 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#1a1a1a]" style={{ fontWeight: 760 }}>
                知识图谱
              </h1>
              <p className="text-xs text-[#8b7355] mt-0.5">
                {rawNodes.length}节点 · {rawEdges.length}条关系 · 11类实体
              </p>
            </div>
            <Link
              href="/healing"
              className="px-3 py-1.5 bg-[#f5efe6] text-[#8b7355] text-xs rounded-lg hover:bg-[#e8ddd0]/60 transition-colors"
            >
              返回疗愈
            </Link>
          </div>
        </div>
      </div>

      {/* 类型筛选 */}
      <div className="px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedType('全部')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedType === '全部' ? 'bg-[#8b7355] text-white shadow-sm' : 'bg-white/60 text-[#8b7355] hover:bg-white/90 border border-[#e8ddd0]/60'
              }`}
            >
              全部
            </button>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedType === t ? 'text-white shadow-sm' : 'bg-white/60 text-[#8b7355] hover:bg-white/90 border border-[#e8ddd0]/60'
                }`}
                style={selectedType === t ? { backgroundColor: TYPE_COLORS[t] } : undefined}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[t] }} />
                {TYPE_LABELS[t] || t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8 flex gap-4">
        {/* 力导向图 */}
        <div className="flex-1 bg-white/60 rounded-2xl border border-[#e8ddd0]/60 overflow-hidden shadow-sm" style={{ height: '70vh' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
          />
        </div>

        {/* 右侧详情面板 */}
        {selectedNode && (
          <div className="w-[300px] shrink-0 bg-white/90 rounded-2xl border border-[#e8ddd0]/60 p-4 shadow-sm overflow-y-auto max-h-[70vh]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS[selectedNode.type] }} />
              <h3 className="text-base font-bold text-[#1a1a1a]" style={{ fontWeight: 700 }}>{selectedNode.name}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: TYPE_COLORS[selectedNode.type] }}>
                {TYPE_LABELS[selectedNode.type] || selectedNode.type}
              </span>
            </div>
            {selectedNode.description && (
              <p className="text-xs text-[#555] mb-3">{selectedNode.description}</p>
            )}

            {/* 关联节点 */}
            {nodeRelations.neighbors.length > 0 && (
              <div>
                <p className="text-xs text-[#8b7355] font-medium mb-2">关联节点 ({nodeRelations.neighbors.length})</p>
                <div className="space-y-1">
                  {nodeRelations.neighbors.slice(0, 20).map(n => (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNode(n)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-[#f5efe6] transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[n.type] }} />
                      <span className="text-xs text-[#1a1a1a] font-medium">{n.name}</span>
                      <span className="text-[10px] text-[#aaa]">{TYPE_LABELS[n.type]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 跳转链接 */}
            {['acupoint', 'dong_acupoint'].includes(selectedNode.type) && (
              <Link
                href={`/meridian?focus=${selectedNode.id.replace('ACU_', '')}`}
                className="block mt-3 text-center py-2 bg-[#c9a94f] text-white text-xs rounded-lg hover:bg-[#b89840] transition-colors"
              >
                在3D模型中查看
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
