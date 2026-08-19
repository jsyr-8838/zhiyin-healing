/**
 * 12季型色彩数据系统
 * 适配 zhi-yin 五行色彩诊断
 */

export interface SeasonColor {
  name: string;           // 英文名
  nameCN: string;         // 中文名
  extremeColor: string;   // 极端测试色(阶段1初筛)
  dailyColor: string;     // 日常色(阶段2精筛)
  palette: string[];      // 推荐色板(6色)
  avoid: string[];        // 避雷色(3色)
  description: string;    // 季型特征描述
}

export const SEASONS: Record<string, SeasonColor> = {
  brightSpring: {
    name: 'Bright Spring',
    nameCN: '净春',
    extremeColor: '#FF3A3A',
    dailyColor: '#00F0F9',
    palette: ['#FF3A3A', '#00F0F9', '#FF8C00', '#FFD700', '#FF1493', '#00FF7F'],
    avoid: ['#5C5C5C', '#8B4513', '#4A4A4A'],
    description: '净春型人肤色明亮通透，适合高饱和度、高明度的鲜明色彩。净春型是最具活力的季型，色彩选择大胆而充满生命力。',
  },
  warmSpring: {
    name: 'Warm Spring',
    nameCN: '暖春',
    extremeColor: '#FF5533',
    dailyColor: '#F0B266',
    palette: ['#FF5533', '#F0B266', '#E67E22', '#FFD700', '#D35400', '#F39C12'],
    avoid: ['#6C7B95', '#8899AA', '#536B78'],
    description: '暖春型人肤色温暖偏黄，适合暖色调的明亮色彩。暖春型散发着春天的温暖与活力，金色、橙色系是最佳选择。',
  },
  lightSpring: {
    name: 'Light Spring',
    nameCN: '浅春',
    extremeColor: '#FF99CC',
    dailyColor: '#F7EE77',
    palette: ['#FF99CC', '#F7EE77', '#FFB6C1', '#FFDAB9', '#DDA0DD', '#F0E68C'],
    avoid: ['#2C3E50', '#1A1A2E', '#34495E'],
    description: '浅春型人肤色浅淡柔和，适合轻盈明快的色彩。浅春型如春日花瓣般清新脱俗，低饱和高明度的色彩最为契合。',
  },
  lightSummer: {
    name: 'Light Summer',
    nameCN: '浅夏',
    extremeColor: '#AAD4F2',
    dailyColor: '#F2C2CC',
    palette: ['#AAD4F2', '#F2C2CC', '#87CEEB', '#DDA0DD', '#B0E0E6', '#FFB6C1'],
    avoid: ['#2D1B0E', '#4A0E0E', '#1B2A1B'],
    description: '浅夏型人肤色清透偏冷，适合柔和淡雅的冷色调。浅夏型如夏日清晨般清新，浅蓝、薰衣草紫是最完美的选择。',
  },
  coolSummer: {
    name: 'Cool Summer',
    nameCN: '冷夏',
    extremeColor: '#0088DD',
    dailyColor: '#E6B2CC',
    palette: ['#0088DD', '#E6B2CC', '#4169E1', '#6A5ACD', '#20B2AA', '#4682B4'],
    avoid: ['#CC7722', '#8B6914', '#B8860B'],
    description: '冷夏型人肤色偏冷偏粉，适合冷色调的中等明度色彩。冷夏型优雅而沉静，蓝色系和薰衣草色系是衣橱首选。',
  },
  softSummer: {
    name: 'Soft Summer',
    nameCN: '柔夏',
    extremeColor: '#8888CC',
    dailyColor: '#BB88AA',
    palette: ['#8888CC', '#BB88AA', '#9370DB', '#778899', '#BC8F8F', '#A0A0C0'],
    avoid: ['#FF4500', '#FF0000', '#CC0000'],
    description: '柔夏型人肤色柔和灰调，适合低饱和度的冷灰色系。柔夏型气质温柔内敛，灰蓝、灰紫是最具魅力的色彩。',
  },
  softAutumn: {
    name: 'Soft Autumn',
    nameCN: '柔秋',
    extremeColor: '#EE8877',
    dailyColor: '#AA8866',
    palette: ['#EE8877', '#AA8866', '#D2B48C', '#8FBC8F', '#BC8F8F', '#CD853F'],
    avoid: ['#00FFFF', '#00BFFF', '#4169E1'],
    description: '柔秋型人肤色柔和偏暖，适合大地色系的低饱和色彩。柔秋型如秋日落叶般温暖，驼色、苔绿是最经典的选择。',
  },
  warmAutumn: {
    name: 'Warm Autumn',
    nameCN: '暖秋',
    extremeColor: '#FFAA00',
    dailyColor: '#E2AA7F',
    palette: ['#FFAA00', '#E2AA7F', '#D2691E', '#CD853F', '#B8860B', '#A0522D'],
    avoid: ['#7B68EE', '#6A5ACD', '#483D8B'],
    description: '暖秋型人肤色温暖偏黄，适合浓郁的暖色调色彩。暖秋型是最具丰收感的季型，琥珀色、赤陶色是标志色彩。',
  },
  deepAutumn: {
    name: 'Deep Autumn',
    nameCN: '深秋',
    extremeColor: '#CC5555',
    dailyColor: '#88553F',
    palette: ['#CC5555', '#88553F', '#8B4513', '#2F4F4F', '#556B2F', '#8B0000'],
    avoid: ['#FFB6C1', '#FFF0F5', '#FFE4E1'],
    description: '深秋型人肤色深沉浓郁，适合深色调的暖色系色彩。深秋型如深秋枫叶般浓烈，深红、墨绿是最具气场的色彩。',
  },
  deepWinter: {
    name: 'Deep Winter',
    nameCN: '深冬',
    extremeColor: '#FF0000',
    dailyColor: '#1064EC',
    palette: ['#FF0000', '#1064EC', '#000080', '#8B008B', '#006400', '#191970'],
    avoid: ['#FFDAB9', '#FFE4B5', '#FAEBD7'],
    description: '深冬型人肤色偏冷偏深，适合高对比度的深色系色彩。深冬型气场强大，纯白+正红+深蓝是永恒经典。',
  },
  coolWinter: {
    name: 'Cool Winter',
    nameCN: '冷冬',
    extremeColor: '#0000FF',
    dailyColor: '#EE33A3',
    palette: ['#0000FF', '#EE33A3', '#4169E1', '#C71585', '#00CED1', '#9932CC'],
    avoid: ['#CC7722', '#B8860B', '#DAA520'],
    description: '冷冬型人肤色冷白偏蓝，适合冷色调的高饱和色彩。冷冬型冷艳高贵，冰蓝、品红是最具辨识度的色彩。',
  },
  brightWinter: {
    name: 'Bright Winter',
    nameCN: '净冬',
    extremeColor: '#00FFFF',
    dailyColor: '#FF3399',
    palette: ['#00FFFF', '#FF3399', '#FF0000', '#FFFFFF', '#0000FF', '#FFD700'],
    avoid: ['#8B7355', '#6B5344', '#A08060'],
    description: '净冬型人肤色清冷通透，适合高对比度的鲜明色彩。净冬型是最具戏剧性的季型，纯黑+纯白+品红是王牌组合。',
  },
};

export const SEASON_KEYS = Object.keys(SEASONS);

const COLOR_NAMES_EXTREME: Record<string, string> = {
  '#FF3A3A': '烈焰红', '#FF5533': '暖橘红', '#FF99CC': '粉樱色',
  '#AAD4F2': '天空蓝', '#0088DD': '海洋蓝', '#8888CC': '薰衣草',
  '#EE8877': '柔珊瑚', '#FFAA00': '琥珀金', '#CC5555': '枫叶红',
  '#FF0000': '正红色', '#0000FF': '宝石蓝', '#00FFFF': '冰晶蓝',
};

const COLOR_NAMES_DAILY: Record<string, string> = {
  '#00F0F9': '薄荷青', '#F0B266': '蜂蜜金', '#F7EE77': '柠檬黄',
  '#F2C2CC': '樱花粉', '#E6B2CC': '藕荷色', '#BB88AA': '灰紫藤',
  '#AA8866': '驼棕色', '#E2AA7F': '杏桃色', '#88553F': '咖啡棕',
  '#1064EC': '皇家蓝', '#EE33A3': '品红色', '#FF3399': '玫红色',
};

export function getColorName(hex: string, phase: number): string {
  const map = phase === 1 ? COLOR_NAMES_EXTREME : COLOR_NAMES_DAILY;
  return map[hex.toUpperCase()] || map[hex] || hex;
}
