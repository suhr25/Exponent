import { NextRequest, NextResponse } from 'next/server';

const GROWW_API_BASE = process.env.GROWW_API_BASE_URL || 'https://api.groww.in/v1';
const GROWW_API_KEY = process.env.GROWW_API_KEY || '';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${GROWW_API_BASE}/holdings/user`, {
      headers: {
        'Authorization': `Bearer ${GROWW_API_KEY}`,
        'Accept': 'application/json',
        'X-API-VERSION': '1.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ holdings: null, mock: true, message: 'Using mock portfolio data' });
  } catch (error) {
    return NextResponse.json({ holdings: null, mock: true, message: 'API unavailable' });
  }
}
