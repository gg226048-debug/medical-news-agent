import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser()

export async function crawlNIH(): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL('https://newsinhealth.nih.gov/news/feed.rss')
    return (feed.items || [])
      .slice(0, 15)
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        sourceUrl: item.link!,
        sourceName: 'NIH',
        summary: item.contentSnippet || item.content || '',
        publishedAt: item.pubDate,
      }))
  } catch (err) {
    console.error('[NIH]', err)
    return []
  }
}
