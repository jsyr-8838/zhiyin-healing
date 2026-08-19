export interface EssenceOil {
  id: string;
  name: string;
  type: 'solar_term' | 'pentad' | 'monthly';
  month: number;
  solarTerm?: string;
  pentadIndex?: number;
  yangValue: number;
  yinValue: number;
  yangDesc?: string;
  yinDesc?: string;
  wuxing: '木' | '火' | '土' | '金' | '水';
  wuxingSub?: '水(阴)' | '水(阳)';
  meridian: string;
  upperColor: string;
  upperColorHex: string;
  lowerColor: string;
  lowerColorHex: string;
  dateRange?: string;
  solarLongitude?: number;
  yiJingQi?: string;
  douZhi?: string;
  ganZhi?: string;
  climateFeature?: string;
  wuxingFeature: string;
  organFunction?: string;
  upperExplanation?: string;
  lowerExplanation?: string;
}

export interface PersonalityColorMapping {
  dimension: string;
  level: string;
  trait: string;
  healingColors: string[];
  solarTerms: string[];
  meridians: string[];
}

const COLOR_HEX: Record<string, string> = {
  '白色': '#FFFFFF',
  '黑色': '#1A1A2E',
  '红色': '#E74C3C',
  '粉色': '#FF69B4',
  '橙色': '#F39C12',
  '黄色': '#F1C40F',
  '绿色': '#27AE60',
  '青色': '#00BCD4',
  '蓝色': '#3498DB',
  '紫色': '#9B59B6',
  '灰色': '#95A5A6',
  '褐色': '#8D6E63',
};

export const essenceOils: EssenceOil[] = [
  // ==================== 月份精油（12条） ====================
  { id: 'm-3', name: '3月·足厥阴肝经精油', type: 'monthly', month: 3, yangValue: 3, yinValue: 3, wuxing: '木', meridian: '足厥阴肝经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '青色', lowerColorHex: '#00BCD4', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '肝主疏泄主藏血', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '青色 – 肝脏主要生理功能包括主疏泄和主藏血。木性具有生长、升发、伸展、舒畅的特性，万物睡醒，成长的时期。' },
  { id: 'm-4', name: '4月·足少阳胆经精油', type: 'monthly', month: 4, yangValue: 4, yinValue: 2, wuxing: '木', meridian: '足少阳胆经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '绿色', lowerColorHex: '#27AE60', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '胆贮藏排泄胆汁', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '绿色 – 胆的主要生理功能为贮藏和排泄胆汁。木性具有升发、伸展、舒畅的特性，少阳胆火与春天的阳气生发，气候由寒转暖，万物萌发。' },
  { id: 'm-5', name: '5月·手太阳小肠经精油', type: 'monthly', month: 5, yangValue: 5, yinValue: 1, wuxing: '火', meridian: '手太阳小肠经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '粉色', lowerColorHex: '#FF69B4', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '小肠分清泌浊', yangDesc: '五阳', yinDesc: '一阴' },
  { id: 'm-6', name: '6月·手少阴心经精油', type: 'monthly', month: 6, yangValue: 6, yinValue: 0, wuxing: '火', meridian: '手少阴心经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '红色', lowerColorHex: '#E74C3C', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '心君火动力', yangDesc: '六阳', yinDesc: '零阴', lowerExplanation: '红色 - 心脏主要功能是为血液流动提供动力(君火)，把血液(营养素)运行至身体各个部分。太阳直射角度下，火性的炎热、上升，把春季夏季下的雨准备君火沸腾开。' },
  { id: 'm-7', name: '7月·足太阴脾经精油', type: 'monthly', month: 7, yangValue: 5, yinValue: 1, wuxing: '土', meridian: '足太阴脾经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '橙色', lowerColorHex: '#F39C12', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '脾主运化', yangDesc: '五阳', yinDesc: '一阴', lowerExplanation: '橙色 – 脾脏的主要生理功能为主运化，主统血，主升清。土性的孕育生机、长养万物的特性，把春季夏季下的雨上升运化沸腾弥散开。' },
  { id: 'm-8', name: '8月·足阳明胃经精油', type: 'monthly', month: 8, yangValue: 4, yinValue: 2, wuxing: '土', meridian: '足阳明胃经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '黄色', lowerColorHex: '#F1C40F', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '胃容纳水谷', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '黄色 - 胃主要功能是接受和容纳水谷，土性的承载、受纳的特性，把太阳能量和雨水能量受纳。' },
  { id: 'm-9', name: '9月·手阳明大肠经精油', type: 'monthly', month: 9, yangValue: 3, yinValue: 3, wuxing: '金', meridian: '手阳明大肠经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '褐色', lowerColorHex: '#8D6E63', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '大肠传化糟粕', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '褐色 – 大肠主要功能传化糟粕的功能，接受小肠泌别清浊后下移的食物残渣，吸收其中多余的水液，形成粪便，经肛门排出体外。金性的沉降、收敛、清洁特性，把水谷收获，剩下残渣分别。' },
  { id: 'm-10', name: '10月·手太阴肺经精油', type: 'monthly', month: 10, yangValue: 2, yinValue: 4, wuxing: '金', meridian: '手太阴肺经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '白色', lowerColorHex: '#FFFFFF', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '肺主气司呼吸', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '白色 – 肺脏主要生理功能是主气司呼吸，主行水，朝百脉，主治节，最娇嫩的器官怕寒热怕脏，金性清洁的特性，相当于整个一年的冬眠之前整理整顿。' },
  { id: 'm-11', name: '11月·足少阴肾经精油', type: 'monthly', month: 11, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阴)', meridian: '足少阴肾经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '黑色', lowerColorHex: '#1A1A2E', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '肾主藏精主水', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '黑色 – 肾脏主藏精，主水，主纳气，肾中精气中含有肾阴、肾阳两部分。肾阳鼓动肾阴，经肾气的蒸化作用，升清降浊。水性下行、寒冷、闭藏特性，人体一天有晚上睡觉准备白天一样，储存一年剩下的能量冬眠。' },
  { id: 'm-12', name: '12月·足太阳膀胱经精油', type: 'monthly', month: 12, yangValue: 0, yinValue: 6, wuxing: '水', wuxingSub: '水(阴)', meridian: '足太阳膀胱经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '灰色', lowerColorHex: '#95A5A6', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '膀胱贮存排泄', yangDesc: '零阳', yinDesc: '六阴', lowerExplanation: '灰色 – 膀胱是贮存和排泄尿液的器官。水性下行、寒冷、闭藏特性，冬眠中产生的残渣物贮存和排泄。' },
  { id: 'm-1', name: '1月·手少阳三焦经精油', type: 'monthly', month: 1, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阳)', meridian: '手少阳三焦经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '紫色', lowerColorHex: '#9B59B6', wuxingFeature: '● 上层解释：白色 –', organFunction: '三焦总司气化', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '紫色 – 三焦既是气机升降出入的通道，又是气化的场所，总司全身的气化，运行水液，疏通水道。肾阳的蒸化作用，升清降浊后通过三焦全身弥散，这时候通过睡眠休息，准备迎接春天的阳气。紫色涵盖红色，这里的红色代表肾阳。' },
  { id: 'm-2', name: '2月·手厥阴心包经精油', type: 'monthly', month: 2, yangValue: 2, yinValue: 4, wuxing: '水', wuxingSub: '水(阳)', meridian: '手厥阴心包经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '蓝色', lowerColorHex: '#3498DB', wuxingFeature: '● 上层解释：白色 –', organFunction: '心包护卫心脏', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '蓝色 - 心包包裹着心脏，对心脏起护卫的作用。寒冷的冬眠期沉睡的心脏保护的是心包，肾阳鼓动保护心包敲醒君火。' },

  // ==================== 节气精油（24条） ====================
  { id: 'jq-jingzhe', name: '惊蛰精油', type: 'solar_term', month: 3, solarTerm: '惊蛰', yangValue: 3, yinValue: 3, wuxing: '木', meridian: '足厥阴肝经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '青色', lowerColorHex: '#00BCD4', dateRange: '3月5-6日', solarLongitude: 345, yiJingQi: '初之气（厥阴风木）', douZhi: '甲', ganZhi: '卯月起始', climateFeature: '天气回暖春雷鸣响', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '肝主疏泄主藏血', yangDesc: '三阳', yinDesc: '三阴', upperExplanation: '紫色 – 雨水突然降温的满满回暖，春雨让动物睡醒。', lowerExplanation: '青色 – 肝脏主要生理功能包括主疏泄和主藏血。木性具有生长、升发、伸展、舒畅的特性，万物睡醒，成长的时期。' },
  { id: 'jq-chunfen', name: '春分精油', type: 'solar_term', month: 3, solarTerm: '春分', yangValue: 3, yinValue: 3, wuxing: '木', meridian: '足厥阴肝经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '青色', lowerColorHex: '#00BCD4', dateRange: '3月20-21日', solarLongitude: 0, yiJingQi: '二之气（少阴君火）', douZhi: '卯', ganZhi: '空', climateFeature: '天气明显变暖', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '肝主疏泄主藏血', yangDesc: '三阳', yinDesc: '三阴', upperExplanation: '绿色 – 绿色虽然冷色系，但是最平衡的颜色。', lowerExplanation: '青色 – 肝脏主要生理功能包括主疏泄和主藏血。木性具有生长、升发、伸展、舒畅的特性，万物睡醒，成长的时期。' },
  { id: 'jq-qingming', name: '清明精油', type: 'solar_term', month: 4, solarTerm: '清明', yangValue: 4, yinValue: 2, wuxing: '木', meridian: '足少阳胆经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '绿色', lowerColorHex: '#27AE60', dateRange: '4月5-6日', solarLongitude: 15, yiJingQi: '二之气（少阴君火）', douZhi: '乙', ganZhi: '辰月起始', climateFeature: '天气多雨阳光明媚', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '胆贮藏排泄胆汁', yangDesc: '四阳', yinDesc: '二阴', upperExplanation: '青色 – 相表里的颜色，蓝天(蓝色)和树木(绿色)。', lowerExplanation: '绿色 – 胆的主要生理功能为贮藏和排泄胆汁。木性具有升发、伸展、舒畅的特性，少阳胆火与春天的阳气生发，气候由寒转暖，万物萌发。' },
  { id: 'jq-guyu', name: '谷雨精油', type: 'solar_term', month: 4, solarTerm: '谷雨', yangValue: 4, yinValue: 2, wuxing: '木', meridian: '足少阳胆经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '绿色', lowerColorHex: '#27AE60', dateRange: '4月20-21日', solarLongitude: 30, yiJingQi: '二之气（少阴君火）', douZhi: '辰', ganZhi: '空', climateFeature: '降水增多促进生长', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '胆贮藏排泄胆汁', yangDesc: '四阳', yinDesc: '二阴', upperExplanation: '黄色 – 气温上升，对农作物的促进生长的雨，所以用黄色。', lowerExplanation: '绿色 – 胆胆的主要生理功能为贮藏和排泄胆汁。木性具有升发、伸展、舒畅的特性，少阳胆火与春天的阳气生发，气候由寒转暖，万物萌发。' },
  { id: 'jq-lixia', name: '立夏精油', type: 'solar_term', month: 5, solarTerm: '立夏', yangValue: 5, yinValue: 1, wuxing: '火', meridian: '手太阳小肠经', upperColor: '红色', upperColorHex: '#E74C3C', lowerColor: '粉色', lowerColorHex: '#FF69B4', dateRange: '5月5-6日', solarLongitude: 45, yiJingQi: '二之气（少阴君火）', douZhi: '巽', ganZhi: '巳月起始', climateFeature: '夏天来临暴雨增多', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '小肠分清泌浊', yangDesc: '五阳', yinDesc: '一阴', upperExplanation: '红色 - 相表里的颜色，进入夏季的象征' },
  { id: 'jq-xiaoman', name: '小满精油', type: 'solar_term', month: 5, solarTerm: '小满', yangValue: 5, yinValue: 1, wuxing: '火', meridian: '手太阳小肠经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '粉色', lowerColorHex: '#FF69B4', dateRange: '5月21-22日', solarLongitude: 60, yiJingQi: '三之气（少阳相火）', douZhi: '巳', ganZhi: '空', climateFeature: '降水量大幅增加', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '小肠分清泌浊', yangDesc: '五阳', yinDesc: '一阴', upperExplanation: '橙色 – 气温上升' },
  { id: 'jq-mangzhong', name: '芒种精油', type: 'solar_term', month: 6, solarTerm: '芒种', yangValue: 6, yinValue: 0, wuxing: '火', meridian: '手少阴心经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '红色', lowerColorHex: '#E74C3C', dateRange: '6月6-7日', solarLongitude: 75, yiJingQi: '三之气（少阳相火）', douZhi: '丙', ganZhi: '午月起始', climateFeature: '天气炎热麦类成熟', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '心君火动力', yangDesc: '六阳', yinDesc: '零阴', upperExplanation: '橙色 – 气温上升', lowerExplanation: '红色 - 心脏主要功能是为血液流动提供动力(君火)，把血液(营养素)运行至身体各个部分。太阳直射角度下，火性的炎热、上升，把春季夏季下的雨准备君火沸腾开。' },
  { id: 'jq-xiazhi', name: '夏至精油', type: 'solar_term', month: 6, solarTerm: '夏至', yangValue: 6, yinValue: 0, wuxing: '火', meridian: '手少阴心经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '红色', lowerColorHex: '#E74C3C', dateRange: '6月21-22日', solarLongitude: 90, yiJingQi: '三之气（少阳相火）', douZhi: '午', ganZhi: '空', climateFeature: '太阳高度最高白昼最长', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火；', organFunction: '心君火动力', yangDesc: '六阳', yinDesc: '零阴', upperExplanation: '粉色 – 相表里颜色，气温继续上升，降水量与太阳最多。', lowerExplanation: '红色 - 心脏主要功能是为血液流动提供动力(君火)，把血液(营养素)运行至身体各个部分。太阳直射角度下，火性的炎热、上升，把春季夏季下的雨准备君火沸腾开。' },
  { id: 'jq-xiaoshu', name: '小暑精油', type: 'solar_term', month: 7, solarTerm: '小暑', yangValue: 5, yinValue: 1, wuxing: '土', meridian: '足太阴脾经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '橙色', lowerColorHex: '#F39C12', dateRange: '7月7-8日', solarLongitude: 105, yiJingQi: '三之气（少阳相火）', douZhi: '丁', ganZhi: '未月起始', climateFeature: '炎热天气开始', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '脾主运化', yangDesc: '五阳', yinDesc: '一阴', upperExplanation: '粉色 – 气温继续上升', lowerExplanation: '橙色 – 脾脏的主要生理功能为主运化，主统血，主升清。土性的孕育生机、长养万物的特性，把春季夏季下的雨上升运化沸腾弥散开。' },
  { id: 'jq-dashu', name: '大暑精油', type: 'solar_term', month: 7, solarTerm: '大暑', yangValue: 5, yinValue: 1, wuxing: '土', meridian: '足太阴脾经', upperColor: '红色', upperColorHex: '#E74C3C', lowerColor: '橙色', lowerColorHex: '#F39C12', dateRange: '7月23-24日', solarLongitude: 120, yiJingQi: '四之气（太阴湿土）', douZhi: '未', ganZhi: '空', climateFeature: '一年中最热', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '脾主运化', yangDesc: '五阳', yinDesc: '一阴', upperExplanation: '红色 – 气温上升到最热', lowerExplanation: '橙色 – 脾脏的主要生理功能为主运化，主统血，主升清。土性的孕育生机、长养万物的特性，把春季夏季下的雨上升运化沸腾弥散开。' },
  { id: 'jq-liqiu', name: '立秋精油', type: 'solar_term', month: 8, solarTerm: '立秋', yangValue: 4, yinValue: 2, wuxing: '土', meridian: '足阳明胃经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '黄色', lowerColorHex: '#F1C40F', dateRange: '8月7-8日', solarLongitude: 135, yiJingQi: '四之气（太阴湿土）', douZhi: '坤', ganZhi: '申月起始', climateFeature: '进入秋季天气仍热', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '胃容纳水谷', yangDesc: '四阳', yinDesc: '二阴', upperExplanation: '橙色 – 气温逐渐下降，代表入秋季的颜色。', lowerExplanation: '黄色 - 胃主要功能是接受和容纳水谷，土性的承载、受纳的特性，把太阳能量和雨水能量受纳。' },
  { id: 'jq-chushu', name: '处暑精油', type: 'solar_term', month: 8, solarTerm: '处暑', yangValue: 4, yinValue: 2, wuxing: '土', meridian: '足阳明胃经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '黄色', lowerColorHex: '#F1C40F', dateRange: '8月23-24日', solarLongitude: 150, yiJingQi: '四之气（太阴湿土）', douZhi: '申', ganZhi: '空', climateFeature: '暑热即将结束', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '胃容纳水谷', yangDesc: '四阳', yinDesc: '二阴', upperExplanation: '粉色 – 气温下降到暑期结束了。', lowerExplanation: '黄色 - 胃主要功能是接受和容纳水谷，土性的承载、受纳的特性，把太阳能量和雨水能量受纳。' },
  { id: 'jq-bailu', name: '白露精油', type: 'solar_term', month: 9, solarTerm: '白露', yangValue: 3, yinValue: 3, wuxing: '金', meridian: '手阳明大肠经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '褐色', lowerColorHex: '#8D6E63', dateRange: '9月8-9日', solarLongitude: 165, yiJingQi: '四之气（太阴湿土）', douZhi: '庚', ganZhi: '酉月起始', climateFeature: '寒气增长早晚温差大', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '大肠传化糟粕', yangDesc: '三阳', yinDesc: '三阴', upperExplanation: '黄色 - 气温下降，暖色当中最接近冷色的颜色。', lowerExplanation: '褐色 – 大肠主要功能传化糟粕的功能，接受小肠泌别清浊后下移的食物残渣，吸收其中多余的水液，形成粪便，经肛门排出体外。金性的沉降、收敛、清洁特性，把水谷收获，剩下残渣分别。' },
  { id: 'jq-qiufen', name: '秋分精油', type: 'solar_term', month: 9, solarTerm: '秋分', yangValue: 3, yinValue: 3, wuxing: '金', meridian: '手阳明大肠经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '褐色', lowerColorHex: '#8D6E63', dateRange: '9月23-24日', solarLongitude: 180, yiJingQi: '五之气（阳明燥金）', douZhi: '酉', ganZhi: '空', climateFeature: '暑热散去昼夜等长', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '大肠传化糟粕', yangDesc: '三阳', yinDesc: '三阴', upperExplanation: '绿色 – 绿色虽然冷色系，但是最平衡的颜色。', lowerExplanation: '褐色 – 大肠主要功能传化糟粕的功能，接受小肠泌别清浊后下移的食物残渣，吸收其中多余的水液，形成粪便，经肛门排出体外。金性的沉降、收敛、清洁特性，把水谷收获，剩下残渣分别。' },
  { id: 'jq-hanlu', name: '寒露精油', type: 'solar_term', month: 10, solarTerm: '寒露', yangValue: 2, yinValue: 4, wuxing: '金', meridian: '手太阴肺经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '白色', lowerColorHex: '#FFFFFF', dateRange: '10月8-9日', solarLongitude: 195, yiJingQi: '五之气（阳明燥金）', douZhi: '辛', ganZhi: '戌月起始', climateFeature: '气温继续下降温差加大', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '肺主气司呼吸', yangDesc: '二阳', yinDesc: '四阴', upperExplanation: '绿色 – 气温继续下降', lowerExplanation: '白色 – 肺脏主要生理功能是主气司呼吸，主行水，朝百脉，主治节，最娇嫩的器官怕寒热怕脏，金性清洁的特性，相当于整个一年的冬眠之前整理整顿。' },
  { id: 'jq-shuangjiang', name: '霜降精油', type: 'solar_term', month: 10, solarTerm: '霜降', yangValue: 2, yinValue: 4, wuxing: '金', meridian: '手太阴肺经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '白色', lowerColorHex: '#FFFFFF', dateRange: '10月23-24日', solarLongitude: 210, yiJingQi: '五之气（阳明燥金）', douZhi: '戌', ganZhi: '空', climateFeature: '气温骤降温差更大', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '肺主气司呼吸', yangDesc: '二阳', yinDesc: '四阴', upperExplanation: '青色 - 气温继续下降', lowerExplanation: '白色 – 肺脏主要生理功能是主气司呼吸，主行水，朝百脉，主治节，最娇嫩的器官怕寒热怕脏。金性清洁的特性，相当于整个一年的冬眠之前整理整顿。' },
  { id: 'jq-lidong', name: '立冬精油', type: 'solar_term', month: 11, solarTerm: '立冬', yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阴)', meridian: '足少阴肾经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '黑色', lowerColorHex: '#1A1A2E', dateRange: '11月7-8日', solarLongitude: 225, yiJingQi: '五之气（阳明燥金）', douZhi: '乾', ganZhi: '亥月起始', climateFeature: '冬季开始万物休养', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '肾主藏精主水', yangDesc: '一阳', yinDesc: '五阴', upperExplanation: '青色 - 气温继续下降', lowerExplanation: '黑色 – 肾脏主藏精，主水，主纳气，肾中精气中含有肾阴、肾阳两部分。肾阳鼓动肾阴，经肾气的蒸化作用，升清降浊。水性下行、寒冷、闭藏特性，人体一天有晚上睡觉准备白天一样，储存一年剩下的能量冬眠。' },
  { id: 'jq-xiaoxue', name: '小雪精油', type: 'solar_term', month: 11, solarTerm: '小雪', yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阴)', meridian: '足少阴肾经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '黑色', lowerColorHex: '#1A1A2E', dateRange: '11月22-23日', solarLongitude: 240, yiJingQi: '六之气（太阳寒水）', douZhi: '亥', ganZhi: '空', climateFeature: '天气冷降水量增多', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '肾主藏精主水', yangDesc: '一阳', yinDesc: '五阴', upperExplanation: '蓝色 - 气温继续下降', lowerExplanation: '黑色 – 肾脏主藏精，主水，主纳气，肾中精气中含有肾阴、肾阳两部分。肾阳鼓动肾阴，经肾气的蒸化作用，升清降浊。水性下行、寒冷、闭藏特性，人体一天有晚上睡觉准备白天一样，储存一年剩下的能量冬眠。' },
  { id: 'jq-daxue', name: '大雪精油', type: 'solar_term', month: 12, solarTerm: '大雪', yangValue: 0, yinValue: 6, wuxing: '水', wuxingSub: '水(阴)', meridian: '足太阳膀胱经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '灰色', lowerColorHex: '#95A5A6', dateRange: '12月7-8日', solarLongitude: 255, yiJingQi: '六之气（太阳寒水）', douZhi: '壬', ganZhi: '子月起始', climateFeature: '气温显著下降', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '膀胱贮存排泄', yangDesc: '零阳', yinDesc: '六阴', upperExplanation: '蓝色 – 天气突然下降', lowerExplanation: '灰色 – 膀胱是贮存和排泄尿液的器官。水性下行、寒冷、闭藏特性，冬眠中产生的残渣物贮存和排泄。' },
  { id: 'jq-dongzhi', name: '冬至精油', type: 'solar_term', month: 12, solarTerm: '冬至', yangValue: 0, yinValue: 6, wuxing: '水', wuxingSub: '水(阴)', meridian: '足太阳膀胱经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '灰色', lowerColorHex: '#95A5A6', dateRange: '12月22-23日', solarLongitude: 260, yiJingQi: '六之气（太阳寒水）', douZhi: '子', ganZhi: '空', climateFeature: '白昼最短夜晚最长', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '膀胱贮存排泄', yangDesc: '零阳', yinDesc: '六阴', upperExplanation: '黑色 – 晚上最长，寒冷的时候', lowerExplanation: '灰色 – 膀胱是贮存和排泄尿液的器官。水性下行、寒冷、闭藏特性，冬眠中产生的残渣物贮存和排泄。' },
  { id: 'jq-xiaohan', name: '小寒精油', type: 'solar_term', month: 1, solarTerm: '小寒', yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阳)', meridian: '手少阳三焦经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '紫色', lowerColorHex: '#9B59B6', dateRange: '1月5-6日', solarLongitude: 275, yiJingQi: '六之气（太阳寒水）', douZhi: '癸', ganZhi: '丑月起始', climateFeature: '天气寒冷但未到极点', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '三焦总司气化', yangDesc: '一阳', yinDesc: '五阴', upperExplanation: '蓝色 – 比大寒不冷，不过还是很冷。', lowerExplanation: '紫色 – 三焦既是气机升降出入的通道，又是气化的场所，总司全身的气化，运行水液，疏通水道。肾阳的蒸化作用，升清降浊后通过三焦全身弥散，这时候通过睡眠休息，准备迎接春天的阳气。紫色涵盖红色，这里的红色代表肾阳。' },
  { id: 'jq-dahan', name: '大寒精油', type: 'solar_term', month: 1, solarTerm: '大寒', yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阳)', meridian: '手少阳三焦经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '紫色', lowerColorHex: '#9B59B6', dateRange: '1月20-21日', solarLongitude: 290, yiJingQi: '初之气（厥阴风木）', douZhi: '丑', ganZhi: '空', climateFeature: '天气寒冷到了极致', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '三焦总司气化', yangDesc: '一阳', yinDesc: '五阴', upperExplanation: '黑色 – 最寒冷', lowerExplanation: '紫色 – 三焦既是气机升降出入的通道，又是气化的场所，总司全身的气化，运行水液，疏通水道。肾阳的蒸化作用，升清降浊后通过三焦全身弥散，这时候通过睡眠休息，准备迎接春天的阳气。紫色涵盖红色，这里的红色代表肾阳。' },
  { id: 'jq-lichun', name: '立春精油', type: 'solar_term', month: 2, solarTerm: '立春', yangValue: 2, yinValue: 4, wuxing: '水', wuxingSub: '水(阳)', meridian: '手厥阴心包经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '蓝色', lowerColorHex: '#3498DB', dateRange: '2月4-5日', solarLongitude: 315, yiJingQi: '初之气（厥阴风木）', douZhi: '艮', ganZhi: '寅月起始', climateFeature: '春天的开始万物生长', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '心包护卫心脏', yangDesc: '二阳', yinDesc: '四阴', upperExplanation: '紫色 – 立春后气温突然增加，紫色含有红色和蓝色。', lowerExplanation: '蓝色 - 心包包裹着心脏，对心脏起护卫的作用。寒冷的冬眠期沉睡的心脏保护的是心包，肾阳鼓动保护心包敲醒君火。' },
  { id: 'jq-yushui', name: '雨水精油', type: 'solar_term', month: 2, solarTerm: '雨水', yangValue: 2, yinValue: 4, wuxing: '水', wuxingSub: '水(阳)', meridian: '手厥阴心包经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '蓝色', lowerColorHex: '#3498DB', dateRange: '2月19-20日', solarLongitude: 330, yiJingQi: '初之气（厥阴风木）', douZhi: '寅', ganZhi: '空', climateFeature: '标志着降雨的开始', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '心包护卫心脏', yangDesc: '二阳', yinDesc: '四阴', upperExplanation: '黑色 – 下雨后，降水量小幅增加，气温突然下降。', lowerExplanation: '蓝色 - 心包包裹着心脏，对心脏起护卫的作用。寒冷的冬眠期沉睡的心脏保护的是心包，肾阳鼓动保护心包敲醒君火。' },

  // ==================== 候精油（72条） ====================
  // 惊蛰三候（3月）
  { id: 'hou-jingzhe-1', name: '惊蛰·一候精油', type: 'pentad', month: 3, solarTerm: '惊蛰', pentadIndex: 1, yangValue: 3, yinValue: 3, wuxing: '木', meridian: '足厥阴肝经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '青色', lowerColorHex: '#00BCD4', dateRange: '3月5-9日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '肝主疏泄主藏血', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '青色 – 肝脏主要生理功能包括主疏泄和主藏血。木性具有生长、升发、伸展、舒畅的特性，万物睡醒，成长的时期。' },
  { id: 'hou-jingzhe-2', name: '惊蛰·二候精油', type: 'pentad', month: 3, solarTerm: '惊蛰', pentadIndex: 2, yangValue: 3, yinValue: 3, wuxing: '木', meridian: '足厥阴肝经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '青色', lowerColorHex: '#00BCD4', dateRange: '3月10-14日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '肝主疏泄主藏血', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '青色 – 肝脏主要生理功能包括主疏泄和主藏血。木性具有生长、升发、伸展、舒畅的特性，万物睡醒，成长的时期。' },
  { id: 'hou-jingzhe-3', name: '惊蛰·三候精油', type: 'pentad', month: 3, solarTerm: '惊蛰', pentadIndex: 3, yangValue: 3, yinValue: 3, wuxing: '木', meridian: '足厥阴肝经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '青色', lowerColorHex: '#00BCD4', dateRange: '3月15-19日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '肝主疏泄主藏血', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '青色 – 肝脏主要生理功能包括主疏泄和主藏血。木性具有生长、升发、伸展、舒畅的特性，万物睡醒，成长的时期。' },
  // 春分三候（3月）
  { id: 'hou-chunfen-1', name: '春分·一候精油', type: 'pentad', month: 3, solarTerm: '春分', pentadIndex: 1, yangValue: 3, yinValue: 3, wuxing: '木', meridian: '足厥阴肝经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '青色', lowerColorHex: '#00BCD4', dateRange: '3月20-24日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '肝主疏泄主藏血', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '青色 – 肝脏主要生理功能包括主疏泄和主藏血。木性具有生长、升发、伸展、舒畅的特性，万物睡醒，成长的时期。' },
  { id: 'hou-chunfen-2', name: '春分·二候精油', type: 'pentad', month: 3, solarTerm: '春分', pentadIndex: 2, yangValue: 3, yinValue: 3, wuxing: '木', meridian: '足厥阴肝经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '青色', lowerColorHex: '#00BCD4', dateRange: '3月25-29日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '肝主疏泄主藏血', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '青色 – 肝脏主要生理功能包括主疏泄和主藏血。木性具有生长、升发、伸展、舒畅的特性，万物睡醒，成长的时期。' },
  { id: 'hou-chunfen-3', name: '春分·三候精油', type: 'pentad', month: 3, solarTerm: '春分', pentadIndex: 3, yangValue: 3, yinValue: 3, wuxing: '木', meridian: '足厥阴肝经', upperColor: '红色', upperColorHex: '#E74C3C', lowerColor: '青色', lowerColorHex: '#00BCD4', dateRange: '3月30-4月4日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '肝主疏泄主藏血', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '青色 – 肝脏主要生理功能包括主疏泄和主藏血。木性具有生长、升发、伸展、舒畅的特性，万物睡醒，成长的时期。' },
  // 清明三候（4月）
  { id: 'hou-qingming-1', name: '清明·一候精油', type: 'pentad', month: 4, solarTerm: '清明', pentadIndex: 1, yangValue: 4, yinValue: 2, wuxing: '木', meridian: '足少阳胆经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '绿色', lowerColorHex: '#27AE60', dateRange: '4月5-9日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '胆贮藏排泄胆汁', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '绿色 – 胆的主要生理功能为贮藏和排泄胆汁。木性具有升发、伸展、舒畅的特性，少阳胆火与春天的阳气生发，气候由寒转暖，万物萌发。' },
  { id: 'hou-qingming-2', name: '清明·二候精油', type: 'pentad', month: 4, solarTerm: '清明', pentadIndex: 2, yangValue: 4, yinValue: 2, wuxing: '木', meridian: '足少阳胆经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '绿色', lowerColorHex: '#27AE60', dateRange: '4月10-14日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '胆贮藏排泄胆汁', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '绿色 – 胆的主要生理功能为贮藏和排泄胆汁。木性具有升发、伸展、舒畅的特性，少阳胆火与春天的阳气生发，气候由寒转暖，万物萌发。' },
  { id: 'hou-qingming-3', name: '清明·三候精油', type: 'pentad', month: 4, solarTerm: '清明', pentadIndex: 3, yangValue: 4, yinValue: 2, wuxing: '木', meridian: '足少阳胆经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '绿色', lowerColorHex: '#27AE60', dateRange: '4月15-19日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '胆贮藏排泄胆汁', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '绿色 – 胆的主要生理功能为贮藏和排泄胆汁。木性具有升发、伸展、舒畅的特性，少阳胆火与春天的阳气生发，气候由寒转暖，万物萌发。' },
  // 谷雨三候（4月）
  { id: 'hou-guyu-1', name: '谷雨·一候精油', type: 'pentad', month: 4, solarTerm: '谷雨', pentadIndex: 1, yangValue: 4, yinValue: 2, wuxing: '木', meridian: '足少阳胆经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '绿色', lowerColorHex: '#27AE60', dateRange: '4月20-24日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '胆贮藏排泄胆汁', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '绿色 – 胆的主要生理功能为贮藏和排泄胆汁。木性具有升发、伸展、舒畅的特性，少阳胆火与春天的阳气生发，气候由寒转暖，万物萌发。' },
  { id: 'hou-guyu-2', name: '谷雨·二候精油', type: 'pentad', month: 4, solarTerm: '谷雨', pentadIndex: 2, yangValue: 4, yinValue: 2, wuxing: '木', meridian: '足少阳胆经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '绿色', lowerColorHex: '#27AE60', dateRange: '4月25-29日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '胆贮藏排泄胆汁', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '绿色 – 胆的主要生理功能为贮藏和排泄胆汁。木性具有升发、伸展、舒畅的特性，少阳胆火与春天的阳气生发，气候由寒转暖，万物萌发。' },
  { id: 'hou-guyu-3', name: '谷雨·三候精油', type: 'pentad', month: 4, solarTerm: '谷雨', pentadIndex: 3, yangValue: 4, yinValue: 2, wuxing: '木', meridian: '足少阳胆经', upperColor: '红色', upperColorHex: '#E74C3C', lowerColor: '绿色', lowerColorHex: '#27AE60', dateRange: '4月30-5月4日', wuxingFeature: '木的特性：“木曰曲直”，指木具有能屈能伸、向上向外舒展的特性，引申为凡具有生长、升发、伸展、舒畅等性质和作用的事物或现象，均归属于木。', organFunction: '胆贮藏排泄胆汁', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '绿色 – 胆的主要生理功能为贮藏和排泄胆汁。木性具有升发、伸展、舒畅的特性，少阳胆火与春天的阳气生发，气候由寒转暖，万物萌发。' },
  // 立夏三候（5月）
  { id: 'hou-lixia-1', name: '立夏·一候精油', type: 'pentad', month: 5, solarTerm: '立夏', pentadIndex: 1, yangValue: 5, yinValue: 1, wuxing: '火', meridian: '手太阳小肠经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '粉色', lowerColorHex: '#FF69B4', dateRange: '5月5-9日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '小肠分清泌浊', yangDesc: '五阳', yinDesc: '一阴' },
  { id: 'hou-lixia-2', name: '立夏·二候精油', type: 'pentad', month: 5, solarTerm: '立夏', pentadIndex: 2, yangValue: 5, yinValue: 1, wuxing: '火', meridian: '手太阳小肠经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '粉色', lowerColorHex: '#FF69B4', dateRange: '5月10-14日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '小肠分清泌浊', yangDesc: '五阳', yinDesc: '一阴' },
  { id: 'hou-lixia-3', name: '立夏·三候精油', type: 'pentad', month: 5, solarTerm: '立夏', pentadIndex: 3, yangValue: 5, yinValue: 1, wuxing: '火', meridian: '手太阳小肠经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '粉色', lowerColorHex: '#FF69B4', dateRange: '5月15-20日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '小肠分清泌浊', yangDesc: '五阳', yinDesc: '一阴' },
  // 小满三候（5月）
  { id: 'hou-xiaoman-1', name: '小满·一候精油', type: 'pentad', month: 5, solarTerm: '小满', pentadIndex: 1, yangValue: 5, yinValue: 1, wuxing: '火', meridian: '手太阳小肠经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '粉色', lowerColorHex: '#FF69B4', dateRange: '5月21-25日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '小肠分清泌浊', yangDesc: '五阳', yinDesc: '一阴' },
  { id: 'hou-xiaoman-2', name: '小满·二候精油', type: 'pentad', month: 5, solarTerm: '小满', pentadIndex: 2, yangValue: 5, yinValue: 1, wuxing: '火', meridian: '手太阳小肠经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '粉色', lowerColorHex: '#FF69B4', dateRange: '5月26-30日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '小肠分清泌浊', yangDesc: '五阳', yinDesc: '一阴' },
  { id: 'hou-xiaoman-3', name: '小满·三候精油', type: 'pentad', month: 5, solarTerm: '小满', pentadIndex: 3, yangValue: 5, yinValue: 1, wuxing: '火', meridian: '手太阳小肠经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '粉色', lowerColorHex: '#FF69B4', dateRange: '5月31-6月5日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '小肠分清泌浊', yangDesc: '五阳', yinDesc: '一阴' },
  // 芒种三候（6月）
  { id: 'hou-mangzhong-1', name: '芒种·一候精油', type: 'pentad', month: 6, solarTerm: '芒种', pentadIndex: 1, yangValue: 6, yinValue: 0, wuxing: '火', meridian: '手少阴心经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '红色', lowerColorHex: '#E74C3C', dateRange: '6月6-10日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '心君火动力', yangDesc: '六阳', yinDesc: '零阴', lowerExplanation: '红色 - 心脏主要功能是为血液流动提供动力(君火)，把血液(营养素)运行至身体各个部分。太阳直射角度下，火性的炎热、上升，把春季夏季下的雨准备君火沸腾开。' },
  { id: 'hou-mangzhong-2', name: '芒种·二候精油', type: 'pentad', month: 6, solarTerm: '芒种', pentadIndex: 2, yangValue: 6, yinValue: 0, wuxing: '火', meridian: '手少阴心经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '红色', lowerColorHex: '#E74C3C', dateRange: '6月11-15日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '心君火动力', yangDesc: '六阳', yinDesc: '零阴', lowerExplanation: '红色 - 心脏主要功能是为血液流动提供动力(君火)，把血液(营养素)运行至身体各个部分。太阳直射角度下，火性的炎热、上升，把春季夏季下的雨准备君火沸腾开。' },
  { id: 'hou-mangzhong-3', name: '芒种·三候精油', type: 'pentad', month: 6, solarTerm: '芒种', pentadIndex: 3, yangValue: 6, yinValue: 0, wuxing: '火', meridian: '手少阴心经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '红色', lowerColorHex: '#E74C3C', dateRange: '6月16-20日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '心君火动力', yangDesc: '六阳', yinDesc: '零阴', lowerExplanation: '红色 - 心脏主要功能是为血液流动提供动力(君火)，把血液(营养素)运行至身体各个部分。太阳直射角度下，火性的炎热、上升，把春季夏季下的雨准备君火沸腾开。' },
  // 夏至三候（6月）
  { id: 'hou-xiazhi-1', name: '夏至·一候精油', type: 'pentad', month: 6, solarTerm: '夏至', pentadIndex: 1, yangValue: 6, yinValue: 0, wuxing: '火', meridian: '手少阴心经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '红色', lowerColorHex: '#E74C3C', dateRange: '6月21-25日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '心君火动力', yangDesc: '六阳', yinDesc: '零阴', lowerExplanation: '红色 - 心脏主要功能是为血液流动提供动力(君火)，把血液(营养素)运行至身体各个部分。太阳直射角度下，火性的炎热、上升，把春季夏季下的雨准备君火沸腾开。' },
  { id: 'hou-xiazhi-2', name: '夏至·二候精油', type: 'pentad', month: 6, solarTerm: '夏至', pentadIndex: 2, yangValue: 6, yinValue: 0, wuxing: '火', meridian: '手少阴心经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '红色', lowerColorHex: '#E74C3C', dateRange: '6月26-30日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '心君火动力', yangDesc: '六阳', yinDesc: '零阴', lowerExplanation: '红色 - 心脏主要功能是为血液流动提供动力(君火)，把血液(营养素)运行至身体各个部分。太阳直射角度下，火性的炎热、上升，把春季夏季下的雨准备君火沸腾开。' },
  { id: 'hou-xiazhi-3', name: '夏至·三候精油', type: 'pentad', month: 6, solarTerm: '夏至', pentadIndex: 3, yangValue: 6, yinValue: 0, wuxing: '火', meridian: '手少阴心经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '红色', lowerColorHex: '#E74C3C', dateRange: '7月1-6日', wuxingFeature: '火的特性：“火曰炎上”，炎上指火具有炎热、上升、光明的特性，引申为凡具有温热、升腾、明亮等性质和作用的事物或现象，均归属于火。', organFunction: '心君火动力', yangDesc: '六阳', yinDesc: '零阴', lowerExplanation: '红色 - 心脏主要功能是为血液流动提供动力(君火)，把血液(营养素)运行至身体各个部分。太阳直射角度下，火性的炎热、上升，把春季夏季下的雨准备君火沸腾开。' },
  // 小暑三候（7月）
  { id: 'hou-xiaoshu-1', name: '小暑·一候精油', type: 'pentad', month: 7, solarTerm: '小暑', pentadIndex: 1, yangValue: 5, yinValue: 1, wuxing: '土', meridian: '足太阴脾经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '橙色', lowerColorHex: '#F39C12', dateRange: '7月7-11日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '脾主运化', yangDesc: '五阳', yinDesc: '一阴', lowerExplanation: '橙色 – 脾脏的主要生理功能为主运化，主统血，主升清。土性的孕育生机、长养万物的特性，把春季夏季下的雨上升运化沸腾弥散开。' },
  { id: 'hou-xiaoshu-2', name: '小暑·二候精油', type: 'pentad', month: 7, solarTerm: '小暑', pentadIndex: 2, yangValue: 5, yinValue: 1, wuxing: '土', meridian: '足太阴脾经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '橙色', lowerColorHex: '#F39C12', dateRange: '7月12-16日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '脾主运化', yangDesc: '五阳', yinDesc: '一阴', lowerExplanation: '橙色 – 脾脏的主要生理功能为主运化，主统血，主升清。土性的孕育生机、长养万物的特性，把春季夏季下的雨上升运化沸腾弥散开。' },
  { id: 'hou-xiaoshu-3', name: '小暑·三候精油', type: 'pentad', month: 7, solarTerm: '小暑', pentadIndex: 3, yangValue: 5, yinValue: 1, wuxing: '土', meridian: '足太阴脾经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '橙色', lowerColorHex: '#F39C12', dateRange: '7月17-22日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '脾主运化', yangDesc: '五阳', yinDesc: '一阴', lowerExplanation: '橙色 – 脾脏的主要生理功能为主运化，主统血，主升清。土性的孕育生机、长养万物的特性，把春季夏季下的雨上升运化沸腾弥散开。' },
  // 大暑三候（7月）
  { id: 'hou-dashu-1', name: '大暑·一候精油', type: 'pentad', month: 7, solarTerm: '大暑', pentadIndex: 1, yangValue: 5, yinValue: 1, wuxing: '土', meridian: '足太阴脾经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '橙色', lowerColorHex: '#F39C12', dateRange: '7月23-27日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '脾主运化', yangDesc: '五阳', yinDesc: '一阴', lowerExplanation: '橙色 – 脾脏的主要生理功能为主运化，主统血，主升清。土性的孕育生机、长养万物的特性，把春季夏季下的雨上升运化沸腾弥散开。' },
  { id: 'hou-dashu-2', name: '大暑·二候精油', type: 'pentad', month: 7, solarTerm: '大暑', pentadIndex: 2, yangValue: 5, yinValue: 1, wuxing: '土', meridian: '足太阴脾经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '橙色', lowerColorHex: '#F39C12', dateRange: '7月28-8月1日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '脾主运化', yangDesc: '五阳', yinDesc: '一阴', lowerExplanation: '橙色 – 脾脏的主要生理功能为主运化，主统血，主升清。土性的孕育生机、长养万物的特性，把春季夏季下的雨上升运化沸腾弥散开。' },
  { id: 'hou-dashu-3', name: '大暑·三候精油', type: 'pentad', month: 7, solarTerm: '大暑', pentadIndex: 3, yangValue: 5, yinValue: 1, wuxing: '土', meridian: '足太阴脾经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '橙色', lowerColorHex: '#F39C12', dateRange: '8月2-6日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '脾主运化', yangDesc: '五阳', yinDesc: '一阴', lowerExplanation: '橙色 – 脾脏的主要生理功能为主运化，主统血，主升清。土性的孕育生机、长养万物的特性，把春季夏季下的雨上升运化沸腾弥散开。' },
  // 立秋三候（8月）
  { id: 'hou-liqiu-1', name: '立秋·一候精油', type: 'pentad', month: 8, solarTerm: '立秋', pentadIndex: 1, yangValue: 4, yinValue: 2, wuxing: '土', meridian: '足阳明胃经', upperColor: '红色', upperColorHex: '#E74C3C', lowerColor: '黄色', lowerColorHex: '#F1C40F', dateRange: '8月7-11日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '胃容纳水谷', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '黄色 - 胃主要功能是接受和容纳水谷，土性的承载、受纳的特性，把太阳能量和雨水能量受纳。' },
  { id: 'hou-liqiu-2', name: '立秋·二候精油', type: 'pentad', month: 8, solarTerm: '立秋', pentadIndex: 2, yangValue: 4, yinValue: 2, wuxing: '土', meridian: '足阳明胃经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '黄色', lowerColorHex: '#F1C40F', dateRange: '8月12-16日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '胃容纳水谷', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '黄色 - 胃主要功能是接受和容纳水谷，土性的承载、受纳的特性，把太阳能量和雨水能量受纳。' },
  { id: 'hou-liqiu-3', name: '立秋·三候精油', type: 'pentad', month: 8, solarTerm: '立秋', pentadIndex: 3, yangValue: 4, yinValue: 2, wuxing: '土', meridian: '足阳明胃经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '黄色', lowerColorHex: '#F1C40F', dateRange: '8月17-22日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '胃容纳水谷', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '黄色 - 胃主要功能是接受和容纳水谷，土性的承载、受纳的特性，把太阳能量和雨水能量受纳。' },
  // 处暑三候（8月）
  { id: 'hou-chushu-1', name: '处暑·一候精油', type: 'pentad', month: 8, solarTerm: '处暑', pentadIndex: 1, yangValue: 4, yinValue: 2, wuxing: '土', meridian: '足阳明胃经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '黄色', lowerColorHex: '#F1C40F', dateRange: '8月23-27日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '胃容纳水谷', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '黄色 - 胃主要功能是接受和容纳水谷，土性的承载、受纳的特性，把太阳能量和雨水能量受纳。' },
  { id: 'hou-chushu-2', name: '处暑·二候精油', type: 'pentad', month: 8, solarTerm: '处暑', pentadIndex: 2, yangValue: 4, yinValue: 2, wuxing: '土', meridian: '足阳明胃经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '黄色', lowerColorHex: '#F1C40F', dateRange: '8月28-9月1日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '胃容纳水谷', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '黄色 - 胃主要功能是接受和容纳水谷，土性的承载、受纳的特性，把太阳能量和雨水能量受纳。' },
  { id: 'hou-chushu-3', name: '处暑·三候精油', type: 'pentad', month: 8, solarTerm: '处暑', pentadIndex: 3, yangValue: 4, yinValue: 2, wuxing: '土', meridian: '足阳明胃经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '黄色', lowerColorHex: '#F1C40F', dateRange: '9月2-7日', wuxingFeature: '土的特性：“土爱稼穑”，指土具有播种和收获，即孕育生机、长养万物的特性，故称土载四行，为万物之母。引申为凡具有生化、承载、受纳等性质和作用的事物或现象，均归属于土。', organFunction: '胃容纳水谷', yangDesc: '四阳', yinDesc: '二阴', lowerExplanation: '黄色 - 胃主要功能是接受和容纳水谷，土性的承载、受纳的特性，把太阳能量和雨水能量受纳。' },
  // 白露三候（9月）
  { id: 'hou-bailu-1', name: '白露·一候精油', type: 'pentad', month: 9, solarTerm: '白露', pentadIndex: 1, yangValue: 3, yinValue: 3, wuxing: '金', meridian: '手阳明大肠经', upperColor: '红色', upperColorHex: '#E74C3C', lowerColor: '褐色', lowerColorHex: '#8D6E63', dateRange: '9月8-12日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '大肠传化糟粕', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '褐色 – 大肠主要功能传化糟粕的功能，接受小肠泌别清浊后下移的食物残渣，吸收其中多余的水液，形成粪便，经肛门排出体外。金性的沉降、收敛、清洁特性，把水谷收获，剩下残渣分别。' },
  { id: 'hou-bailu-2', name: '白露·二候精油', type: 'pentad', month: 9, solarTerm: '白露', pentadIndex: 2, yangValue: 3, yinValue: 3, wuxing: '金', meridian: '手阳明大肠经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '褐色', lowerColorHex: '#8D6E63', dateRange: '9月13-17日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '大肠传化糟粕', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '褐色 – 大肠主要功能传化糟粕的功能，接受小肠泌别清浊后下移的食物残渣，吸收其中多余的水液，形成粪便，经肛门排出体外。金性的沉降、收敛、清洁特性，把水谷收获，剩下残渣分别。' },
  { id: 'hou-bailu-3', name: '白露·三候精油', type: 'pentad', month: 9, solarTerm: '白露', pentadIndex: 3, yangValue: 3, yinValue: 3, wuxing: '金', meridian: '手阳明大肠经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '褐色', lowerColorHex: '#8D6E63', dateRange: '9月18-22日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '大肠传化糟粕', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '褐色 – 大肠主要功能传化糟粕的功能，接受小肠泌别清浊后下移的食物残渣，吸收其中多余的水液，形成粪便，经肛门排出体外。金性的沉降、收敛、清洁特性，把水谷收获，剩下残渣分别。' },
  // 秋分三候（9月）
  { id: 'hou-qiufen-1', name: '秋分·一候精油', type: 'pentad', month: 9, solarTerm: '秋分', pentadIndex: 1, yangValue: 3, yinValue: 3, wuxing: '金', meridian: '手阳明大肠经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '褐色', lowerColorHex: '#8D6E63', dateRange: '9月23-27日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '大肠传化糟粕', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '褐色 – 大肠主要功能传化糟粕的功能，接受小肠泌别清浊后下移的食物残渣，吸收其中多余的水液，形成粪便，经肛门排出体外。金性的沉降、收敛、清洁特性，把水谷收获，剩下残渣分别。' },
  { id: 'hou-qiufen-2', name: '秋分·二候精油', type: 'pentad', month: 9, solarTerm: '秋分', pentadIndex: 2, yangValue: 3, yinValue: 3, wuxing: '金', meridian: '手阳明大肠经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '褐色', lowerColorHex: '#8D6E63', dateRange: '9月28-10月2日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '大肠传化糟粕', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '褐色 – 大肠主要功能传化糟粕的功能，接受小肠泌别清浊后下移的食物残渣，吸收其中多余的水液，形成粪便，经肛门排出体外。金性的沉降、收敛、清洁特性，把水谷收获，剩下残渣分别。' },
  { id: 'hou-qiufen-3', name: '秋分·三候精油', type: 'pentad', month: 9, solarTerm: '秋分', pentadIndex: 3, yangValue: 3, yinValue: 3, wuxing: '金', meridian: '手阳明大肠经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '褐色', lowerColorHex: '#8D6E63', dateRange: '10月3-7日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '大肠传化糟粕', yangDesc: '三阳', yinDesc: '三阴', lowerExplanation: '褐色 – 大肠主要功能传化糟粕的功能，接受小肠泌别清浊后下移的食物残渣，吸收其中多余的水液，形成粪便，经肛门排出体外。金性的沉降、收敛、清洁特性，把水谷收获，剩下残渣分别。' },
  // 寒露三候（10月）
  { id: 'hou-hanlu-1', name: '寒露·一候精油', type: 'pentad', month: 10, solarTerm: '寒露', pentadIndex: 1, yangValue: 2, yinValue: 4, wuxing: '金', meridian: '手太阴肺经', upperColor: '红色', upperColorHex: '#E74C3C', lowerColor: '白色', lowerColorHex: '#FFFFFF', dateRange: '10月8-12日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '肺主气司呼吸', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '白色 – 肺脏主要生理功能是主气司呼吸，主行水，朝百脉，主治节，最娇嫩的器官怕寒热怕脏，金性清洁的特性，相当于整个一年的冬眠之前整理整顿。' },
  { id: 'hou-hanlu-2', name: '寒露·二候精油', type: 'pentad', month: 10, solarTerm: '寒露', pentadIndex: 2, yangValue: 2, yinValue: 4, wuxing: '金', meridian: '手太阴肺经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '白色', lowerColorHex: '#FFFFFF', dateRange: '10月13-17日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '肺主气司呼吸', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '白色 – 肺脏主要生理功能是主气司呼吸，主行水，朝百脉，主治节，最娇嫩的器官怕寒热怕脏，金性清洁的特性，相当于整个一年的冬眠之前整理整顿。' },
  { id: 'hou-hanlu-3', name: '寒露·三候精油', type: 'pentad', month: 10, solarTerm: '寒露', pentadIndex: 3, yangValue: 2, yinValue: 4, wuxing: '金', meridian: '手太阴肺经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '白色', lowerColorHex: '#FFFFFF', dateRange: '10月18-22日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '肺主气司呼吸', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '白色 – 肺脏主要生理功能是主气司呼吸，主行水，朝百脉，主治节，最娇嫩的器官怕寒热怕脏，金性清洁的特性，相当于整个一年的冬眠之前整理整顿。' },
  // 霜降三候（10月）
  { id: 'hou-shuangjiang-1', name: '霜降·一候精油', type: 'pentad', month: 10, solarTerm: '霜降', pentadIndex: 1, yangValue: 2, yinValue: 4, wuxing: '金', meridian: '手太阴肺经', upperColor: '蓝色', upperColorHex: '#3498DB', lowerColor: '白色', lowerColorHex: '#FFFFFF', dateRange: '10月23-27日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '肺主气司呼吸', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '白色 – 肺脏主要生理功能是主气司呼吸，主行水，朝百脉，主治节，最娇嫩的器官怕寒热怕脏，金性清洁的特性，相当于整个一年的冬眠之前整理整顿。' },
  { id: 'hou-shuangjiang-2', name: '霜降·二候精油', type: 'pentad', month: 10, solarTerm: '霜降', pentadIndex: 2, yangValue: 2, yinValue: 4, wuxing: '金', meridian: '手太阴肺经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '白色', lowerColorHex: '#FFFFFF', dateRange: '10月28-11月1日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '肺主气司呼吸', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '白色 – 肺脏主要生理功能是主气司呼吸，主行水，朝百脉，主治节，最娇嫩的器官怕寒热怕脏，金性清洁的特性，相当于整个一年的冬眠之前整理整顿。' },
  { id: 'hou-shuangjiang-3', name: '霜降·三候精油', type: 'pentad', month: 10, solarTerm: '霜降', pentadIndex: 3, yangValue: 2, yinValue: 4, wuxing: '金', meridian: '手太阴肺经', upperColor: '黑色', upperColorHex: '#1A1A2E', lowerColor: '白色', lowerColorHex: '#FFFFFF', dateRange: '11月2-6日', wuxingFeature: '金的特性：“金曰从革”，引申为凡具有沉降、肃杀、收敛、清洁、发声等性质和作用的事物或现象均归属于金。', organFunction: '肺主气司呼吸', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '白色 – 肺脏主要生理功能是主气司呼吸，主行水，朝百脉，主治节，最娇嫩的器官怕寒热怕脏，金性清洁的特性，相当于整个一年的冬眠之前整理整顿。' },
  // 立冬三候（11月）
  { id: 'hou-lidong-1', name: '立冬·一候精油', type: 'pentad', month: 11, solarTerm: '立冬', pentadIndex: 1, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阴)', meridian: '足少阴肾经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '黑色', lowerColorHex: '#1A1A2E', dateRange: '11月7-11日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '肾主藏精主水', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '黑色 – 肾脏主藏精，主水，主纳气，肾中精气中含有肾阴、肾阳两部分。肾阳鼓动肾阴，经肾气的蒸化作用，升清降浊。水性下行、寒冷、闭藏特性，人体一天有晚上睡觉准备白天一样，储存一年剩下的能量冬眠。' },
  { id: 'hou-lidong-2', name: '立冬·二候精油', type: 'pentad', month: 11, solarTerm: '立冬', pentadIndex: 2, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阴)', meridian: '足少阴肾经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '黑色', lowerColorHex: '#1A1A2E', dateRange: '11月12-16日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '肾主藏精主水', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '黑色 – 肾脏主藏精，主水，主纳气，肾中精气中含有肾阴、肾阳两部分。肾阳鼓动肾阴，经肾气的蒸化作用，升清降浊。水性下行、寒冷、闭藏特性，人体一天有晚上睡觉准备白天一样，储存一年剩下的能量冬眠。' },
  { id: 'hou-lidong-3', name: '立冬·三候精油', type: 'pentad', month: 11, solarTerm: '立冬', pentadIndex: 3, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阴)', meridian: '足少阴肾经', upperColor: '白色', upperColorHex: '#FFFFFF', lowerColor: '黑色', lowerColorHex: '#1A1A2E', dateRange: '11月17-21日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '肾主藏精主水', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '黑色 – 肾脏主藏精，主水，主纳气，肾中精气中含有肾阴、肾阳两部分。肾阳鼓动肾阴，经肾气的蒸化作用，升清降浊。水性下行、寒冷、闭藏特性，人体一天有晚上睡觉准备白天一样，储存一年剩下的能量冬眠。' },
  // 小雪三候（11月）
  { id: 'hou-xiaoxue-1', name: '小雪·一候精油', type: 'pentad', month: 11, solarTerm: '小雪', pentadIndex: 1, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阴)', meridian: '足少阴肾经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '黑色', lowerColorHex: '#1A1A2E', dateRange: '11月22-26日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '肾主藏精主水', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '黑色 – 肾脏主藏精，主水，主纳气，肾中精气中含有肾阴、肾阳两部分。肾阳鼓动肾阴，经肾气的蒸化作用，升清降浊。水性下行、寒冷、闭藏特性，人体一天有晚上睡觉准备白天一样，储存一年剩下的能量冬眠。' },
  { id: 'hou-xiaoxue-2', name: '小雪·二候精油', type: 'pentad', month: 11, solarTerm: '小雪', pentadIndex: 2, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阴)', meridian: '足少阴肾经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '黑色', lowerColorHex: '#1A1A2E', dateRange: '11月27-12月1日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '肾主藏精主水', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '黑色 – 肾脏主藏精，主水，主纳气，肾中精气中含有肾阴、肾阳两部分。肾阳鼓动肾阴，经肾气的蒸化作用，升清降浊。水性下行、寒冷、闭藏特性，人体一天有晚上睡觉准备白天一样，储存一年剩下的能量冬眠。' },
  { id: 'hou-xiaoxue-3', name: '小雪·三候精油', type: 'pentad', month: 11, solarTerm: '小雪', pentadIndex: 3, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阴)', meridian: '足少阴肾经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '黑色', lowerColorHex: '#1A1A2E', dateRange: '12月2-6日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '肾主藏精主水', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '黑色 – 肾脏主藏精，主水，主纳气，肾中精气中含有肾阴、肾阳两部分。肾阳鼓动肾阴，经肾气的蒸化作用，升清降浊。水性下行、寒冷、闭藏特性，人体一天有晚上睡觉准备白天一样，储存一年剩下的能量冬眠。' },
  // 大雪三候（12月）
  { id: 'hou-daxue-1', name: '大雪·一候精油', type: 'pentad', month: 12, solarTerm: '大雪', pentadIndex: 1, yangValue: 0, yinValue: 6, wuxing: '水', wuxingSub: '水(阴)', meridian: '足太阳膀胱经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '灰色', lowerColorHex: '#95A5A6', dateRange: '12月7-11日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '膀胱贮存排泄', yangDesc: '零阳', yinDesc: '六阴', lowerExplanation: '灰色 – 膀胱是贮存和排泄尿液的器官。水性下行、寒冷、闭藏特性，冬眠中产生的残渣物贮存和排泄。' },
  { id: 'hou-daxue-2', name: '大雪·二候精油', type: 'pentad', month: 12, solarTerm: '大雪', pentadIndex: 2, yangValue: 0, yinValue: 6, wuxing: '水', wuxingSub: '水(阴)', meridian: '足太阳膀胱经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '灰色', lowerColorHex: '#95A5A6', dateRange: '12月12-16日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '膀胱贮存排泄', yangDesc: '零阳', yinDesc: '六阴', lowerExplanation: '灰色 – 膀胱是贮存和排泄尿液的器官。水性下行、寒冷、闭藏特性，冬眠中产生的残渣物贮存和排泄。' },
  { id: 'hou-daxue-3', name: '大雪·三候精油', type: 'pentad', month: 12, solarTerm: '大雪', pentadIndex: 3, yangValue: 0, yinValue: 6, wuxing: '水', wuxingSub: '水(阴)', meridian: '足太阳膀胱经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '灰色', lowerColorHex: '#95A5A6', dateRange: '12月17-21日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '膀胱贮存排泄', yangDesc: '零阳', yinDesc: '六阴', lowerExplanation: '灰色 – 膀胱是贮存和排泄尿液的器官。水性下行、寒冷、闭藏特性，冬眠中产生的残渣物贮存和排泄。' },
  // 冬至三候（12月）
  { id: 'hou-dongzhi-1', name: '冬至·一候精油', type: 'pentad', month: 12, solarTerm: '冬至', pentadIndex: 1, yangValue: 0, yinValue: 6, wuxing: '水', wuxingSub: '水(阴)', meridian: '足太阳膀胱经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '灰色', lowerColorHex: '#95A5A6', dateRange: '12月22-26日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '膀胱贮存排泄', yangDesc: '零阳', yinDesc: '六阴', lowerExplanation: '灰色 – 膀胱是贮存和排泄尿液的器官。水性下行、寒冷、闭藏特性，冬眠中产生的残渣物贮存和排泄。' },
  { id: 'hou-dongzhi-2', name: '冬至·二候精油', type: 'pentad', month: 12, solarTerm: '冬至', pentadIndex: 2, yangValue: 0, yinValue: 6, wuxing: '水', wuxingSub: '水(阴)', meridian: '足太阳膀胱经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '灰色', lowerColorHex: '#95A5A6', dateRange: '12月27-31日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '膀胱贮存排泄', yangDesc: '零阳', yinDesc: '六阴', lowerExplanation: '灰色 – 膀胱是贮存和排泄尿液的器官。水性下行、寒冷、闭藏特性，冬眠中产生的残渣物贮存和排泄。' },
  { id: 'hou-dongzhi-3', name: '冬至·三候精油', type: 'pentad', month: 12, solarTerm: '冬至', pentadIndex: 3, yangValue: 0, yinValue: 6, wuxing: '水', wuxingSub: '水(阴)', meridian: '足太阳膀胱经', upperColor: '紫色', upperColorHex: '#9B59B6', lowerColor: '灰色', lowerColorHex: '#95A5A6', dateRange: '1月1-4日', wuxingFeature: '水的特性：“水曰润下”，指水具有滋润、下行的特性。引申为凡具有滋润、下行、寒冷、闭藏等性质和作用的事物或现象，均归属于水。', organFunction: '膀胱贮存排泄', yangDesc: '零阳', yinDesc: '六阴', lowerExplanation: '灰色 – 膀胱是贮存和排泄尿液的器官。水性下行、寒冷、闭藏特性，冬眠中产生的残渣物贮存和排泄。' },
  // 小寒三候（1月）
  { id: 'hou-xiaohan-1', name: '小寒·一候精油', type: 'pentad', month: 1, solarTerm: '小寒', pentadIndex: 1, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阳)', meridian: '手少阳三焦经', upperColor: '红色', upperColorHex: '#E74C3C', lowerColor: '紫色', lowerColorHex: '#9B59B6', dateRange: '1月5-9日', wuxingFeature: '● 上层解释：红色 –', organFunction: '三焦总司气化', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '紫色 – 三焦既是气机升降出入的通道，又是气化的场所，总司全身的气化，运行水液，疏通水道。肾阳的蒸化作用，升清降浊后通过三焦全身弥散，这时候通过睡眠休息，准备迎接春天的阳气。紫色涵盖红色，这里的红色代表肾阳。' },
  { id: 'hou-xiaohan-2', name: '小寒·二候精油', type: 'pentad', month: 1, solarTerm: '小寒', pentadIndex: 2, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阳)', meridian: '手少阳三焦经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '紫色', lowerColorHex: '#9B59B6', dateRange: '1月10-14日', wuxingFeature: '● 上层解释：橙色 –', organFunction: '三焦总司气化', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '紫色 – 三焦既是气机升降出入的通道，又是气化的场所，总司全身的气化，运行水液，疏通水道。肾阳的蒸化作用，升清降浊后通过三焦全身弥散，这时候通过睡眠休息，准备迎接春天的阳气。紫色涵盖红色，这里的红色代表肾阳。' },
  { id: 'hou-xiaohan-3', name: '小寒·三候精油', type: 'pentad', month: 1, solarTerm: '小寒', pentadIndex: 3, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阳)', meridian: '手少阳三焦经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '紫色', lowerColorHex: '#9B59B6', dateRange: '1月15-19日', wuxingFeature: '● 上层解释：粉色 –', organFunction: '三焦总司气化', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '紫色 – 三焦既是气机升降出入的通道，又是气化的场所，总司全身的气化，运行水液，疏通水道。肾阳的蒸化作用，升清降浊后通过三焦全身弥散，这时候通过睡眠休息，准备迎接春天的阳气。紫色涵盖红色，这里的红色代表肾阳。' },
  // 大寒三候（1月）
  { id: 'hou-dahan-1', name: '大寒·一候精油', type: 'pentad', month: 1, solarTerm: '大寒', pentadIndex: 1, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阳)', meridian: '手少阳三焦经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '紫色', lowerColorHex: '#9B59B6', dateRange: '1月20-24日', wuxingFeature: '● 上层解释：黄色 –', organFunction: '三焦总司气化', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '紫色 – 三焦既是气机升降出入的通道，又是气化的场所，总司全身的气化，运行水液，疏通水道。肾阳的蒸化作用，升清降浊后通过三焦全身弥散，这时候通过睡眠休息，准备迎接春天的阳气。紫色涵盖红色，这里的红色代表肾阳。' },
  { id: 'hou-dahan-2', name: '大寒·二候精油', type: 'pentad', month: 1, solarTerm: '大寒', pentadIndex: 2, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阳)', meridian: '手少阳三焦经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '紫色', lowerColorHex: '#9B59B6', dateRange: '1月25-29日', wuxingFeature: '● 上层解释：绿色 –', organFunction: '三焦总司气化', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '紫色 – 三焦既是气机升降出入的通道，又是气化的场所，总司全身的气化，运行水液，疏通水道。肾阳的蒸化作用，升清降浊后通过三焦全身弥散，这时候通过睡眠休息，准备迎接春天的阳气。紫色涵盖红色，这里的红色代表肾阳。' },
  { id: 'hou-dahan-3', name: '大寒·三候精油', type: 'pentad', month: 1, solarTerm: '大寒', pentadIndex: 3, yangValue: 1, yinValue: 5, wuxing: '水', wuxingSub: '水(阳)', meridian: '手少阳三焦经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '紫色', lowerColorHex: '#9B59B6', dateRange: '1月30-2月3日', wuxingFeature: '● 上层解释：青色 –', organFunction: '三焦总司气化', yangDesc: '一阳', yinDesc: '五阴', lowerExplanation: '紫色 – 三焦既是气机升降出入的通道，又是气化的场所，总司全身的气化，运行水液，疏通水道。肾阳的蒸化作用，升清降浊后通过三焦全身弥散，这时候通过睡眠休息，准备迎接春天的阳气。紫色涵盖红色，这里的红色代表肾阳。' },
  // 立春三候（2月）
  { id: 'hou-lichun-1', name: '立春·一候精油', type: 'pentad', month: 2, solarTerm: '立春', pentadIndex: 1, yangValue: 2, yinValue: 4, wuxing: '水', wuxingSub: '水(阳)', meridian: '手厥阴心包经', upperColor: '青色', upperColorHex: '#00BCD4', lowerColor: '蓝色', lowerColorHex: '#3498DB', dateRange: '2月4-8日', wuxingFeature: '● 上层解释：青色 –', organFunction: '心包护卫心脏', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '蓝色 - 心包包裹着心脏，对心脏起护卫的作用。寒冷的冬眠期沉睡的心脏保护的是心包，肾阳鼓动保护心包敲醒君火。' },
  { id: 'hou-lichun-2', name: '立春·二候精油', type: 'pentad', month: 2, solarTerm: '立春', pentadIndex: 2, yangValue: 2, yinValue: 4, wuxing: '水', wuxingSub: '水(阳)', meridian: '手厥阴心包经', upperColor: '绿色', upperColorHex: '#27AE60', lowerColor: '蓝色', lowerColorHex: '#3498DB', dateRange: '2月9-13日', wuxingFeature: '● 上层解释：绿色 –', organFunction: '心包护卫心脏', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '蓝色 - 心包包裹着心脏，对心脏起护卫的作用。寒冷的冬眠期沉睡的心脏保护的是心包，肾阳鼓动保护心包敲醒君火。' },
  { id: 'hou-lichun-3', name: '立春·三候精油', type: 'pentad', month: 2, solarTerm: '立春', pentadIndex: 3, yangValue: 2, yinValue: 4, wuxing: '水', wuxingSub: '水(阳)', meridian: '手厥阴心包经', upperColor: '黄色', upperColorHex: '#F1C40F', lowerColor: '蓝色', lowerColorHex: '#3498DB', dateRange: '2月14-18日', wuxingFeature: '● 上层解释：黄色 –', organFunction: '心包护卫心脏', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '蓝色 - 心包包裹着心脏，对心脏起护卫的作用。寒冷的冬眠期沉睡的心脏保护的是心包，肾阳鼓动保护心包敲醒君火。' },
  // 雨水三候（2月）
  { id: 'hou-yushui-1', name: '雨水·一候精油', type: 'pentad', month: 2, solarTerm: '雨水', pentadIndex: 1, yangValue: 2, yinValue: 4, wuxing: '水', wuxingSub: '水(阳)', meridian: '手厥阴心包经', upperColor: '粉色', upperColorHex: '#FF69B4', lowerColor: '蓝色', lowerColorHex: '#3498DB', dateRange: '2月19-23日', wuxingFeature: '● 上层解释：粉色 –', organFunction: '心包护卫心脏', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '蓝色 - 心包包裹着心脏，对心脏起护卫的作用。寒冷的冬眠期沉睡的心脏保护的是心包，肾阳鼓动保护心包敲醒君火。' },
  { id: 'hou-yushui-2', name: '雨水·二候精油', type: 'pentad', month: 2, solarTerm: '雨水', pentadIndex: 2, yangValue: 2, yinValue: 4, wuxing: '水', wuxingSub: '水(阳)', meridian: '手厥阴心包经', upperColor: '橙色', upperColorHex: '#F39C12', lowerColor: '蓝色', lowerColorHex: '#3498DB', dateRange: '2月24-28日', wuxingFeature: '● 上层解释：橙色 –', organFunction: '心包护卫心脏', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '蓝色 - 心包包裹着心脏，对心脏起护卫的作用。寒冷的冬眠期沉睡的心脏保护的是心包，肾阳鼓动保护心包敲醒君火。' },
  { id: 'hou-yushui-3', name: '雨水·三候精油', type: 'pentad', month: 2, solarTerm: '雨水', pentadIndex: 3, yangValue: 2, yinValue: 4, wuxing: '水', wuxingSub: '水(阳)', meridian: '手厥阴心包经', upperColor: '红色', upperColorHex: '#E74C3C', lowerColor: '蓝色', lowerColorHex: '#3498DB', dateRange: '3月1-4日', wuxingFeature: '● 上层解释：红色 –', organFunction: '心包护卫心脏', yangDesc: '二阳', yinDesc: '四阴', lowerExplanation: '蓝色 - 心包包裹着心脏，对心脏起护卫的作用。寒冷的冬眠期沉睡的心脏保护的是心包，肾阳鼓动保护心包敲醒君火。' },
];

export const personalityColorMap: PersonalityColorMapping[] = [
  { dimension: '太阳', level: '高分', trait: '坚持己见', healingColors: ['红色'], solarTerms: ['立春','立秋'], meridians: ['心经(午月)'] },
  { dimension: '太阳', level: '高分', trait: '好斗', healingColors: ['红色','粉色'], solarTerms: ['小满','小雪'], meridians: ['小肠经(巳月)'] },
  { dimension: '太阳', level: '高分', trait: '性子急', healingColors: ['红色','蓝色'], solarTerms: ['大暑','大寒'], meridians: ['心包经(寅月)'] },
  { dimension: '太阳', level: '高分', trait: '走路时昂首挺胸', healingColors: ['红色','青色'], solarTerms: ['芒种','大雪'], meridians: ['肝经(卯月)'] },
  { dimension: '太阳', level: '高分', trait: '走路时昂首挺胸', healingColors: ['红色'], solarTerms: ['均可'], meridians: ['心经'] },
  { dimension: '太阳', level: '低分', trait: '性子不急', healingColors: ['绿色'], solarTerms: ['均可'], meridians: ['胆经'] },
  { dimension: '太阳', level: '低分', trait: '避免与他人冲突', healingColors: ['绿色'], solarTerms: ['处暑','雨水'], meridians: ['胆经(辰月)'] },
  { dimension: '太阳', level: '低分', trait: '不能坚持自己的意见', healingColors: ['粉色'], solarTerms: ['小满','小雪'], meridians: ['小肠经(巳月)'] },
  { dimension: '少阳', level: '高分', trait: '乐观', healingColors: ['橙色','黄色'], solarTerms: ['均可'], meridians: ['脾经'] },
  { dimension: '少阳', level: '高分', trait: '反应快', healingColors: ['橙色','黄色'], solarTerms: ['均可'], meridians: ['脾经'] },
  { dimension: '少阳', level: '高分', trait: '好交际', healingColors: ['橙色','黄色'], solarTerms: ['均可'], meridians: ['脾经'] },
  { dimension: '少阳', level: '高分', trait: '说话时手势丰富', healingColors: ['橙色','黄色'], solarTerms: ['均可'], meridians: ['脾经'] },
  { dimension: '少阳', level: '低分', trait: '反应慢', healingColors: ['蓝色'], solarTerms: ['均可'], meridians: ['心包经'] },
  { dimension: '少阳', level: '低分', trait: '悲观', healingColors: ['蓝色'], solarTerms: ['大暑','大寒'], meridians: ['心包经(寅月)'] },
  { dimension: '少阳', level: '低分', trait: '悲观', healingColors: ['蓝色','红色'], solarTerms: ['立春','立秋'], meridians: ['心经(午月)'] },
  { dimension: '少阳', level: '低分', trait: '稳重', healingColors: ['白色'], solarTerms: ['均可'], meridians: ['肺经'] },
  { dimension: '少阳', level: '低分', trait: '不喜交际', healingColors: ['橙色'], solarTerms: ['立夏','立冬'], meridians: ['脾经'] },
  { dimension: '少阳', level: '低分', trait: '不喜交际', healingColors: ['黄色'], solarTerms: ['夏至','冬至'], meridians: ['胃经'] },
  { dimension: '阴阳和平', level: '高分', trait: '从容', healingColors: ['绿色'], solarTerms: ['均可'], meridians: ['胆经'] },
  { dimension: '阴阳和平', level: '高分', trait: '心态平和', healingColors: ['绿色'], solarTerms: ['均可'], meridians: ['胆经'] },
  { dimension: '阴阳和平', level: '高分', trait: '善于权衡利弊', healingColors: ['绿色'], solarTerms: ['均可'], meridians: ['胆经'] },
  { dimension: '阴阳和平', level: '高分', trait: '待人接物得体妥当', healingColors: ['绿色'], solarTerms: ['均可'], meridians: ['胆经'] },
  { dimension: '阴阳和平', level: '低分', trait: '有时考虑欠周全', healingColors: ['白色','棕色'], solarTerms: ['霜降','谷雨'], meridians: ['大肠经(酉月)'] },
  { dimension: '阴阳和平', level: '低分', trait: '易感烦恼', healingColors: ['白色'], solarTerms: ['小暑','小寒'], meridians: ['肺经(戌月)'] },
  { dimension: '少阴', level: '高分', trait: '谨慎', healingColors: ['青色'], solarTerms: ['芒种','大雪'], meridians: ['肝经(卯月)'] },
  { dimension: '少阴', level: '高分', trait: '内敛', healingColors: ['青色'], solarTerms: ['芒种','大雪'], meridians: ['肝经(卯月)'] },
  { dimension: '少阴', level: '高分', trait: '稳重', healingColors: ['青色'], solarTerms: ['芒种','大雪'], meridians: ['肝经(卯月)'] },
  { dimension: '少阴', level: '高分', trait: '说话做事慢吞吞的', healingColors: ['黄色'], solarTerms: ['均可'], meridians: ['胃经'] },
  { dimension: '少阴', level: '低分', trait: '乐于表达', healingColors: ['青色','黄色'], solarTerms: ['夏至','冬至'], meridians: ['胃经(申月)'] },
  { dimension: '少阴', level: '低分', trait: '做事情往往轻率随意', healingColors: ['橙色'], solarTerms: ['立夏','立冬'], meridians: ['脾经(未月)'] },
  { dimension: '太阴', level: '高分', trait: '思虑多', healingColors: ['蓝色','黑色'], solarTerms: ['清明','寒露'], meridians: ['肾经(亥月)'] },
  { dimension: '太阴', level: '高分', trait: '思虑多', healingColors: ['蓝色','黑色'], solarTerms: ['立春','立秋'], meridians: ['心经(午月)'] },
  { dimension: '太阴', level: '高分', trait: '缺乏自信', healingColors: ['黄色'], solarTerms: ['夏至','冬至'], meridians: ['胃经(申月)'] },
  { dimension: '太阴', level: '高分', trait: '缺乏自信', healingColors: ['紫色'], solarTerms: ['春分','秋分'], meridians: ['三焦经(丑月)'] },
  { dimension: '太阴', level: '高分', trait: '易感烦恼', healingColors: ['白色'], solarTerms: ['小暑','小寒'], meridians: ['肺经(戌月)'] },
  { dimension: '太阴', level: '高分', trait: '易感烦恼', healingColors: ['棕色'], solarTerms: ['霜降','谷雨'], meridians: ['大肠经(酉月)'] },
  { dimension: '太阴', level: '高分', trait: '情绪不稳定', healingColors: ['橙色'], solarTerms: ['立夏','立冬'], meridians: ['脾经(未月)'] },
  { dimension: '太阴', level: '高分', trait: '易感疲惫', healingColors: ['黑色'], solarTerms: ['清明','寒露'], meridians: ['肾经(亥月)'] },
  { dimension: '太阴', level: '高分', trait: '易感疲惫', healingColors: ['黑色'], solarTerms: ['白露','惊蛰'], meridians: ['膀胱经(子月)'] },
  { dimension: '太阴', level: '低分', trait: '乐观', healingColors: ['橙色','黄色'], solarTerms: ['均可'], meridians: ['脾经','胃经'] },
  { dimension: '太阴', level: '低分', trait: '思虑少', healingColors: ['橙色','黄色'], solarTerms: ['均可'], meridians: ['脾经','胃经'] },
  { dimension: '太阴', level: '低分', trait: '自信', healingColors: ['紫色'], solarTerms: ['均可'], meridians: ['三焦经'] },
  { dimension: '太阴', level: '低分', trait: '情绪稳定', healingColors: ['紫色'], solarTerms: ['均可'], meridians: ['三焦经'] },
];

const SOLAR_TERM_DATES: { name: string; month: number; day: number; endMonth: number; endDay: number }[] = [
  { name: '小寒', month: 1, day: 5, endMonth: 1, endDay: 19 },
  { name: '大寒', month: 1, day: 20, endMonth: 2, endDay: 3 },
  { name: '立春', month: 2, day: 4, endMonth: 2, endDay: 18 },
  { name: '雨水', month: 2, day: 19, endMonth: 3, endDay: 4 },
  { name: '惊蛰', month: 3, day: 5, endMonth: 3, endDay: 19 },
  { name: '春分', month: 3, day: 20, endMonth: 4, endDay: 4 },
  { name: '清明', month: 4, day: 5, endMonth: 4, endDay: 19 },
  { name: '谷雨', month: 4, day: 20, endMonth: 5, endDay: 4 },
  { name: '立夏', month: 5, day: 5, endMonth: 5, endDay: 20 },
  { name: '小满', month: 5, day: 21, endMonth: 6, endDay: 5 },
  { name: '芒种', month: 6, day: 6, endMonth: 6, endDay: 20 },
  { name: '夏至', month: 6, day: 21, endMonth: 7, endDay: 6 },
  { name: '小暑', month: 7, day: 7, endMonth: 7, endDay: 22 },
  { name: '大暑', month: 7, day: 23, endMonth: 8, endDay: 6 },
  { name: '立秋', month: 8, day: 7, endMonth: 8, endDay: 22 },
  { name: '处暑', month: 8, day: 23, endMonth: 9, endDay: 7 },
  { name: '白露', month: 9, day: 8, endMonth: 9, endDay: 22 },
  { name: '秋分', month: 9, day: 23, endMonth: 10, endDay: 7 },
  { name: '寒露', month: 10, day: 8, endMonth: 10, endDay: 22 },
  { name: '霜降', month: 10, day: 23, endMonth: 11, endDay: 6 },
  { name: '立冬', month: 11, day: 7, endMonth: 11, endDay: 21 },
  { name: '小雪', month: 11, day: 22, endMonth: 12, endDay: 6 },
  { name: '大雪', month: 12, day: 7, endMonth: 12, endDay: 21 },
  { name: '冬至', month: 12, day: 22, endMonth: 1, endDay: 4 },
];

export function getCurrentSolarTerm(): { solarTerm: string; month: number; pentad: number } | null {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  for (let i = SOLAR_TERM_DATES.length - 1; i >= 0; i--) {
    const st = SOLAR_TERM_DATES[i];
    const start = m * 100 + d;
    const stStart = st.month * 100 + st.day;
    const stEnd = st.endMonth * 100 + st.endDay;

    let inRange: boolean;
    if (stStart <= stEnd) {
      inRange = start >= stStart && start <= stEnd;
    } else {
      inRange = start >= stStart || start <= stEnd;
    }

    if (inRange) {
      const diffDays = Math.floor((now.getTime() - new Date(now.getFullYear(), st.month - 1, st.day).getTime()) / 86400000);
      const pentad = Math.min(Math.floor(diffDays / 5) + 1, 3) as 1 | 2 | 3;
      return { solarTerm: st.name, month: st.month, pentad };
    }
  }
  return null;
}

export function getRecommendedColors(personalityScores: { taiyang: number; shaoyang: number; yinyangheping: number; shaoyin: number; taiyin: number }): string[] {
  const dimensions = [
    { key: '太阳' as const, score: personalityScores.taiyang },
    { key: '少阳' as const, score: personalityScores.shaoyang },
    { key: '阴阳和平' as const, score: personalityScores.yinyangheping },
    { key: '少阴' as const, score: personalityScores.shaoyin },
    { key: '太阴' as const, score: personalityScores.taiyin },
  ];

  const avg = dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length;
  const highDimensions = dimensions.filter(d => d.score > avg);
  const lowDimensions = dimensions.filter(d => d.score < avg);

  const colorSet = new Set<string>();

  for (const dim of highDimensions) {
    const matches = personalityColorMap.filter(p => p.dimension === dim.key && p.level === '高分');
    for (const m of matches) {
      for (const c of m.healingColors) colorSet.add(c);
    }
  }

  for (const dim of lowDimensions) {
    const matches = personalityColorMap.filter(p => p.dimension === dim.key && p.level === '低分');
    for (const m of matches) {
      for (const c of m.healingColors) colorSet.add(c);
    }
  }

  return Array.from(colorSet);
}

export function getColorHex(colorName: string): string {
  return COLOR_HEX[colorName] || '#000000';
}



// ==================== 增强属性：能量属性映射 ====================
export const ENERGY_PROPERTY: Record<string, { name: string; desc: string }> = {
  '木': { name: '生发生长', desc: '升阳舒展·生长之力·如春日嫩芽破土' },
  '火': { name: '温热炎上', desc: '激情活力·上升之力·如夏日骄阳似火' },
  '土': { name: '孕育承载', desc: '稳重包容·运化之力·如大地滋养万物' },
  '金': { name: '清肃收敛', desc: '刚毅果决·收敛之力·如秋风肃杀落叶' },
  '水': { name: '润下藏精', desc: '沉静深邃·潜藏之力·如冬水归藏地下' },
};

export const AROMA_NOTE: Record<string, { note: string; examples: string }> = {
  '木': { note: '柑橘调', examples: '柠檬、佛手柑、甜橙、葡萄柚' },
  '火': { note: '花香调', examples: '玫瑰、薰衣草、天竺葵、依兰依兰' },
  '土': { note: '草本调', examples: '迷迭香、百里香、罗勒、马郁兰' },
  '金': { note: '木质调', examples: '雪松、檀香、乳香、杜松' },
  '水': { note: '树脂调', examples: '没药、安息香、岩兰草、广藿香' },
};

export const COLOR_PSYCHOLOGY: Record<string, { psyche: string; emotion: string; chakra: string }> = {
  '白色': { psyche: '净化·清明', emotion: '追求纯净、理性清明、全新开始', chakra: '顶轮' },
  '黑色': { psyche: '深度·守护', emotion: '内省沉思、安全感、深度蛰伏', chakra: '根轮' },
  '红色': { psyche: '激情·行动', emotion: '热情奔放、勇气行动、生命力旺盛', chakra: '根轮' },
  '粉色': { psyche: '柔情·疗愈', emotion: '温柔自爱、情感疗愈、接纳自我', chakra: '心轮' },
  '橙色': { psyche: '创造·快乐', emotion: '创意迸发、社交活跃、快乐满足', chakra: '腹轮' },
  '黄色': { psyche: '智慧·自信', emotion: '思维清晰、自信果断、理性思考', chakra: '太阳轮' },
  '绿色': { psyche: '平衡·成长', emotion: '内心平和、和谐成长、自然治愈', chakra: '心轮' },
  '青色': { psyche: '表达·自由', emotion: '自由沟通、真实表达、思维灵活', chakra: '喉轮' },
  '蓝色': { psyche: '宁静·深思', emotion: '深度安宁、直觉敏锐、理性冷静', chakra: '喉轮' },
  '紫色': { psyche: '灵性·冥想', emotion: '灵性超悟、冥想内观、内在觉知', chakra: '眉心轮' },
  '灰色': { psyche: '中性·沉稳', emotion: '情绪沉稳、客观中立、内在调和', chakra: '全脉轮' },
  '褐色': { psyche: '踏实·根植', emotion: '脚踏实地、安全稳定、务实扎根', chakra: '根轮' },
};

export const MERIDIAN_PSYCHOLOGY: Record<string, { organ: string; emotion: string; healing: string }> = {
  '足厥阴肝经': { organ: '肝', emotion: '怒·郁', healing: '疏肝解郁、调和情志' },
  '足少阳胆经': { organ: '胆', emotion: '惊·决', healing: '温壮胆气、安定心神' },
  '手太阳小肠经': { organ: '小肠', emotion: '辨·析', healing: '分清泌浊、安神定志' },
  '手少阴心经': { organ: '心', emotion: '喜·躁', healing: '养心安神、清心除烦' },
  '足太阴脾经': { organ: '脾', emotion: '思·忧', healing: '健脾益气、化湿安神' },
  '足阳明胃经': { organ: '胃', emotion: '纳·受', healing: '和胃降逆、消食安中' },
  '手阳明大肠经': { organ: '大肠', emotion: '排·释', healing: '通腑泄热、排毒解郁' },
  '手太阴肺经': { organ: '肺', emotion: '悲·忧', healing: '宣肺理气、润燥宁神' },
  '足少阴肾经': { organ: '肾', emotion: '恐·惊', healing: '补肾固精、温阳安神' },
  '足太阳膀胱经': { organ: '膀胱', emotion: '存·化', healing: '通阳化气、利水宁心' },
  '手少阳三焦经': { organ: '三焦', emotion: '通·畅', healing: '通调三焦、理气解郁' },
  '手厥阴心包经': { organ: '心包', emotion: '护·卫', healing: '宽胸理气、宁心安神' },
};

// ==================== 精油心理评测模型 ====================
export interface OilPsychResult {
  selectedOils: EssenceOil[];
  wuxingDistribution: Record<string, number>;
  yinYangBalance: { yang: number; yin: number; ratio: string };
  dominantEmotions: string[];
  psychologyProfile: string;
  meridianAnalysis: string;
  colorPsychAnalysis: string;
  healingSuggestions: string[];
  disclaimer: string;
}

export function generateOilPsychResult(selectedOils: EssenceOil[]): OilPsychResult {
  // 五行分布统计
  const wuxingDist: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  selectedOils.forEach(o => { wuxingDist[o.wuxing] = (wuxingDist[o.wuxing] || 0) + 1; });

  // 阴阳平衡
  const totalYang = selectedOils.reduce((s, o) => s + o.yangValue, 0);
  const totalYin = selectedOils.reduce((s, o) => s + o.yinValue, 0);
  const yinMax = totalYang + totalYin;
  const ratio = yinMax > 0 ? `${Math.round(totalYang / yinMax * 100)}:${Math.round(totalYin / yinMax * 100)}` : '50:50';

  // 主导情绪
  const emotions: string[] = [];
  selectedOils.forEach(o => {
    const mp = MERIDIAN_PSYCHOLOGY[o.meridian];
    const cp = COLOR_PSYCHOLOGY[o.upperColor];
    if (mp) emotions.push(mp.emotion);
    if (cp) emotions.push(cp.psyche);
  });
  const emotionCounts: Record<string, number> = {};
  emotions.forEach(e => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; });
  const dominantEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([e]) => e);

  // 心理学画像
  const dominantWuxing = Object.entries(wuxingDist).sort((a, b) => b[1] - a[1])[0];
  const wuxingEnergy = ENERGY_PROPERTY[dominantWuxing[0]];
  const psychologyProfile = dominantWuxing[1] >= selectedOils.length * 0.5
    ? `您当前内在能量高度集中于${dominantWuxing[0]}行（${wuxingEnergy.name}），表明${wuxingEnergy.desc}。这种能量分布提示您正处于需要${dominantWuxing[0] === '木' ? '突破创新' : dominantWuxing[0] === '火' ? '激情表达' : dominantWuxing[0] === '土' ? '稳固根基' : dominantWuxing[0] === '金' ? '整理归划' : '静心蓄力'}的生命阶段。`
    : `您选择的精油五行分布较为均衡（${Object.entries(wuxingDist).filter(([,v]) => v > 0).map(([k,v]) => k + v).join('·')}），表明内在能量流动多元，具有较好的适应力和整合力。`;

  // 经络分析
  const meridianSet = new Set(selectedOils.map(o => o.meridian));
  const meridianAnalysis = `所选精油关联${meridianSet.size}条经络：${Array.from(meridianSet).map(m => {
    const mp = MERIDIAN_PSYCHOLOGY[m];
    return mp ? `${m}（情志: ${mp.emotion}）` : m;
  }).join('、')}。建议重点关注对应脏腑的情志调养。`;

  // 色彩心理分析
  const upperColors = selectedOils.map(o => o.upperColor);
  const lowerColors = selectedOils.map(o => o.lowerColor);
  const colorPsychAnalysis = `上层色彩映射意识层面：${upperColors.map(c => {
    const cp = COLOR_PSYCHOLOGY[c];
    return cp ? `${c}（${cp.psyche}）` : c;
  }).join('·')}，反映您当前的显性心理状态。下层色彩映射潜意识：${lowerColors.map(c => {
    const cp = COLOR_PSYCHOLOGY[c];
    return cp ? `${c}（${cp.psyche}）` : c;
  }).join('·')}，揭示深层情绪需求。`;

  // 疗愈建议
  const suggestions: string[] = [];
  if (totalYang > totalYin) {
    suggestions.push('阳气偏盛，建议增加静心冥想与阴瑜伽，平衡阳动之气');
  } else if (totalYin > totalYang) {
    suggestions.push('阴气偏重，建议增加户外运动与阳光浴，激发阳气生发');
  } else {
    suggestions.push('阴阳平衡良好，建议保持当前生活方式，注重节气顺应');
  }
  
  selectedOils.forEach(o => {
    const mp = MERIDIAN_PSYCHOLOGY[o.meridian];
    if (mp) suggestions.push(`${o.name}：${mp.healing}，适合${AROMA_NOTE[o.wuxing]?.note || '芳香'}疗愈`);
  });

  if (dominantWuxing[0] === '木') suggestions.push('木行主导：建议晨起户外深呼吸、练习伸展运动、饮用柠檬佛手柑茶');
  if (dominantWuxing[0] === '火') suggestions.push('火行主导：建议午间休息、练习冥想、饮用玫瑰花茶安神');
  if (dominantWuxing[0] === '土') suggestions.push('土行主导：建议规律饮食、练习腹部呼吸、饮用迷迭香茶健脾');
  if (dominantWuxing[0] === '金') suggestions.push('金行主导：建议深呼吸练习、登高远望、饮用雪松檀香熏香');
  if (dominantWuxing[0] === '水') suggestions.push('水行主导：建议充足睡眠、泡脚温肾、使用岩兰草安息香熏香');

  return {
    selectedOils,
    wuxingDistribution: wuxingDist,
    yinYangBalance: { yang: totalYang, yin: totalYin, ratio },
    dominantEmotions,
    psychologyProfile,
    meridianAnalysis,
    colorPsychAnalysis,
    healingSuggestions: suggestions.slice(0, 6),
    disclaimer: '本方案仅供参考，实际需结合专业医疗意见。如有严重身心不适，请及时就医。',
  };
}

// ==================== 疗愈方案生成引擎 ====================
export interface HealingPlan {
  oil: EssenceOil;
  method: string;
  duration: string;
  combination: string;
  timing: string;
  precautions: string;
  disclaimer: string;
}

export function generateHealingPlan(oil: EssenceOil): HealingPlan {
  const aroma = AROMA_NOTE[oil.wuxing];
  const energy = ENERGY_PROPERTY[oil.wuxing];
  const upperPsyche = COLOR_PSYCHOLOGY[oil.upperColor];
  const lowerPsyche = COLOR_PSYCHOLOGY[oil.lowerColor];

  const methods: Record<string, string> = {
    '木': '扩香吸入法：将3-5滴精油加入扩香器，在安静环境中深呼吸15-20分钟',
    '火': '穴位按摩法：将2滴精油稀释于载体油，按揉心经/心包经穴位5分钟',
    '土': '腹部温敷法：将4滴精油加入温水，浸湿毛巾敷于腹部10-15分钟',
    '金': '蒸汽吸入法：将3滴精油加入热水中，用毛巾覆盖头部吸入5-10分钟',
    '水': '足浴浸泡法：将5滴精油加入温水中泡脚15-20分钟，温补肾阳',
  };

  const durations: Record<string, string> = {
    '木': '每日1次，晨起7-9点（肝经当令时辰），连续7天为一个疗程',
    '火': '每日1次，午间11-13点（心经当令时辰），连续5天为一个疗程',
    '土': '每日1次，饭后1小时（脾经当令时辰），连续10天为一个疗程',
    '金': '每日1次，清晨3-5点或睡前（肺经当令时辰），连续7天为一个疗程',
    '水': '每日1次，傍晚17-19点（肾经当令时辰），连续14天为一个疗程',
  };

  const combinations: Record<string, string> = {
    '木': '可搭配甜橙+佛手柑增强疏肝效果，或搭配薰衣草+柠檬调和情绪',
    '火': '可搭配玫瑰+依兰增强宁心效果，或搭配檀香+乳香深度安神',
    '土': '可搭配迷迭香+罗勒增强健脾效果，或搭配甜橙+生姜温中散寒',
    '金': '可搭配雪松+杜松增强清肺效果，或搭配乳香+没药收敛固涩',
    '水': '可搭配岩兰草+广藿香增强固肾效果，或搭配没药+安息香温阳纳气',
  };

  return {
    oil,
    method: methods[oil.wuxing] || '扩香法：将3-5滴精油加入扩香器中使用',
    duration: durations[oil.wuxing] || '每日1次，连续7天',
    combination: combinations[oil.wuxing] || '可搭配同五行属性精油增强效果',
    timing: `${oil.meridian}当令时辰使用效果最佳。上层色（${oil.upperColor}）对应${upperPsyche?.psyche || '净化'}意识层面，下层色（${oil.lowerColor}）对应${lowerPsyche?.psyche || '滋养'}潜意识层面。${energy?.name || ''}能量配合${aroma?.note || '芳香'}调气味，形成完整的感官疗愈闭环。`,
    precautions: `孕妇、婴幼儿及严重过敏体质者慎用。避免直接接触皮肤，需载体油稀释后使用。${oil.yangValue > 4 ? '阳气较盛，不宜晚间使用以免影响睡眠。' : ''}${oil.yinValue > 4 ? '阴气较重，不宜晨间使用以免阳气受抑。' : ''}`,
    disclaimer: '本方案仅供参考，实际需结合专业医疗意见。精油疗愈为辅助调理手段，不可替代正规医疗。如有严重身心不适，请及时就医。',
  };
}
