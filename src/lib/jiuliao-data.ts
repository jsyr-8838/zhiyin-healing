import rawPrescriptions from './jiuliao-prescriptions.json'

export interface JiuliaoPrescription {
  id: number
  name: string
  category: string
  indication: string
  points: string[]
  method: string
  classicRef: string
  standard: string
  clinicalCase: string
  experience: string
  fullText: string
}

export const JIULIAO_PRESCRIPTIONS: JiuliaoPrescription[] =
  rawPrescriptions as JiuliaoPrescription[]

export const PRESCRIPTION_CATEGORIES: string[] = [
  ...new Set(JIULIAO_PRESCRIPTIONS.map((p) => p.category)),
]

export type ConstitutionKey =
  | '阳虚质'
  | '阴虚质'
  | '气虚质'
  | '痰湿质'
  | '湿热质'
  | '血瘀质'
  | '气郁质'
  | '特禀质'
  | '平和质'

interface ConstitutionMapping {
  recommendedCategories: string[]
  recommendedIds: number[]
  rationale: string
}

export const CONSTITUTION_PRESCRIPTIONS: Record<
  ConstitutionKey,
  ConstitutionMapping
> = {
  阳虚质: {
    recommendedCategories: ['肾系', '脾胃'],
    recommendedIds: [
      6, 34, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 60, 61, 62, 63,
      76, 77, 78, 79, 88, 89, 90, 91, 92, 93, 94, 95,
    ],
    rationale:
      '阳虚质阳气不足，宜温补肾阳、健脾暖胃，重点选用肾系（温阳补肾）与脾胃（温中散寒）类灸方',
  },
  阴虚质: {
    recommendedCategories: ['肺痨', '咳嗽', '心系'],
    recommendedIds: [
      11, 21, 22, 33, 39, 67, 68, 69, 70, 71, 72, 73, 74, 75, 166, 167, 168,
    ],
    rationale:
      '阴虚质阴液亏虚、虚火内生，宜滋阴降火，选用肺痨（滋阴润肺）、阴虚咳嗽及心系阴虚类灸方，灸量宜轻',
  },
  气虚质: {
    recommendedCategories: ['脾胃', '亚健康', '感冒'],
    recommendedIds: [
      5, 12, 14, 38, 41, 46, 50, 53, 55, 56, 57, 60, 62, 76, 77, 78, 79, 87,
      88, 89, 91, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307,
      308, 309, 310, 311, 312, 313, 314, 315, 316,
    ],
    rationale:
      '气虚质元气不足，宜健脾益气补肺，选用脾胃（健脾益气）、亚健康（气虚调养）及气虚感冒类灸方',
  },
  痰湿质: {
    recommendedCategories: ['脾胃', '亚健康', '气血津液'],
    recommendedIds: [
      9, 18, 37, 43, 46, 50, 53, 55, 56, 57, 60, 62, 76, 77, 78, 79, 87, 88,
      89, 91, 100, 101, 102, 103, 104, 296, 297, 298, 299, 300, 301, 317, 318,
      319, 320, 321, 322, 323,
    ],
    rationale:
      '痰湿质痰湿内蕴，宜健脾化痰祛湿，选用脾胃（健脾化湿）与亚健康（痰湿调养）类灸方',
  },
  湿热质: {
    recommendedCategories: ['肝胆', '皮肤', '脾胃'],
    recommendedIds: [
      4, 46, 50, 53, 55, 60, 62, 76, 78, 79, 87, 88, 91, 92, 93, 94, 95, 96,
      97, 98, 99, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153,
      154, 155, 156, 157, 158, 159, 160,
    ],
    rationale:
      '湿热质湿热内蕴，宜清热利湿，选用肝胆（清利湿热）与皮肤（清热解毒）类灸方，灸量宜轻',
  },
  血瘀质: {
    recommendedCategories: ['筋骨', '妇科', '气血津液'],
    recommendedIds: [
      36, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112,
      113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
      127, 128, 129, 130, 131, 132, 133, 134, 161, 162, 163, 164, 165, 166,
      167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180,
      181, 182, 183, 184, 185, 186, 187, 188, 189, 190,
    ],
    rationale:
      '血瘀质血行不畅，宜活血化瘀通络，选用筋骨（活血通络）、妇科（化瘀调经）及气血津液（活血）类灸方',
  },
  气郁质: {
    recommendedCategories: ['心系', '妇科', '亚健康'],
    recommendedIds: [
      31, 32, 33, 38, 39, 40, 44, 45, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73,
      74, 75, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173,
      174, 175, 176, 296, 297, 298, 299, 324, 325, 326, 327, 328, 329,
    ],
    rationale:
      '气郁质气机郁滞，宜疏肝理气解郁，选用心系（安神定志）、妇科（疏肝调经）及亚健康（情志调养）类灸方',
  },
  特禀质: {
    recommendedCategories: ['皮肤', '鼻病', '哮喘'],
    recommendedIds: [
      20, 28, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154,
      155, 156, 157, 158, 159, 160, 25, 26, 27, 28, 29, 30, 15, 16, 17, 18,
      19, 20,
    ],
    rationale:
      '特禀质先天禀赋异常、易过敏，宜调节免疫固表，选用皮肤（抗过敏）、鼻病（过敏性鼻炎）及哮喘（过敏性哮喘）类灸方',
  },
  平和质: {
    recommendedCategories: ['亚健康', '特殊灸法'],
    recommendedIds: [
      296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309,
      310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323,
      324, 325, 326, 327, 328, 329, 310, 311, 312, 313, 314, 315, 316, 317,
      318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329,
    ],
    rationale:
      '平和质阴阳气血调和，宜保健防病，选用亚健康（日常保养）与特殊灸法（保健灸）类灸方',
  },
}

export function searchPrescriptions(query: string): JiuliaoPrescription[] {
  if (!query.trim()) return []
  const q = query.trim().toLowerCase()
  return JIULIAO_PRESCRIPTIONS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.indication.toLowerCase().includes(q) ||
      p.fullText.toLowerCase().includes(q) ||
      p.points.some((pt) => pt.toLowerCase().includes(q)),
  )
}

export function getPrescriptionsByCategory(
  cat: string,
): JiuliaoPrescription[] {
  return JIULIAO_PRESCRIPTIONS.filter((p) => p.category === cat)
}

export function getPrescriptionsForConstitution(
  constitution: ConstitutionKey,
): JiuliaoPrescription[] {
  const mapping = CONSTITUTION_PRESCRIPTIONS[constitution]
  if (!mapping) return []
  const idSet = new Set(mapping.recommendedIds)
  return JIULIAO_PRESCRIPTIONS.filter((p) => idSet.has(p.id))
}
