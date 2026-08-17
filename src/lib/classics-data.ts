// 玄览数据（山医命相卜养 · 六大类52部典籍）
// 从 divination-engine.ts 独立拆出，仅用于 /classics 页面

export interface ClassicBook {
  id: string
  name: string
  description: string
  dynasty: string        // 朝代
  author: string         // 作者
  volumes: string        // 卷/篇/章
  category: string       // 分类
  summary: string        // 一句话概要（给AI解读上下文用）
}

interface ClassicsCategory {
  id: string
  name: string
  label: string
  icon: string
  books: ClassicBook[]
}

export const CLASSICS_CATEGORIES: ClassicsCategory[] = [
  {
    id: 'mountain', name: '山', label: '仙学', icon: '🏔️',
    books: [
      { id: 'daodejing', name: '道德经', description: '道法自然，众妙之门', dynasty: '春秋', author: '李耳（老子）', volumes: '上下两篇八十一章', category: '山', summary: '道家根本经典，以"道"为核心，论天地万物之始、治国修身之法。全文约五千言，分道经三十七章与德经四十四章。道法自然、无为而治、上善若水等思想影响中华文化两千余年，被誉为万经之王。' },
      { id: 'taishang', name: '太上老君说常清静经', description: '道家修心法门，清静无为之道', dynasty: '唐', author: '佚名（托名太上老君）', volumes: '一卷', category: '山', summary: '道教修心炼性之根本经典，以"清静"二字为宗，阐述人心本清本静，因欲而动，教人澄心遣欲、返本归元。全文仅三百余字，言简意深，为道家日诵功课之首。' },
      { id: 'yinfu', name: '黄帝阴符经', description: '观天之道，执天之行', dynasty: '战国（托名黄帝）', author: '佚名', volumes: '三篇（上中下）', category: '山', summary: '黄老道家核心经典，上篇神仙抱一之道，中篇富国安民之法，下篇强兵战胜之术。全文仅三百余字，以天道运行规律驭人事，被道家视为内丹修炼与治国用兵的总纲。' },
      { id: 'baopuzi', name: '抱朴子·内篇', description: '葛洪炼丹修仙要旨', dynasty: '东晋', author: '葛洪', volumes: '二十卷', category: '山', summary: '道教丹鼎派要典，专论金丹、仙药、养生、房中、符箓诸术。书中所载炼丹之法，是中国古代化学最重要的文献来源，同时为道教神仙学说立下了根基。' },
      { id: 'cantongqi', name: '周易参同契', description: '万古丹经王，丹道祖书', dynasty: '东汉', author: '魏伯阳', volumes: '三卷', category: '山', summary: '被誉为"万古丹经王"，是现存最早的炼丹术专著。以周易卦象、黄老之道、炉火之术三者参同，故称参同契。以内丹修炼为主线，兼论外丹，对后世丹道影响至深。' },
      { id: 'huangting', name: '黄庭经', description: '内景修炼，五脏神明', dynasty: '晋', author: '佚名（传魏华存）', volumes: '外景经一卷·内景经一卷', category: '山', summary: '道教上清派核心经典，以五脏六腑各有神明为中心，阐述内景存思修炼之法。内景经详论脑中及五脏神祇名号、服食五方之气法，是内丹学和中医藏象学说的重要源头。' },
      { id: 'wuzhen', name: '悟真篇', description: '张紫阳丹法精要', dynasty: '北宋', author: '张伯端（紫阳真人）', volumes: '三卷', category: '山', summary: '与《参同契》并称丹经双璧，内丹南宗开山之作。以诗词形式阐述金丹大道，强调先命后性、性命双修。全书七言律诗十六首、绝句六十四首、五言一首、西江月十二首，体系完密。' },
    ],
  },
  {
    id: 'medicine', name: '医', label: '医典', icon: '⚕️',
    books: [
      { id: 'suwen', name: '黄帝内经·素问', description: '中医理论奠基之作', dynasty: '战国至西汉', author: '佚名（托名黄帝）', volumes: '八十一篇', category: '医', summary: '中医四大经典之首，以黄帝与岐伯等人对话形式写就。分论阴阳五行、脏腑经络、病因病机、诊法治则、养生防病，为中医学立下理论根基，被尊为"医之始祖"。' },
      { id: 'lingshu', name: '黄帝内经·灵枢', description: '经络针灸核心经典', dynasty: '战国至西汉', author: '佚名（托名黄帝）', volumes: '八十一篇', category: '医', summary: '与《素问》合为《黄帝内经》，偏重经络针灸理论与实践。详述十二经脉、奇经八脉的走向与腧穴，针刺手法与补泻原则，是针灸学的根本经典，又称《针经》。' },
      { id: 'nanjing', name: '难经', description: '八十一难，阐释内经奥义', dynasty: '秦汉', author: '佚名（传秦越人/扁鹊）', volumes: '八十一难', category: '医', summary: '以问答形式阐释《内经》精义八十一条，对脉学、经络、脏腑理论有重大发挥。首创"独取寸口"脉法，补充命门学说，在中医脉学和针灸学方面贡献卓著。' },
      { id: 'shennong', name: '神农本草经', description: '中药学开山经典', dynasty: '汉', author: '佚名（托名神农）', volumes: '三卷（上中下三品）', category: '医', summary: '中国最早的中药学专著，收药365种，按上中下三品分类。首创四气五味、毒性等级、配伍七情等药学理论，记载各药之功效主治，为后世本草学奠定了基本框架。' },
      { id: 'shanghan', name: '伤寒论', description: '张仲景六经辨证', dynasty: '东汉', author: '张仲景', volumes: '十卷', category: '医', summary: '中医临床医学奠基之作，创立六经辨证体系（太阳、阳明、少阳、太阴、少阴、厥阴），论治外感热病。载方113首，方药严谨、法度分明，被后世尊为"方书之祖"。' },
      { id: 'jingui', name: '金匮要略', description: '杂病论治概要', dynasty: '东汉', author: '张仲景', volumes: '三卷二十五篇', category: '医', summary: '与《伤寒论》原为一书（伤寒杂病论），此为杂病部分。论治内科杂病及妇人妊娠产后诸疾，载方262首，首创脏躁、水肿、胸痹等病证辨治标准，临证实用极强。' },
      { id: 'jiayi', name: '针灸甲乙经', description: '皇甫谧集针灸大成', dynasty: '西晋', author: '皇甫谧', volumes: '十二卷128篇', category: '医', summary: '中国现存最早的针灸学专著，荟萃《素问》《灵枢》《明堂孔穴针灸治要》三书精华。厘定穴位349个（单穴49、双穴300），明确各穴定位、刺灸法与主治，为针灸学确立了标准。' },
      { id: 'wenbing', name: '温病条辨', description: '温病学派经典', dynasty: '清', author: '吴鞠通', volumes: '六卷', category: '医', summary: '温病学派要典，创立三焦辨证体系（上焦心肺、中焦脾胃、下焦肝肾），分论温病的发生发展规律与治法方药。弥补了伤寒论治温热病的不足，影响至今。' },
    ],
  },
  {
    id: 'fate', name: '命', label: '命理', icon: '🔮',
    books: [
      { id: 'sanhui', name: '三命通会', description: '八字命理百科全书', dynasty: '明', author: '万民英', volumes: '十二卷', category: '命', summary: '八字命理史上最完备的著作，收罗宏富，考证详实。从天干地支基础到格局用神、神煞纳音、大运流年，几乎涵盖八字命理全部内容，是命理研究者的必读典籍。' },
      { id: 'ditiansui', name: '滴天髓', description: '命理最高指导', dynasty: '宋（传京图）', author: '京图/刘伯温注/任铁樵疏', volumes: '一卷', category: '命', summary: '命理学最高理论指导，以阴阳五行为纲，通篇以理胜象，直指命理核心。提出"欲识三元万法宗，先观帝载与行动"，强调五行生克制化之理，被后世尊为命理圣经。' },
      { id: 'ziping', name: '子平真诠', description: '格局派命理经典', dynasty: '清', author: '沈孝瞻', volumes: '一卷', category: '命', summary: '格局派命理的代表作，详论八字格局的判定与成败，如正官格、偏官格、印绶格、食神格等。论理精当，条理分明，为学习格局论命的首要入门书。' },
      { id: 'qiongyao', name: '穷通宝鉴', description: '调候用神', dynasty: '清', author: '佚名（余春台整理）', volumes: '三卷', category: '命', summary: '专论调候用神的命理名著，按日主五行配十个月令，逐月论述所需调候之五行。是命理实践中"调候为急"原则的核心依据，补充了格局用神之外的判断维度。' },
      { id: 'yuanhai', name: '渊海子平', description: '八字命理奠基之作', dynasty: '宋', author: '徐子平（传）/徐升编', volumes: '五卷', category: '命', summary: '八字命理学的开山之作，相传为徐子平所创四柱推命法的完整记录。确立了以日干为中心、四柱八字为框架的命理体系，其格局、用神、神煞等理论影响深远。' },
      { id: 'shenfeng', name: '神峰通考', description: '病药说命理', dynasty: '明', author: '张神峰', volumes: '六卷', category: '命', summary: '提出"有病方为贵，无伤不是奇"的著名论断，以病药说解释格局成败。认为八字贵在有病有药，有制有化，方为好命。对格局法有独到发挥，辟谬正俗。' },
      { id: 'liren', name: '李虚中命书', description: '古法禄命论', dynasty: '唐', author: '李虚中', volumes: '三卷', category: '命', summary: '中国禄命学的早期经典，以年柱为主论命，兼参月日时胎，用纳音五行推人休咎。是八字命理的前身，韩愈为之作墓志铭称其"百不失一二"，可见其术之精。' },
    ],
  },
  {
    id: 'appearance', name: '相', label: '相术', icon: '👁️',
    books: [
      { id: 'mayi', name: '麻衣神相', description: '面相学开山之作', dynasty: '宋', author: '麻衣道者（传）', volumes: '五卷', category: '相', summary: '面相学开山经典，相传为麻衣道者所著，陈抟老祖注解。详论面部五官、十二宫位、气色纹痕的相理判断，首开面相一脉理路，后世相书多宗其说。' },
      { id: 'liuzhuang', name: '柳庄相法', description: '袁柳庄面相精要', dynasty: '明', author: '袁珙（号柳庄居士）', volumes: '三卷', category: '相', summary: '与《麻衣神相》并称相学双璧，袁珙相术精绝，曾为朱棣相面预言其将登大宝。此法重视气色与形骨并参，论断精切，对五官气色、骨格神态的判断尤为精到。' },
      { id: 'shenxiang', name: '神相全编', description: '相学集成巨著', dynasty: '明', author: '袁忠彻（编）', volumes: '十三卷', category: '相', summary: '相学汇辑巨著，广采历代相书精华，涵盖面相、手相、骨相、体相、气色等全部内容。体例完备，引证详实，是学习传统相术最称全面的参考书。' },
      { id: 'bingjian', name: '冰鉴', description: '曾国藩识人用人之术', dynasty: '清', author: '曾国藩', volumes: '七章', category: '相', summary: '曾国藩相人识人经验之总结，虽非传统相书体例，却以独到的观人术闻名。从神骨、刚柔、容貌、情态、须眉、声音、气色七个维度品鉴人才，为近代识人学经典。' },
      { id: 'gujin', name: '古今面相手相', description: '面相手相结合', dynasty: '古今综合', author: '民间汇编', volumes: '合集', category: '相', summary: '综合历代面相手相学的实用集成，将面相手相结合参看，以面相论大格、手相论细节，互补印证。收录民间实用断诀与口诀，是相术实践的便利参考。' },
      { id: 'dili', name: '地理五诀', description: '风水基础', dynasty: '清', author: '赵玉材', volumes: '八卷', category: '相', summary: '风水学入门经典，以龙、穴、砂、水、向五诀为纲，条分缕析寻龙点穴之法。文字浅显、图例丰富，是初学风水者最常用的入门书，在民间影响极大。' },
    ],
  },
  {
    id: 'divination', name: '卜', label: '卜筮', icon: '🐢',
    books: [
      { id: 'zhouyi', name: '周易', description: '群经之首，卜筮之源', dynasty: '西周', author: '佚名（传伏羲画卦/文王演卦/孔子作传）', volumes: '六十四卦', category: '卜', summary: '中华文明的总源头，群经之首。以六十四卦、三百八十四爻的符号系统推演天地变化之理，既为占卜之书，更为哲学之源。阴阳变易思想贯穿始终，影响中华文明数千年。' },
      { id: 'meihua', name: '梅花易数', description: '邵康节象数占法', dynasty: '宋', author: '邵雍（康节先生）', volumes: '五卷', category: '卜', summary: '以数起卦的占卜方法，可由时间、数字、方位、声音、颜色等任一起卦，灵活快捷。以体用生克为核心断卦法，兼参卦气旺衰、互变之象。因邵雍观梅知雀争而折枝之传说得名。' },
      { id: 'zengbu', name: '增删卜易', description: '六爻占卜经典', dynasty: '清', author: '野鹤老人', volumes: '八卷', category: '卜', summary: '六爻占卜的实用经典，以大量实测案例为据，增删古法中不验之诀。对用神选取、月建日辰、动变冲合论述精到，是学习六爻占卜最可靠的入门与进阶书。' },
      { id: 'huozhu', name: '火珠林', description: '六爻纳甲法', dynasty: '唐', author: '佚名（传麻衣道者）', volumes: '一卷', category: '卜', summary: '六爻纳甲法的早期经典，将天干地支纳于六爻之上，配以六亲、世应、动变等，立下六爻占卜的基本格局。后世六爻占法多由此出。' },
      { id: 'qimen', name: '奇门遁甲', description: '帝王之术，排兵布阵', dynasty: '汉唐以降', author: '佚名（传黄帝/风后/张良/诸葛亮）', volumes: '多种版本', category: '卜', summary: '与太乙、六壬合称三式，被誉为"帝王之术"和"最高预测学"。以九宫八卦为框架，天盘地盘人盘神盘四层叠加，通过时空模型推断吉凶，古代用于军事决策。' },
      { id: 'liuren', name: '大六壬', description: '三式之首', dynasty: '汉唐以降', author: '佚名', volumes: '多种版本', category: '卜', summary: '三式之一，被术数家推为三式之首。以日辰天将为纲，四课三传为核心，配以十二天将、十二贵神，断事细密。善断人事吉凶，所获信息量大、推断颇为精到。' },
      { id: 'taiyi', name: '太乙神数', description: '三式之一，推国运', dynasty: '汉唐以降', author: '佚名', volumes: '多种版本', category: '卜', summary: '三式之一，专推天时国运、大范围周期变化。以积年数推太乙行宫，配合文昌、始击、客目、主目诸星推断天下大势。古代多用于预测国运、灾异、战争胜败。' },
      { id: 'tieguan', name: '铁关刀', description: '择日通书', dynasty: '清', author: '佚名', volumes: '合集', category: '卜', summary: '民间择日学的实用典籍，收录婚嫁、迁居、开市、安葬等诸事的吉日选择法。以神煞、干支、五行生克为依据，为日常行事提供趋吉避凶的时间参考。' },
      { id: 'xieji', name: '协纪辨方书', description: '钦定择吉大典', dynasty: '清', author: '乾隆钦定（允禄等编纂）', volumes: '三十六卷', category: '卜', summary: '清代乾隆年间钦定编纂的择吉大典，集历代择吉理论之大成。梳理神煞体系，考证源流，辨析真伪，为择吉学最权威的官方文献，至今仍被历书编纂者奉为标准。' },
    ],
  },
  {
    id: 'wellness', name: '养', label: '养生', icon: '🌿',
    books: [
      { id: 'yingyangshi', name: '中国营养师培训教材', description: '系统营养学培训教材，512章超80万字', dynasty: '现代', author: '中国营养学会', volumes: '512章', category: '养', summary: '中国营养学会编写的系统营养学培训教材，涵盖基础营养、食物营养、公共营养、临床营养等全部领域。512章详述各类营养素的生理功能、食物来源、推荐摄入量，以及不同人群的营养需求与膳食指导，是营养学从业者的权威参考。' },
      { id: 'zhongbingzhiwang', name: '众病之王：癌症传', description: '癌症的传记，一部人类抗癌史', dynasty: '现代', author: '悉达多·穆克吉', volumes: '52章', category: '养', summary: '普利策奖获奖作品，以传记形式讲述癌症这一"众病之王"的前世今生。从古埃及到现代靶向治疗，横跨数千年，融合医学史、科学探索与人文关怀，是一部兼具深度与温度的医学非虚构经典。' },
      { id: 'danguimin', name: '单桂敏灸除百病', description: '单桂敏灸法养生实战指南', dynasty: '现代', author: '单桂敏', volumes: '74章', category: '养', summary: '知名艾灸专家单桂敏多年临床经验总结，详解艾灸养生原理、常用穴位定位与灸法操作。涵盖常见病症的艾灸调理方案，图文并茂，实用性极强，是中医艾灸入门和家庭保健的优秀参考。' },
      { id: 'chidezhenxiang1', name: '吃的真相', description: '食品科学家揭秘饮食误区', dynasty: '现代', author: '云无心', volumes: '79章', category: '养', summary: '食品工程博士云无心以科学视角审视日常饮食，揭示食品添加剂、有机食品、保健品等热点话题背后的真相。用严谨的数据和实验破除饮食谣言，帮助读者建立科学理性的饮食观念。' },
      { id: 'chidezhenxiang2', name: '吃的真相2', description: '续篇，更多食品安全科学解读', dynasty: '现代', author: '云无心', volumes: '70章', category: '养', summary: '《吃的真相》续篇，继续以食品科学视角解读日常饮食中的科学与误区。涵盖更多食品安全案例、营养争议话题和实用烹饪建议，延续理性科普风格。' },
      { id: 'chidezhenxiang3', name: '吃的真相3：带你认清毒食', description: '食品安全深度调查，识别问题食品', dynasty: '现代', author: '果壳', volumes: '102章', category: '养', summary: '果壳网出品，聚焦食品安全领域，系统梳理常见"毒食"谣言与真相。从农药残留、重金属污染到非法添加剂，用科学数据说话，帮助读者在信息洪流中辨别真伪，吃得放心。' },
      { id: 'qiutujianshen', name: '囚徒健身', description: '徒手力量训练圣经', dynasty: '现代', author: '保罗·威德', volumes: '36章', category: '养', summary: '作者以在美国监狱中十余年训练经验为基础，创建了完整的徒手力量训练体系。六艺十式，从零基础到精英级别，不依赖任何器械，用自身体重完成全身力量构建，是徒手健身领域的经典之作。' },
      { id: 'huijia_chifan', name: '回家吃饭的智慧', description: '家庭日常饮食养生指南', dynasty: '现代', author: '牟珊珊', volumes: '28章', category: '养', summary: '从家庭厨房出发，探讨日常饮食的养生智慧。涵盖食材搭配、四季饮食调理、常见小病的食疗方法等实用内容，倡导回归家庭餐桌、用心烹饪的健康生活理念。' },
      { id: 'bachulaidebing', name: '把吃出来的病吃回去', description: '食疗养生，以食代药', dynasty: '现代', author: '张悟本', volumes: '19章', category: '养', summary: '以"药食同源"为核心理念，探讨通过饮食调理改善常见慢性病的方法。书中提出多种食材的食疗功效与搭配方案，倡导通过日常饮食实现健康管理。' },
      { id: 'wendujueding', name: '温度决定生老病死', description: '体温与健康关系的深度探讨', dynasty: '现代', author: '马悦凌', volumes: '18章', category: '养', summary: '从中医阳气理论出发，探讨体温与人体健康的密切关系。主张寒凉是百病之源，通过保暖、温补、祛寒等方法提升基础体温，增强自愈能力。融汇传统养生与现代观察的独特视角。' },
      { id: 'lvseyangsheng', name: '绿色养生健康读本', description: '现代绿色健康生活方式指南', dynasty: '现代', author: '冯理达', volumes: '66章', category: '养', summary: '著名免疫学家冯理达著，系统阐述绿色养生理念。涵盖环境与健康、心理调适、运动养生、饮食营养、疾病预防等全方位健康知识，倡导人与自然和谐共生的健康生活方式。' },
      { id: 'feipang_shipu', name: '肥胖患者营养康复食谱', description: '医学营养减重方案', dynasty: '现代', author: '于康', volumes: '20章', category: '养', summary: '北京协和医院营养科专家于康著，基于临床营养学原理，为肥胖患者提供科学的减重饮食方案。涵盖热量计算、食物交换、运动配合、心理调适等内容，是医学减重的实用参考。' },
      { id: 'qingduanshi', name: '轻断食', description: '5:2间歇式断食瘦身革命', dynasty: '现代', author: '麦克尔·莫斯利', volumes: '28章', category: '养', summary: 'BBC科学记者麦克尔·莫斯利提出的5:2轻断食法，一周5天正常饮食、2天限制热量。基于间歇式断食的科学研究，证实其在减重、改善代谢、延缓衰老等方面的多重益处，风靡全球。' },
      { id: 'jieyan', name: '这本书能让你戒烟', description: '亚伦·卡尔轻松戒烟法', dynasty: '现代', author: '亚伦·卡尔', volumes: '35章', category: '养', summary: '亚伦·卡尔独创的"轻松戒烟法"，不依赖意志力和替代品，通过改变吸烟者对尼古丁依赖的认知来实现戒烟。全球数百万吸烟者因此书成功戒烟，被公认为最有效的戒烟方法之一。' },
      { id: 'huo20nian', name: '这样做，至少多活20年', description: '抗衰老医学实用指南', dynasty: '现代', author: '迈克尔·罗伊森', volumes: '96章', category: '养', summary: '美国抗衰老医学专家迈克尔·罗伊森著，从运动、饮食、睡眠、压力管理等多维度提供延缓衰老的实用方案。基于最新医学研究，给出可量化的健康行为建议，帮助读者延长健康寿命。' },
      { id: 'huangdi_jiayong', name: '黄帝内经家用说明书', description: '曲黎敏解读内经养生智慧', dynasty: '现代', author: '曲黎敏', volumes: '95章', category: '养', summary: '北京中医药大学曲黎敏教授以通俗语言解读《黄帝内经》中的养生智慧，将古典医学理论转化为现代家庭可用的健康指导。涵盖四季养生、情志调摄、饮食起居、经络保健等实用内容。' },
    ],
  },
]
