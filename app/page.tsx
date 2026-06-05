import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import NewsCard from '@/components/NewsCard'

export const revalidate = 1800

const SOURCES = ['WHO', 'CDC', 'NIH', 'PubMed', 'MedicalXpress', 'Google News', 'Reuters']

async function getArticles(source?: string) {
  let query = supabase
    .from('articles')
    .select(
      'id, title, summary, source_name, source_url, thumbnail_url, published_at, article_tags(tags(name, slug))',
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(60)

  if (source) query = query.eq('source_name', source)

  const { data, error } = await query
  if (error) console.error('[page] fetch error:', error)
  return (data || []) as unknown as Parameters<typeof NewsCard>[0]['article'][]
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>
}) {
  const { source } = await searchParams
  const articles = await getArticles(source)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Source filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !source
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            전체
          </Link>
          {SOURCES.map((s) => (
            <Link
              key={s}
              href={`/?source=${encodeURIComponent(s)}`}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                source === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Count */}
        <p className="text-sm text-gray-400 mb-4">
          {articles.length > 0 ? `${articles.length}개의 뉴스` : ''}
        </p>

        {/* Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🏥</p>
            <p className="text-lg font-medium text-gray-500">수집된 뉴스가 없습니다</p>
            <p className="text-sm mt-2">상단의 &apos;뉴스 수집&apos; 버튼을 눌러 시작하세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
