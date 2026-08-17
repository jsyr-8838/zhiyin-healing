import {
  ELEMENT_COLORS,
  type MeihuaJson, type LiuyaoJson, type LiuyaoLine,
  type QimenJson, type QimenPalace, type DaliurenJson,
  type BaziJson, type BaziPillar, type BaziDayunItem,
  type XiaoliurenJson, type XiaoliurenPosition,
  type ZiweiJson, type ZiweiPalace,
  type TaiyiJson, type TarotJson, type TarotCard,
} from './types';

export function MeihuaResult({ j, summary }: { j: MeihuaJson; summary: string }) {
  const mainHex = j?.mainHexagram || j?.hexagram;
  const upperGua = j?.upperGua || mainHex?.upper || '?';
  const lowerGua = j?.lowerGua || mainHex?.lower || '?';
  const movingLine = j?.movingLine || '?';
  const upperElement = j?.upperElement || '?';
  const lowerElement = j?.lowerElement || '?';

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-900">主卦 · {mainHex?.name || summary}</h4>
          {mainHex?.element && (
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
              {mainHex.element}行·{mainHex.keyword || ''}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">上卦</p>
            <p className="font-bold text-lg">{upperGua}</p>
            <p className="text-xs text-gray-400">{upperElement}</p>
          </div>
          <div className="text-3xl text-gray-300">⇅</div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">下卦</p>
            <p className="font-bold text-lg">{lowerGua}</p>
            <p className="text-xs text-gray-400">{lowerElement}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">动爻第{movingLine}爻</span>
        </div>
        {mainHex?.judgment && (
          <p className="text-xs text-gray-500 mt-2 italic">&quot;{mainHex.judgment}&quot;</p>
        )}
      </div>
      {j?.interHexagram && (
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: '主卦', name: j.mainHexagram?.name, el: j.mainHexagram?.element },
            { label: '互卦', name: j.interHexagram?.name, el: j.interHexagram?.element },
            { label: '变卦', name: j.changedHexagram?.name, el: j.changedHexagram?.element },
            { label: '错卦/综卦', name: j.cuoHexagram?.name || j.zongHexagram?.name, el: j.cuoHexagram?.element || j.zongHexagram?.element },
          ].filter(g => g.name).map(g => (
            <div key={g.label} className="bg-white rounded-lg p-2 border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400">{g.label}</p>
              <p className="font-bold text-sm text-gray-900">{g.name}</p>
              {g.el && <p className="text-[10px] text-gray-400">{g.el}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LiuyaoResult({ j, summary, text }: { j: LiuyaoJson; summary: string; text: string }) {
  const lines = j?.lines || [];
  const hexName = j?.mainHexagram || j?.hexagramName || summary;
  const gongName = j?.gongName || j?.gong || '';
  const changedName = j?.changedHexagram?.name || j?.changedHexagramName || '';

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-900">六爻 · {hexName}</h4>
        {gongName && <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{gongName}宫</span>}
      </div>
      {lines.length > 0 ? (
        <div className="space-y-1">
          <div className="grid grid-cols-6 gap-1 text-[10px] text-gray-400 font-bold px-1">
            <span>六神</span><span>六亲</span><span>爻象</span><span>地支</span><span></span><span>世应</span>
          </div>
          {lines.slice().reverse().map((line: LiuyaoLine, idx: number) => (
            <div key={idx} className={`grid grid-cols-6 gap-1 px-1 py-1 rounded text-sm
              ${line.isMoving ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}
              ${line.shiYing === '世' ? 'ring-1 ring-emerald-300' : ''}
              ${line.shiYing === '应' ? 'ring-1 ring-blue-300' : ''}`}>
              <span className="text-gray-500 text-xs">{line.liuShen || line.liushen}</span>
              <span className={`text-xs font-bold ${
                line.liuQin === '妻财' ? 'text-amber-600' :
                line.liuQin === '官鬼' ? 'text-red-600' :
                line.liuQin === '父母' ? 'text-blue-600' :
                line.liuQin === '子孙' ? 'text-emerald-600' : 'text-gray-600'
              }`}>{line.liuQin}</span>
              <span className="font-mono text-gray-800">
                {line.yinYang === '阳' ? '━━━' : '━ ━'}
                {line.isMoving && <span className="text-amber-500">○</span>}
              </span>
              <span className="text-gray-600 text-xs">{line.diZhi}</span>
              <span className="text-xs text-gray-400">{line.position}</span>
              <span className={`text-xs font-bold ${
                line.shiYing === '世' ? 'text-emerald-600' :
                line.shiYing === '应' ? 'text-blue-600' : 'text-transparent'
              }`}>{line.shiYing || '·'}</span>
            </div>
          ))}
        </div>
      ) : (
        <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{text}</pre>
      )}
      {changedName && (
        <div className="mt-2 text-xs text-gray-500">变卦：{changedName}</div>
      )}
    </div>
  );
}

export function QimenResult({ j, text }: { j: QimenJson; text: string }) {
  const dunType = j?.dunType || j?.yinYang || '';
  const juNumber = j?.juNumber || j?.ju || '';
  const palaces = j?.palaces || [];
  const layout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-900">奇门遁甲 · {dunType}{juNumber}局</h4>
        <span className="text-xs text-gray-500">
          值符{j?.zhiFu || ''} 值使{j?.zhiShi || ''}
        </span>
      </div>
      {palaces.length > 0 ? (
        <div className="grid grid-cols-3 gap-1">
          {layout.flat().map(pos => {
            const palace = palaces.find((p: QimenPalace) => p.position === pos || p.gong === pos);
            if (pos === 5) {
              return (
                <div key={pos} className="bg-gray-100 rounded-lg p-2 text-center border border-gray-200 min-h-[90px] flex flex-col justify-center">
                  <p className="text-xs text-gray-400">中宫</p>
                  <p className="font-bold text-sm">天禽</p>
                </div>
              );
            }
            return (
              <div key={pos} className="bg-gray-50 rounded-lg p-2 border border-gray-200 min-h-[90px]">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-gray-400">{pos}宫</span>
                  <span className="text-[10px] text-purple-600 font-bold">{palace?.shen}</span>
                </div>
                <p className="font-bold text-xs text-gray-900">{palace?.tianGan}</p>
                <p className="text-[10px] text-amber-700">⊙{palace?.men}</p>
                <p className="text-[10px] text-blue-600">★{palace?.xing}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{text}</pre>
      )}
    </div>
  );
}

export function DaliurenResult({ j, text }: { j: DaliurenJson; text: string }) {
  const firstChuan = j?.firstChuan || j?.chuChuan?.[0] || '';
  const secondChuan = j?.secondChuan || j?.chuChuan?.[1] || '';
  const thirdChuan = j?.thirdChuan || j?.chuChuan?.[2] || '';

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-900">大六壬 · 四课三传</h4>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: '初传', value: firstChuan },
          { label: '中传', value: secondChuan },
          { label: '末传', value: thirdChuan },
        ].map(c => (
          <div key={c.label} className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
            <p className="text-xs text-purple-400">{c.label}</p>
            <p className="font-bold text-lg text-purple-700">
              {typeof c.value === 'object' ? c.value?.ganZhi || c.value?.name || JSON.stringify(c.value) : c.value || '?'}
            </p>
          </div>
        ))}
      </div>
      <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg overflow-auto max-h-60">{text}</pre>
    </div>
  );
}

export function BaziResult({ j }: { j: BaziJson }) {
  const pillars = [
    { label: '年柱', key: 'yearPillar' },
    { label: '月柱', key: 'monthPillar' },
    { label: '日柱', key: 'dayPillar' },
    { label: '时柱', key: 'hourPillar' },
  ] as const;

  const wuxingCount = j?.wuxingCount || j?.fiveElementsCount || { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-900">八字命盘</h4>
        {j?.animal && <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">{j.animal}年</span>}
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {pillars.map(p => {
          const pillar = j?.[p.key];
          if (!pillar) return (
            <div key={p.label} className="rounded-xl p-3 text-center border bg-gray-50 border-gray-100">
              <p className="text-[10px] text-gray-400 mb-1">{p.label}</p>
              <p className="font-bold text-lg text-gray-300">--</p>
            </div>
          );
          return (
            <div key={p.label} className={`rounded-xl p-3 text-center border
              ${p.label === '日柱' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
              <p className="text-[10px] text-gray-400 mb-1">{p.label}</p>
              <p className="font-black text-2xl text-gray-900">{pillar.gan}</p>
              <p className="font-bold text-lg text-gray-700">{pillar.zhi}</p>
              {pillar.naYin && <p className="text-[10px] text-gray-400 mt-1">{pillar.naYin}</p>}
              {p.label === '日柱' && <p className="text-[10px] font-bold mt-0.5 text-amber-600">日主</p>}
            </div>
          );
        })}
      </div>
      <div className="flex items-end justify-around px-2 py-2 bg-gray-50 rounded-lg">
        {(['木', '火', '土', '金', '水'] as const).map(el => {
          const count = Number(wuxingCount[el]) || 0;
          const maxCount = Math.max(...Object.values(wuxingCount).map(Number), 1);
          return (
            <div key={el} className="flex flex-col items-center gap-1">
              <div className={`w-8 rounded-t ${ELEMENT_COLORS[el] || 'bg-gray-300'}`}
                style={{ height: `${(count / maxCount) * 40 + 4}px` }} />
              <span className="text-xs font-bold">{el}</span>
              <span className="text-[10px] text-gray-400">{count}</span>
            </div>
          );
        })}
      </div>
      {(j?.dayMaster || j?.dayMasterElement) && (
        <div className="mt-2 text-center text-xs text-gray-500">
          日主：{j.dayMaster || ''}({j.dayMasterElement || ''})
        </div>
      )}
      {j?.dayun && (
        <div className="mt-3">
          <p className="text-xs font-bold text-gray-600 mb-1">大运</p>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(j.dayun) ? j.dayun.map((d: string | BaziDayunItem, i: number) => (
              <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                {typeof d === 'string' ? d : d?.ganZhi || d?.name || JSON.stringify(d)}
              </span>
            )) : (
              <pre className="text-xs text-gray-500 whitespace-pre-wrap">{JSON.stringify(j.dayun, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function XiaoliurenResult({ j, summary, text }: { j: XiaoliurenJson; summary: string; text: string }) {
  const positions = j?.positions || [
    { label: '大安', name: j?.daAn || j?.name1 || j?.firstPosition },
    { label: '留连', name: j?.liuLian || j?.name2 || j?.secondPosition },
    { label: '速喜', name: j?.suXi || j?.name3 || j?.thirdPosition },
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h4 className="font-bold text-gray-900 mb-3">小六壬 · {j?.name || summary}</h4>
      <div className="grid grid-cols-3 gap-2">
        {positions.map((p: XiaoliurenPosition, i: number) => (
          <div key={i} className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
            <p className="text-xs text-emerald-400">{p.label || `第${i + 1}位`}</p>
            <p className="font-bold text-lg text-emerald-700">{p.name || '?'}</p>
          </div>
        ))}
      </div>
      <pre className="mt-3 text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{text}</pre>
    </div>
  );
}

export function ZiweiResult({ j, text }: { j: ZiweiJson; text: string }) {
  const palaces = j?.palaces || j?.gong || [];
  const mingGong = j?.mingGong || j?.命宫 || '';

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-900">紫微斗数 · 命宫{mingGong}</h4>
      </div>
      {Array.isArray(palaces) && palaces.length > 0 ? (
        <div className="grid grid-cols-4 gap-1.5">
          {palaces.slice(0, 12).map((p: ZiweiPalace, i: number) => (
            <div key={i} className="bg-purple-50 rounded-lg p-2 text-center border border-purple-100 min-h-[60px]">
              <p className="text-[10px] text-purple-400">{p.name || p.gongName || `宫${i + 1}`}</p>
              <p className="font-bold text-xs text-purple-700">{p.mainStar || p.star || p.zhuXing || ''}</p>
              {p.subStar && <p className="text-[9px] text-purple-400">{p.subStar}</p>}
            </div>
          ))}
        </div>
      ) : (
        <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg max-h-80 overflow-auto">{text}</pre>
      )}
    </div>
  );
}

export function TaiyiResult({ j, summary, text }: { j: TaiyiJson; summary: string; text: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h4 className="font-bold text-gray-900 mb-3">太乙神数 · {j?.taiyiStar || j?.name || summary}</h4>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: '太乙星', value: j?.taiyiStar || j?.star },
          { label: '积年数', value: j?.jiNian || j?.accumulation },
          { label: '主算', value: j?.zhuSuan || j?.mainCalc },
          { label: '客算', value: j?.keSuan || j?.guestCalc },
        ].filter(f => f.value).map(f => (
          <div key={f.label} className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
            <p className="text-xs text-amber-400">{f.label}</p>
            <p className="font-bold text-amber-700">{String(f.value)}</p>
          </div>
        ))}
      </div>
      <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg max-h-60 overflow-auto">{text}</pre>
    </div>
  );
}

export function TarotResult({ j, text }: { j: TarotJson; text: string }) {
  const cards = j?.cards || [];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h4 className="font-bold text-gray-900 mb-3">塔罗牌</h4>
      {cards.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {cards.map((card: TarotCard, i: number) => (
            <div key={i} className={`rounded-xl p-3 text-center border ${card.reversed ? 'bg-indigo-50 border-indigo-200' : 'bg-purple-50 border-purple-200'}`}>
              <p className="text-2xl mb-1">{card.reversed ? '🔻' : '🔺'}</p>
              <p className="font-bold text-sm text-gray-900">{card.name}</p>
              {card.reversed !== undefined && (
                <p className={`text-[10px] ${card.reversed ? 'text-indigo-500' : 'text-purple-500'}`}>
                  {card.reversed ? '逆位' : '正位'}
                </p>
              )}
              {card.suit && <p className="text-[10px] text-gray-400">{card.suit}</p>}
              {card.meaning && <p className="text-[10px] text-gray-500 mt-1">{card.meaning}</p>}
            </div>
          ))}
        </div>
      ) : (
        <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{text}</pre>
      )}
    </div>
  );
}

export function GenericResult({ methodName, summary, text }: { methodName: string; summary: string; text: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h4 className="font-bold text-gray-900 mb-3">{methodName} · {summary}</h4>
      <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg max-h-80 overflow-auto">
        {text}
      </pre>
    </div>
  );
}
