'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import {
  GUASHA_TABS,
  THEORY,
  CLASSICS,
  MERIDIANS,
  MERIDIAN_CATEGORIES,
  ACUPOINTS,
  REGIONS,
  DISEASES,
  DISEASE_CATEGORIES,
  STANDARD,
  CASES,
  ZHANGXQ,
  type TabId,
  type InfoRow,
} from '@/lib/guasha-data';
import { normalizeSymptom } from '@/lib/tcm-lifestyle-data';

const C = {
  zhusha: '#5C1A00',
  zhushaL: '#8B2500',
  gold: '#C4A35A',
  goldD: '#B8860B',
  paper: '#FDF8F0',
  paperL: '#F5EFE0',
  paperO: '#EDE4D3',
  ink: '#2C1810',
  inkL: '#5C4033',
  herb: '#228B22',
};

export default function GuashaPage() {
  const [activeTab, setActiveTab] = useState<TabId>('theory');
  const [search, setSearch] = useState('');
  const [meridianFilter, setMeridianFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const [zhangxqExpanded, setZhangxqExpanded] = useState<Set<number>>(new Set());

  const toggleExpand = (i: number, set: React.Dispatch<React.SetStateAction<Set<number>>>) => {
    set(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const filteredMeridians = useMemo(() => {
    if (meridianFilter === 'all') return MERIDIANS;
    return MERIDIANS.filter(m => m.category === meridianFilter);
  }, [meridianFilter]);

  const filteredAcupoints = useMemo(() => {
    if (!search) return ACUPOINTS;
    const q = search.toLowerCase();
    // 症状同义词扩展
    const expandedTerms = normalizeSymptom(q);
    const allTerms = [q, ...expandedTerms.filter(t => t !== q)];
    return ACUPOINTS.filter(a =>
      allTerms.some(term =>
        a.name.includes(term) || a.meridianLabel.includes(term) ||
        a.rows.some(r => r.value.toLowerCase().includes(term))
      )
    );
  }, [search]);

  const filteredDiseases = useMemo(() => {
    let list = DISEASES;
    if (diseaseFilter !== 'all') list = list.filter(d => d.category === diseaseFilter);
    if (search) {
      const q = search.toLowerCase();
      // 症状同义词扩展
      const expandedTerms = normalizeSymptom(q);
      const allTerms = [q, ...expandedTerms.filter(t => t !== q)];
      list = list.filter(d => allTerms.some(term => d.name.includes(term) || (d.keyPoints && d.keyPoints.includes(term))));
    }
    return list;
  }, [diseaseFilter, search]);

  const filteredZhangxq = useMemo(() => {
    if (!search) return ZHANGXQ.conditions;
    const q = search.toLowerCase();
    // 症状同义词扩展
    const expandedTerms = normalizeSymptom(q);
    const allTerms = [q, ...expandedTerms.filter(t => t !== q)];
    return ZHANGXQ.conditions.filter(c => allTerms.some(term => c.name.includes(term) || c.rows.some(r => r.value.toLowerCase().includes(term))));
  }, [search]);

  const InfoRows = ({ rows }: { rows: InfoRow[] }) => (
    <div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', borderBottom: `1px dashed ${C.paperO}`, padding: '5px 0' }}>
          <span style={{
            minWidth: 80, fontWeight: 600, color: C.zhusha,
            background: 'linear-gradient(90deg, rgba(196,163,90,0.15), transparent)',
            padding: '2px 8px 2px 6px', borderLeft: `2px solid ${C.goldD}`,
            marginRight: 8, fontSize: '0.88em',
          }}>{r.label}</span>
          <span style={{ flex: 1, color: C.inkL }}>{r.value}</span>
        </div>
      ))}
    </div>
  );

  const Quote = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{
      background: 'linear-gradient(90deg, rgba(196,163,90,0.1), rgba(237,228,211,0.4), rgba(196,163,90,0.1))',
      borderLeft: `3px solid ${C.zhushaL}`, borderRight: `1px solid ${C.gold}`,
      padding: '12px 16px', margin: '10px 0', fontStyle: 'italic',
      ...style,
    }}>
      {children}
    </div>
  );

  const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{
      background: 'linear-gradient(145deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)',
      border: `2px solid ${C.gold}`, borderRadius: 8, position: 'relative',
      overflow: 'hidden', boxShadow: '0 2px 12px rgba(92,26,0,0.08)',
      transition: 'transform 0.3s, box-shadow 0.3s', padding: 16, marginBottom: 14,
      ...style,
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: C.zhusha }} />
      {children}
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      fontFamily: 'serif', fontSize: '1.5em', color: C.zhusha, margin: '20px 0 12px',
      letterSpacing: 3, display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ width: 4, height: 28, background: C.zhusha, borderRadius: 2, display: 'inline-block' }} />
      {children}
    </div>
  );

  const SubTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      fontFamily: 'serif', fontSize: '1.15em', color: C.zhushaL, margin: '16px 0 8px',
      paddingLeft: 12, borderLeft: `3px solid ${C.gold}`,
    }}>
      {children}
    </div>
  );

  const Seal = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <span style={{
      display: 'inline-block', padding: '4px 8px', border: `2px solid ${C.zhusha}`,
      color: C.zhusha, fontSize: '0.75em', fontWeight: 700, transform: 'rotate(-3deg)',
      letterSpacing: 2, background: 'rgba(92,26,0,0.04)', margin: '2px 4px',
      ...style,
    }}>{children}</span>
  );

  const TheoryBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{
      background: 'linear-gradient(135deg, #FDF8F0, #F5EFE0)',
      border: `1px solid ${C.paperO}`, borderTop: `2px solid ${C.zhushaL}`,
      padding: '14px 18px', margin: '10px 0', borderRadius: 4,
    }}>
      <strong>{title}</strong>
      {children}
    </div>
  );

  const CaseBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{
      background: 'linear-gradient(180deg, #F5EFE0, #EDE4D3)',
      border: `1px solid ${C.goldD}`, borderRadius: 6, padding: '12px 16px', margin: '10px 0',
    }}>
      <strong>{title}</strong>
      {children}
    </div>
  );

  const Tbl = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
    <div style={{ overflowX: 'auto', margin: '10px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86em', lineHeight: 1.7 }}>
        <thead>
          <tr>{headers.map((h, i) => (
            <th key={i} style={{
              background: C.zhusha, color: C.paper, padding: '8px 12px',
              fontWeight: 600, border: `1px solid ${C.zhushaL}`, whiteSpace: 'nowrap',
            }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(196,163,90,0.06)' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '7px 12px', border: `1px solid ${C.paperO}`, whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTheory = () => (
    <>
      <div style={{
        width: '100%', height: 240, borderRadius: 12, overflow: 'hidden',
        border: `2px solid ${C.gold}`, position: 'relative', marginBottom: 24,
        background: 'linear-gradient(135deg, #3E1200 0%, #5C1A00 30%, #8B2500 60%, #5C1A00 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(62,18,0,0.6), rgba(92,26,0,0.4))',
        }}>
          <h1 style={{ fontFamily: 'serif', fontSize: '2.4em', color: C.paper, letterSpacing: 12, textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>传统刮痧</h1>
          <p style={{ color: C.gold, letterSpacing: 6, marginTop: 8 }}>千年底蕴 · 调和阴阳 · 疏通经络</p>
        </div>
      </div>

      <SectionTitle>核心原理</SectionTitle>
      <Card style={{ padding: 20 }}>
        <Quote>{THEORY.corePrinciple.quote}</Quote>
        <p style={{ marginTop: 12 }}>{THEORY.corePrinciple.description}</p>
        <TheoryBox title="理论基础">
          {THEORY.corePrinciple.foundations.map((f, i) => (
            <div key={i} style={{ display: 'flex', borderBottom: `1px dashed ${C.paperO}`, padding: '6px 0' }}>
              <span style={{ minWidth: 80, fontWeight: 600, color: C.zhusha, background: 'linear-gradient(90deg, rgba(196,163,90,0.15), transparent)', padding: '2px 8px 2px 6px', borderLeft: `2px solid ${C.goldD}`, marginRight: 8, fontSize: '0.9em' }}>{f.label}</span>
              <span style={{ flex: 1, color: C.inkL }}>{f.value}</span>
            </div>
          ))}
        </TheoryBox>
      </Card>

      <SectionTitle>刮痧机制</SectionTitle>
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {THEORY.mechanisms.map((m, i) => (
            <TheoryBox key={i} title="">
              <div style={{ color: C.zhusha, fontWeight: 700, marginBottom: 6 }}>{m.icon} {m.title}</div>
              <p style={{ fontSize: '0.88em' }}>{m.desc}</p>
            </TheoryBox>
          ))}
        </div>
      </Card>

      <SectionTitle>刮痧工具</SectionTitle>
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {THEORY.tools.map((t, i) => (
            <TheoryBox key={i} title="">
              <div style={{ color: C.zhusha, fontWeight: 700 }}>{t.name}</div>
              <InfoRows rows={t.rows} />
            </TheoryBox>
          ))}
        </div>
      </Card>

      <SectionTitle>刮痧手法</SectionTitle>
      <Card style={{ padding: 20 }}><Tbl headers={THEORY.techniques.headers} rows={THEORY.techniques.rows} /></Card>

      <SectionTitle>补泻法对比</SectionTitle>
      <Card style={{ padding: 20 }}>
        <Tbl headers={THEORY.bushaxieMethod.headers} rows={THEORY.bushaxieMethod.rows} />
        <Quote>{THEORY.bushaxieMethod.quote}</Quote>
      </Card>

      <SectionTitle>刮痧七要素</SectionTitle>
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {THEORY.sevenElements.map((e, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', borderBottom: `1px dashed ${C.paperO}`, padding: '4px 0' }}>
              <span style={{ fontWeight: 600, color: C.zhusha, background: 'linear-gradient(90deg, rgba(196,163,90,0.15), transparent)', padding: '2px 8px 2px 6px', borderLeft: `2px solid ${C.goldD}`, marginRight: 8, fontSize: '0.9em', minWidth: 80 }}>{e.label}</span>
              <span style={{ color: C.inkL, marginTop: 4 }}>{e.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );

  const renderClassics = () => (
    <>
      <SectionTitle>典籍溯源</SectionTitle>
      <p style={{ marginBottom: 16, color: C.inkL }}>刮痧疗法历史悠久，源自上古，历经数千年传承发展：</p>
      {CLASSICS.map((c, i) => (
        <Card key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <Seal>{c.era}</Seal>
            <strong style={{ color: C.zhusha, fontSize: '1.05em', fontFamily: 'serif' }}>{c.title}</strong>
          </div>
          {c.quote && <Quote style={{ margin: 0 }}>{c.quote}</Quote>}
          <InfoRows rows={c.rows} />
        </Card>
      ))}
    </>
  );

  const renderMeridian = () => (
    <>
      <SectionTitle>经络刮法</SectionTitle>
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {MERIDIAN_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setMeridianFilter(c.id)} style={{
            padding: '5px 14px', border: `1px solid ${C.goldD}`, borderRadius: 20,
            background: meridianFilter === c.id ? C.zhusha : 'transparent',
            color: meridianFilter === c.id ? C.paper : C.inkL,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85em',
            transition: 'all 0.3s',
          }}>{c.label}</button>
        ))}
      </div>
      {filteredMeridians.map((m, i) => (
        <Card key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 3,
              fontSize: '0.82em', fontWeight: 600, margin: '2px 3px',
              background: '#EFEBE9', color: '#3E2723', border: '1px solid #BCAAA4',
            }}>{m.categoryLabel}</span>
            <strong style={{ fontFamily: 'serif', fontSize: '1.2em', color: C.zhusha }}>{m.name}</strong>
            {m.seal && <Seal>{m.seal}</Seal>}
          </div>
          <InfoRows rows={m.rows} />
          {m.quote && <Quote>{m.quote}</Quote>}
          {m.theory && <TheoryBox title="理论解析"><p style={{ fontSize: '0.88em', marginTop: 6 }}>{m.theory}</p></TheoryBox>}
          {m.clinicalCase && <CaseBox title="临床案例"><p style={{ fontSize: '0.88em', marginTop: 6 }}>{m.clinicalCase}</p></CaseBox>}
        </Card>
      ))}
    </>
  );

  const renderAcupoint = () => (
    <>
      <SectionTitle>穴位刮法</SectionTitle>
      <div style={{ position: 'relative', marginBottom: 12, maxWidth: 400 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索穴位名称、归经、主治..."
          style={{
            width: '100%', padding: '10px 14px 10px 40px', border: `2px solid ${C.gold}`,
            borderRadius: 6, background: C.paper, color: C.ink, fontFamily: 'inherit',
            fontSize: '0.95em', outline: 'none',
          }} />
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.goldD }}>🔍</span>
      </div>
      <TheoryBox title="骨度分寸定位法与手指同身寸">
        <p style={{ fontSize: '0.88em' }}>骨度分寸法是以患者骨节为主要标志，规定出一定的折量寸数，作为量取腧穴的标准。常用折量标准：前发际至后发际12寸；眉心至前发际3寸；第7颈椎至尾骶21椎（每椎折算约1寸）；胸骨下端至脐中8寸；脐中至耻骨联合上缘5寸；腋前纹头至肘横纹9寸；肘横纹至腕横纹12寸；股骨大转子至膝中19寸；膝中至外踝尖16寸；外踝尖至足底3寸。</p>
        <p style={{ marginTop: 8, fontSize: '0.88em' }}><strong>手指同身寸法：</strong>①中指同身寸——中指中节桡侧两端纹头之间为1寸；②拇指同身寸——拇指指间关节横度为1寸；③横指同身寸（一夫法）——四指并拢，中指中节横纹宽度为3寸。取穴时以患者自身手指为度，更为准确。</p>
      </TheoryBox>
      {filteredAcupoints.map((a, i) => (
        <Card key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 3, fontSize: '0.82em', fontWeight: 600, background: '#EFEBE9', color: '#3E2723', border: '1px solid #BCAAA4' }}>{a.meridianLabel}</span>
            <strong style={{ fontFamily: 'serif', fontSize: '1.15em', color: C.zhusha }}>{a.name}</strong>
            {a.seal && <Seal>{a.seal}</Seal>}
          </div>
          <InfoRows rows={a.rows} />
          {a.quote && <Quote>{a.quote}</Quote>}
          {a.theory && <TheoryBox title="理论解析"><p style={{ fontSize: '0.88em', marginTop: 6 }}>{a.theory}</p></TheoryBox>}
        </Card>
      ))}
    </>
  );

  const renderRegion = () => (
    <>
      <SectionTitle>部位刮法</SectionTitle>
      {REGIONS.map((r, i) => (
        <Card key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <strong style={{ fontFamily: 'serif', fontSize: '1.15em', color: C.zhusha }}>{r.icon} {r.name}</strong>
            {r.seal && <Seal>{r.seal}</Seal>}
          </div>
          <InfoRows rows={r.rows} />
        </Card>
      ))}
    </>
  );

  const renderDisease = () => (
    <>
      <SectionTitle>辨证方案</SectionTitle>
      <div style={{ position: 'relative', marginBottom: 12, maxWidth: 400 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索疾病名称..."
          style={{
            width: '100%', padding: '10px 14px 10px 40px', border: `2px solid ${C.gold}`,
            borderRadius: 6, background: C.paper, color: C.ink, fontFamily: 'inherit',
            fontSize: '0.95em', outline: 'none',
          }} />
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.goldD }}>🔍</span>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {DISEASE_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setDiseaseFilter(c.id)} style={{
            padding: '5px 14px', border: `1px solid ${C.goldD}`, borderRadius: 20,
            background: diseaseFilter === c.id ? C.zhusha : 'transparent',
            color: diseaseFilter === c.id ? C.paper : C.inkL,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85em',
          }}>{c.label}</button>
        ))}
      </div>
      {filteredDiseases.map((d, i) => {
        const isOpen = expanded.has(i);
        return (
          <Card key={i} style={{ padding: 0 }}>
            <button onClick={() => toggleExpand(i, setExpanded)} style={{
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', width: '100%', border: 'none',
              background: 'linear-gradient(90deg, rgba(92,26,0,0.08), rgba(196,163,90,0.1), transparent)',
              borderRadius: '8px 8px 0 0', borderBottom: `1px solid ${C.paperO}`,
              fontFamily: 'inherit', color: C.zhusha, fontWeight: 700, fontSize: '1.05em',
            }}>
              <span>{d.name}</span>
              <span style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s', color: C.zhushaL }}>▶</span>
            </button>
            {isOpen && (
              <div style={{ padding: '12px 16px' }}>
                {d.keyPoints && <InfoRows rows={[{ label: '辨证要点', value: d.keyPoints }]} />}
                {d.plan && <InfoRows rows={[{ label: '刮痧方案', value: d.plan }]} />}
                {d.technique && <InfoRows rows={[{ label: '手法', value: d.technique }]} />}
                {d.extraRows && <InfoRows rows={d.extraRows} />}
                {d.subtypes && (
                  <Tbl
                    headers={['分型', '辨证要点', '刮痧方案']}
                    rows={d.subtypes.map(s => [s.name, s.keyPoints, s.plan])}
                  />
                )}
                {d.quote && <Quote>{d.quote}</Quote>}
                {d.theory && <TheoryBox title="理论解析"><p style={{ fontSize: '0.88em', marginTop: 6 }}>{d.theory}</p></TheoryBox>}
                {d.clinicalCase && <CaseBox title="案例"><p style={{ fontSize: '0.88em', marginTop: 6 }}>{d.clinicalCase}</p></CaseBox>}
              </div>
            )}
          </Card>
        );
      })}
    </>
  );

  const renderStandard = () => (
    <>
      <SectionTitle>操作规范</SectionTitle>

      <SubTitle>操作环境与体位</SubTitle>
      <Card><InfoRows rows={STANDARD.environment} /></Card>

      <SubTitle>操作步骤五步法</SubTitle>
      <Card><Tbl headers={STANDARD.fiveSteps.headers} rows={STANDARD.fiveSteps.rows} /></Card>

      <SubTitle>禁忌症</SubTitle>
      <Card><Tbl headers={STANDARD.contraindications.headers} rows={STANDARD.contraindications.rows} /></Card>

      <SubTitle>注意事项七条</SubTitle>
      <Card>
        {STANDARD.precautions.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', borderBottom: `1px dashed ${C.paperO}`, padding: '6px 0' }}>
            <span style={{ fontWeight: 600, color: C.zhusha, background: 'linear-gradient(90deg, rgba(196,163,90,0.15), transparent)', padding: '2px 8px 2px 6px', borderLeft: `2px solid ${C.goldD}`, marginRight: 8, fontSize: '0.9em', minWidth: 40, display: 'inline-block' }}>{p.label}</span>
            <span style={{ color: C.inkL, marginTop: 4 }}>{p.value}</span>
          </div>
        ))}
      </Card>

      <SubTitle>刮后护理</SubTitle>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {STANDARD.postCare.map((c, i) => (
            <TheoryBox key={i} title="">
              <div style={{ color: C.zhusha, fontWeight: 700 }}>{c.icon} {c.title}</div>
              <p style={{ fontSize: '0.88em', marginTop: 4 }}>{c.desc}</p>
            </TheoryBox>
          ))}
        </div>
      </Card>

      <SubTitle>特殊人群注意</SubTitle>
      <Card><Tbl headers={STANDARD.specialPopulations.headers} rows={STANDARD.specialPopulations.rows} /></Card>
    </>
  );

  const renderCases = () => (
    <>
      <SectionTitle>临床案例集</SectionTitle>
      {CASES.map((c, i) => (
        <Card key={i}>
          <div style={{ color: C.zhusha, fontWeight: 700, fontSize: '1.05em', marginBottom: 10 }}>{c.title}</div>
          <CaseBox title="">
            <InfoRows rows={c.rows} />
          </CaseBox>
        </Card>
      ))}
    </>
  );

  const renderZhangxq = () => (
    <>
      <SectionTitle>张秀勤全息刮痧</SectionTitle>

      <Card style={{ padding: 20 }}>
        <Quote style={{ marginTop: 0 }}>{ZHANGXQ.intro.quote}</Quote>
        <TheoryBox title="核心理论三大支柱">
          {ZHANGXQ.intro.pillars.map((p, i) => (
            <div key={i} style={{ display: 'flex', borderBottom: `1px dashed ${C.paperO}`, padding: '6px 0' }}>
              <span style={{ minWidth: 80, fontWeight: 600, color: C.zhusha, background: 'linear-gradient(90deg, rgba(196,163,90,0.15), transparent)', padding: '2px 8px 2px 6px', borderLeft: `2px solid ${C.goldD}`, marginRight: 8, fontSize: '0.9em' }}>{p.label}</span>
              <span style={{ flex: 1, color: C.inkL }}>{p.value}</span>
            </div>
          ))}
        </TheoryBox>
      </Card>

      <SubTitle>三级刮痧术</SubTitle>
      <Card><Tbl headers={ZHANGXQ.threeLevels.headers} rows={ZHANGXQ.threeLevels.rows} /></Card>

      <SubTitle>六种特色手法</SubTitle>
      <Card><Tbl headers={ZHANGXQ.sixTechniques.headers} rows={ZHANGXQ.sixTechniques.rows} /></Card>

      <SubTitle>全息穴区体系</SubTitle>
      {ZHANGXQ.holographicZones.map((z, i) => {
        const isOpen = zhangxqExpanded.has(i);
        return (
          <Card key={i} style={{ padding: 0 }}>
            <button onClick={() => toggleExpand(i, setZhangxqExpanded)} style={{
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', width: '100%', border: 'none',
              background: 'linear-gradient(90deg, rgba(92,26,0,0.08), rgba(196,163,90,0.1), transparent)',
              borderBottom: `1px solid ${C.paperO}`, fontFamily: 'inherit',
            }}>
              <span><strong>{z.icon} {z.name}</strong> — {z.subtitle}</span>
              <span style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s', color: C.zhushaL }}>▶</span>
            </button>
            {isOpen && <div style={{ padding: '12px 16px' }}><InfoRows rows={z.rows} /></div>}
          </Card>
        );
      })}

      <SubTitle>痧象诊断法</SubTitle>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Seal>诊断核心</Seal>
          <strong style={{ color: C.zhusha }}>痧象是机体状态的镜子</strong>
        </div>
        <Tbl headers={ZHANGXQ.shaDiagnosis.table.headers} rows={ZHANGXQ.shaDiagnosis.table.rows} />
      </Card>

      <SubTitle>病症方案</SubTitle>
      <div style={{ position: 'relative', marginBottom: 12, maxWidth: 400 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索病症..."
          style={{
            width: '100%', padding: '10px 14px 10px 40px', border: `2px solid ${C.gold}`,
            borderRadius: 6, background: C.paper, color: C.ink, fontFamily: 'inherit',
            fontSize: '0.95em', outline: 'none',
          }} />
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.goldD }}>🔍</span>
      </div>
      {filteredZhangxq.map((c, i) => (
        <Card key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <strong style={{ color: C.zhusha, fontSize: '1.05em' }}>{c.name}</strong>
            {c.seal && <Seal>{c.seal}</Seal>}
          </div>
          <InfoRows rows={c.rows} />
        </Card>
      ))}

      <SubTitle>九种体质刮痧诊测</SubTitle>
      <Card>
        <p style={{ marginBottom: 10, color: C.inkL }}>{ZHANGXQ.nineConstitutions.intro}</p>
        <Tbl headers={ZHANGXQ.nineConstitutions.headers} rows={ZHANGXQ.nineConstitutions.rows} />
      </Card>

      <SubTitle>刮痧搭档理论</SubTitle>
      <Card>
        <Quote style={{ marginTop: 0 }}>{ZHANGXQ.partnerTheory.quote}</Quote>
        <Tbl headers={ZHANGXQ.partnerTheory.headers} rows={ZHANGXQ.partnerTheory.rows} />
      </Card>

      <SubTitle>脊椎检查法</SubTitle>
      <Card>
        <p style={{ marginBottom: 10, color: C.inkL }}>{ZHANGXQ.spineCheck.intro}</p>
        <Tbl headers={ZHANGXQ.spineCheck.headers} rows={ZHANGXQ.spineCheck.rows} />
      </Card>

      <SubTitle>日常保健方案</SubTitle>
      <Card>
        <Tbl headers={ZHANGXQ.seasonalCare.headers} rows={ZHANGXQ.seasonalCare.rows} />
        <Quote>{ZHANGXQ.seasonalCare.quote}</Quote>
        <TheoryBox title="日常保健要点">
          {ZHANGXQ.seasonalCare.dailyTips.map((t, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', borderBottom: `1px dashed ${C.paperO}`, padding: '4px 0' }}>
              <span style={{ fontWeight: 600, color: C.zhusha, background: 'linear-gradient(90deg, rgba(196,163,90,0.15), transparent)', padding: '2px 8px 2px 6px', borderLeft: `2px solid ${C.goldD}`, marginRight: 8, fontSize: '0.9em', minWidth: 50, display: 'inline-block' }}>{t.label}</span>
              <span style={{ color: C.inkL, marginTop: 4 }}>{t.value}</span>
            </div>
          ))}
        </TheoryBox>
      </Card>
    </>
  );

  const tabRenderers: Record<TabId, () => React.ReactNode> = {
    theory: renderTheory,
    classics: renderClassics,
    meridian: renderMeridian,
    acupoint: renderAcupoint,
    region: renderRegion,
    disease: renderDisease,
    standard: renderStandard,
    cases: renderCases,
    zhangxq: renderZhangxq,
  };

  return (
    <PageContainer theme="healing">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex" style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 200, zIndex: 40,
        background: 'linear-gradient(180deg, #3E1200, #5C1A00, #3E1200)',
        borderRight: `2px solid ${C.gold}`, flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 16px', textAlign: 'center', borderBottom: '1px solid rgba(196,163,90,0.3)' }}>
          <Link href="/healing" style={{ color: C.gold, fontSize: '0.8em', textDecoration: 'none', display: 'block', marginBottom: 8 }}>← 返回疗愈</Link>
          <h1 style={{ fontFamily: 'serif', color: C.paper, fontSize: '1.3em', letterSpacing: 4 }}>传统刮痧</h1>
          <p style={{ color: C.gold, fontSize: '0.7em', letterSpacing: 2, marginTop: 4 }}>宣纸水墨 · 医馆雅集</p>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {GUASHA_TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch(''); }}
              style={{
                display: 'flex', alignItems: 'center', padding: '10px 16px', cursor: 'pointer',
                color: activeTab === tab.id ? C.paper : 'rgba(253,248,240,0.7)',
                fontSize: '0.88em', transition: 'all 0.3s', position: 'relative',
                borderLeft: activeTab === tab.id ? `3px solid ${C.gold}` : '3px solid transparent',
                background: activeTab === tab.id ? 'rgba(196,163,90,0.15)' : 'transparent',
                width: '100%', borderRight: 'none', borderTop: 'none', borderBottom: 'none',
                fontFamily: 'inherit',
              }}>
              <span style={{ width: 24, textAlign: 'center', marginRight: 8, fontSize: '0.9em' }}>{tab.icon}</span>
              <span style={{ letterSpacing: 1 }}>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: 12, textAlign: 'center' }}>
          <Seal style={{ fontSize: '0.65em' }}>传承国术</Seal>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-[200px] pb-20 md:pb-4" style={{ position: 'relative', zIndex: 1 }}>
        {/* Mobile Header */}
        <div className="md:hidden">
          <HealingHeader title="传统刮痧" subtitle="宣纸水墨 · 医馆雅集" dark />
        </div>

        <div style={{ padding: '24px 24px', maxWidth: 1100, margin: '0 auto' }}
          className="md:p-6 p-4">
          <div key={activeTab} style={{ animation: 'fadeIn 0.4s ease' }}>
            {tabRenderers[activeTab]()}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Tabs */}
      <div className="md:hidden" style={{
        position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 50,
        background: 'linear-gradient(180deg, #3E1200, #5C1A00)',
        borderTop: `2px solid ${C.gold}`, overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ display: 'flex', whiteSpace: 'nowrap', padding: '4px 0' }}>
          {GUASHA_TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch(''); }}
              style={{
                flex: 1, minWidth: 70, textAlign: 'center', padding: '8px 4px 6px',
                color: activeTab === tab.id ? C.gold : 'rgba(253,248,240,0.6)',
                fontSize: '0.72em', cursor: 'pointer', transition: 'color 0.3s',
                borderTop: activeTab === tab.id ? `2px solid ${C.gold}` : '2px solid transparent',
                background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
                fontFamily: 'inherit',
              }}>
              <span style={{ display: 'block', fontSize: '1.1em', marginBottom: 2 }}>{tab.icon}</span>
              {tab.mobileLabel}
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </PageContainer>
  );
}
