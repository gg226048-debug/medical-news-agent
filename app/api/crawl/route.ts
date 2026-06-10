import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { translateArticle } from '@/lib/translator'
import { crawlAll } from '@/lib/crawlers'

export const runtime = 'nodejs'
export const maxDuration = 300

function makeSlug(sourceName: string): string {
  return `${sourceName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function makeTagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

export async function POST() {
  const admin = createServiceClient()

  // 1단계: 기존 데이터 전체 삭제
  await admin
    .from('article_tags')
    .delete()
    .neq('article_id', '00000000-0000-0000-0000-000000000000')
  await admin
    .from('articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  // 2단계: 뉴스 수집
  const rawArticles = await crawlAll()

  const { data: category } = await admin
    .from('categories')
    .select('id')
    .eq('slug', 'medical-health')
    .single()

  let saved = 0
  const errors: string[] = []

  for (const article of rawArticles) {
    if (!article.title || !article.sourceUrl) continue

    const rawContent = article.content || article.summary || article.title

    // 3단계: Anthropic API로 한글 번역·요약
    const { title_ko, summary, tags } = await translateArticle(
      article.title,
      rawContent,
      article.sourceName,
    )

    const { data: inserted, error } = await admin
      .from('articles')
      .insert({
        title:         title_ko,                // 한글 제목
        slug:          makeSlug(article.sourceName),
        summary,                                 // 한글 요약
        content:       rawContent,
        thumbnail_url: article.thumbnailUrl || null,
        category_id:   category?.id || null,
        source_name:   article.sourceName,
        source_url:    article.sourceUrl,
        status:        'published',
        published_at:  article.publishedAt
          ? new Date(article.publishedAt).toISOString()
          : new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error || !inserted) {
      errors.push(`${article.sourceName}: ${error?.message}`)
      continue
    }

    // 태그 저장
    for (const tagName of tags) {
      const tagSlug = makeTagSlug(tagName)
      if (!tagSlug) continue

      let tagId: string | null = null
      const { data: existing } = await admin
        .from('tags').select('id').eq('slug', tagSlug).maybeSingle()

      if (existing) {
        tagId = existing.id
      } else {
        const { data: newTag } = await admin
          .from('tags').insert({ name: tagName, slug: tagSlug }).select('id').single()
        tagId = newTag?.id || null
      }

      if (tagId) {
        await admin
          .from('article_tags')
          .insert({ article_id: inserted.id, tag_id: tagId })
          .throwOnError()
      }
    }

    saved++
  }

  return NextResponse.json({
    saved,
    total: rawArticles.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
