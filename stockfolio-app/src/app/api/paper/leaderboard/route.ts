import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  const db = await getDb();
  if (!db) return NextResponse.json({ leaderboard: [], reason: 'MongoDB not configured' });

  const rows = await db
    .collection('paper_trades')
    .find(
      {},
      {
        projection: {
          _id: 0,
          username: 1,
          netWorth: 1,
          balance: 1,
          holdings: 1,
          updatedAt: 1,
        },
      }
    )
    .sort({ netWorth: -1 })
    .limit(20)
    .toArray();

  const leaderboard = rows.map((row, i) => ({
    rank: i + 1,
    username: row.username,
    netWorth: row.netWorth,
    balance: row.balance,
    holdingsCount: row.holdings?.length ?? 0,
    updatedAt: row.updatedAt,
  }));

  return NextResponse.json({ leaderboard });
}
