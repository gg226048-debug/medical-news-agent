const SOURCE_COLORS: Record<string, string> = {
  WHO: 'bg-red-100 text-red-700',
  CDC: 'bg-blue-100 text-blue-700',
  NIH: 'bg-purple-100 text-purple-700',
  PubMed: 'bg-teal-100 text-teal-700',
  MedicalXpress: 'bg-orange-100 text-orange-700',
  'Google News': 'bg-green-100 text-green-700',
  Reuters: 'bg-indigo-100 text-indigo-700',
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}

interface Tag {
  name: string
  slug: string
}

interface ArticleCardProps {
  article: {
    id: string
    title: string
    summary: string | null
    source_name: string | null
    source_url: string | null
    thumbnail_url: string | null
    published_at: string | null
    article_tags: Array<{ tags: Tag | null }>
  }
}

export default function NewsCard({ article }: ArticleCardProps) {
  const sourceName = article.source_name || 'Unknown'
  const badgeClass = SOURCE_COLORS[sourceName] || 'bg-gray-100 text-gray-700'
  const tags = article.article_tags
    .map((at) => at.tags)
    .filter((t): t is Tag => t !== null)

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {sourceName}
          </span>
          <time className="text-xs text-gray-400">{formatDate(article.published_at)}</time>
        </div>

        <a
          href={article.source_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <h2 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h2>
        </a>

        {article.summary && (
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-4 flex-1">
            {article.summary}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {tags.map((tag) => (
              <span
                key={tag.slug}
                className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-200"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
