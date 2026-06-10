'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CrawlButton() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [saved, setSaved] = useState<number | null>(null)
  const router = useRouter()

  const handleCrawl = async () => {
    setStatus('running')
    setSaved(null)
    try {
      const res  = await fetch('/api/crawl', { method: 'POST' })
      const data = await res.json()
      setSaved(data.saved ?? 0)
      router.refresh()
      setStatus('done')
      // 3초 후 idle 복귀
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('idle')
    }
  }

  return (
    <div className="flex items-center gap-3">
      {status === 'done' && saved !== null && (
        <span className="text-sm text-green-600 font-medium">
          ✅ {saved}개 한글로 저장됨
        </span>
      )}
      <button
        onClick={handleCrawl}
        disabled={status === 'running'}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
      >
        {status === 'running' ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            수집 중...
          </>
        ) : (
          '🔄 한글 재수집'
        )}
      </button>
    </div>
  )
}
