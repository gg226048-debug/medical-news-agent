import CrawlButton from './CrawlButton'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-base">M</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Medical News AI</h1>
            <p className="text-xs text-gray-400">AI 의료 뉴스 자동 수집 · 요약</p>
          </div>
        </div>
        <CrawlButton />
      </div>
    </header>
  )
}
