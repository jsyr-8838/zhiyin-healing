// acupoint-compatibility-data.ts — 针灸配伍诊疗数据 + 操作技法数据
// 数据来源：chinese-acupuncture项目，引用《针灸甲乙经》《针灸大成》等典籍
// 融入知音平台中医通知识库（针灸玄门模块）

// ═══════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════

export interface CompatibilityEntry {
  id: number;
  symptom: string;
  acupoints: string;          // 含穴位code，如 "合谷（LI4）、风池（GB20）"
  acupointCodes: string[];    // 解析出的穴位code列表，如 ["LI4","GB20"]
  needlingOrder: string;
  treatmentCourse: string;
  source: string;
  diseaseCategory: string;
  status: string;
  updateTime: string;
}

export interface TechniqueEntry {
  id: number;
  name: string;
  pinyin: string;
  code: string;
  category: string;          // 针刺技法/艾灸技法/外治疗法/推拿技法/微针疗法/安全规范
  description: string;
  dangerLevel: '普通' | '危险';
  status: string;
  updateTime: string;
}

// ═══════════════════════════════════════
// 30条配伍诊疗数据
// ═══════════════════════════════════════

export const COMPATIBILITY_DATA: CompatibilityEntry[] = [
  { id: 1, symptom: '风寒外感头痛', acupoints: '合谷（LI4）、风池（GB20）、太阳（EX-HN5）、列缺（LU7）', acupointCodes: ['LI4','GB20','EX-HN5','LU7'], needlingOrder: '先针远端合谷、列缺，再针局部风池、太阳', treatmentCourse: '每日1次，3-5天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '头面五官疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 2, symptom: '肝阳上亢头痛', acupoints: '太冲（LR3）、百会（GV20）、风池（GB20）、太阳（EX-HN5）', acupointCodes: ['LR3','GV20','GB20','EX-HN5'], needlingOrder: '先针太冲清肝，再针百会、风池、太阳', treatmentCourse: '每日1次，5-7天为1疗程', source: '《针灸大成》', diseaseCategory: '头面五官疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 3, symptom: '血虚头晕', acupoints: '足三里（ST36）、三阴交（SP6）、百会（GV20）、太阳（EX-HN5）', acupointCodes: ['ST36','SP6','GV20','EX-HN5'], needlingOrder: '先针足三里、三阴交补气血，再针百会、太阳', treatmentCourse: '每日1次，7-10天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '头面五官疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 4, symptom: '风寒感冒', acupoints: '列缺（LU7）、合谷（LI4）、风池（GB20）、大椎（GV14）', acupointCodes: ['LU7','LI4','GB20','GV14'], needlingOrder: '先针列缺、合谷解表，再针风池、大椎', treatmentCourse: '每日1次，2-3天为1疗程', source: '《针灸心法要诀》', diseaseCategory: '外感疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 5, symptom: '风热感冒', acupoints: '曲池（LI11）、合谷（LI4）、外关（TE5）、大椎（GV14）', acupointCodes: ['LI11','LI4','TE5','GV14'], needlingOrder: '先针曲池、合谷清热，再针外关、大椎', treatmentCourse: '每日1次，3天为1疗程', source: '《针灸心法要诀》', diseaseCategory: '外感疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 6, symptom: '咳嗽（风寒型）', acupoints: '肺俞（BL13）、列缺（LU7）、合谷（LI4）、风门（BL12）', acupointCodes: ['BL13','LU7','LI4','BL12'], needlingOrder: '先针肺俞、风门，再针列缺、合谷', treatmentCourse: '每日1次，5-7天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '呼吸系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 7, symptom: '哮喘发作期', acupoints: '肺俞（BL13）、定喘（EX-B1）、天突（RN22）、列缺（LU7）、丰隆（ST40）', acupointCodes: ['BL13','EX-B1','RN22','LU7','ST40'], needlingOrder: '先针天突、定喘平喘，再针肺俞、列缺、丰隆', treatmentCourse: '每日1次，7-10天为1疗程', source: '《针灸大成》', diseaseCategory: '呼吸系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 8, symptom: '失眠（心脾两虚）', acupoints: '神门（HT7）、三阴交（SP6）、内关（PC6）、心俞（BL15）、脾俞（BL20）', acupointCodes: ['HT7','SP6','PC6','BL15','BL20'], needlingOrder: '先针神门、内关，再针三阴交、心俞、脾俞', treatmentCourse: '每日睡前1次，10-14天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '情志疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 9, symptom: '失眠（心肾不交）', acupoints: '神门（HT7）、太溪（KI3）、三阴交（SP6）、心俞（BL15）、肾俞（BL23）', acupointCodes: ['HT7','KI3','SP6','BL15','BL23'], needlingOrder: '先针太溪、肾俞补肾，再针神门、心俞安神', treatmentCourse: '每日睡前1次，10-14天为1疗程', source: '《针灸资生经》', diseaseCategory: '情志疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 10, symptom: '抑郁症', acupoints: '百会（GV20）、印堂（EX-HN3）、太冲（LR3）、神门（HT7）、内关（PC6）', acupointCodes: ['GV20','EX-HN3','LR3','HT7','PC6'], needlingOrder: '先针百会、印堂调神，再针太冲、神门、内关', treatmentCourse: '每日1次，14-21天为1疗程', source: '《针灸大成》', diseaseCategory: '情志疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 11, symptom: '焦虑症', acupoints: '百会（GV20）、印堂（EX-HN3）、神门（HT7）、少府（HT8）、内关（PC6）', acupointCodes: ['GV20','EX-HN3','HT7','HT8','PC6'], needlingOrder: '先针百会、印堂，再针神门、少府、内关', treatmentCourse: '每日1次，10-14天为1疗程', source: '《针灸心法要诀》', diseaseCategory: '情志疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 12, symptom: '急性胃痛（寒邪型）', acupoints: '中脘（RN12）、足三里（ST36）、内关（PC6）、梁门（ST21）', acupointCodes: ['RN12','ST36','PC6','ST21'], needlingOrder: '先针中脘、足三里，再针内关、梁门，可加灸', treatmentCourse: '每日1次，3-5天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '消化系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 13, symptom: '慢性胃炎', acupoints: '中脘（RN12）、足三里（ST36）、内关（PC6）、胃俞（BL21）、脾俞（BL20）', acupointCodes: ['RN12','ST36','PC6','BL21','BL20'], needlingOrder: '先针中脘、足三里，再针内关、胃俞、脾俞', treatmentCourse: '隔日1次，10-14次为1疗程', source: '《针灸资生经》', diseaseCategory: '消化系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 14, symptom: '消化性溃疡', acupoints: '中脘（RN12）、足三里（ST36）、内关（PC6）、脾俞（BL20）、胃俞（BL21）、公孙（SP4）', acupointCodes: ['RN12','ST36','PC6','BL20','BL21','SP4'], needlingOrder: '先针脾俞、胃俞，再针中脘、足三里、内关、公孙', treatmentCourse: '隔日1次，20-30次为1疗程', source: '《针灸大成》', diseaseCategory: '消化系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 15, symptom: '便秘（实热型）', acupoints: '天枢（ST25）、足三里（ST36）、曲池（LI11）、支沟（TE6）', acupointCodes: ['ST25','ST36','LI11','TE6'], needlingOrder: '先针天枢、足三里，再针曲池、支沟', treatmentCourse: '每日1次，5-7天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '消化系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 16, symptom: '腹泻（脾虚型）', acupoints: '天枢（ST25）、足三里（ST36）、脾俞（BL20）、肾俞（BL23）、关元（RN4）', acupointCodes: ['ST25','ST36','BL20','BL23','RN4'], needlingOrder: '先针脾俞、肾俞，再针天枢、足三里、关元', treatmentCourse: '每日1次，7-10天为1疗程', source: '《针灸资生经》', diseaseCategory: '消化系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 17, symptom: '腰痛（寒湿型）', acupoints: '肾俞（BL23）、腰阳关（GV3）、委中（BL40）、命门（GV4）', acupointCodes: ['BL23','GV3','BL40','GV4'], needlingOrder: '先针肾俞、腰阳关，再针委中、命门，加灸', treatmentCourse: '每日1次，7-10天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '筋骨关节疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 18, symptom: '腰肌劳损', acupoints: '肾俞（BL23）、大肠俞（BL25）、委中（BL40）、阿是穴', acupointCodes: ['BL23','BL25','BL40','阿是穴'], needlingOrder: '先针肾俞、大肠俞，再针委中、阿是穴', treatmentCourse: '每日1次，10-14天为1疗程', source: '《针灸大成》', diseaseCategory: '筋骨关节疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 19, symptom: '腰椎间盘突出', acupoints: '肾俞（BL23）、大肠俞（BL25）、委中（BL40）、环跳（GB30）、阳陵泉（GB34）', acupointCodes: ['BL23','BL25','BL40','GB30','GB34'], needlingOrder: '先针腰部俞穴，再针下肢委中、环跳、阳陵泉', treatmentCourse: '隔日1次，15-20次为1疗程', source: '《针灸资生经》', diseaseCategory: '筋骨关节疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 20, symptom: '颈椎病（神经根型）', acupoints: '风池（GB20）、颈夹脊（EX-B2）、大椎（GV14）、后溪（SI3）、曲池（LI11）', acupointCodes: ['GB20','EX-B2','GV14','SI3','LI11'], needlingOrder: '先针风池、颈夹脊，再针大椎、后溪、曲池', treatmentCourse: '每日1次，10-14天为1疗程', source: '《针灸心法要诀》', diseaseCategory: '筋骨关节疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 21, symptom: '肩周炎', acupoints: '肩髃（LI15）、肩前（EX-HN54）、肩髎（TE14）、曲池（LI11）、合谷（LI4）', acupointCodes: ['LI15','EX-HN54','TE14','LI11','LI4'], needlingOrder: '先针肩部三穴，再针曲池、合谷', treatmentCourse: '每日1次，10-14天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '筋骨关节疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 22, symptom: '膝关节骨性关节炎', acupoints: '犊鼻（ST35）、内膝眼（EX-LE4）、阳陵泉（GB34）、血海（SP10）、足三里（ST36）', acupointCodes: ['ST35','EX-LE4','GB34','SP10','ST36'], needlingOrder: '先针犊鼻、内膝眼，再针阳陵泉、血海、足三里', treatmentCourse: '每周3次，10-15次为1疗程', source: '《针灸大成》', diseaseCategory: '筋骨关节疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 23, symptom: '面瘫（周围性）', acupoints: '地仓（ST4）、颊车（ST6）、阳白（GB14）、四白（ST2）、合谷（LI4）、风池（GB20）', acupointCodes: ['ST4','ST6','GB14','ST2','LI4','GB20'], needlingOrder: '先针风池、合谷，再针面部地仓、颊车、阳白、四白', treatmentCourse: '每日1次，10-14天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '头面五官疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 24, symptom: '中风后遗症（上肢瘫）', acupoints: '肩髃（LI15）、曲池（LI11）、外关（TE5）、合谷（LI4）、内关（PC6）', acupointCodes: ['LI15','LI11','TE5','LI4','PC6'], needlingOrder: '先针肩部，再针肘部，最后针腕手部', treatmentCourse: '每日1次，15-20天为1疗程', source: '《针灸心法要诀》', diseaseCategory: '神经系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 25, symptom: '中风后遗症（下肢瘫）', acupoints: '环跳（GB30）、阳陵泉（GB34）、足三里（ST36）、解溪（ST41）、三阴交（SP6）', acupointCodes: ['GB30','GB34','ST36','ST41','SP6'], needlingOrder: '先针环跳，再针阳陵泉、足三里，最后针解溪、三阴交', treatmentCourse: '每日1次，15-20天为1疗程', source: '《针灸心法要诀》', diseaseCategory: '神经系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 26, symptom: '偏瘫（综合调理）', acupoints: '百会（GV20）、人中（GV26）、内关（PC6）、三阴交（SP6）、极泉（HT1）、委中（BL40）', acupointCodes: ['GV20','GV26','PC6','SP6','HT1','BL40'], needlingOrder: '先针百会、人中醒脑，再针内关、三阴交，最后针极泉、委中', treatmentCourse: '每日1次，20-30天为1疗程', source: '《针灸大成》', diseaseCategory: '神经系统疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 27, symptom: '月经不调（气血两虚）', acupoints: '关元（RN4）、三阴交（SP6）、血海（SP10）、足三里（ST36）', acupointCodes: ['RN4','SP6','SP10','ST36'], needlingOrder: '先针关元，再针三阴交、血海、足三里', treatmentCourse: '月经前1周开始，每日1次，5-7次为1疗程', source: '《针灸甲乙经》', diseaseCategory: '妇科疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 28, symptom: '痛经', acupoints: '关元（RN4）、三阴交（SP6）、地机（SP8）、血海（SP10）', acupointCodes: ['RN4','SP6','SP8','SP10'], needlingOrder: '先针关元，再针三阴交、地机、血海，可加灸', treatmentCourse: '月经前3-5天开始，每日1次，3-5次为1疗程', source: '《针灸资生经》', diseaseCategory: '妇科疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 29, symptom: '耳鸣', acupoints: '听宫（SI19）、听会（GB2）、翳风（TE17）、中渚（TE3）、太溪（KI3）', acupointCodes: ['SI19','GB2','TE17','TE3','KI3'], needlingOrder: '先针耳周听宫、听会、翳风，再针中渚、太溪', treatmentCourse: '每日1次，10-14天为1疗程', source: '《针灸甲乙经》', diseaseCategory: '头面五官疾患', status: '已发布', updateTime: '2024-03-20' },
  { id: 30, symptom: '过敏性鼻炎', acupoints: '迎香（LI20）、印堂（EX-HN3）、风池（GB20）、合谷（LI4）、肺俞（BL13）', acupointCodes: ['LI20','EX-HN3','GB20','LI4','BL13'], needlingOrder: '先针迎香、印堂局部，再针风池、合谷、肺俞', treatmentCourse: '每日1次，10-14天为1疗程', source: '《针灸大成》', diseaseCategory: '头面五官疾患', status: '已发布', updateTime: '2024-03-20' },
];

// ═══════════════════════════════════════
// 15条操作与技法数据
// ═══════════════════════════════════════

export const TECHNIQUE_DATA: TechniqueEntry[] = [
  { id: 1, name: '毫针刺法', pinyin: 'Haozhen Cifa', code: 'TC-001', category: '针刺技法', description: '选用0.25-0.35mm直径毫针，根据穴位深浅直刺、斜刺或平刺。进针手法包括指切进针、夹持进针、提捏进针、舒张进针四种。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 2, name: '提插补泻法', pinyin: 'Ticha Buxie Fa', code: 'TC-002', category: '针刺技法', description: '补法：先浅后深，重插轻提，提插幅度小，频率慢；泻法：先深后浅，轻插重提，提插幅度大，频率快。以得气为度。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 3, name: '捻转补泻法', pinyin: 'Nianzhuan Buxie Fa', code: 'TC-003', category: '针刺技法', description: '补法：捻转角度小（<180度），用力轻，频率慢；泻法：捻转角度大（>360度），用力重，频率快。左右手配合操作。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 4, name: '艾灸疗法', pinyin: 'Ajiu Liaofa', code: 'TC-004', category: '艾灸技法', description: '包括温和灸、雀啄灸、回旋灸三种手法。温和灸距皮肤2-3cm，每穴10-15分钟；雀啄灸上下移动如鸟啄食；回旋灸左右移动。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 5, name: '温针灸法', pinyin: 'Wenzhen Jiufa', code: 'TC-005', category: '艾灸技法', description: '在留针过程中，将艾绒捏成枣核大小，套在针柄上点燃，使热力通过针身传入穴位。每穴灸2-3壮，注意防止烫伤。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 6, name: '拔罐疗法', pinyin: 'Baguan Liaofa', code: 'TC-006', category: '外治疗法', description: '包括留罐、走罐、闪罐、刺络拔罐等。留罐5-15分钟；走罐需涂抹润滑剂；闪罐反复吸拔至皮肤潮红；刺络拔罐先点刺出血再拔罐。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 7, name: '推拿手法', pinyin: 'Tuina Shoufa', code: 'TC-007', category: '推拿技法', description: '基本手法包括：推法、拿法、按法、摩法、揉法、滚法、搓法、抖法。要求持久、有力、均匀、柔和，达到深透效果。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 8, name: '耳针疗法', pinyin: 'Erzhen Liaofa', code: 'TC-008', category: '微针疗法', description: '选用0.5寸短毫针或揿针，刺入耳廓相应穴位，留针20-30分钟。常用穴位：神门、交感、皮质下、内分泌等。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 9, name: '头针疗法', pinyin: 'Touzhen Liaofa', code: 'TC-009', category: '微针疗法', description: '沿头皮特定刺激区快速进针，达帽状腱膜下层，快速捻转200次/分，持续2-3分钟。主治脑血管疾病、疼痛等。', dangerLevel: '危险', status: '已发布', updateTime: '2024-03-20' },
  { id: 10, name: '电针疗法', pinyin: 'Dianzhen Liaofa', code: 'TC-010', category: '针刺技法', description: '在针刺得气后，连接电针仪，选用疏波、密波或疏密波。强度以患者耐受为度，每次20-30分钟。适用于疼痛、瘫痪等。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 11, name: '穴位贴敷', pinyin: 'Xuewei Tiefu', code: 'TC-011', category: '外治疗法', description: '将药物制成膏剂或糊剂，贴敷于特定穴位。常用三伏贴（冬病夏治）、三九贴（夏病冬治）。贴敷时间2-6小时，注意皮肤反应。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 12, name: '刮痧疗法', pinyin: 'Guasha Liaofa', code: 'TC-012', category: '外治疗法', description: '用刮痧板蘸润滑剂，在体表特定部位反复刮动，至皮肤出现红色或紫红色痧点。方向一般由上向下、由内向外。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 13, name: '得气与行针', pinyin: 'Deqi yu Xingzhen', code: 'TC-013', category: '针刺技法', description: '得气表现为酸、麻、胀、重感，或沿经络传导。行针手法包括提插法、捻转法、震颤法、飞法、弹法等，以维持和加强针感。', dangerLevel: '普通', status: '已发布', updateTime: '2024-03-20' },
  { id: 14, name: '针刺异常情况处理', pinyin: 'Zhenci Yichang Qingkuang Chuli', code: 'TC-014', category: '安全规范', description: '晕针：立即起针，平卧保暖，饮温水；滞针：放松肌肉，反向捻转；弯针：顺弯曲方向缓慢退出；断针：固定体位，手术取出。', dangerLevel: '危险', status: '已发布', updateTime: '2024-03-20' },
  { id: 15, name: '针刺禁忌与注意事项', pinyin: 'Zhenci Jinji yu Zhuyi Shixiang', code: 'TC-015', category: '安全规范', description: '禁忌：过饥过饱、醉酒、极度疲劳、孕妇腰骶腹部、皮肤感染处。注意：重要脏器部位浅刺、血管丰富处避开血管、小儿囟门未闭禁刺头部。', dangerLevel: '危险', status: '已发布', updateTime: '2024-03-20' },
];

// ═══════════════════════════════════════
// 查询函数
// ═══════════════════════════════════════

// 按病症分类分组
export function getCompatibilityByCategory(): Record<string, CompatibilityEntry[]> {
  return COMPATIBILITY_DATA.reduce((acc, item) => {
    if (!acc[item.diseaseCategory]) acc[item.diseaseCategory] = [];
    acc[item.diseaseCategory].push(item);
    return acc;
  }, {} as Record<string, CompatibilityEntry[]>);
}

// 按穴位code反查配伍方案
export function getCompatibilityByAcupointCode(code: string): CompatibilityEntry[] {
  return COMPATIBILITY_DATA.filter(item => item.acupointCodes.includes(code));
}

// 按技法分类分组
export function getTechniquesByCategory(): Record<string, TechniqueEntry[]> {
  return TECHNIQUE_DATA.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TechniqueEntry[]>);
}
