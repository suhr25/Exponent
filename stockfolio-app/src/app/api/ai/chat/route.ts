// ─── AI Chat Proxy ───────────────────────────────────────────────────────────
// Proxies requests to Anthropic Claude API, keeping API key server-side.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, systemPrompt, maxTokens = 500 } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key, return a helpful mock response
    if (!apiKey) {
      const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();
      return NextResponse.json({
        content: generateMockAIResponse(lastUserMessage?.content || ''),
        model: 'mock',
        usage: { input_tokens: 0, output_tokens: 0 },
      });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt || 'You are a helpful Indian stock market analyst.',
        messages,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Anthropic API error', details: errData },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      content: data.content?.[0]?.text || '',
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'AI proxy error', details: String(error) },
      { status: 500 }
    );
  }
}

/** Generate a mock AI response when no API key is configured */
function generateMockAIResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('buy') || q.includes('good')) {
    return `Based on the current technical and fundamental indicators, this stock shows mixed signals. The RSI is in neutral territory, and the MACD shows a potential crossover forming. From a fundamental perspective, the P/E ratio is within the sector average range.

**Key Considerations:**
- Monitor the support level and volume patterns
- Check the upcoming quarterly results for earnings surprises
- Compare with sector peers for relative valuation

**⚠️ Disclaimer:** This is AI-generated analysis and not financial advice. Always do your own research (DYOR) and consult a SEBI-registered advisor before making investment decisions.`;
  }

  if (q.includes('risk')) {
    return `The key risks for this stock include:

1. **Sector-specific headwinds** — Regulatory changes and competitive pressures could impact margins
2. **Valuation concern** — Current P/E is slightly above the 5-year average
3. **FII activity** — Recent FII selling pressure in the broader market may impact sentiment
4. **Global factors** — Dollar strengthening and US Fed policy decisions

**⚠️ Disclaimer:** This is AI-generated analysis and not financial advice. DYOR.`;
  }

  return `Here's a quick analysis based on the available data:

The stock is currently trading with moderate momentum. Technical indicators suggest a neutral-to-slightly-bullish outlook in the near term. Volume patterns are consistent with the recent trend.

**Key Metrics to Watch:**
- Support and resistance levels from recent price action
- Quarterly earnings trajectory
- Institutional holding changes (FII/DII activity)
- Sector rotation trends in the Indian market

For a deeper analysis, consider looking at the Stock DNA radar chart and peer comparison on the stock's detail page.

**⚠️ Disclaimer:** This is AI-generated analysis and not financial advice. Always do your own research (DYOR) and consult a SEBI-registered advisor.`;
}
