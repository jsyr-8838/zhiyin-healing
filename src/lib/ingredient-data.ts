// 食材相生相克数据库 - 摘自 LingSuHealth + 扩充
// 基于中医五行理论和传统食物搭配宜忌

export type InteractionType = '相生' | '相克';
export type SeverityLevel = '有益' | '轻度' | '中度' | '重度';

export interface IngredientItem {
  id: string;
  name: string;
  category: '谷物' | '蔬菜' | '水果' | '肉禽' | '水产' | '药材' | '调料' | '茶饮' | '豆类' | '坚果';
  nature: '寒' | '凉' | '平' | '温' | '热' | '微寒';
  element: '木' | '火' | '土' | '金' | '水';
  description: string;
}

export interface IngredientInteraction {
  item1Id: string;
  item1Name: string;
  item2Id: string;
  item2Name: string;
  type: InteractionType;
  severity: SeverityLevel;
  effect: string;
  basis: string;
  recommendation: string;
}

// 常见食材库
export const INGREDIENTS: IngredientItem[] = [
  // 谷物
  { id: 'rice', name: '大米', category: '谷物', nature: '平', element: '土', description: '补中益气，健脾和胃' },
  { id: 'millet', name: '小米', category: '谷物', nature: '凉', element: '土', description: '健脾和胃，补益虚损' },
  { id: 'oats', name: '燕麦', category: '谷物', nature: '平', element: '土', description: '益脾养心，敛汗' },
  // 蔬菜
  { id: 'spinach', name: '菠菜', category: '蔬菜', nature: '凉', element: '木', description: '养血止血，敛阴润燥' },
  { id: 'ginger', name: '生姜', category: '蔬菜', nature: '温', element: '木', description: '散寒发汗，温中止呕' },
  { id: 'garlic', name: '大蒜', category: '蔬菜', nature: '温', element: '火', description: '解毒杀虫，消肿止痛' },
  { id: 'radish', name: '白萝卜', category: '蔬菜', nature: '凉', element: '金', description: '消食下气，化痰清热' },
  { id: 'yam', name: '山药', category: '蔬菜', nature: '平', element: '土', description: '补脾养胃，生津益肺' },
  { id: 'lotus_root', name: '莲藕', category: '蔬菜', nature: '寒', element: '水', description: '清热生津，凉血止血' },
  { id: 'celery', name: '芹菜', category: '蔬菜', nature: '凉', element: '木', description: '平肝清热，祛风利湿' },
  // 水果
  { id: 'pear', name: '梨', category: '水果', nature: '凉', element: '金', description: '润肺清热，化痰止咳' },
  { id: 'jujube', name: '大枣', category: '水果', nature: '温', element: '土', description: '补中益气，养血安神' },
  { id: 'longan', name: '桂圆', category: '水果', nature: '温', element: '火', description: '补心脾，益气血' },
  { id: 'hawthorn', name: '山楂', category: '水果', nature: '温', element: '木', description: '消食化积，活血散瘀' },
  { id: 'walnut', name: '核桃', category: '坚果', nature: '温', element: '水', description: '补肾固精，温肺定喘' },
  // 肉禽
  { id: 'chicken', name: '鸡肉', category: '肉禽', nature: '温', element: '木', description: '温中益气，补精填髓' },
  { id: 'lamb', name: '羊肉', category: '肉禽', nature: '温', element: '火', description: '温中暖肾，益气补虚' },
  { id: 'beef', name: '牛肉', category: '肉禽', nature: '温', element: '土', description: '补脾胃，益气血，强筋骨' },
  { id: 'pork', name: '猪肉', category: '肉禽', nature: '平', element: '水', description: '滋阴润燥，补肾养血' },
  { id: 'duck', name: '鸭肉', category: '肉禽', nature: '凉', element: '水', description: '滋阴清热，利水消肿' },
  // 水产
  { id: 'carp', name: '鲤鱼', category: '水产', nature: '平', element: '水', description: '利水消肿，下气通乳' },
  { id: 'shrimp', name: '虾', category: '水产', nature: '温', element: '火', description: '补肾壮阳，通乳排毒' },
  { id: 'crab', name: '螃蟹', category: '水产', nature: '寒', element: '水', description: '清热解毒，散瘀消肿' },
  // 药材
  { id: 'ginseng', name: '人参', category: '药材', nature: '温', element: '土', description: '大补元气，补脾益肺' },
  { id: 'astragalus', name: '黄芪', category: '药材', nature: '温', element: '土', description: '补气升阳，固表止汗' },
  { id: 'goji', name: '枸杞', category: '药材', nature: '平', element: '水', description: '滋补肝肾，益精明目' },
  { id: 'tremella', name: '银耳', category: '药材', nature: '平', element: '金', description: '滋阴润肺，养胃生津' },
  { id: 'lily', name: '百合', category: '药材', nature: '微寒', element: '金', description: '养阴润肺，清心安神' },
  { id: 'danggui', name: '当归', category: '药材', nature: '温', element: '木', description: '补血活血，调经止痛' },
  // 豆类
  { id: 'mung_bean', name: '绿豆', category: '豆类', nature: '凉', element: '木', description: '清热解毒，消暑利水' },
  { id: 'red_bean', name: '红豆', category: '豆类', nature: '平', element: '火', description: '利水消肿，解毒排脓' },
  { id: 'black_bean', name: '黑豆', category: '豆类', nature: '平', element: '水', description: '补肾益阴，健脾利湿' },
  { id: 'soybean', name: '黄豆', category: '豆类', nature: '平', element: '土', description: '健脾宽中，润燥消水' },
  // 调料
  { id: 'honey', name: '蜂蜜', category: '调料', nature: '平', element: '土', description: '补中润燥，止痛解毒' },
  { id: 'cinnamon', name: '肉桂', category: '调料', nature: '热', element: '火', description: '补火助阳，散寒止痛' },
  { id: 'vinegar', name: '食醋', category: '调料', nature: '温', element: '木', description: '散瘀消肿，理气止痛' },
  { id: 'salt', name: '食盐', category: '调料', nature: '寒', element: '水', description: '调味，清热解毒' },
  // 茶饮
  { id: 'green_tea', name: '绿茶', category: '茶饮', nature: '凉', element: '木', description: '清热解毒，提神醒脑' },
  { id: 'red_tea', name: '红茶', category: '茶饮', nature: '温', element: '火', description: '温中暖胃，消食化滞' },
  { id: 'chrysanthemum', name: '菊花', category: '茶饮', nature: '微寒', element: '金', description: '疏风清热，平肝明目' },
  { id: 'rose', name: '玫瑰花', category: '茶饮', nature: '温', element: '木', description: '理气解郁，活血散瘀' },
];

// 食材相生相克关系库（基于中医理论和传统食养经验）
export const INTERACTIONS: IngredientInteraction[] = [
  // ===== 相生（有益搭配） =====
  { item1Id: 'ginger', item1Name: '生姜', item2Id: 'lamb', item2Name: '羊肉',
    type: '相生', severity: '有益', effect: '温中散寒，补益气血，驱寒效果倍增',
    basis: '生姜辛温散寒，羊肉温补气血，二者合用温阳散寒之力更强', recommendation: '冬季进补经典搭配，适合阳虚畏寒者' },

  { item1Id: 'jujube', item1Name: '大枣', item2Id: 'goji', item2Name: '枸杞',
    type: '相生', severity: '有益', effect: '补气养血，滋补肝肾，美容养颜',
    basis: '大枣补中益气养血，枸杞滋补肝肾，气血双补', recommendation: '泡茶或煲汤均可，适合气血两虚者' },

  { item1Id: 'lily', item1Name: '百合', item2Id: 'tremella', item2Name: '银耳',
    type: '相生', severity: '有益', effect: '滋阴润肺，养颜美容，安神止咳',
    basis: '二味皆为滋阴润肺之品，协同增强润燥之力', recommendation: '秋季甜品首选，适合阴虚燥咳者' },

  { item1Id: 'yam', item1Name: '山药', item2Id: 'millet', item2Name: '小米',
    type: '相生', severity: '有益', effect: '健脾养胃，补益中气，助消化',
    basis: '山药健脾补气，小米和胃安眠，脾胃同调', recommendation: '煮粥为佳，适合脾胃虚弱者' },

  { item1Id: 'red_bean', item1Name: '红豆', item2Id: 'mung_bean', item2Name: '薏米',
    type: '相生', severity: '有益', effect: '利水消肿，健脾祛湿',
    basis: '红豆利水消肿，薏米健脾渗湿，合用祛湿力强', recommendation: '煮水代茶或煲粥，适合痰湿体质' },

  { item1Id: 'ginger', item1Name: '生姜', item2Id: 'jujube', item2Name: '大枣',
    type: '相生', severity: '有益', effect: '温中散寒，调和脾胃，温经活血',
    basis: '姜枣组合为中医经典配伍，生姜温中散寒，大枣补中益气', recommendation: '泡水代茶，女性经期尤佳' },

  { item1Id: 'honey', item1Name: '蜂蜜', item2Id: 'pear', item2Name: '梨',
    type: '相生', severity: '有益', effect: '润肺止咳，滋阴润燥',
    basis: '蜂蜜润燥，梨清热生津，合用润肺止咳', recommendation: '蒸梨加蜂蜜，秋冬润燥良方' },

  { item1Id: 'goji', item1Name: '枸杞', item2Id: 'chrysanthemum', item2Name: '菊花',
    type: '相生', severity: '有益', effect: '清肝明目，滋阴降火',
    basis: '枸杞补肝肾，菊花清肝火，一补一清明目效果佳', recommendation: '泡茶饮用，适合用眼过度、肝火旺者' },

  { item1Id: 'rose', item1Name: '玫瑰花', item2Id: 'jujube', item2Name: '大枣',
    type: '相生', severity: '有益', effect: '疏肝理气，养血安神',
    basis: '玫瑰花疏肝理气，大枣养血安神，气畅血和', recommendation: '泡茶饮用，适合气郁体质、情绪低落者' },

  { item1Id: 'black_bean', item1Name: '黑豆', item2Id: 'walnut', item2Name: '核桃',
    type: '相生', severity: '有益', effect: '补肾益精，乌发健脑',
    basis: '黑豆入肾，核桃补肾固精，二味同入肾经', recommendation: '煮粥或豆浆，适合肾虚脱发健忘者' },

  // ===== 相克（不宜搭配） =====
  { item1Id: 'crab', item1Name: '螃蟹', item2Id: 'ginger', item2Name: '柿子',
    type: '相克', severity: '重度', effect: '可能形成胃结石，引起腹痛呕吐',
    basis: '蟹肉富含蛋白质，柿子含鞣酸，二者结合形成不易消化的凝块', recommendation: '切忌同食，食蟹后至少间隔2小时再吃柿子' },

  { item1Id: 'crab', item1Name: '螃蟹', item2Id: 'honey', item2Name: '蜂蜜',
    type: '相克', severity: '中度', effect: '可能引起腹泻',
    basis: '蟹性寒，蜂蜜润肠通便，寒润并用易致泄泻', recommendation: '不建议同食，脾胃虚寒者尤忌' },

  { item1Id: 'milk', item1Name: '牛奶', item2Id: 'chocolate', item2Name: '巧克力',
    type: '相克', severity: '轻度', effect: '影响钙质吸收',
    basis: '巧克力中的草酸与牛奶中钙结合形成草酸钙', recommendation: '间隔1小时以上食用为佳' },

  { item1Id: 'ginseng', item1Name: '人参', item2Id: 'radish', item2Name: '白萝卜',
    type: '相克', severity: '中度', effect: '萝卜下气行滞，削弱人参补气功效',
    basis: '人参大补元气，萝卜下气消食，功用相反', recommendation: '服人参期间忌食萝卜' },

  { item1Id: 'mutton', item1Name: '羊肉', item2Id: 'vinegar', item2Name: '食醋',
    type: '相克', severity: '轻度', effect: '酸收与温散相抵，降低温补效果',
    basis: '羊肉温阳散寒，醋酸收敛，一散一收功力相消', recommendation: '吃羊肉时少放醋，不宜大量同食' },

  { item1Id: 'lamb', item1Name: '羊肉', item2Id: 'pear', item2Name: '梨',
    type: '相克', severity: '中度', effect: '寒热相激，可能引起腹痛或消化不良',
    basis: '羊肉大热，梨性寒凉，寒热相搏伤脾胃', recommendation: '不宜同食，至少间隔2小时' },

  { item1Id: 'danggui', item1Name: '当归', item2Id: 'green_tea', item2Name: '绿茶',
    type: '相克', severity: '轻度', effect: '茶中鞣酸影响当归有效成分吸收',
    basis: '茶叶中的鞣质与中药有效成分结合影响吸收', recommendation: '服当归后2小时内勿饮茶' },

  { item1Id: 'beef', item1Name: '牛肉', item2Id: 'chestnut', item2Name: '栗子',
    type: '相克', severity: '轻度', effect: '不易消化，易引起腹胀',
    basis: '牛肉和栗子都不易消化，同食增加胃肠负担', recommendation: '可少量同食，消化功能弱者慎食' },

  { item1Id: 'garlic', item1Name: '大蒜', item2Id: 'honey', item2Name: '蜂蜜',
    type: '相克', severity: '轻度', effect: '辛甘相混，可能引起轻微不适',
    basis: '大蒜辛热，蜂蜜甘平，性味不和', recommendation: '不宜大量同食，少许无碍' },

  { item1Id: 'shrimp', item1Name: '虾', item2Id: 'jujube', item2Name: '大枣',
    type: '相克', severity: '轻度', effect: '同食可能降低营养价值',
    basis: '虾中五价砷与维C含量高的食物反应，大枣含维C较多', recommendation: '少量同食无碍，不建议大量搭配' },
];

// 查询食材的所有交互关系
export function findInteractions(ingredientName: string): IngredientInteraction[] {
  return INTERACTIONS.filter(
    (i) => i.item1Name === ingredientName || i.item2Name === ingredientName
  );
}

// 查询两种食材之间的关系
export function findRelation(name1: string, name2: string): IngredientInteraction | undefined {
  return INTERACTIONS.find(
    (i) => (i.item1Name === name1 && i.item2Name === name2) ||
           (i.item1Name === name2 && i.item2Name === name1)
  );
}

// 按分类获取食材
export function getIngredientsByCategory(category: string): IngredientItem[] {
  return INGREDIENTS.filter((i) => i.category === category);
}

// 获取所有分类
export function getCategories(): string[] {
  return [...new Set(INGREDIENTS.map((i) => i.category))];
}
