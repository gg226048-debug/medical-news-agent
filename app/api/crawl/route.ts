import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { summarizeArticle } from '@/lib/openrouter'
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
  const rawArticles = await crawlAll()

  const { data: category } = await admin
    .from('categories')
    .select('id')
    .eq('slug', 'medical-health')
    .single()

  let saved = 0
  let skipped = 0
  const errors: string[] = []

  for (const article of rawArticles) {
    if (!article.title || !article.sourceUrl) {
      skipped++
      continue
    }

    const { data: existing } = await admin
      .from('articles')
      .select('id')
      .eq('source_url', article.sourceUrl)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const rawContent = article.content || article.summary || article.title
    const { summary, tags } = await summarizeArticle(
      article.title,
      rawContent,
      article.sourceName,
    )

    const { data: inserted, error } = await admin
      .from('articles')
      .insert({
        title: article.title,
        slug: makeSlug(article.sourceName),
        summary,
        content: rawContent,
        thumbnail_url: article.thumbnailUrl || null,
        category_id: category?.id || null,
        source_name: article.sourceName,
        source_url: article.sourceUrl,
        status: 'published',
        published_at: article.publishedAt
          ? new Date(article.publishedAt).toISOString()
          : new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error || !inserted) {
      errors.push(`${article.sourceName}: ${error?.message}`)
      continue
    }

    for (const tagName of tags) {
      const tagSlug = makeTagSlug(tagName)
      if (!tagSlug) continue

      let tagId: string | null = null
      const { data: existingTag } = await admin
        .from('tags')
        .select('id')
        .eq('slug', tagSlug)
        .maybeSingle()

      if (existingTag) {
        tagId = existingTag.id
      } else {
        const { data: newTag } = await admin
          .from('tags')
          .insert({ name: tagName, slug: tagSlug })
          .select('id')
          .single()
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
    skipped,
    total: rawArticles.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
