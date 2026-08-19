/**
 * 专家数据种子脚本
 * 将硬编码的4位专家数据插入数据库
 * 用法: npx ts-node prisma/seed-experts.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXPERTS = [
  {
    name: '魏治芹',
    title: '资深疗愈顾问',
    subtitle: '禅静国灸 · 北京事业部',
    specialty: '灸法调养 · 体质疏导 · 情志调理',
    tags: JSON.stringify(['灸法', '体质辨识', '情志疏导']),
    avatar: '/images/experts/weizhiqin.jpg',
    element: 'fire',
    bio: '深耕艾灸养生领域多年，擅长以古法灸术结合九种体质辨识，为每位体验者定制专属调养方案。手法温润细腻，尤精于虚寒体质与气郁体质的辨证施灸。',
    services: JSON.stringify([
      { name: '一对一灸法调养', duration: '60分钟', desc: '辨证选穴 · 古法施灸 · 体质调养' },
      { name: '体质辨识与养生指导', duration: '45分钟', desc: '九种体质评估 · 膳食建议 · 功法推荐' },
    ]),
    wechatId: '',
    phone: '',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: '张月瀛',
    title: '高级疗愈顾问',
    subtitle: '禅静国灸 · 北京事业部',
    specialty: '经络调理 · 灸疗处方 · 健康管理',
    tags: JSON.stringify(['经络', '灸疗', '健康管理']),
    avatar: '/images/experts/zhangyueying.jpg',
    element: 'wood',
    bio: '精通经络穴位理论与灸疗配伍，善于将子午流注时辰养生融入日常调理，帮助体验者建立顺应天时的健康节律。尤擅颈肩腰腿痛的灸法缓解与情志安抚。',
    services: JSON.stringify([
      { name: '经络灸疗调理', duration: '60分钟', desc: '循经取穴 · 时辰配伍 · 灸法调治' },
      { name: '亚健康状态评估', duration: '30分钟', desc: '望闻问切 · 穴位检测 · 调理建议' },
    ]),
    wechatId: '',
    phone: '',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: '王燕燕',
    title: '首席疗愈顾问',
    subtitle: '禅静国灸 · 北京事业部',
    specialty: '五行音疗 · 脉轮疏导 · 身心整合',
    tags: JSON.stringify(['音疗', '脉轮', '身心整合']),
    avatar: '/images/experts/wangyanyan.jpg',
    element: 'earth',
    bio: '融合五行音乐疗法与脉轮能量疏导，开创身心一体化疗愈路径。擅长以五音角徵宫商羽对应肝心脾肺肾，配合颂钵共振，帮助体验者深入放松与自我修复。',
    services: JSON.stringify([
      { name: '五行音疗私享课', duration: '90分钟', desc: '体质配乐 · 颂钵共振 · 引导冥想' },
      { name: '身心整合调理', duration: '60分钟', desc: '情志评估 · 音疗处方 · 呼吸引导' },
    ]),
    wechatId: '',
    phone: '',
    sortOrder: 3,
    isActive: true,
  },
  {
    name: '李世萍',
    title: '资深疗愈顾问',
    subtitle: '禅静国灸 · 北京事业部',
    specialty: '节气调养 · 药膳食疗 · 女性养生',
    tags: JSON.stringify(['节气', '食疗', '女性调养']),
    avatar: '/images/experts/lishiping.jpg',
    element: 'water',
    bio: '深谙二十四节气养生之道，善以时令药膳与温阳灸法调补气血，尤精于女性经带胎产各阶段的中医调理。温和细致，深受体验者信赖。',
    services: JSON.stringify([
      { name: '节气专属调养', duration: '60分钟', desc: '当令节气 · 顺时施灸 · 药膳推荐' },
      { name: '女性中医调养', duration: '60分钟', desc: '气血辨证 · 温阳调理 · 食疗方案' },
    ]),
    wechatId: '',
    phone: '',
    sortOrder: 4,
    isActive: true,
  },
];

async function main() {
  console.log('🌱 开始填充专家数据...');

  // 先清空旧数据
  await prisma.booking.deleteMany();
  await prisma.expert.deleteMany();
  console.log('  已清空旧数据');

  for (const expert of EXPERTS) {
    const created = await prisma.expert.create({ data: expert });
    console.log(`  ✅ 创建专家: ${created.name} (${created.element})`);
  }

  const count = await prisma.expert.count();
  console.log(`\n🎉 完成！共 ${count} 位专家已写入数据库`);
}

main()
  .catch((e) => {
    console.error('❌ 种子脚本出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
