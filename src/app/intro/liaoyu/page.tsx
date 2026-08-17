import ModuleIntroPage from '@/components/module-intro/ModuleIntroPage';

export default function LiaoyuIntro() {
  return (
    <ModuleIntroPage
      moduleId="liaoyu"
      poeticName="疗愈"
      tagline="六法归元 · 五行共济"
      wuxing="fire"
      wuxingLabel="火"
      description={[
        '疗者，治也；愈者，安也。疗愈之法，不独药石，音声可入脉、呼吸可调气、灸火可温经、颂钵可定神。此模块集六大疗愈法门——六字诀、五音疗愈、灸疗疏导、推拿引导、颂钵音疗、脉轮调频——以五行生克为纲，以辨证施治为目。',
        '嘘呵呼呬吹嘻，六字出《养性延命录》，每字应一脏腑，呼出浊气、吸入清气。角徵宫商羽，五音应五行，闻角音舒肝、听徵音养心，音声之道通于经络。灸疗疏导以十步功法引灸入经，推拿引导循经点穴以助气血周流。',
        '颂钵之音，金行之声也，共振频率可深达筋骨。脉轮之学，虽出西域，与三焦命门之说暗合。七轮调频，自底而上，由根至冠，调和全身能量中心。六法随体而用，火行之体宜水音制之，木行之人宜火音养之——此辨证施疗之妙也。',
      ]}
      features={[
        {
          icon: '🌬️',
          title: '六字诀呼吸法',
          desc: '嘘呵呼呬吹嘻，六字应五脏，呼吸+TTS语音引导+五行音阶悦耳音效+动画呼吸球，五种呼吸模式',
        },
        {
          icon: '🎵',
          title: '五音疗愈',
          desc: '角徵宫商羽对应木火土金水，双耳节拍+波形调制+实时可视化，以音入经调和脏腑',
        },
        {
          icon: '🔥',
          title: '灸疗疏导',
          desc: '静禅国灸十步功法：闻灸→热敷→响钟→药油→行钟→摇钟→定钟→火灸→灸感→心法，全程语音引导',
        },
        {
          icon: '✋',
          title: '推拿引导',
          desc: '头颈胸腹背臂腿七区25+手法，TTS语音计时，每步注明要领与禁忌，自推拿养生',
        },
        {
          icon: '🔔',
          title: '颂钵音疗',
          desc: '五行颂钵频率，双耳节拍+余韵衰减，沉浸式共振疗愈，金行之声通达全身',
        },
        {
          icon: '🔮',
          title: '脉轮调频',
          desc: '七轮Solfeggio频率(396-963Hz)，旋转轮盘可视化，海底轮/心轮/眉心轮等预设方案',
        },
      ]}
      ctaHref="/healing"
      ctaLabel="进入疗愈"
      backHref="/dashboard"
    />
  );
}
