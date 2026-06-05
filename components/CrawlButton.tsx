'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CrawlButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ saved: number; skipped: number } | null>(null)
  const router = useRouter()

  const handleCrawl = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/crawl', { method: 'POST' })
      const data = await res.json()
      setResult(data)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-sm text-green-600 font-medium">
          {result.saved}개 신규 저장
        </span>
      )}
      <button
        onClick={handleCrawl}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            수집 중...
          </>
        ) : (
          '뉴스 수집'
        )}
      </button>
    </div>
  )
}
