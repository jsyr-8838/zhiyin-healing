import ModuleIntroPage from '@/components/module-intro/ModuleIntroPage';

export default function ZhijiIntro() {
  return (
    <ModuleIntroPage
      moduleId="zhiji"
      poeticName="知几"
      tagline="知几其神 · 穷理尽性"
      wuxing="water"
      wuxingLabel="水"
      description={[
        '知几者，《易·系辞下》云"知几其神乎"。几者，动之微、吉之先见也。世间万象皆有前兆，天地运行自有律数。此模块集十种术数——梅花易数、周易、六爻、奇门遁甲、大六壬、八字、小六壬、紫微斗数、太乙神数、塔罗——以古法排盘，以AI解读，助您洞察机先。',
        '梅花易数取象于心，一花一叶皆可起卦；周易六爻纳甲装卦，三百八十四爻各有所指；奇门遁甲排九星八门，天时地利人和尽在盘中；六壬四课三传递进，事之来龙去脉了然于胸。',
        '排盘者，数也；解读者，理也。古法排盘严谨精确，AI解读则广征博引——《易经》原典、《增删卜易》《卜筮正宗》等传世经典皆在参考之列。术数非迷信，乃古人对天地规律的数学建模；知几非妄测，乃审时度势的理性推演。',
      ]}
      features={[
        {
          icon: '🌸',
          title: '梅花易数',
          desc: '以数起卦、以象得爻，万物皆可入卦，灵活直觉，心易合一',
        },
        {
          icon: '☯️',
          title: '周易六爻',
          desc: '纳甲装卦、六亲生克、用神原象，传统六爻完整排盘+AI深度解读',
        },
        {
          icon: '🚪',
          title: '奇门遁甲',
          desc: '九星八门、天盘地盘、三奇六仪，时空方位一览无余',
        },
        {
          icon: '🐍',
          title: '大六壬',
          desc: '四课三传、天将遁干、贵人昼夜，事之始末因果尽呈盘面',
        },
        {
          icon: '📊',
          title: '八字·紫微·太乙',
          desc: '命理三术齐备：八字四柱推命、紫微斗数排盘、太乙神数推算，多术互参',
        },
        {
          icon: '🤖',
          title: 'AI专业解读',
          desc: '古法排盘+AI广征经典解读，每次解读引证传世文献，非臆测而有据',
        },
      ]}
      ctaHref="/divination"
      ctaLabel="探索知几"
      backHref="/dashboard"
    />
  );
}
