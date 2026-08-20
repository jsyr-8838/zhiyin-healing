import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';
import { planPostSchema, validateOrError } from '@/lib/validators';

// 九种体质对应养生方案（静态匹配，移植自LingSuHealth）
const CONSTITUTION_PLANS: Record<string, {
  name: string;
  focus: string;
  daily: { morning: string; noon: string; evening: string };
  diet: string[];
  taboo: string[];
  exercise: string[];
  wuyin: string;
}> = {
  '平和质': {
    name: '平和质养生方案',
    focus: '阴阳调和，保持平衡',
    daily: {
      morning: '八段锦15分钟 + 呼吸练习',
      noon: '午时小憩15-30分钟养心',
      evening: '五行调和音疗20分钟',
    },
    diet: ['五谷杂粮均衡', '四时蔬菜应季', '适量坚果', '清淡饮食为主'],
    taboo: ['暴饮暴食', '偏食偏嗜', '过度进补'],
    exercise: ['太极拳', '八段锦', '慢跑', '游泳'],
    wuyin: 'gong',
  },
  '气虚质': {
    name: '气虚质补气方案',
    focus: '益气健脾，培补元气',
    daily: {
      morning: '深呼吸练习10分钟 + 散步',
      noon: '午休30分钟恢复精力',
      evening: '宫音健脾15分钟 + 足三里按摩',
    },
    diet: ['黄芪炖鸡', '山药薏米粥', '大枣桂圆', '少食生冷'],
    taboo: ['过度劳累', '大汗淋漓', '空腹运动'],
    exercise: ['缓慢散步', '八段锦', '深呼吸', '避免剧烈运动'],
    wuyin: 'gong',
  },
  '阳虚质': {
    name: '阳虚质温阳方案',
    focus: '温阳散寒，扶助正气',
    daily: {
      morning: '日光浴15分钟 + 晨起姜茶',
      noon: '午休养阳，背部晒太阳',
      evening: '徵音养心15分钟 + 艾灸关元',
    },
    diet: ['羊肉生姜温补', '核桃韭菜', '桂枝汤', '忌寒凉生冷'],
    taboo: ['寒凉食物', '冷水浴', '久坐阴湿地'],
    exercise: ['慢跑', '太极拳', '日光下运动', '避免冬季晨练'],
    wuyin: 'zhi',
  },
  '阴虚质': {
    name: '阴虚质滋阴方案',
    focus: '滋阴降火，养阴润燥',
    daily: {
      morning: '静坐冥想10分钟',
      noon: '午休养阴，闭目养神',
      evening: '羽音固肾15分钟 + 涌泉穴按摩',
    },
    diet: ['银耳百合羹', '枸杞桑葚', '鸭肉甲鱼', '忌辛辣燥热'],
    taboo: ['辛辣刺激', '烧烤油炸', '熬夜伤阴'],
    exercise: ['瑜伽', '散步', '太极', '避免大汗淋漓'],
    wuyin: 'yu',
  },
  '痰湿质': {
    name: '痰湿质化痰方案',
    focus: '健脾化痰，祛湿排浊',
    daily: {
      morning: '快步走30分钟促代谢',
      noon: '饭后慢走助消化',
      evening: '宫音健脾15分钟 + 丰隆穴按摩',
    },
    diet: ['薏米红豆祛湿', '冬瓜荷叶', '陈皮白术', '少食甜腻'],
    taboo: ['甜食油腻', '乳制品过量', '久坐不动'],
    exercise: ['快走', '游泳', '有氧运动', '每日30分钟以上'],
    wuyin: 'gong',
  },
  '湿热质': {
    name: '湿热质清化方案',
    focus: '清热利湿，疏肝泻火',
    daily: {
      morning: '晨起温水 + 深呼吸',
      noon: '清淡饮食，午餐七分饱',
      evening: '角音疏肝15分钟 + 太冲穴按摩',
    },
    diet: ['绿豆薏米清热', '苦瓜莲藕', '菊花决明子', '忌辛辣油腻'],
    taboo: ['辛辣刺激', '饮酒', '肥甘厚味'],
    exercise: ['游泳', '快走', '瑜伽', '避免烈日下运动'],
    wuyin: 'jiao',
  },
  '血瘀质': {
    name: '血瘀质活血方案',
    focus: '活血化瘀，通络行气',
    daily: {
      morning: '晨起旋转关节5分钟 + 梳头',
      noon: '午餐后散步促循环',
      evening: '商音清肺15分钟 + 血海穴按摩',
    },
    diet: ['山楂活血', '玫瑰花茶', '黑木耳', '适量红酒'],
    taboo: ['久坐不动', '寒凉食物', '情绪抑郁'],
    exercise: ['太极拳', '快走', '舞蹈', '全身性有氧运动'],
    wuyin: 'shang',
  },
  '气郁质': {
    name: '气郁质疏肝方案',
    focus: '疏肝解郁，调畅气机',
    daily: {
      morning: '户外散步15分钟 + 深呼吸',
      noon: '午间听舒缓音乐放松',
      evening: '角音疏肝20分钟 + 膻中穴按摩',
    },
    diet: ['玫瑰花茶疏肝', '佛手柑', '萝卜顺气', '少量黄酒'],
    taboo: ['闭门不出', '过度忧虑', '咖啡提神'],
    exercise: ['户外散步', '跑步', '团体运动', '社交活动'],
    wuyin: 'jiao',
  },
  '特禀质': {
    name: '特禀质调护方案',
    focus: '益气固表，避免过敏',
    daily: {
      morning: '室内轻度拉伸10分钟',
      noon: '午休养气，远离过敏原',
      evening: '宫音健脾15分钟 + 足三里按摩',
    },
    diet: ['黄芪防风固表', '山药薏米', '清淡饮食', '记录食物过敏'],
    taboo: ['已知过敏原', '花粉季节户外', '寒凉刺激'],
    exercise: ['室内运动', '瑜伽', '太极', '避免过敏环境运动'],
    wuyin: 'gong',
  },
};

// POST /api/plan - 生成7天健康计划
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateOrError(planPostSchema, body);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { userId, constitution } = validation.data;

    // 确定体质类型
    let constitutionType = constitution || '平和质';

    // 如果没传体质，从数据库查
    if (!constitution) {
      const latestAssessment = await db.findOne<{ primaryType: string }>(
        'SELECT primaryType FROM Assessment WHERE userId = ? ORDER BY date DESC LIMIT 1',
        [userId]
      );
      if (latestAssessment) {
        constitutionType = latestAssessment.primaryType as typeof constitutionType;
      }
    }

    const planTemplate = CONSTITUTION_PLANS[constitutionType] || CONSTITUTION_PLANS['平和质'];

    // 获取最近7天打卡数据，用于动态调整
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceStr = since.toISOString().split('T')[0];

    const recentCheckins = await db.findAll(
      'SELECT * FROM Checkin WHERE userId = ? AND date >= ? ORDER BY date DESC',
      [userId, sinceStr]
    );

    // 生成7天计划
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 6);

    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weeklyPlan = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayStr = weekDays[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      // 根据昨日打卡数据动态调整
      const yesterdayCheckin = recentCheckins.find(
        (c: Record<string, unknown>) => c.date === new Date(d.getTime() - 86400000).toISOString().split('T')[0]
      );

      let adjustments: string[] = [];
      if (yesterdayCheckin) {
        const yc = yesterdayCheckin as Record<string, number>;
        if (yc.sleepScore < 60) adjustments.push('昨日睡眠不足，今早点睡');
        if (yc.moodScore < 60) adjustments.push('情绪偏低，多听角音疏肝');
        if (yc.exerciseScore < 60) adjustments.push('运动不足，增加活动量');
        if (yc.dietScore < 60) adjustments.push('饮食不规律，注意定时定量');
      }

      weeklyPlan.push({
        date: dateStr,
        day: dayStr,
        morning: planTemplate.daily.morning,
        noon: planTemplate.daily.noon,
        evening: planTemplate.daily.evening,
        focus: i === 0 ? planTemplate.focus : undefined,
        adjustments: adjustments.length > 0 ? adjustments : undefined,
      });
    }

    // 保存到数据库
    const planContent = JSON.stringify({
      constitution: constitutionType,
      template: planTemplate,
      weeklyPlan,
      recentAvgScore: recentCheckins.length > 0
        ? Math.round(recentCheckins.reduce((s: number, c: Record<string, number>) => s + c.healthScore, 0) / recentCheckins.length)
        : null,
    });

    // 将之前的计划标记为非活跃
    await db.execute(
      'UPDATE HealthPlan SET isActive = 0 WHERE userId = ? AND isActive = 1',
      [userId]
    );

    const id = generateId();
    const ts = now();
    await db.execute(
      `INSERT INTO HealthPlan (id, userId, startDate, endDate, planType, constitution, content, isActive, checkinCount, completionRate, adjustments, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, '[]', ?, ?)`,
      [id, userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0],
       'weekly', constitutionType, planContent, 1, ts, ts]
    );

    const plan = await db.findOne('SELECT * FROM HealthPlan WHERE id = ?', [id]);

    return NextResponse.json({
      plan,
      constitution: constitutionType,
      template: planTemplate,
      weeklyPlan,
    });
  } catch (error) {
    console.error('Plan API error:', error);
    return NextResponse.json({ error: '生成计划失败' }, { status: 500 });
  }
}

// GET /api/plan?userId=xxx - 获取当前活跃计划
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId.length > 64) {
      return NextResponse.json({ error: '缺少userId或格式错误' }, { status: 400 });
    }

    const plan = await db.findOne<{ content: string; isActive: number; [k: string]: unknown }>(
      'SELECT * FROM HealthPlan WHERE userId = ? AND isActive = 1 ORDER BY createdAt DESC LIMIT 1',
      [userId]
    );

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    const content = JSON.parse(plan.content);
    return NextResponse.json({
      plan: { ...plan, isActive: !!plan.isActive },
      ...content,
    });
  } catch (error) {
    console.error('Plan GET error:', error);
    return NextResponse.json({ error: '获取计划失败' }, { status: 500 });
  }
}
