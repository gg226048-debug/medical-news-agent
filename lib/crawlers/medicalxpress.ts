import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser()

export async function crawlMedicalXpress(): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL('https://medicalxpress.com/rss-feed/')
    return (feed.items || [])
      .slice(0, 15)
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        sourceUrl: item.link!,
        sourceName: 'MedicalXpress',
        summary: item.contentSnippet || item.content || '',
        publishedAt: item.pubDate,
      }))
  } catch (err) {
    console.error('[MedicalXpress]', err)
    return []
  }
}
