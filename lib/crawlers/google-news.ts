import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser()

export async function crawlGoogleNews(): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(
      'https://news.google.com/rss/search?q=health+medicine+disease+treatment&hl=en-US&gl=US&ceid=US:en',
    )
    return (feed.items || [])
      .slice(0, 15)
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.replace(/\s*-\s*[^-]+$/, '').trim(),
        sourceUrl: item.link!,
        sourceName: 'Google News',
        summary: item.contentSnippet || '',
        publishedAt: item.pubDate,
      }))
  } catch (err) {
    console.error('[Google News]', err)
    return []
  }
}
