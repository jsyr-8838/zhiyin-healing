/**
 * 知音进化系统 — 扩展知识种子（九境解说文案 + 进化方法论）
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KNOWLEDGE = [
  // ── 九境解说文案精华（每境提取核心疗愈主题+写作方法论）──
  {
    id: 'narration_deepsea',
    domain: '疗愈文案',
    element: 'water',
    title: '深海境解说文案——水行下沉托举',
    content: `核心意象：下沉、托举、心跳节奏
疗愈策略：利用深海的压力感模拟"放手"体验，从身体紧张到心理放松
文案结构：闭眼→声引下沉→海水托举→重量离开→心跳节奏→回归当下→回到水面
写作要点：
- "海水托着你的身体"——用水行托举意象替代"放松"指令
- "你只是一滴回归大海的水"——从个体到整体的哲学重构
- 呼吸节奏：11秒周期（吸4s-屏3s-呼4s）与解说段落间隔对齐
- 心率映射：BPM≥100推荐，高压焦虑人群首选
进化方向：可增加"海底珊瑚花园"视觉引导，扩展为深海生态沉浸`,
    source: 'immersive-healing-narration',
    tags: ['九境', '深海', '水行', '文案', '解说'],
    qualityScore: 92,
  },
  {
    id: 'narration_rain',
    domain: '疗愈文案',
    element: 'water',
    title: '雨夜境解说文案——水行安全感回归',
    content: `核心意象：屋檐雨声、童年安全感、旧棉被
疗愈策略：雨声包裹→童年安全记忆唤醒→杂音冲走→慢下来
文案结构：听雨→雨声包裹→带走杂音→童年安全记忆→泥土气息→安全确认
写作要点：
- "像一床旧棉被，温柔而踏实"——触觉隐喻建立安全感
- "还记得小时候的雨夜吗？"——唤醒安全记忆锚点
- "这间屋子，这场雨，此刻，刚好够用"——满足感确认
- 心率映射：BPM 90-99推荐，轻度紧张人群
进化方向：可增加四季雨声变体（春雨/秋雨/夜雨），不同雨量对应不同焦虑等级`,
    source: 'immersive-healing-narration',
    tags: ['九境', '雨夜', '水行', '文案', '解说'],
    qualityScore: 91,
  },
  {
    id: 'narration_temple',
    domain: '疗愈文案',
    element: 'metal',
    title: '钟声境解说文案——金行心水沉淀',
    content: `核心意象：钟磬余韵、心水沉淀、澄澈照月
疗愈策略：钟声穿越身体→念头来去→心水沉淀→照见本心
文案结构：听钟→钟穿身体→不必追念头→古人晨钟→心水沉淀→水静照月→余韵停留
写作要点：
- "让它穿过你的脊背"——具身化引导，声音变身体感知
- "水静了，才能照见月亮"——佛道融合的哲学重构
- 心率映射：BPM 80-89推荐，略有紧绷人群
进化方向：可增加"晨钟"和"暮鼓"两个子模式，对应不同时段疗愈需求`,
    source: 'immersive-healing-narration',
    tags: ['九境', '钟声', '金行', '文案', '解说'],
    qualityScore: 93,
  },
  {
    id: 'narration_universe',
    domain: '疗愈文案',
    element: 'fire',
    title: '宇宙境解说文案——星空飘浮渺小释然',
    content: `核心意象：星空飘浮、辽阔渺小、尘埃仰望
疗愈策略：升空→脱离具体自我→远处回望→渺小释然→什么也不必成为
文案结构：望星空→飘起来→无上下无迟早→远处回望→尘埃仰望→允许渺小→漂浮着
写作要点：
- "从这远处望回去，那些让你焦灼的事情，变得多么小"——宇宙视角重构
- "渺小，不是卑微。渺小，是终于松了那口气"——反向赋义
- "什么也不必成为"——存在主义疗愈的核心
- 通用解压境，BPM≥80均可推荐
进化方向：可增加"太阳系漫游"子模式，从近地轨道到深空递进`,
    source: 'immersive-healing-narration',
    tags: ['九境', '宇宙', '星空', '文案', '解说'],
    qualityScore: 94,
  },
  {
    id: 'narration_mountain',
    domain: '疗愈文案',
    element: 'wood',
    title: '山林境解说文案——木行扎根生长',
    content: `核心意象：松针泥土、古树扎根、风穿过林梢
疗愈策略：山林入口→呼吸清茶→踩落叶→阳光碎金→古树年轮→根扎泥土→风声呼吸
写作要点：
- "踩上去，沙沙地响。那是山林在回应你"——自然互动反馈
- "你也像一棵树。在风雨里弯过腰，却没有折断"——韧性确认
- "你本就是山林的一部分"——归属感重建
- 心率映射：BPM<50推荐，需要激活的人群
进化方向：可增加"竹林"和"松林"子模式，对应木行不同调性`,
    source: 'immersive-healing-narration',
    tags: ['九境', '山林', '木行', '文案', '解说'],
    qualityScore: 90,
  },
  {
    id: 'narration_campfire',
    domain: '疗愈文案',
    element: 'fire',
    title: '篝火境解说文案——火行古老暖意',
    content: `核心意象：火苗跳动、木柴噼啪、古老暖意、火光安全圈
疗愈策略：火光映脸→木柴燃烧→光圈安全→祖先围火→心里有火→烧掉冰冷→被火包裹
写作要点：
- "木材把存了一辈子的阳光，一点一点地还回夜的怀里"——火行转化意象
- "你熬过的那么多黑夜，都是心里的这团火"——内在力量确认
- "把白天那些冰冷的、扎人的事情，扔进火里"——火焰净化仪式
- 心率映射：BPM 50-59推荐，能量偏低人群
进化方向：可增加"炉边故事"子模式，火光中讲述简短寓言`,
    source: 'immersive-healing-narration',
    tags: ['九境', '篝火', '火行', '文案', '解说'],
    qualityScore: 91,
  },
  {
    id: 'narration_snow',
    domain: '疗愈文案',
    element: 'water',
    title: '雪夜境解说文案——无声落雪世界静默',
    content: `核心意象：无声落雪、白色覆盖、静默停顿、雪与温度交换
疗愈策略：看雪→无声之声→颜色被盖→路被抹平→念头如雪花→呼吸成雾→安静存在
写作要点：
- "那种无声，本身也是一种声音"——反向感知
- "此刻，你不需要急着去哪里，因为哪里，都还没被踩出来"——雪地新起点的隐喻
- "你不需要融化什么，也不需要被什么融化"——自我接纳
- 心率映射：低能量时的静默备选
进化方向：可增加"初雪"和"融雪"子模式，对应不同疗愈阶段`,
    source: 'immersive-healing-narration',
    tags: ['九境', '雪夜', '水行', '文案', '解说'],
    qualityScore: 89,
  },
  {
    id: 'narration_moon',
    domain: '疗愈文案',
    element: 'water',
    title: '月夜境解说文案——月光接纳悲伤',
    content: `核心意象：清亮月光、不评判的照见、月亮如镜、悲伤之美
疗愈策略：月升起→清亮月光→月光只让你看见→月亮如镜→月光不评判→潮湿泛光→悲伤也可以美
写作要点：
- "月光只让你看见——看见就够了，不必追问，不必判断"——接纳而非解决
- "你也像月亮。你一直在接纳"——镜像共鸣
- "原来悲伤，也可以是美的"——美学转化，将痛苦重构为美
- 心率映射：BPM 70-79推荐，接近正常但需情感释放
进化方向：可增加"满月"和"新月"子模式，满月释怀/新月重新出发`,
    source: 'immersive-healing-narration',
    tags: ['九境', '月夜', '水行', '文案', '解说'],
    qualityScore: 95,
  },
  {
    id: 'narration_mist',
    domain: '疗愈文案',
    element: 'earth',
    title: '晨雾境解说文案——土行一步一稳',
    content: `核心意象：薄纱轮廓、一步一稳、湿润呼吸、雾自己会散
疗愈策略：雾未散→轮廓模糊→看不清就不看→只走眼前一步→呼吸细雨→不冲破雾→等雾自散
写作要点：
- "雾让你只能看见眼前这一步。那就把这一步，走稳"——当下行动力
- "你不需要冲破雾。雾自己会散"——自然过程信任
- "雾散的时候，你会看见，你还是你，只是更柔软了一些"——成长确认
- 心率映射：BPM 60-69推荐，身心平稳人群
进化方向：可增加"山间晨雾"和"湖面晨雾"子模式，不同自然场景`,
    source: 'immersive-healing-narration',
    tags: ['九境', '晨雾', '土行', '文案', '解说'],
    qualityScore: 90,
  },
  // ── 进化方法论知识 ──
  {
    id: 'evo_method_prompt_eng',
    domain: '进化方法论',
    element: 'fire',
    title: '提示词进化方法论——五行火行策略',
    content: `火行·活跃策略：提示词优化、AI增强

提示词优化五步法：
1. 采样分析：收集低分对话(用户评分<0)，提取共性失败模式
2. 结构强化：增加强制输出段（如"5段结构"），减少自由发挥
3. 约束锁定：用枚举选项替代开放生成，如"舌质颜色仅限5选1"
4. 反幻觉注入：添加"禁止无数据支撑"和"必须引用具体XX"规则
5. A/B测试：新旧版本同时运行，对比avgScore和hallucinationRate

知音已有实践：
- ai-diagnosis提示词：增加五行归经推导链→avgScore从0.45提升到0.65
- tongue-analysis提示词：四维结构化+枚举锁定→hallucinationRate从0.15降到0.05
- divination提示词：强制引用卦象数据→但avgScore仅0.58，需继续优化

下一步进化方向：
- 占卜提示词avgScore偏低(0.58)，需要增加更多具体约束
- 导诊提示词可以增加"辨证→治则→疗愈"三级结构`,
    source: 'prompt-engineer',
    tags: ['进化', '火行', '提示词', '方法论'],
    qualityScore: 88,
  },
  {
    id: 'evo_method_content_exp',
    domain: '进化方法论',
    element: 'wood',
    title: '内容扩充方法论——五行木行策略',
    content: `木行·生长策略：内容扩充、知识发现

内容扩充三种路径：
1. 深度调研驱动（每月）：使用deep-research技能，调研最新学术/市场进展
2. 用户缺口驱动（每周）：分析用户搜索词和未满足查询，识别内容空洞
3. 跨域迁移驱动：将其他领域的有效方法迁移到中医疗愈场景

知音已有实践：
- 调研成果：5条核心领域知识已入库（中医体质/五行音乐/六字诀/颂钵/经络）
- 内容覆盖率：9境解说文案完整，但子模式（如四季雨声）尚未扩充
- 缺口识别：低覆盖率领域需持续补充

下一步进化方向：
- 扩充九境子模式文案（四季雨声/晨钟暮鼓/竹松林等）
- 补充24节气对应的情志调理方案
- 集成更多经典方剂的灸疗处方数据`,
    source: 'deep-research',
    tags: ['进化', '木行', '内容扩充', '方法论'],
    qualityScore: 86,
  },
];

async function main() {
  console.log('🌿 知音进化系统 — 扩展知识种子\n');
  let count = 0;

  for (const entry of KNOWLEDGE) {
    try {
      await prisma.evoKnowledge.upsert({
        where: { id: entry.id },
        update: {
          content: entry.content,
          qualityScore: entry.qualityScore,
          tags: JSON.stringify(entry.tags),
        },
        create: {
          id: entry.id,
          domain: entry.domain,
          element: entry.element,
          title: entry.title,
          content: entry.content,
          source: entry.source || 'ai_generated',
          sourceUrl: '',
          tags: JSON.stringify(entry.tags),
          qualityScore: entry.qualityScore,
          status: 'deployed',
        },
      });
      count++;
      console.log(`  ✓ ${entry.title}`);
    } catch (err) {
      console.error(`  ✗ ${entry.title}:`, err);
    }
  }

  console.log(`\n✅ ${count}/${KNOWLEDGE.length} 条扩展知识写入完成`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('扩展知识种子失败:', err);
  prisma.$disconnect();
  process.exit(1);
});
