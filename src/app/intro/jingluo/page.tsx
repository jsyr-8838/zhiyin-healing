import ModuleIntroPage from '@/components/module-intro/ModuleIntroPage';

export default function JingluoIntro() {
  return (
    <ModuleIntroPage
      moduleId="jingluo"
      poeticName="经络"
      tagline="经脉流注 · 气血周行"
      wuxing="water"
      wuxingLabel="水"
      description={[
        '经脉者，所以决死生、处百病、调虚实，不可不通也。《灵枢·经脉》所载十二正经与奇经八脉，乃中医理论之骨干，针灸治疗之根基。此模块以BodyParts3D真实MRI数据构建1:1真人骨骼3D模型，十四条经脉、三百余穴位尽在掌中。',
        '穴有定位，遵古籍而取之。骨度分寸法为唯一可量化的定位标准，结合灵枢经脉篇与针灸甲乙经，从古籍定位到体表映射，再到三维坐标化，最后以CatmullRomCurve3曲线路径插值——五步闭环，确保每穴每经皆有所据。',
        '五色标注五行穴位，红为火、青为木、黄为土、白为金、蓝为水。点击任一穴位，3D模型即行响应——骨骼透明可见经络气血穿行，相机平滑聚焦穴位前方位，信息面板展示定位、归经、主治、取穴方法。气血粒子沿经脉曲线匀速流动，脉动发光，如亲见真气运行。',
      ]}
      features={[
        {
          icon: '🦴',
          title: '1:1真实骨骼3D模型',
          desc: '基于BodyParts3D MRI数据构建，高清骨骼+透明度可调，可缩放旋转平移自由探索',
        },
        {
          icon: '🔴',
          title: '五行五色穴位标注',
          desc: '木青·火红·土黄·金白·水蓝，智能提示交会经络，一目了然归属关系',
        },
        {
          icon: '✨',
          title: '气血流动动画',
          desc: '每条经脉4个粒子沿CatmullRomCurve3曲线流动，脉动发光，十二经流注可视',
        },
        {
          icon: '👆',
          title: '穴位点击交互',
          desc: '点击穴位→相机平滑聚焦→骨骼响应→信息面板展示定位/归经/主治/取穴/古籍摘录',
        },
        {
          icon: '🕐',
          title: '子午流注·五运六气',
          desc: '1600-3000年纪年推算，当下时辰对应经脉自动高亮，五运六气司天在泉一目了然',
        },
        {
          icon: '📝',
          title: '穴位测验系统',
          desc: '四题型+自定义题量+经脉五行筛选，AI判卷+错题3D联动，学以致用',
        },
      ]}
      ctaHref="/meridian"
      ctaLabel="进入经络"
      backHref="/dashboard"
    />
  );
}
