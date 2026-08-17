export type WuxingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export type ModuleConfig = {
  href: string;
  icon: string;
  name: string;
  desc: string;
  element: WuxingElement;
};

export const DAILY_QUOTES: Array<{ text: string; author: string }> = [
  { text: '上工治未病，不治已病', author: '《黄帝内经》' },
  { text: '恬淡虚无，真气从之；精神内守，病安从来', author: '《素问·上古天真论》' },
  { text: '阴平阳秘，精神乃治', author: '《素问·生气通天论》' },
  { text: '正气存内，邪不可干', author: '《素问·刺法论》' },
  { text: '起居有常，不妄作劳', author: '《素问·上古天真论》' },
  { text: '法于阴阳，和于术数', author: '《素问·上古天真论》' },
  { text: '饮食有节，起居有常，不妄作劳', author: '《黄帝内经》' },
  { text: '百病生于气也，怒则气上，喜则气缓', author: '《素问·举痛论》' },
  { text: '心者，君主之官也，神明出焉', author: '《素问·灵兰秘典论》' },
  { text: '脾胃者，仓廪之官，五味出焉', author: '《素问·灵兰秘典论》' },
  { text: '圣人不治已病治未病，不治已乱治未乱', author: '《素问·四气调神大论》' },
  { text: '春养肝，夏养心，秋养肺，冬养肾', author: '《黄帝内经》' },
];

export const TREATMENT_MODULES: ModuleConfig[] = [
  { href: '/healing/acupoint', icon: 'CircleDot', name: '穴位定位', desc: '416穴·高清图·经络筛选', element: 'metal' },
  { href: '/healing/meridian-chart', icon: 'GitBranch', name: '经络图解', desc: '15条经络·动态图·穴位', element: 'wood' },
  { href: '/healing/ai-diagnosis', icon: 'MessageCircleHeart', name: 'AI导诊', desc: '智能问诊·个性化方案', element: 'fire' },
  { href: '/healing/color-diagnosis', icon: 'Palette', name: '色彩情志', desc: '色诊明辨·五行推荐', element: 'earth' },
  { href: '/jiuliao', icon: 'FlameKindling', name: '灸疗处方', desc: '329方辨证施灸', element: 'earth' },
  { href: '/healing/guasha', icon: 'RotateCw', name: '传统刮痧', desc: '九大体系·全息刮法', element: 'fire' },
  { href: '/tuina', icon: 'Hand', name: '推拿手法', desc: '61种国标手法', element: 'earth' },
];

export const THERAPY_MODULES: ModuleConfig[] = [
  { href: '/healing/liuzijue', icon: 'Wind', name: '六字诀', desc: '呼吸引导·沉浸体验', element: 'wood' },
  { href: '/healing/wuyin', icon: 'Music', name: '五音疗愈', desc: '角徵宫商羽·可视化', element: 'water' },
  { href: '/healing/mineradio', icon: 'Music2', name: '天籁', desc: '天籁无奏·万窍自鸣', element: 'water' },
  { href: '/healing/zhi-yin-zhi-jing', icon: 'Sparkles', name: '知音之境', desc: '四境沉浸·口语疗愈解说', element: 'water' },
  { href: '/healing/tuina-guide', icon: 'Hand', name: '推拿引导', desc: '自推拿·语音引导', element: 'earth' },
  { href: '/healing/grounding', icon: 'FlameKindling', name: '灸疗疏导', desc: '静禅国灸·十大流程', element: 'fire' },
  { href: '/healing/singing-bowl', icon: 'Volume2', name: '颂钵', desc: '频率调谐·实时可视化', element: 'metal' },
  { href: '/healing/chakra', icon: 'CircleDot', name: '脉轮', desc: '7脉轮·频率调谐', element: 'fire' },
];

export const LIFESTYLE_MODULES: ModuleConfig[] = [
  { href: '/healing/spine-solar', icon: 'Bone', name: '脊柱身心', desc: '节气↔椎骨↔经络深层关联', element: 'earth' },
  { href: '/healing/essence', icon: 'Droplets', name: '精油图谱', desc: '108精油·五行归经·疗愈方', element: 'water' },
  { href: '/healing/solar-calendar', icon: 'CalendarHeart', name: '节气养生', desc: '二十四节气·顺时调养', element: 'wood' },
  { href: '/healing/diet', icon: 'Leaf', name: '节气饮食', desc: '顺天时而食·二十四节气', element: 'earth' },
  { href: '/healing/fitness', icon: 'Dumbbell', name: '运动康复', desc: '8套方案·五行关联', element: 'water' },
  { href: '/healing/tea', icon: 'Coffee', name: '茶道养生', desc: '品茶听乐·五行五音', element: 'wood' },
  { href: '/healing/wine', icon: 'Wine', name: '酒道品鉴', desc: '药酒养生·五行配伍', element: 'fire' },
  { href: '/healing/flower', icon: 'Flower2', name: '花语养生', desc: '花语寄情·四季花令', element: 'wood' },
  { href: '/healing/wuxing-clothing', icon: 'Shirt', name: '五行穿衣', desc: '日柱五行·相生相克配色', element: 'earth' },
];

export const ELEMENT_STYLE: Record<string, { accent: string; bg: string; text: string; border: string }> = {
  wood:   { accent: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
  fire:   { accent: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  earth:  { accent: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  metal:  { accent: 'bg-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-500/20' },
  water:  { accent: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
};

export const ELEMENT_ICON_BG: Record<string, string> = {
  wood: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
  fire: 'bg-gradient-to-br from-red-500 to-red-700',
  earth: 'bg-gradient-to-br from-amber-400 to-amber-600',
  metal: 'bg-gradient-to-br from-teal-500 to-teal-700',
  water: 'bg-gradient-to-br from-blue-500 to-blue-700',
};
