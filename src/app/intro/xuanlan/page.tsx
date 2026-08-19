import ModuleIntroPage from '@/components/module-intro/ModuleIntroPage';

export default function XuanlanIntro() {
  return (
    <ModuleIntroPage
      moduleId="xuanlan"
      poeticName="玄览"
      tagline="涤除玄览 · 道法自然"
      wuxing="earth"
      wuxingLabel="土"
      description={[
        '玄览者，《道德经》第十章云"涤除玄览，能无疵乎"。玄者，深微也；览者，观照也。涤除心中尘垢，方能照见大道本真。此模块汇山医命相卜五门三十六部古籍，以疗愈之心读经典之文，沉浸其中，可得古人之智慧、医者之仁心。',
        '山者，修真养性之学，《黄庭经》《悟真篇》导引内炼；医者，济世活人之术，《黄帝内经》《伤寒论》辨证论治；命者，穷通寿夭之数，《三命通会》《滴天髓》推演流年；相者，观形察貌之法，《麻衣相法》《柳庄相法》识人鉴质；卜者，吉凶悔吝之占，《增删卜易》《卜筮正宗》趋避知机。',
        '五术同源，皆以阴阳五行为基。读《内经》可悟脏腑经络之说，读《易经》可明变通趋避之道，读《黄庭》可知内丹存想之功。玄览非徒读也，乃以心体之、以身证之，于古籍文字间感受千年智慧的脉动。',
      ]}
      features={[
        {
          icon: '📚',
          title: '五术三十六部经典',
          desc: '山医命相卜五大类，36部传世古籍完整收录，从《内经》到《增删卜易》一应俱全',
        },
        {
          icon: '🎨',
          title: '疗愈式沉浸阅读',
          desc: '宋韵宣纸底色+中式墨韵排版+五音疗愈诵读，读书亦养神，观文可静心',
        },
        {
          icon: '🔍',
          title: '三栏拖拽阅读器',
          desc: '目录·正文·笔记三栏自由拖拽，阅读时随手批注，重要段落一键收藏',
        },
        {
          icon: '🤖',
          title: 'AI助读注解',
          desc: '疑难段落AI即时注解，古文今译，医理阐释，典籍不再晦涩难通',
        },
        {
          icon: '📑',
          title: '全文检索·跨书引用',
          desc: '关键词一键搜索全部典籍，跨书互引，纵横比对，融会贯通五术之学',
        },
      ]}
      ctaHref="/classics"
      ctaLabel="开启玄览"
      backHref="/dashboard"
    />
  );
}
