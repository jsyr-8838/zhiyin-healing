export interface SymptomRule {
  id: string;
  keywords: string[];
  organ: string;
  meridian: string;
  category: string;
  description: string;
  advice: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export const SYMPTOM_RULES: SymptomRule[] = [
  {
    id: 'liver-qi-stagnation',
    keywords: ['易怒', '烦躁', '胁肋胀痛', '叹气', '胸闷', '乳房胀痛', '月经不调', '口苦'],
    organ: '肝',
    meridian: '足厥阴肝经',
    category: '肝气郁结',
    description: '肝失疏泄，气机郁滞，表现为情志抑郁或易怒、胸胁胀痛等',
    advice: ['保持心情舒畅，避免郁怒', '适度运动疏通气血', '按揉太冲穴疏肝理气', '可饮玫瑰花茶疏肝解郁'],
    severity: 'moderate',
  },
  {
    id: 'heart-fire',
    keywords: ['心烦', '失眠', '口舌生疮', '心悸', '多梦', '面赤', '舌尖红', '小便黄'],
    organ: '心',
    meridian: '手少阴心经',
    category: '心火旺盛',
    description: '心火内炽，扰动心神，表现为心烦失眠、口舌生疮等',
    advice: ['清心降火，少思少虑', '可用莲子心泡水代茶', '按揉少府穴清心泻火', '避免熬夜耗伤心阴'],
    severity: 'moderate',
  },
  {
    id: 'spleen-qi-deficiency',
    keywords: ['乏力', '食欲不振', '腹胀', '便溏', '面色萎黄', '气短', '消瘦', '浮肿'],
    organ: '脾',
    meridian: '足太阴脾经',
    category: '脾气虚弱',
    description: '脾失健运，气血生化不足，表现为纳差腹胀、倦怠乏力等',
    advice: ['规律饮食，忌生冷油腻', '可食山药薏仁健脾', '按揉足三里健脾益气', '适度运动助脾运化'],
    severity: 'moderate',
  },
  {
    id: 'lung-qi-deficiency',
    keywords: ['咳嗽', '气短', '自汗', '易感冒', '声音低弱', '面白', '鼻塞', '咽干'],
    organ: '肺',
    meridian: '手太阴肺经',
    category: '肺气不足',
    description: '肺气亏虚，卫外不固，表现为咳喘无力、易感冒等',
    advice: ['注意保暖防寒', '可食百合银耳润肺', '按揉太渊穴补肺气', '练习深呼吸养肺'],
    severity: 'mild',
  },
  {
    id: 'kidney-yang-deficiency',
    keywords: ['腰膝酸冷', '畏寒', '夜尿多', '水肿', '阳痿', '宫寒', '五更泄', '精神萎靡'],
    organ: '肾',
    meridian: '足少阴肾经',
    category: '肾阳亏虚',
    description: '肾阳不足，温煦失职，表现为畏寒肢冷、腰膝酸冷等',
    advice: ['温补肾阳，食羊肉核桃', '每晚温水泡脚搓涌泉', '艾灸命门穴温补肾阳', '避免久坐寒凉之地'],
    severity: 'moderate',
  },
  {
    id: 'stomach-heat',
    keywords: ['胃脘灼痛', '口臭', '牙龈肿痛', '消谷善饥', '便秘', '口渴', '泛酸', '烧心'],
    organ: '胃',
    meridian: '足阳明胃经',
    category: '胃热炽盛',
    description: '胃火炽盛，灼伤胃津，表现为胃脘灼痛、口臭便秘等',
    advice: ['清淡饮食，忌辛辣煎炸', '可饮绿豆汤清胃热', '按揉内庭穴清泻胃火', '规律作息避免熬夜'],
    severity: 'moderate',
  },
  {
    id: 'gallbladder-heat',
    keywords: ['口苦', '目眩', '偏头痛', '耳鸣', '胁痛', '惊悸', '失眠多梦', '善太息'],
    organ: '胆',
    meridian: '足少阳胆经',
    category: '胆火上炎',
    description: '胆火上扰，决断失常，表现为口苦目眩、偏头痛等',
    advice: ['疏肝利胆，保持心情平和', '可饮菊花茶清胆热', '按揉风池穴疏泄胆火', '早睡避免子时未眠'],
    severity: 'mild',
  },
  {
    id: 'bladder-damp-heat',
    keywords: ['尿频', '尿急', '尿痛', '腰痛', '小便黄赤', '小腹胀痛', '血尿', '尿不尽'],
    organ: '膀胱',
    meridian: '足太阳膀胱经',
    category: '膀胱湿热',
    description: '湿热蕴结膀胱，气化不利，表现为尿频尿急、小便黄赤等',
    advice: ['清热利湿通淋', '多饮水促进排泄', '按揉委中穴通利膀胱', '忌辛辣肥甘厚味'],
    severity: 'moderate',
  },
  {
    id: 'large-intestine-heat',
    keywords: ['便秘', '腹痛', '痔疮', '便血', '里急后重', '大便干结', '肛裂', '腹胀'],
    organ: '大肠',
    meridian: '手阳明大肠经',
    category: '大肠燥热',
    description: '大肠热盛，津液亏耗，表现为便秘腹痛、大便干结等',
    advice: ['润肠通便，多食蔬果', '可饮蜂蜜水润肠', '按揉合谷穴通泄大肠', '养成定时排便习惯'],
    severity: 'mild',
  },
  {
    id: 'small-intestine-heat',
    keywords: ['小腹胀痛', '小便赤涩', '口舌生疮', '心烦', '咽痛', '耳鸣', '目赤', '尿血'],
    organ: '小肠',
    meridian: '手太阳小肠经',
    category: '小肠实热',
    description: '心火下移小肠，泌别清浊失职，表现为小便赤涩、口舌生疮等',
    advice: ['清心导赤，饮竹叶茶', '饮食清淡易消化', '按揉后溪穴清泻小肠', '避免心火过旺'],
    severity: 'mild',
  },
  {
    id: 'pericardium-stagnation',
    keywords: ['心胸憋闷', '心痛', '心悸', '焦虑', '抑郁', '善太息', '手心热', '腋肿'],
    organ: '心包',
    meridian: '手厥阴心包经',
    category: '心包气滞',
    description: '心包气机不畅，心神被扰，表现为心胸憋闷、焦虑不安等',
    advice: ['宽胸理气，保持情志舒畅', '可按揉内关穴宁心安神', '练习深呼吸放松身心', '适当运动疏通气血'],
    severity: 'moderate',
  },
  {
    id: 'sanjiao-dampness',
    keywords: ['水肿', '耳鸣', '胸闷', '腹胀', '小便不利', '身重', '口黏', '头重如裹'],
    organ: '三焦',
    meridian: '手少阳三焦经',
    category: '三焦湿阻',
    description: '三焦气化不利，水湿内停，表现为水肿身重、小便不利等',
    advice: ['宜通三焦，利水化湿', '可饮薏仁水健脾利湿', '按揉阳池穴通利三焦', '适度运动助气化'],
    severity: 'moderate',
  },
  {
    id: 'liver-yang-rising',
    keywords: ['头晕', '头痛', '面红目赤', '急躁易怒', '耳鸣', '腰膝酸软', '肢体麻木', '震颤'],
    organ: '肝',
    meridian: '足厥阴肝经',
    category: '肝阳上亢',
    description: '肝肾阴虚，肝阳上亢，表现为头晕头痛、面红目赤等',
    advice: ['平肝潜阳，忌暴怒', '可食天麻钩藤熄风', '按揉太冲穴平肝降逆', '保证充足睡眠'],
    severity: 'severe',
  },
  {
    id: 'kidney-yin-deficiency',
    keywords: ['腰膝酸软', '五心烦热', '潮热盗汗', '耳鸣', '遗精', '咽干', '脱发', '记忆力减退'],
    organ: '肾',
    meridian: '足少阴肾经',
    category: '肾阴亏虚',
    description: '肾阴不足，虚火内生，表现为腰膝酸软、五心烦热等',
    advice: ['滋补肾阴，食黑芝麻枸杞', '避免熬夜伤阴', '按揉太溪穴滋补肾阴', '节制房事保精'],
    severity: 'moderate',
  },
];

export type ShichenData = {
  name: string;
  hours: string;
  organ: string;
  meridian: string;
  healthTip: string;
};

export const SHICHEN_DATA: ShichenData[] = [
  { name: '子', hours: '23:00-1:00', organ: '胆', meridian: '胆经', healthTip: '子时胆经当令，宜入睡养胆' },
  { name: '丑', hours: '1:00-3:00', organ: '肝', meridian: '肝经', healthTip: '丑时肝经当令，深睡养血' },
  { name: '寅', hours: '3:00-5:00', organ: '肺', meridian: '肺经', healthTip: '寅时肺经当令，宜深呼吸' },
  { name: '卯', hours: '5:00-7:00', organ: '大肠', meridian: '大肠经', healthTip: '卯时大肠经当令，宜排便' },
  { name: '辰', hours: '7:00-9:00', organ: '胃', meridian: '胃经', healthTip: '辰时胃经当令，宜吃早餐' },
  { name: '巳', hours: '9:00-11:00', organ: '脾', meridian: '脾经', healthTip: '巳时脾经当令，宜运化' },
  { name: '午', hours: '11:00-13:00', organ: '心', meridian: '心经', healthTip: '午时心经当令，宜午休' },
  { name: '未', hours: '13:00-15:00', organ: '小肠', meridian: '小肠经', healthTip: '未时小肠经当令，宜消化' },
  { name: '申', hours: '15:00-17:00', organ: '膀胱', meridian: '膀胱经', healthTip: '申时膀胱经当令，宜喝水' },
  { name: '酉', hours: '17:00-19:00', organ: '肾', meridian: '肾经', healthTip: '酉时肾经当令，宜养肾' },
  { name: '戌', hours: '19:00-21:00', organ: '心包', meridian: '心包经', healthTip: '戌时心包经当令，宜放松' },
  { name: '亥', hours: '21:00-23:00', organ: '三焦', meridian: '三焦经', healthTip: '亥时三焦经当令，宜入眠' },
];

export const ORGAN_ACUPOINT_MAP: Record<string, string[]> = {
  '肝': ['太冲', '行间', '期门', '章门', '曲泉'],
  '心': ['神门', '少府', '内关', '心俞', '通里'],
  '脾': ['足三里', '三阴交', '血海', '阴陵泉', '脾俞'],
  '肺': ['太渊', '列缺', '尺泽', '肺俞', '合谷'],
  '肾': ['涌泉', '太溪', '复溜', '肾俞', '命门'],
  '胃': ['足三里', '中脘', '天枢', '内庭', '胃俞'],
  '胆': ['风池', '阳陵泉', '悬钟', '胆俞', '侠溪'],
  '膀胱': ['委中', '承山', '昆仑', '膀胱俞', '飞扬'],
  '大肠': ['合谷', '曲池', '天枢', '大肠俞', '上巨虚'],
  '小肠': ['后溪', '听宫', '天宗', '小肠俞', '下巨虚'],
  '心包': ['内关', '大陵', '曲泽', '心包俞', '郄门'],
  '三焦': ['阳池', '外关', '支沟', '三焦俞', '翳风'],
};

export const QUICK_COMMANDS = [
  { label: '头痛头晕', symptoms: ['头痛', '头晕'] },
  { label: '失眠多梦', symptoms: ['失眠', '多梦'] },
  { label: '胃痛腹胀', symptoms: ['胃脘灼痛', '腹胀'] },
  { label: '腰膝酸软', symptoms: ['腰膝酸软'] },
  { label: '心烦心悸', symptoms: ['心烦', '心悸'] },
  { label: '咳嗽气短', symptoms: ['咳嗽', '气短'] },
  { label: '便秘口臭', symptoms: ['便秘', '口臭'] },
  { label: '易怒烦躁', symptoms: ['易怒', '烦躁'] },
  { label: '乏力食欲差', symptoms: ['乏力', '食欲不振'] },
  { label: '浮肿尿频', symptoms: ['浮肿', '尿频'] },
];
