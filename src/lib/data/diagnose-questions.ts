export interface QuestionOption {
  label: string;
  score: number;
}

export interface ConstitutionQuestion {
  id: number;
  category: string;
  dimension: string;
  question: string;
  options: QuestionOption[];
}

export const CONSTITUTION_QUESTIONS: ConstitutionQuestion[] = [
  { id: 1, category: '气虚质', dimension: '精力', question: '你容易感到疲乏无力吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 2, category: '气虚质', dimension: '声音', question: '你说话声音低弱、容易气短吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 3, category: '气虚质', dimension: '免疫', question: '你容易感冒，且恢复较慢吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 4, category: '气虚质', dimension: '出汗', question: '你稍动就容易出虚汗吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 5, category: '阳虚质', dimension: '温度', question: '你手脚发凉，特别怕冷吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 6, category: '阳虚质', dimension: '饮食', question: '你吃凉的东西会不舒服或腹泻吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 7, category: '阳虚质', dimension: '温度2', question: '你冬天被子比别人盖得厚吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 8, category: '阳虚质', dimension: '面色', question: '你面色偏白或苍白吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 9, category: '阴虚质', dimension: '口干', question: '你经常口干咽燥，想喝水吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 10, category: '阴虚质', dimension: '五心', question: '你手心、足心发热，或午后潮热吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 11, category: '阴虚质', dimension: '睡眠', question: '你有盗汗（睡觉出汗）的情况吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 12, category: '痰湿质', dimension: '体型', question: '你体形偏胖，尤其是腹部松软吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 13, category: '痰湿质', dimension: '口粘', question: '你经常感到口粘腻或甜腻吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 14, category: '痰湿质', dimension: '困重', question: '你经常感到身体困重、不爽快吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 15, category: '湿热质', dimension: '面垢', question: '你面部或鼻部油腻、容易长痘吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 16, category: '湿热质', dimension: '口苦', question: '你经常口苦口干，或有口臭吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 17, category: '血瘀质', dimension: '肤色', question: '你肤色晦暗，容易出现瘀斑吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 18, category: '血瘀质', dimension: '疼痛', question: '你有固定部位的疼痛或刺痛吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 19, category: '气郁质', dimension: '情绪', question: '你容易情绪低落、郁闷不乐吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 20, category: '气郁质', dimension: '胸胁', question: '你经常胸胁胀满或叹气吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  { id: 21, category: '特禀质', dimension: '过敏', question: '你有过敏性疾病（如哮喘、荨麻疹、过敏性鼻炎）吗？', options: [{ label: '没有', score: 0 }, { label: '轻度', score: 1 }, { label: '中度', score: 2 }, { label: '严重', score: 3 }] },
  { id: 22, category: '平和质', dimension: '整体', question: '你感觉自己精力充沛、状态良好吗？', options: [{ label: '总是', score: 3 }, { label: '经常', score: 2 }, { label: '偶尔', score: 1 }, { label: '从不', score: 0 }] },
];
