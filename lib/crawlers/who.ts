import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser()

export async function crawlWHO(): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL('https://www.who.int/rss-feeds/news-english.xml')
    return (feed.items || [])
      .slice(0, 15)
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        sourceUrl: item.link!,
        sourceName: 'WHO',
        summary: item.contentSnippet || item.content || '',
        publishedAt: item.pubDate,
      }))
  } catch (err) {
    console.error('[WHO]', err)
    return []
  }
}
