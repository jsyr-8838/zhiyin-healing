import { NextRequest, NextResponse } from 'next/server'
import {
  JIULIAO_PRESCRIPTIONS,
  searchPrescriptions,
  getPrescriptionsByCategory,
  getPrescriptionsForConstitution,
  PRESCRIPTION_CATEGORIES,
  CONSTITUTION_PRESCRIPTIONS,
  type ConstitutionKey,
} from '@/lib/jiuliao-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const q = searchParams.get('q') ?? ''
    const category = searchParams.get('category') ?? ''
    const constitution = searchParams.get('constitution') ?? ''
    const ids = searchParams.get('ids') ?? ''
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')))

  let results = [...JIULIAO_PRESCRIPTIONS]

  if (ids) {
    const idSet = new Set(ids.split(',').map(Number).filter((n) => !isNaN(n)))
    results = results.filter((p) => idSet.has(p.id))
  }

  if (q) {
    const matched = searchPrescriptions(q)
    const matchedIds = new Set(matched.map((p) => p.id))
    results = results.filter((p) => matchedIds.has(p.id))
  }

  if (category) {
    const catResults = getPrescriptionsByCategory(category)
    const catIds = new Set(catResults.map((p) => p.id))
    results = results.filter((p) => catIds.has(p.id))
  }

  if (constitution) {
    const key = constitution as ConstitutionKey
    if (key in CONSTITUTION_PRESCRIPTIONS) {
      const constResults = getPrescriptionsForConstitution(key)
      const constIds = new Set(constResults.map((p) => p.id))
      results = results.filter((p) => constIds.has(p.id))
    }
  }

  const total = results.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paginated = results.slice(start, start + limit)

  return NextResponse.json({
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    categories: PRESCRIPTION_CATEGORIES,
    constitutions: Object.keys(CONSTITUTION_PRESCRIPTIONS),
  })
  } catch (err) {
    console.error('[jiuliao] Error:', err)
    return NextResponse.json(
      { error: '灸疗处方查询失败', details: (err as Error).message },
      { status: 500 },
    )
  }
}
