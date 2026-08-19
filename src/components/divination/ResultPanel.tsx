import type { DivineResult } from '@/lib/taibu-adapter';
import {
  MeihuaResult, LiuyaoResult, QimenResult, DaliurenResult,
  BaziResult, XiaoliurenResult, ZiweiResult, TaiyiResult,
  TarotResult, GenericResult,
} from './ResultRenderers';

interface ResultPanelProps {
  divineResult: DivineResult;
}

export function ResultPanel({ divineResult }: ResultPanelProps) {
  const j = divineResult.json as any;

  switch (divineResult.method) {
    case 'meihua':
    case 'zhouyi':
      return <MeihuaResult j={j} summary={divineResult.summary} />;
    case 'liuyao':
      return <LiuyaoResult j={j} summary={divineResult.summary} text={divineResult.text} />;
    case 'qimen':
      return <QimenResult j={j} text={divineResult.text} />;
    case 'daliuren':
      return <DaliurenResult j={j} text={divineResult.text} />;
    case 'bazi':
      return <BaziResult j={j} />;
    case 'xiaoliuren':
      return <XiaoliurenResult j={j} summary={divineResult.summary} text={divineResult.text} />;
    case 'ziwei':
      return <ZiweiResult j={j} text={divineResult.text} />;
    case 'taiyi':
      return <TaiyiResult j={j} summary={divineResult.summary} text={divineResult.text} />;
    case 'tarot':
      return <TarotResult j={j} text={divineResult.text} />;
    default:
      return <GenericResult methodName={divineResult.methodName} summary={divineResult.summary} text={divineResult.text} />;
  }
}
