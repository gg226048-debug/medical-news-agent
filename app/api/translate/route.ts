import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { summarizeArticle } from '@/lib/openrouter'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST() {
  const admin = createServiceClient()

  // 영어 제목 기사만 조회 (한글 없는 것)
  const { data: articles, error } = await admin
    .from('articles')
    .select('id, title, summary, source_name, content')
    .eq('status', 'published')
    .limit(30)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let translated = 0
  let skipped = 0

  for (const article of articles || []) {
    // 이미 한글 제목이면 스킵
    const hasKorean = /[가-힣]/.test(article.title || '')
    if (hasKorean) { skipped++; continue }

    const rawContent = article.content || article.summary || article.title
    const { title_ko, summary } = await summarizeArticle(
      article.title,
      rawContent,
      article.source_name || '',
    )

    await admin
      .from('articles')
      .update({ title: title_ko, summary })
      .eq('id', article.id)

    translated++
    // API rate limit 방지
    await new Promise(r => setTimeout(r, 300))
  }

  return NextResponse.json({ translated, skipped, total: articles?.length || 0 })
}
