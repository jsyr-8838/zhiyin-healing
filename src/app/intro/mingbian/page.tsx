import ModuleIntroPage from '@/components/module-intro/ModuleIntroPage';

export default function MingbianIntro() {
  return (
    <ModuleIntroPage
      moduleId="mingbian"
      poeticName="明辨"
      tagline="辨证求因 · 以识定法"
      wuxing="wood"
      wuxingLabel="木"
      description={[
        '明辨者，《中庸》所谓"明辨之"也。中医之要，首在明辨——辨体质之偏颇，识病机之深浅，而后方能药证相应、法随证出。此模块融九种体质问卷、舌诊面诊手诊之望诊精要、五行八字推算于一炉，六源加权投票，得最真体质画像。',
        '望闻问切，望为先焉。舌为心之苗，面为气血之华，手为经络之镜。AI望诊助手以百代医案为师，观舌色之深浅、苔之厚薄、形之胖瘦，察面之五色、手之大小鱼际，皆可为辨证之凭据。',
        '明辨而后方定，知体而后调养。九种体质各有所偏，五行生克各有其道。明辨所得，将为后续疗愈方案奠定根基——体质不同，则灸疗穴位、六字诀字法、五音音阶皆随体而变，是为"辨证施治"之核心。',
      ]}
      features={[
        {
          icon: '📋',
          title: '九种体质问卷',
          desc: '22道专业题项，覆盖形体外貌、心理特征、适应能力七大维度，科学评估您的体质倾向',
        },
        {
          icon: '👅',
          title: 'AI舌诊·望舌知病',
          desc: '手机拍照即可分析——8种舌色+7种苔色+6种舌形+分区辨证，含舌下络脉观察与舌尖/边/根色差分析',
        },
        {
          icon: '👤',
          title: '面诊·手诊双望',
          desc: '面诊五色主病理论+手诊大小鱼际观察，三望合参提高辨证准确度',
        },
        {
          icon: '☯️',
          title: '五行体质推算',
          desc: '四柱八字→五行得分→日主强弱→流年运势→九种体质对应，千年命理与中医体质学的交汇',
        },
        {
          icon: '🧠',
          title: '六源加权综合分析',
          desc: '问卷+舌诊+面诊+手诊+五行+AI导诊，六源加权投票生成最精准的体质画像与养生建议',
        },
      ]}
      ctaHref="/diagnose"
      ctaLabel="开始明辨"
      backHref="/dashboard"
    />
  );
}
