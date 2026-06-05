import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser()

export async function crawlCDC(): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(
      'https://tools.cdc.gov/api/v2/resources/media/316422.rss',
    )
    return (feed.items || [])
      .slice(0, 15)
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        sourceUrl: item.link!,
        sourceName: 'CDC',
        summary: item.contentSnippet || item.content || '',
        publishedAt: item.pubDate,
      }))
  } catch (err) {
    console.error('[CDC]', err)
    return []
  }
}
