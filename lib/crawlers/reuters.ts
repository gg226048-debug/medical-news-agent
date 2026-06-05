import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser()

export async function crawlReuters(): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL('https://feeds.reuters.com/reuters/healthNews')
    return (feed.items || [])
      .slice(0, 15)
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        sourceUrl: item.link!,
        sourceName: 'Reuters',
        summary: item.contentSnippet || item.content || '',
        publishedAt: item.pubDate,
      }))
  } catch (err) {
    console.error('[Reuters]', err)
    return []
  }
}
