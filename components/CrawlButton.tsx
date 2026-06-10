'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CrawlButton() {
  const [status, setStatus] = useState<'idle'|'resetting'|'crawling'|'translating'|'done'>('idle')
  const [result, setResult] = useState<{ saved?: number; translated?: number } | null>(null)
  const router = useRouter()

  // 한글로 새로 수집: 초기화 → 수집
  const handleKoreanCrawl = async () => {
    if (!confirm('기존 뉴스를 모두 삭제하고 한글로 새로 수집할까요?')) return

    setResult(null)

    // 1단계: 초기화
    setStatus('resetting')
    try {
      await fetch('/api/reset', { method: 'POST' })
    } catch {}

    // 2단계: 한글 수집
    setStatus('crawling')
    try {
      const res  = await fetch('/api/crawl', { method: 'POST' })
      const data = await res.json()
      setResult({ saved: data.saved })
      router.refresh()
      setStatus('done')
    } catch {
      setStatus('idle')
    }
  }

  // 기존 영어 기사 번역
  const handleTranslate = async () => {
    setStatus('translating')
    setResult(null)
    try {
      const res  = await fetch('/api/translate', { method: 'POST' })
      const data = await res.json()
      setResult({ translated: data.translated })
      router.refresh()
      setStatus('done')
    } catch {
      setStatus('idle')
    }
  }

  const loading = status !== 'idle' && status !== 'done'

  const statusLabel: Record<typeof status, string> = {
    idle:        '뉴스 수집',
    resetting:   '초기화 중...',
    crawling:    '수집 중...',
    translating: '번역 중...',
    done:        '완료',
  }

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {result?.saved    != null && <span className="text-sm text-green-600 font-medium">{result.saved}개 신규 저장</span>}
      {result?.translated != null && <span className="text-sm text-blue-600 font-medium">{result.translated}개 번역 완료</span>}

      {/* 기존 영어 기사 번역 버튼 */}
      <button
        onClick={handleTranslate}
        disabled={loading}
        title="기존 영어 기사를 한글로 번역"
        className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
      >
        {status === 'translating' ? (
          <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />번역 중...</>
        ) : '🌐 한글 번역'}
      </button>

      {/* 초기화 후 한글 재수집 버튼 */}
      <button
        onClick={handleKoreanCrawl}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {loading && status !== 'translating' ? (
          <><span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />{statusLabel[status]}</>
        ) : '🔄 한글 재수집'}
      </button>
    </div>
  )
}
