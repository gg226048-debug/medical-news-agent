import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST() {
  const admin = createServiceClient()

  // article_tags 먼저 삭제 (FK 제약)
  await admin.from('article_tags').delete().neq('article_id', '00000000-0000-0000-0000-000000000000')
  // articles 전체 삭제
  const { error } = await admin
    .from('articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: '전체 기사가 삭제되었습니다' })
}
