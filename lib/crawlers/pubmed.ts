import type { RawArticle } from './types'

const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

export async function crawlPubMed(): Promise<RawArticle[]> {
  try {
    const searchRes = await fetch(
      `${BASE}/esearch.fcgi?db=pubmed&term=disease+outbreak+OR+medical+breakthrough+OR+clinical+trial&sort=date&retmax=12&retmode=json&datetype=pdat&reldate=7`,
    )
    const searchData = await searchRes.json()
    const ids: string[] = searchData.esearchresult?.idlist || []
    if (ids.length === 0) return []

    const summaryRes = await fetch(
      `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`,
    )
    const summaryData = await summaryRes.json()
    const results = summaryData.result || {}

    return ids
      .filter((id) => results[id]?.title)
      .map((id) => {
        const item = results[id]
        const authors: string = item.authors?.slice(0, 3).map((a: { name: string }) => a.name).join(', ') || ''
        return {
          title: item.title.replace(/\.$/, ''),
          sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          sourceName: 'PubMed',
          summary: [item.source, authors, item.sortpubdate].filter(Boolean).join(' · '),
          publishedAt: item.sortpubdate,
        }
      })
  } catch (err) {
    console.error('[PubMed]', err)
    return []
  }
}
