interface SummarizeResult {
  summary: string
  tags: string[]
}

export async function summarizeArticle(
  title: string,
  content: string,
  sourceName: string,
): Promise<SummarizeResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return { summary: content.slice(0, 400), tags: [] }
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost',
        'X-Title': 'Medical News Agent',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
            content:
              '당신은 의료/보건 전문 번역가 및 에디터입니다. 영어 의료 뉴스를 한국어로 정확하고 이해하기 쉽게 요약합니다.',
          },
          {
            role: 'user',
            content: `아래 의료 뉴스를 한국어 3~4문장으로 요약하고, 관련 의료 키워드 태그 3~5개를 추출해주세요.

출처: ${sourceName}
제목: ${title}
내용: ${content.slice(0, 2000)}

반드시 아래 JSON 형식으로만 응답하세요:
{"summary":"한국어 요약","tags":["태그1","태그2","태그3"]}`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 600,
      }),
    })

    if (!res.ok) throw new Error(`OpenRouter ${res.status}`)

    const data = await res.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    return {
      summary: parsed.summary || content.slice(0, 400),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    }
  } catch (err) {
    console.error('[OpenRouter]', err)
    return { summary: content.slice(0, 400), tags: [] }
  }
}
