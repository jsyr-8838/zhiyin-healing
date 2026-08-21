/**
 * 二十四节气养生数据
 * 数据来源：倪海厦中西医养生理论
 * 移植自 github.com/aiist007/24life
 */

export interface SolarTermHealth {
  id: number;
  name: string;
  pinyin: string;
  date: string;           // 2026年日期
  time: string;           // 交节时刻
  season: '春' | '夏' | '秋' | '冬';
  element: '木' | '火' | '土' | '金' | '水';
  organ: string;          // 对应脏腑
  color: string;          // 主题色
  theme: string;          // 养生主题
  description: string;    // 中医养生说明
  foods: string[];        // 推荐食物
  foodColors: string;     // 食物颜色/类属
  lifestyle: string;      // 作息建议
  exercise: string;       // 运动推荐
  acupoint: string;       // 穴位按摩 — 可联动3D经络
  sixSound: string;       // 六字诀对应音
  taboo: string;          // 禁忌
  poem: string;           // 古诗词
}

export const solarTermsHealth: SolarTermHealth[] = [
  {
    id: 1, name: '小寒', pinyin: 'Xiǎo Hán', date: '2026-01-05', time: '16:24',
    season: '冬', element: '水', organ: '肾', color: '#1a365d',
    theme: '补气补血、强肾固本',
    description: '小寒是一年中最寒冷的时节之一，此时阳气潜藏，阴气盛极。倪海厦强调冬季养肾，应早睡晚起，待日光而起，保持身体温暖，避免大汗淋漓。',
    foods: ['黑豆', '黑米', '紫菜', '核桃', '羊肉'],
    foodColors: '黑色食物为主，温补肾阳',
    lifestyle: '早睡晚起，泡手脚，保暖颈项腰部',
    exercise: '踮脚尖提肛，搓热腰部命门穴',
    acupoint: '涌泉穴、太溪穴', sixSound: '吹',
    taboo: '避免剧烈运动出大汗，忌食生冷',
    poem: '小寒连大吕，欢鹊垒新巢'
  },
  {
    id: 2, name: '大寒', pinyin: 'Dà Hán', date: '2026-01-20', time: '09:46',
    season: '冬', element: '水', organ: '肾', color: '#1a365d',
    theme: '守阳避寒、静养蓄能',
    description: '大寒是二十四节气中最后一个节气，也是一年中最冷的时期。倪海厦认为此时应收敛神气，无欲无求，为来年春天的生发积蓄能量。',
    foods: ['红豆', '大葱', '马铃薯', '姜', '桂圆'],
    foodColors: '温热食物，补阳固本',
    lifestyle: '早晨温水润喉，固定运动，保持心情平和',
    exercise: '室内轻柔运动，八段锦',
    acupoint: '关元穴、气海穴', sixSound: '吹',
    taboo: '避免寒风侵袭，忌过度劳累',
    poem: '大寒须守火，无事莫出门'
  },
  {
    id: 3, name: '立春', pinyin: 'Lì Chūn', date: '2026-02-04', time: '04:03',
    season: '春', element: '木', organ: '肝', color: '#276749',
    theme: '唤醒阳气、舒展肝气',
    description: '立春是二十四节气之首，标志着春天的开始。春三月此谓发陈，天地俱生，万物以荣，应夜卧早起，广步于庭，披发缓形。',
    foods: ['韭菜', '葱', '香菜', '枸杞', '花生', '菠菜'],
    foodColors: '青色食物为主，疏肝理气',
    lifestyle: '夜卧早起，早起晒太阳，伸展腰背',
    exercise: '拍打肝胆经，深呼吸',
    acupoint: '太冲穴', sixSound: '嘘',
    taboo: '勿动怒，生而勿杀，予而勿夺',
    poem: '立春一日，百草回芽'
  },
  {
    id: 4, name: '雨水', pinyin: 'Yǔ Shuǐ', date: '2026-02-18', time: '23:51',
    season: '春', element: '木', organ: '肝', color: '#276749',
    theme: '养脾祛湿、调气顺体',
    description: '雨水节气，降雨增多，湿气渐重。此时应注意健脾祛湿，保持室内干爽，适度活动促进气血流通。',
    foods: ['红枣', '山药', '百合', '藕', '薏仁'],
    foodColors: '健脾食物，祛湿养气',
    lifestyle: '保持空气干爽，适度活动',
    exercise: '昂头望月式导引',
    acupoint: '足三里、三阴交', sixSound: '嘘',
    taboo: '避免久坐湿地，忌过食生冷',
    poem: '好雨知时节，当春乃发生'
  },
  {
    id: 5, name: '惊蛰', pinyin: 'Jīng Zhé', date: '2026-03-05', time: '21:58',
    season: '春', element: '木', organ: '肝', color: '#276749',
    theme: '提气防病、养肝护阳',
    description: '惊蛰时节，春雷始鸣，万物复苏。此时肝气升发，应注意疏肝理气，防止春困，多食绿色蔬菜助阳气生发。',
    foods: ['菠菜', '莲子', '蜂蜜', '芹菜', '韭菜'],
    foodColors: '绿色蔬菜，疏通肝气',
    lifestyle: '晨起深呼吸，出门防风',
    exercise: '伸展运动，疏通经络',
    acupoint: '太冲穴、期门穴', sixSound: '嘘',
    taboo: '避免情绪波动，忌过食酸味',
    poem: '微雨众卉新，一雷惊蛰始'
  },
  {
    id: 6, name: '春分', pinyin: 'Chūn Fēn', date: '2026-03-20', time: '22:41',
    season: '春', element: '木', organ: '肝', color: '#276749',
    theme: '阴阳平衡、调神养气',
    description: '春分日，昼夜平分，阴阳相半。此时应调和阴阳，保持情志舒畅，饮食均衡，作息规律。',
    foods: ['香菜', '绿豆芽', '豆腐', '春笋', '荠菜'],
    foodColors: '清淡食物，平衡阴阳',
    lifestyle: '午休，早睡早起，保持心情愉悦',
    exercise: '太极拳，调和阴阳',
    acupoint: '内关穴、神门穴', sixSound: '嘘',
    taboo: '避免过劳，忌大喜大悲',
    poem: '春分雨脚落声微，柳岸斜风带客归'
  },
  {
    id: 7, name: '清明', pinyin: 'Qīng Míng', date: '2026-04-05', time: '02:35',
    season: '春', element: '木', organ: '肝', color: '#276749',
    theme: '祛湿解郁、防过敏',
    description: '清明时节，气温回升，雨水增多。此时肝气旺盛，应注意疏肝解郁，预防过敏，多进行户外活动。',
    foods: ['牛蒡', '姜', '葱', '芹菜', '艾草'],
    foodColors: '辛香食物，疏通肝气',
    lifestyle: '早晨微运动，避免生冷食物',
    exercise: '踏青散步，舒展身心',
    acupoint: '合谷穴、曲池穴', sixSound: '嘘',
    taboo: '避免久坐不动，忌过食肥甘',
    poem: '清明时节雨纷纷，路上行人欲断魂'
  },
  {
    id: 8, name: '谷雨', pinyin: 'Gǔ Yǔ', date: '2026-04-20', time: '09:31',
    season: '春', element: '木', organ: '肝', color: '#276749',
    theme: '补气抗春困、强健脾胃',
    description: '谷雨是春季最后一个节气，雨生百谷。此时湿气较重，应注意健脾化湿，为夏季做好准备。',
    foods: ['香椿', '五谷', '山药', '茯苓', '扁豆'],
    foodColors: '健脾食物，化湿补气',
    lifestyle: '早起晒太阳，固定作息',
    exercise: '慢跑，促进新陈代谢',
    acupoint: '足三里、中脘穴', sixSound: '呼',
    taboo: '避免过食寒凉，忌熬夜',
    poem: '谷雨如丝复似尘，煮瓶浮蜡正尝新'
  },
  {
    id: 9, name: '立夏', pinyin: 'Lì Xià', date: '2026-05-05', time: '19:41',
    season: '夏', element: '火', organ: '心', color: '#c53030',
    theme: '稳定情绪、养心健脾',
    description: '立夏标志着夏季开始，心气渐旺。夏三月此谓蕃秀，天地气交，万物华实，应夜卧早起，无厌于日，使志无怒。',
    foods: ['番茄', '山楂', '红凤菜', '莲子', '红枣'],
    foodColors: '红色食物为主，养心安神',
    lifestyle: '午后小憩，饭后散步',
    exercise: '静坐调息，双手搓热捂眼',
    acupoint: '劳宫穴、内关穴', sixSound: '呵',
    taboo: '避免大怒，忌过食辛辣',
    poem: '四时天气促相催，一夜薰风带暑来'
  },
  {
    id: 10, name: '小满', pinyin: 'Xiǎo Mǎn', date: '2026-05-21', time: '08:28',
    season: '夏', element: '火', organ: '心', color: '#c53030',
    theme: '清热祛湿、防中暑',
    description: '小满时节，气温升高，雨水增多，湿热交蒸。此时应注意清热祛湿，多喝温水，少食冰品。',
    foods: ['冬瓜', '黄瓜', '绿豆', '苦瓜', '丝瓜'],
    foodColors: '清热利湿食物',
    lifestyle: '多喝温水，少冰品，保持通风',
    exercise: '游泳，消暑健身',
    acupoint: '曲池穴、委中穴', sixSound: '呵',
    taboo: '避免贪凉，忌暴饮暴食',
    poem: '小满动三车，忙得不知他'
  },
  {
    id: 11, name: '芒种', pinyin: 'Máng Zhòng', date: '2026-06-05', time: '23:40',
    season: '夏', element: '火', organ: '心', color: '#c53030',
    theme: '助眠调心、养气安神',
    description: '芒种时节，天气炎热，昼长夜短。此时应注意养心安神，保证充足睡眠，避免过度劳累。',
    foods: ['莲子', '芝麻', '牛奶', '百合', '酸枣仁'],
    foodColors: '养心安神食物',
    lifestyle: '午休20分钟，减少刺激饮食',
    exercise: '瑜伽，放松身心',
    acupoint: '神门穴、心俞穴', sixSound: '呵',
    taboo: '避免熬夜，忌过食辛辣',
    poem: '芒种看今日，螳螂应节生'
  },
  {
    id: 12, name: '夏至', pinyin: 'Xià Zhì', date: '2026-06-21', time: '16:16',
    season: '夏', element: '火', organ: '心', color: '#c53030',
    theme: '养心降火、调气入眠',
    description: '夏至是一年中白昼最长的一天，阳气达到极盛。此时应清心降火，多食苦味蔬菜，保持心情舒畅。',
    foods: ['荞麦', '茯苓', '黄瓜', '苦瓜', '莲子心'],
    foodColors: '苦味食物，清心降火',
    lifestyle: '清晨散步，心情舒畅，避免正午烈日',
    exercise: '晨练，避开高温时段',
    acupoint: '少府穴、通里穴', sixSound: '呵',
    taboo: '避免大汗淋漓，忌贪凉饮冷',
    poem: '夏至一阴生，稍稍夕漏迟'
  },
  {
    id: 13, name: '小暑', pinyin: 'Xiǎo Shǔ', date: '2026-07-07', time: '09:50',
    season: '夏', element: '火', organ: '心', color: '#c53030',
    theme: '祛湿排毒、防倦怠',
    description: '小暑时节，天气炎热，湿气较重。此时应注意祛湿排毒，保持通风，适当出汗以排除体内湿气。',
    foods: ['薏仁', '鸭肉', '鱼腥草', '绿豆', '冬瓜'],
    foodColors: '清热利湿食物',
    lifestyle: '泡脚排湿，保持通风',
    exercise: '适度运动，微微出汗',
    acupoint: '阴陵泉、丰隆穴', sixSound: '呵',
    taboo: '避免久坐空调房，忌过食生冷',
    poem: '倏忽温风至，因循小暑来'
  },
  {
    id: 14, name: '大暑', pinyin: 'Dà Shǔ', date: '2026-07-23', time: '03:07',
    season: '夏', element: '火', organ: '心', color: '#c53030',
    theme: '清心润肺、补气养阴',
    description: '大暑是一年中最热的时节，此时应注意防暑降温，同时养阴生津，为秋季做好准备。',
    foods: ['白木耳', '玉米', '哈密瓜', '西瓜', '绿豆汤'],
    foodColors: '清热生津食物',
    lifestyle: '午休，早晚温差保暖',
    exercise: '晨练或傍晚运动',
    acupoint: '太渊穴、鱼际穴', sixSound: '呬',
    taboo: '避免烈日暴晒，忌过度贪凉',
    poem: '大暑三秋近，林钟九夏移'
  },
  {
    id: 15, name: '立秋', pinyin: 'Lì Qiū', date: '2026-08-07', time: '19:38',
    season: '秋', element: '金', organ: '肺', color: '#d69e2e',
    theme: '健脾润燥、平衡湿热',
    description: '立秋标志着秋季开始，但暑热未消。秋三月此谓容平，天气以急，地气以明，应早卧早起，与鸡俱兴，使志安宁。',
    foods: ['莲藕', '龙眼', '金针花', '银耳', '梨'],
    foodColors: '白色食物为主，润肺养阴',
    lifestyle: '早晚保暖，泡脚助眠',
    exercise: '拍打肺经，深呼吸扩胸',
    acupoint: '太渊穴、鱼际穴', sixSound: '呬',
    taboo: '避免贪凉，忌过食辛辣',
    poem: '乳鸦啼散玉屏空，一枕新凉一扇风'
  },
  {
    id: 16, name: '处暑', pinyin: 'Chǔ Shǔ', date: '2026-08-23', time: '10:16',
    season: '秋', element: '金', organ: '肺', color: '#d69e2e',
    theme: '清心润肺、防秋燥',
    description: '处暑意为暑气消退，天气转凉。此时应注意润肺防燥，多食滋阴润燥的食物。',
    foods: ['白木耳', '苹果', '蜂蜜', '梨', '百合'],
    foodColors: '润肺生津食物',
    lifestyle: '中午小憩，减少辛辣',
    exercise: '慢跑，增强肺活量',
    acupoint: '肺俞穴、膏肓穴', sixSound: '呬',
    taboo: '避免过食辛辣，忌熬夜',
    poem: '处暑无三日，新凉直万金'
  },
  {
    id: 17, name: '白露', pinyin: 'Bái Lù', date: '2026-09-07', time: '22:41',
    season: '秋', element: '金', organ: '肺', color: '#d69e2e',
    theme: '润肺安神、防秋乏',
    description: '白露时节，天气转凉，露水增多。此时应注意保暖，润肺安神，预防秋乏。',
    foods: ['秋葵', '杏仁', '海带', '银耳', '蜂蜜'],
    foodColors: '润肺养阴食物',
    lifestyle: '保持睡眠，润肤保湿',
    exercise: '散步，呼吸新鲜空气',
    acupoint: '列缺穴、尺泽穴', sixSound: '呬',
    taboo: '避免露脚受寒，忌过食生冷',
    poem: '白露团甘子，清晨散马蹄'
  },
  {
    id: 18, name: '秋分', pinyin: 'Qiū Fēn', date: '2026-09-23', time: '08:04',
    season: '秋', element: '金', organ: '肺', color: '#d69e2e',
    theme: '阴阳平衡、强身补气',
    description: '秋分日，昼夜平分，阴阳相半。此时应调和阴阳，收敛神气，保持情志平和。',
    foods: ['核桃', '蜂蜜', '乳品', '芝麻', '银耳'],
    foodColors: '滋阴润燥食物',
    lifestyle: '静坐冥想，泡脚助眠',
    exercise: '太极拳，调和阴阳',
    acupoint: '太渊穴、合谷穴', sixSound: '呬',
    taboo: '避免情绪波动，忌过食寒凉',
    poem: '金气秋分，风清露冷秋期半'
  },
  {
    id: 19, name: '寒露', pinyin: 'Hán Lù', date: '2026-10-08', time: '14:31',
    season: '秋', element: '金', organ: '肺', color: '#d69e2e',
    theme: '润燥防寒、提高免疫',
    description: '寒露时节，气温下降明显，露水寒凉。此时应注意保暖，润燥防寒，增强免疫力。',
    foods: ['柿子', '银耳', '苹果', '梨', '蜂蜜'],
    foodColors: '润肺防燥食物',
    lifestyle: '多喝温水，规律运动',
    exercise: '慢跑，增强体质',
    acupoint: '足三里、肺俞穴', sixSound: '呬',
    taboo: '避免露脚受寒，忌过食辛辣',
    poem: '袅袅凉风动，凄凄寒露零'
  },
  {
    id: 20, name: '霜降', pinyin: 'Shuāng Jiàng', date: '2026-10-23', time: '17:38',
    season: '秋', element: '金', organ: '肺', color: '#d69e2e',
    theme: '平补养阴、准备入冬',
    description: '霜降是秋季最后一个节气，天气渐冷，初霜出现。此时应平补养阴，为冬季做好准备。',
    foods: ['山药', '蜂蜜', '洋葱', '萝卜', '柿子'],
    foodColors: '平补养阴食物',
    lifestyle: '睡前泡脚，减冷饮',
    exercise: '室内运动，保持体温',
    acupoint: '关元穴、气海穴', sixSound: '呬',
    taboo: '避免受寒，忌过食生冷',
    poem: '霜降水返壑，风落木归山'
  },
  {
    id: 21, name: '立冬', pinyin: 'Lì Dōng', date: '2026-11-07', time: '17:54',
    season: '冬', element: '水', organ: '肾', color: '#1a365d',
    theme: '补肾护阳、润燥养心',
    description: '立冬标志着冬季开始，万物收藏。冬三月此谓闭藏，应早卧晚起，必待日光，保持身体温暖，不宜出大汗。',
    foods: ['黑木耳', '芝麻', '豆腐', '红肉', '羊肉'],
    foodColors: '黑色食物为主，温补肾阳',
    lifestyle: '早睡早起，暖足保腰',
    exercise: '踮脚尖提肛，搓热腰部',
    acupoint: '涌泉穴、太溪穴', sixSound: '吹',
    taboo: '避免大汗，忌食生冷',
    poem: '冻笔新诗懒写，寒炉美酒时温'
  },
  {
    id: 22, name: '小雪', pinyin: 'Xiǎo Xuě', date: '2026-11-22', time: '15:24',
    season: '冬', element: '水', organ: '肾', color: '#1a365d',
    theme: '防寒固阳、温补气血',
    description: '小雪时节，天气寒冷，降雪开始。此时应注意防寒保暖，温补气血，增强抵抗力。',
    foods: ['黑芝麻', '核桃', '乌骨鸡', '羊肉', '桂圆'],
    foodColors: '温补食物，固阳养血',
    lifestyle: '泡脚10分钟，保暖颈项',
    exercise: '室内运动，八段锦',
    acupoint: '命门穴、肾俞穴', sixSound: '吹',
    taboo: '避免受寒，忌过度劳累',
    poem: '小雪晴沙不作泥，疏帘红日弄朝晖'
  },
  {
    id: 23, name: '大雪', pinyin: 'Dà Xuě', date: '2026-12-07', time: '10:55',
    season: '冬', element: '水', organ: '肾', color: '#1a365d',
    theme: '进补养精、暖胃安神',
    description: '大雪时节，天气更冷，降雪增多。此时是进补的好时机，应温补肾阳，暖胃安神。',
    foods: ['羊肉', '山药', '姜', '葱', '枸杞'],
    foodColors: '温热食物，进补养精',
    lifestyle: '吃前先暖胃，适度运动',
    exercise: '室内太极，保持活力',
    acupoint: '关元穴、足三里', sixSound: '吹',
    taboo: '避免过度进补，忌食生冷',
    poem: '大雪压青松，青松挺且直'
  },
  {
    id: 24, name: '冬至', pinyin: 'Dōng Zhì', date: '2026-12-22', time: '04:53',
    season: '冬', element: '水', organ: '肾', color: '#1a365d',
    theme: '滋阴补阳、开启新气',
    description: '冬至是一年中白昼最短的一天，阴极阳生。此时一阳初生，应保护阳气，温补肾阳，为来年积蓄能量。',
    foods: ['汤圆', '桂圆', '酒酿', '羊肉', '饺子'],
    foodColors: '温补食物，滋阴补阳',
    lifestyle: '多晒太阳，与家人共餐',
    exercise: '轻柔运动，保存阳气',
    acupoint: '神阙穴、关元穴', sixSound: '吹',
    taboo: '避免剧烈运动，忌食生冷寒凉',
    poem: '冬至阳生春又来，口虽吟咏心中哀'
  },
];

// 五行对应关系
export const fiveElementsMap = {
  wood:  { name: '木', organ: '肝', season: '春', color: '#276749', taste: '酸', emotion: '怒', direction: '东', sound: '嘘' },
  fire:  { name: '火', organ: '心', season: '夏', color: '#c53030', taste: '苦', emotion: '喜', direction: '南', sound: '呵' },
  earth: { name: '土', organ: '脾', season: '长夏', color: '#d69e2e', taste: '甘', emotion: '思', direction: '中', sound: '呼' },
  metal: { name: '金', organ: '肺', season: '秋', color: '#d69e2e', taste: '辛', emotion: '悲', direction: '西', sound: '呬' },
  water: { name: '水', organ: '肾', season: '冬', color: '#1a365d', taste: '咸', emotion: '恐', direction: '北', sound: '吹' },
};

// 倪海厦六大健康标准
export const healthStandards = [
  { title: '头凉足热', description: '头是纯阳的，脚要温热' },
  { title: '手足温热', description: '心脏动脉喷射到手上，小肠管脚' },
  { title: '食欲正常', description: '胃口好，消化良好' },
  { title: '睡眠安稳', description: '血归肝，魂归肝，人能够安睡' },
  { title: '二便规律', description: '大便通畅，小便正常' },
  { title: '精神饱满', description: '精气神充足' },
];

// 四季作息规律
export const seasonalSleep = [
  { season: '春', pattern: '夜卧早起', description: '晚睡早起，顺应阳气生发', color: '#276749' },
  { season: '夏', pattern: '夜卧早起', description: '晚睡早起，适当午休', color: '#c53030' },
  { season: '秋', pattern: '早卧早起', description: '早睡早起，与鸡同步', color: '#d69e2e' },
  { season: '冬', pattern: '早卧晚起', description: '早睡晚起，待日光而起', color: '#1a365d' },
];

// 食疗专用 System Prompt
export const FOOD_THERAPY_PROMPT = `# Role: 倪海厦食疗分身

## 核心理念（倪师标准）
1. **阳气为王**：所有食物必须保护和生成胃热
2. **敌人**：生食、冷饮、奶制品、加工糖会制造"湿气"并损伤心脾
3. **自然时钟**：人必须按二十四节气进食

## 交互工作流
当用户询问"今天吃什么"时：

**第一步：语境分析**
- 确认当前日期和对应节气
- 如用户未提供地点，须先询问以确定当地气候

**第二步：菜品选择**
- 选择3-5道符合当前节气和倪师理念的菜品
- 优先温性食材（姜、桂皮、羊肉、粳米）

**第三步：回答生成**
- 以倪师授课口吻回答：权威、自信、略带口语化、深切关怀
- 使用"听好了""记住了"等口吻

## 输出结构（每道菜）
1. 菜名
2. 核心食材
3. 倪师点评（中医逻辑 + 节气关联）
4. 简要做法（必须加热烹饪，禁止生食沙拉）

## 严格禁忌
- 绝不推荐生蔬菜（沙拉）、刺身或冷饮
- 绝不推荐奶制品（牛奶/奶酪）或加工白糖
- 绝不推荐维生素或补充剂，只推荐天然完整食物
- 水果建议白天食用，不推荐夜间吃，最好加热或严格应季`;

// 倪师AI人设 System Prompt
export const MASTER_NI_PROMPT = `你是一位精通倪海厦养生智慧、中医经典以及五行八卦知识的中医师。你以倪师的AI分身身份与用户交流。

核心要求：
1. **优先考虑时令与地域**：优先结合当前节气和地点的养生建议
2. **优先引用倪海厦著作中的论述**，这是最权威的来源
3. 补充最新食谱或生活建议时，需甄别信息是否符合中医原则
4. **食疗建议**：针对时令推荐食物时，应结合倪师强调的"阳气""阴阳平衡"等理念
5. 使用 Markdown 格式排版，确保清晰易读
6. 语气谦和且具有倪师风格（使用"经方""阳气""阴阳平衡"等术语）`;

/** 获取当前节气 */
export function getCurrentSolarTermHealth(): SolarTermHealth {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  for (let i = 0; i < solarTermsHealth.length; i++) {
    const current = solarTermsHealth[i];
    const next = solarTermsHealth[i + 1];
    if (todayStr >= current.date && (!next || todayStr < next.date)) {
      return current;
    }
  }
  return solarTermsHealth[0];
}

/** 获取季节对应的颜色配置（返回 CSS 原生值，避免 Tailwind 动态类名被 purge） */
export function getSeasonTheme(season: string) {
  const themes: Record<string, { bg: string; accent: string; headerGradient: string }> = {
    '春': { bg: '#ecfdf5', accent: '#276749', headerGradient: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)' },
    '夏': { bg: '#fef2f2', accent: '#c53030', headerGradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' },
    '秋': { bg: '#fffbeb', accent: '#d69e2e', headerGradient: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)' },
    '冬': { bg: '#eff6ff', accent: '#1a365d', headerGradient: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)' },
  };
  return themes[season] || themes['春'];
}

/** 穴位名称中提取3D经络可用的focus code（简化的匹配） */
export function acupointToFocusCode(acupointStr: string): string | null {
  // 尝试匹配常见穴位名 -> 国际代码映射
  const map: Record<string, string> = {
    '涌泉': 'KI1', '太溪': 'KI3', '命门': 'DU4', '肾俞': 'BL23',
    '关元': 'RN4', '气海': 'RN6', '足三里': 'ST36', '三阴交': 'SP6',
    '太冲': 'LR3', '期门': 'LR14', '内关': 'PC6', '神门': 'HT7',
    '合谷': 'LI4', '曲池': 'LI11', '中脘': 'RN12',
    '劳宫': 'PC8', '少府': 'HT8', '通里': 'HT5',
    '委中': 'BL40', '心俞': 'BL15',
    '太渊': 'LU9', '鱼际': 'LU10', '肺俞': 'BL13', '膏肓': 'BL43',
    '列缺': 'LU7', '尺泽': 'LU5', '丰隆': 'ST40', '阴陵泉': 'SP9',
    '神阙': 'RN8',
  };
  for (const [name, code] of Object.entries(map)) {
    if (acupointStr.includes(name)) return code;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// 以下为合并自 solar-wellness.ts 的节气养生扩展数据（统一数据源）
// 前中后建议 / 精油 / 经络 / 熏香 / 禁忌 / 日历辅助
// ═══════════════════════════════════════════════════════════════

/** 节气养生扩展信息（原 solar-wellness 数据源 B） */
export interface SolarTermWellness {
  name: string;
  preAdvice: string[];
  onsetAdvice: string[];
  postAdvice: string[];
  essentialOils: string[];
  meridian: string;
  peakTime: string;
  dietFocus: string;
  routineFocus: string;
  incense: string;
  contraindication: string;
}

/** 节气日期信息（供日历视图使用，含黄经/当令经络） */
export interface SolarTermDateInfo {
  name: string;
  nameEn: string;
  order: number;
  month: number;
  day: number;
  endMonth: number;
  endDay: number;
  season: string;
  wuxing: string;
  meridian: string;
  meridianCode: string;
  huangJing: string;
}

export const SOLAR_TERM_DATES: SolarTermDateInfo[] = [
  { name: '小寒', nameEn: 'Minor Cold', order: 0, month: 1, day: 5, endMonth: 1, endDay: 19, season: '冬', wuxing: '水', meridian: '肺经', meridianCode: 'LU', huangJing: '285°' },
  { name: '大寒', nameEn: 'Major Cold', order: 1, month: 1, day: 20, endMonth: 2, endDay: 3, season: '冬', wuxing: '水', meridian: '心包经', meridianCode: 'PC', huangJing: '300°' },
  { name: '立春', nameEn: 'Start of Spring', order: 2, month: 2, day: 4, endMonth: 2, endDay: 18, season: '春', wuxing: '木', meridian: '肝经', meridianCode: 'LR', huangJing: '315°' },
  { name: '雨水', nameEn: 'Rain Water', order: 3, month: 2, day: 19, endMonth: 3, endDay: 4, season: '春', wuxing: '木', meridian: '胆经', meridianCode: 'GB', huangJing: '330°' },
  { name: '惊蛰', nameEn: 'Awakening', order: 4, month: 3, day: 5, endMonth: 3, endDay: 19, season: '春', wuxing: '木', meridian: '肝经', meridianCode: 'LR', huangJing: '345°' },
  { name: '春分', nameEn: 'Spring Equinox', order: 5, month: 3, day: 20, endMonth: 4, endDay: 4, season: '春', wuxing: '木', meridian: '胆经', meridianCode: 'GB', huangJing: '0°' },
  { name: '清明', nameEn: 'Clear & Bright', order: 6, month: 4, day: 5, endMonth: 4, endDay: 19, season: '春', wuxing: '木', meridian: '肝经', meridianCode: 'LR', huangJing: '15°' },
  { name: '谷雨', nameEn: 'Grain Rain', order: 7, month: 4, day: 20, endMonth: 5, endDay: 4, season: '春', wuxing: '土', meridian: '脾经', meridianCode: 'SP', huangJing: '30°' },
  { name: '立夏', nameEn: 'Start of Summer', order: 8, month: 5, day: 5, endMonth: 5, endDay: 20, season: '夏', wuxing: '火', meridian: '心经', meridianCode: 'HT', huangJing: '45°' },
  { name: '小满', nameEn: 'Grain Buds', order: 9, month: 5, day: 21, endMonth: 6, endDay: 5, season: '夏', wuxing: '火', meridian: '小肠经', meridianCode: 'SI', huangJing: '60°' },
  { name: '芒种', nameEn: 'Grain in Ear', order: 10, month: 6, day: 6, endMonth: 6, endDay: 20, season: '夏', wuxing: '火', meridian: '心经', meridianCode: 'HT', huangJing: '75°' },
  { name: '夏至', nameEn: 'Summer Solstice', order: 11, month: 6, day: 21, endMonth: 7, endDay: 6, season: '夏', wuxing: '火', meridian: '胃经', meridianCode: 'ST', huangJing: '90°' },
  { name: '小暑', nameEn: 'Minor Heat', order: 12, month: 7, day: 7, endMonth: 7, endDay: 22, season: '夏', wuxing: '火', meridian: '心包经', meridianCode: 'PC', huangJing: '105°' },
  { name: '大暑', nameEn: 'Major Heat', order: 13, month: 7, day: 23, endMonth: 8, endDay: 6, season: '夏', wuxing: '土', meridian: '脾经', meridianCode: 'SP', huangJing: '120°' },
  { name: '立秋', nameEn: 'Start of Autumn', order: 14, month: 8, day: 7, endMonth: 8, endDay: 22, season: '秋', wuxing: '金', meridian: '肺经', meridianCode: 'LU', huangJing: '135°' },
  { name: '处暑', nameEn: 'End of Heat', order: 15, month: 8, day: 23, endMonth: 9, endDay: 7, season: '秋', wuxing: '金', meridian: '胆经', meridianCode: 'GB', huangJing: '150°' },
  { name: '白露', nameEn: 'White Dew', order: 16, month: 9, day: 8, endMonth: 9, endDay: 22, season: '秋', wuxing: '金', meridian: '膀胱经', meridianCode: 'BL', huangJing: '165°' },
  { name: '秋分', nameEn: 'Autumn Equinox', order: 17, month: 9, day: 23, endMonth: 10, endDay: 7, season: '秋', wuxing: '金', meridian: '肺经', meridianCode: 'LU', huangJing: '180°' },
  { name: '寒露', nameEn: 'Cold Dew', order: 18, month: 10, day: 8, endMonth: 10, endDay: 22, season: '秋', wuxing: '金', meridian: '大肠经', meridianCode: 'LI', huangJing: '195°' },
  { name: '霜降', nameEn: "Frost's Descent", order: 19, month: 10, day: 23, endMonth: 11, endDay: 6, season: '秋', wuxing: '土', meridian: '脾经', meridianCode: 'SP', huangJing: '210°' },
  { name: '立冬', nameEn: 'Start of Winter', order: 20, month: 11, day: 7, endMonth: 11, endDay: 21, season: '冬', wuxing: '水', meridian: '肾经', meridianCode: 'KI', huangJing: '225°' },
  { name: '小雪', nameEn: 'Minor Snow', order: 21, month: 11, day: 22, endMonth: 12, endDay: 6, season: '冬', wuxing: '水', meridian: '肾经', meridianCode: 'KI', huangJing: '240°' },
  { name: '大雪', nameEn: 'Major Snow', order: 22, month: 12, day: 7, endMonth: 12, endDay: 21, season: '冬', wuxing: '水', meridian: '肾经', meridianCode: 'KI', huangJing: '255°' },
  { name: '冬至', nameEn: 'Winter Solstice', order: 23, month: 12, day: 22, endMonth: 1, endDay: 4, season: '冬', wuxing: '水', meridian: '胃经', meridianCode: 'ST', huangJing: '270°' },
];

/** 节气养生扩展内容（原 solar-wellness 数据源 B） */
export const SOLAR_TERM_WELLNESS: SolarTermWellness[] = [
  {
    name: '小寒',
    preAdvice: ['防寒保暖为首，提前添加衣物', '温补肾阳，可适度进补', '室内保持通风，避免干燥'],
    onsetAdvice: ['小寒至冷时，温补肾阳为要', '早卧晚起，必待日光', '晨起温水泡脚，搓涌泉穴'],
    postAdvice: ['持续温补，食温热食物', '避免剧烈运动，适度散步', '督脉艾灸，固护阳气'],
    essentialOils: ['丁香', '肉桂', '生姜'],
    meridian: '手太阴肺经',
    peakTime: '寅时 3:00-5:00',
    dietFocus: '温补脾肾，食栗子花生',
    routineFocus: '防寒保暖，减少外出',
    incense: '丁香熏香，温中散寒',
    contraindication: '忌食寒凉生冷，忌大汗淋漓',
  },
  {
    name: '大寒',
    preAdvice: ['极寒将至，添衣加被', '温补肾阳食物可增加', '室内适当加湿，防燥伤肺'],
    onsetAdvice: ['大寒为冬末，养藏收官', '温补元阳，食羊肉饺子', '静心安神，减少思虑'],
    postAdvice: ['冬春交替，乍暖还寒注意保暖', '逐步增加户外活动', '养藏收尾，准备迎春'],
    essentialOils: ['没药', '乳香', '广藿香'],
    meridian: '手厥阴心包经',
    peakTime: '戌时 19:00-21:00',
    dietFocus: '温补收官，食八宝粥',
    routineFocus: '养藏收尾，准备迎春',
    incense: '没药熏香，温经固肾',
    contraindication: '忌寒凉食物，忌过度劳累',
  },
  {
    name: '立春',
    preAdvice: ['冬春交替，注意防风御寒', '准备辛甘发散之物', '调整作息，准备早起'],
    onsetAdvice: ['立春阳气生发，助肝气升', '夜卧早起，舒展筋骨', '辛甘发散，食韭菜香菜'],
    postAdvice: ['顺应春气，适度增加运动量', '保持心情舒畅，避免郁怒', '疏肝理气，揉太冲穴'],
    essentialOils: ['紫苏叶', '薄荷', '迷迭香'],
    meridian: '足厥阴肝经',
    peakTime: '丑时 1:00-3:00',
    dietFocus: '辛甘发散，食韭菜香菜',
    routineFocus: '夜卧早起，舒展筋骨',
    incense: '紫苏叶熏香，助肝气生发',
    contraindication: '忌酸收之品，忌久坐不动',
  },
  {
    name: '雨水',
    preAdvice: ['春雨初降，注意防湿', '准备健脾祛湿之品', '早晚温差异大，适时增减衣物'],
    onsetAdvice: ['雨水节气，湿气渐重', '少酸多甘，食山药大枣', '晨起缓行，防风保暖'],
    postAdvice: ['持续健脾祛湿', '防风湿侵袭关节', '按揉足三里、阴陵泉'],
    essentialOils: ['薄荷', '佛手柑', '豆蔻'],
    meridian: '足少阳胆经',
    peakTime: '子时 23:00-1:00',
    dietFocus: '少酸多甘，食山药大枣',
    routineFocus: '晨起缓行，防风保暖',
    incense: '薄荷熏香，疏肝解郁',
    contraindication: '忌肥甘厚味，忌淋雨受凉',
  },
  {
    name: '惊蛰',
    preAdvice: ['万物始生，准备助阳升发', '可食辛散之物助肝', '注意防风，风为春季主气'],
    onsetAdvice: ['惊蛰春雷动，阳气大升', '早起运动，顺应阳气', '清淡养肝，食菠菜芹菜'],
    postAdvice: ['春日运动渐增，量力而行', '保持充足睡眠', '疏肝泻火，揉行间穴'],
    essentialOils: ['艾叶', '尤加利', '茶树'],
    meridian: '足厥阴肝经',
    peakTime: '丑时 1:00-3:00',
    dietFocus: '清淡养肝，食菠菜芹菜',
    routineFocus: '早起运动，顺应阳气',
    incense: '艾叶熏香，驱寒除湿',
    contraindication: '忌暴怒，忌辛辣过度',
  },
  {
    name: '春分',
    preAdvice: ['阴阳相半，调和为主', '饮食忌偏热偏寒', '情志保持平和'],
    onsetAdvice: ['春分昼夜平，阴阳均衡', '作息有常，心情舒畅', '阴阳均衡，忌偏热偏寒'],
    postAdvice: ['持续阴阳调和', '适度运动，不过度', '按摩肝经，推太冲至行间'],
    essentialOils: ['玫瑰', '天竺葵', '依兰'],
    meridian: '足少阳胆经',
    peakTime: '子时 23:00-1:00',
    dietFocus: '阴阳均衡，忌偏热偏寒',
    routineFocus: '作息有常，心情舒畅',
    incense: '玫瑰熏香，调畅情志',
    contraindication: '忌偏食偏嗜，忌情绪极端',
  },
  {
    name: '清明',
    preAdvice: ['清明前后肝气最旺', '准备柔肝养肺之品', '慎食发物，如虾蟹韭菜'],
    onsetAdvice: ['清明踏青时，亲近自然', '柔肝养肺，食银耳百合', '菊花熏香，清肝明目'],
    postAdvice: ['春气升发旺盛，注意疏泄', '防过敏，少食发物', '养肺防燥，按合谷穴'],
    essentialOils: ['菊花', '薄荷', '薰衣草'],
    meridian: '足厥阴肝经',
    peakTime: '丑时 1:00-3:00',
    dietFocus: '柔肝养肺，食银耳百合',
    routineFocus: '踏青散步，亲近自然',
    incense: '菊花熏香，清肝明目',
    contraindication: '忌食发物，忌怒火攻心',
  },
  {
    name: '谷雨',
    preAdvice: ['暮春湿气加重，准备祛湿', '增甘减酸饮食调整', '防湿邪入体'],
    onsetAdvice: ['谷雨春将暮，健脾祛湿', '增甘减酸，食薏仁红豆', '适度运动，防湿保暖'],
    postAdvice: ['湿气重，持续健脾', '准备过渡到夏季饮食', '祛湿常按阴陵泉'],
    essentialOils: ['荷叶', '广藿香', '生姜'],
    meridian: '足太阴脾经',
    peakTime: '巳时 9:00-11:00',
    dietFocus: '增甘减酸，食薏仁红豆',
    routineFocus: '适度运动，防湿保暖',
    incense: '荷叶熏香，健脾祛湿',
    contraindication: '忌寒凉伤脾，忌久坐湿地',
  },
  {
    name: '立夏',
    preAdvice: ['春夏交替，养心安神为先', '准备清心降火之品', '调整午间作息，准备午睡'],
    onsetAdvice: ['立夏心火旺，养心安神', '清淡为主，食绿豆莲子', '夜卧早起，午间小憩'],
    postAdvice: ['心火渐旺，继续清心', '午睡养心很重要', '按内关、神门安眠'],
    essentialOils: ['檀香', '乳香', '薰衣草'],
    meridian: '手少阴心经',
    peakTime: '午时 11:00-13:00',
    dietFocus: '清淡为主，食绿豆莲子',
    routineFocus: '夜卧早起，午间小憩',
    incense: '檀香熏香，宁心安神',
    contraindication: '忌大喜大悲，忌暴晒暴汗',
  },
  {
    name: '小满',
    preAdvice: ['湿热渐显，清热利湿', '避免贪凉伤阳', '准备消暑之物'],
    onsetAdvice: ['小满湿热生，清利为要', '清热利湿，食冬瓜薏米', '避免贪凉，静心养神'],
    postAdvice: ['湿气重，持续清热利湿', '防湿热型皮肤病', '刮痧祛湿，排脾经湿热'],
    essentialOils: ['薰衣草', '薄荷', '柠檬'],
    meridian: '手太阳小肠经',
    peakTime: '未时 13:00-15:00',
    dietFocus: '清热利湿，食冬瓜薏米',
    incense: '薰衣草熏香，安心定志',
    contraindication: '忌冰饮寒凉，忌空调直吹',
  },
  {
    name: '芒种',
    preAdvice: ['暑气日盛，注意防暑', '清补为主饮食调整', '午睡习惯要养成'],
    onsetAdvice: ['芒种忙种时，清心降火', '清补为主，食苦瓜黄瓜', '午睡养心，避免烈日'],
    postAdvice: ['三伏将至，持续养心', '心火旺可按少府穴', '清淡饮食，防暑降温'],
    essentialOils: ['薄荷', '茶树', '尤加利'],
    meridian: '手少阴心经',
    peakTime: '午时 11:00-13:00',
    dietFocus: '清补为主，食苦瓜黄瓜',
    incense: '荷花熏香，清心降火',
    contraindication: '忌烈日暴晒，忌辛辣燥热',
  },
  {
    name: '夏至',
    preAdvice: ['阳气极盛，注意养阳护阴', '准备降火安神之物', '避免过度运动耗气'],
    onsetAdvice: ['夏至阳极阴生，养阳护阴', '饮食清润，食酸梅绿豆', '沉香熏香，降火安神'],
    postAdvice: ['阴气始生，注意护阳', '晚睡早起适当调整', '灸关元穴，冬病夏治'],
    essentialOils: ['沉香', '檀香', '乳香'],
    meridian: '足阳明胃经',
    peakTime: '辰时 7:00-9:00',
    dietFocus: '饮食清润，食酸梅绿豆',
    incense: '沉香熏香，降火安神',
    contraindication: '忌贪凉过度，忌房事过度',
  },
  {
    name: '小暑',
    preAdvice: ['伏天将至，备好消暑之物', '调整运动时间，避开正午', '心火旺盛注意静心'],
    onsetAdvice: ['小暑入伏，清暑益气', '清淡消暑，食西瓜荷叶', '避免暑热，静心养气'],
    postAdvice: ['三伏天持续，冬病夏治好时机', '艾灸督脉、足三里', '大量流汗及时补水补盐'],
    essentialOils: ['薄荷', '柠檬', '茶树'],
    meridian: '手厥阴心包经',
    peakTime: '戌时 19:00-21:00',
    dietFocus: '清淡消暑，食西瓜荷叶',
    incense: '薄荷熏香，清暑益气',
    contraindication: '忌冷水浴，忌暴饮暴食',
  },
  {
    name: '大暑',
    preAdvice: ['一年最热，做好防暑降温', '准备化湿解暑之品', '减少户外活动时间'],
    onsetAdvice: ['大暑极热时，化湿解暑', '清热解暑，食绿豆百合', '防暑降温，安神定志'],
    postAdvice: ['暑热将退，仍需防暑', '逐步恢复正常运动量', '长夏主湿，持续健脾'],
    essentialOils: ['藿香', '广藿香', '薄荷'],
    meridian: '足太阴脾经',
    peakTime: '巳时 9:00-11:00',
    dietFocus: '清热解暑，食绿豆百合',
    incense: '藿香熏香，化湿解暑',
    contraindication: '忌暴晒中暑，忌贪凉伤脾',
  },
  {
    name: '立秋',
    preAdvice: ['夏秋交替，润燥养肺', '准备滋阴润燥之品', '秋冻尚早，注意温差'],
    onsetAdvice: ['立秋燥气生，润肺生津', '滋阴润燥，食梨银耳', '早卧早起，收敛神气'],
    postAdvice: ['秋燥明显，持续润肺', '防秋乏，适当运动', '按太渊穴养肺气'],
    essentialOils: ['桂花', '柠檬', '薄荷'],
    meridian: '手太阴肺经',
    peakTime: '寅时 3:00-5:00',
    dietFocus: '滋阴润燥，食梨银耳',
    incense: '桂花熏香，润肺生津',
    contraindication: '忌辛辣燥热，忌大汗耗气',
  },
  {
    name: '处暑',
    preAdvice: ['暑气渐消，秋凉渐至', '少辛多酸饮食调整', '注意早晚温差'],
    onsetAdvice: ['处暑暑气止，清热润肺', '少辛多酸，食蜂蜜芝麻', '秋冻适度，养肺为先'],
    postAdvice: ['秋高气爽，适度增加户外', '润燥持续，防秋燥伤肺', '按揉列缺穴润肺'],
    essentialOils: ['菊花', '薰衣草', '橙花'],
    meridian: '足少阳胆经',
    peakTime: '子时 23:00-1:00',
    dietFocus: '少辛多酸，食蜂蜜芝麻',
    incense: '菊花熏香，清热润肺',
    contraindication: '忌辛辣煎炸，忌冷水浴',
  },
  {
    name: '白露',
    preAdvice: ['白露至，早晚添衣', '准备温润养肺之品', '防寒气入侵'],
    onsetAdvice: ['白露秋风凉，温肺散寒', '温润养肺，食山药百合', '早晚添衣，防寒保暖'],
    postAdvice: ['秋燥转凉，防燥又防寒', '温补脾肾初开始', '灸肺俞穴温肺'],
    essentialOils: ['松木', '尤加利', '乳香'],
    meridian: '足太阳膀胱经',
    peakTime: '申时 15:00-17:00',
    dietFocus: '温润养肺，食山药百合',
    incense: '松木熏香，温肺散寒',
    contraindication: '忌秋冻过度，忌食冷饮',
  },
  {
    name: '秋分',
    preAdvice: ['昼夜再次均等，阴阳调和', '准备阴阳均衡之食', '注意情绪平和'],
    onsetAdvice: ['秋分阴阳半，调和为要', '阴阳均衡，食梨枸杞', '作息有常，心情平和'],
    postAdvice: ['阴气渐盛，注意养阴', '防悲秋情绪低落', '檀香安神，调和阴阳'],
    essentialOils: ['檀香', '玫瑰', '依兰'],
    meridian: '手太阴肺经',
    peakTime: '寅时 3:00-5:00',
    dietFocus: '阴阳均衡，食梨枸杞',
    incense: '檀香熏香，调和阴阳',
    contraindication: '忌忧思过度，忌饮食无常',
  },
  {
    name: '寒露',
    preAdvice: ['寒气日重，准备温补', '温补脾肾开始', '早卧晚起习惯调整'],
    onsetAdvice: ['寒露秋已深，温肾纳气', '温补脾肾，食栗子核桃', '早卧晚起，防寒护阳'],
    postAdvice: ['深秋寒重，持续温补', '防寒保暖非常重要', '灸肾俞穴温补肾阳'],
    essentialOils: ['乳香', '没药', '生姜'],
    meridian: '手阳明大肠经',
    peakTime: '卯时 5:00-7:00',
    dietFocus: '温补脾肾，食栗子核桃',
    incense: '乳香熏香，温肾纳气',
    contraindication: '忌寒凉食物，忌过度劳累',
  },
  {
    name: '霜降',
    preAdvice: ['霜降将至，注意深秋防寒', '温补食物增加', '运动量适度减少'],
    onsetAdvice: ['霜降秋已末，温经散寒', '温补为主，食羊肉萝卜', '适度运动，保暖防寒'],
    postAdvice: ['秋冬交替，大温补开始', '准备冬令进补方案', '灸关元穴培元固本'],
    essentialOils: ['没药', '肉桂', '广藿香'],
    meridian: '足太阴脾经',
    peakTime: '巳时 9:00-11:00',
    dietFocus: '温补为主，食羊肉萝卜',
    incense: '没药熏香，温经散寒',
    contraindication: '忌寒凉生冷，忌冒霜出行',
  },
  {
    name: '立冬',
    preAdvice: ['冬令开始，准备温补养藏', '增加温补肾阳食物', '作息调整早睡晚起'],
    onsetAdvice: ['立冬藏之始，温肾藏精', '温补养藏，食黑豆核桃', '早卧晚起，养藏阳气'],
    postAdvice: ['冬藏为主，减少运动量', '保暖防寒持续', '肾经疏通，揉涌泉穴'],
    essentialOils: ['沉香', '檀香', '乳香'],
    meridian: '足少阴肾经',
    peakTime: '酉时 17:00-19:00',
    dietFocus: '温补养藏，食黑豆核桃',
    incense: '沉香熏香，温肾藏精',
    contraindication: '忌寒凉伤肾，忌大汗淋漓',
  },
  {
    name: '小雪',
    preAdvice: ['冬寒加深，保暖加温', '温补肾阳食物为主', '静心安神防抑郁'],
    onsetAdvice: ['小雪寒渐浓，温阳安神', '温补肾阳，食羊肉桂圆', '保暖防寒，静心养神'],
    postAdvice: ['日照短，预防冬季抑郁', '温补持续，可膏方进补', '艾灸命门穴温补肾阳'],
    essentialOils: ['安息香', '檀香', '乳香'],
    meridian: '足少阴肾经',
    peakTime: '酉时 17:00-19:00',
    dietFocus: '温补肾阳，食羊肉桂圆',
    incense: '安息香熏香，温阳安神',
    contraindication: '忌忧思过度，忌寒冷环境久留',
  },
  {
    name: '大雪',
    preAdvice: ['大雪前后寒气最重', '温阳散寒食物加大力度', '减少一切不必要外出'],
    onsetAdvice: ['大雪仲冬时，温阳散寒', '温补为主，食红枣当归', '早卧晚起，固护阳气'],
    postAdvice: ['冬至将至，极寒养藏', '适当进补高热量食物', '灸气海穴温阳补气'],
    essentialOils: ['肉桂', '生姜', '丁香'],
    meridian: '足少阴肾经',
    peakTime: '酉时 17:00-19:00',
    dietFocus: '温补为主，食红枣当归',
    incense: '肉桂熏香，温阳散寒',
    contraindication: '忌寒凉入体，忌房事过度',
  },
  {
    name: '冬至',
    preAdvice: ['冬至将至，极寒养藏', '温补肾阳食物备好', '调整作息早睡早起'],
    onsetAdvice: ['冬至一阳生，温补肾阳', '温补元阳，食羊肉饺子', '极寒养藏，适度进补'],
    postAdvice: ['阳气始生，护阳为要', '冬至进补正当时', '灸神阙穴培元固本'],
    essentialOils: ['乳香', '没药', '檀香'],
    meridian: '足阳明胃经',
    peakTime: '辰时 7:00-9:00',
    dietFocus: '温补元阳，食羊肉饺子',
    routineFocus: '极寒养藏，适度进补',
    incense: '乳香熏香，温补肾阳',
    contraindication: '忌剧烈运动，忌暴饮暴食',
  },
];

/** 季节配色（日历视图用） */
export const SEASON_COLORS: Record<string, string> = {
  '春': '#7DBA6E', '夏': '#E86040', '秋': '#D4A574', '冬': '#4A90D9',
};

/** 季节图标（日历视图用） */
export const SEASON_ICONS: Record<string, string> = {
  '春': '🌸', '夏': '☀️', '秋': '🍂', '冬': '❄️',
};

/** 季节渐变（日历视图用） */
export const SEASON_GRADIENTS: Record<string, [string, string]> = {
  '春': ['#d4edda', '#c3e6cb'],
  '夏': ['#fff3cd', '#ffeaa7'],
  '秋': ['#f5e6d3', '#e8d5c4'],
  '冬': ['#d6eaf8', '#c5dbe8'],
};

/** 获取当前节气日期信息 */
export function getCurrentSolarTermDateInfo(date: Date = new Date()): SolarTermDateInfo {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (let i = SOLAR_TERM_DATES.length - 1; i >= 0; i--) {
    const term = SOLAR_TERM_DATES[i];
    const termStart = new Date(year, term.month - 1, term.day);
    const termEnd = new Date(
      term.endMonth < term.month ? year + 1 : year,
      term.endMonth - 1,
      term.endDay
    );
    if (date >= termStart && date <= termEnd) {
      return term;
    }
  }

  const lastTerm = SOLAR_TERM_DATES[SOLAR_TERM_DATES.length - 1];
  const lastTermEnd = new Date(year, lastTerm.endMonth - 1, lastTerm.endDay);
  if (date <= lastTermEnd) {
    return lastTerm;
  }

  return SOLAR_TERM_DATES[0];
}

/** 获取当前节气养生扩展 */
export function getCurrentWellness(date: Date = new Date()): SolarTermWellness {
  const termInfo = getCurrentSolarTermDateInfo(date);
  return SOLAR_TERM_WELLNESS.find(w => w.name === termInfo.name) || SOLAR_TERM_WELLNESS[0];
}

/** 获取节气临近信息（前/当令/后 + 距下个节气天数） */
export function getSolarTermProximity(date: Date = new Date()): {
  current: SolarTermDateInfo;
  next: SolarTermDateInfo;
  daysUntilNext: number;
  phase: 'pre' | 'onset' | 'post';
} {
  const current = getCurrentSolarTermDateInfo(date);
  const year = date.getFullYear();
  const currentStart = new Date(year, current.month - 1, current.day);
  const daysSinceStart = Math.floor((date.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));

  const phase: 'pre' | 'onset' | 'post' =
    daysSinceStart <= 2 ? 'pre' : daysSinceStart <= 7 ? 'onset' : 'post';

  const nextOrder = (current.order + 1) % 24;
  const next = SOLAR_TERM_DATES[nextOrder];
  const nextStart = new Date(
    next.order <= current.order ? year + 1 : year,
    next.month - 1,
    next.day
  );
  const daysUntilNext = Math.floor((nextStart.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  return { current, next, daysUntilNext, phase };
}

/** 获取某月的节气标记（日历视图用） */
export function getCalendarTermMarkers(year: number, month: number): Array<{
  day: number;
  term: SolarTermDateInfo;
}> {
  const markers: Array<{ day: number; term: SolarTermDateInfo }> = [];
  for (const term of SOLAR_TERM_DATES) {
    if (term.month === month) {
      markers.push({ day: term.day, term });
    }
    if (term.endMonth === month) {
      if (term.endDay < term.day || term.endMonth !== term.month) {
        markers.push({ day: term.endDay, term });
      }
    }
  }
  return markers;
}

/** 获取某月的节气（含日期排序） */
export function getSolarTermsInMonth(year: number, month: number): SolarTermDateInfo[] {
  return SOLAR_TERM_DATES.filter(t => t.month === month || t.endMonth === month).map(t => {
    const termDate = t.month === month
      ? new Date(year, t.month - 1, t.day)
      : new Date(year, t.endMonth - 1, t.endDay);
    return { ...t, _date: termDate } as SolarTermDateInfo & { _date: Date };
  }).sort((a, b) => a._date.getTime() - b._date.getTime());
}

/** 获取指定节气日期 */
export function getSolarTermDate(year: number, term: SolarTermDateInfo): Date {
  return new Date(year, term.month - 1, term.day);
}
