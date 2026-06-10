export interface TranslateResult {
  title_ko: string
  summary: string
  tags: string[]
}

export async function translateArticle(
  title: string,
  content: string,
  sourceName: string,
): Promise<TranslateResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const fallback: TranslateResult = {
    title_ko: title,
    summary: content.slice(0, 400),
    tags: [],
  }

  if (!apiKey) {
    console.error('[translator] OPENROUTER_API_KEY 없음')
    return fallback
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://medical-news-agent-nine.vercel.app',
        'X-Title': 'Medical News Agent',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        max_tokens: 1024,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              '의료/보건 전문 번역가입니다. 영어 의료 뉴스를 한국어로 정확하게 번역·요약합니다. ' +
              '반드시 JSON만 출력하고 다른 텍스트는 절대 포함하지 마세요.',
          },
          {
            role: 'user',
            content:
              `출처: ${sourceName}\n제목: ${title}\n내용: ${content.slice(0, 1500)}\n\n` +
              '위 뉴스를 한국어로 번역·요약해서 아래 JSON 형식으로만 응답하세요:\n' +
              '{"title_ko":"한국어 제목","summary":"한국어 3문장 요약","tags":["태그1","태그2","태그3"]}',
          },
        ],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[translator] OpenRouter 오류:', res.status, errText)
      return fallback
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content || ''

    // JSON 추출
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[translator] JSON 파싱 실패:', raw.slice(0, 100))
      return fallback
    }

    const parsed = JSON.parse(match[0])
    return {
      title_ko: parsed.title_ko?.trim() || title,
      summary:  parsed.summary?.trim()  || content.slice(0, 400),
      tags:     Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    }
  } catch (err) {
    console.error('[translator] 예외:', err)
    return fallback
  }
}
