import { crawlWHO } from './who'
import { crawlCDC } from './cdc'
import { crawlNIH } from './nih'
import { crawlPubMed } from './pubmed'
import { crawlMedicalXpress } from './medicalxpress'
import { crawlGoogleNews } from './google-news'
import { crawlReuters } from './reuters'
import type { RawArticle } from './types'

export async function crawlAll(): Promise<RawArticle[]> {
  const results = await Promise.allSettled([
    crawlWHO(),
    crawlCDC(),
    crawlNIH(),
    crawlPubMed(),
    crawlMedicalXpress(),
    crawlGoogleNews(),
    crawlReuters(),
  ])

  const articles: RawArticle[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
    } else {
      console.error('[crawlAll] one source failed:', result.reason)
    }
  }
  return articles
}
