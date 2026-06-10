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
  const apiKey = process.env.ANTHROPIC_API_KEY
  const fallback: TranslateResult = {
    title_ko: title,
    summary: content.slice(0, 400),
    tags: [],
  }

  if (!apiKey) return fallback

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system:
          '의료/보건 전문 번역가입니다. 영어 의료 뉴스를 한국어로 정확하게 번역·요약합니다. ' +
          '반드시 JSON만 출력하고 다른 텍스트는 절대 포함하지 마세요.',
        messages: [
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
      console.error('[translator] API error:', res.status, await res.text())
      return fallback
    }

    const data = await res.json()
    const raw = data.content?.[0]?.text || ''

    // JSON 추출
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return fallback

    const parsed = JSON.parse(match[0])
    return {
      title_ko: parsed.title_ko?.trim() || title,
      summary:  parsed.summary?.trim()  || content.slice(0, 400),
      tags:     Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    }
  } catch (err) {
    console.error('[translator]', err)
    return fallback
  }
}
