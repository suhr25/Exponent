import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'MongoDB not configured' }, { status: 503 });

  const { balance, usedMargin, orders, holdings } = await req.json();

  const holdingsValue = (holdings ?? []).reduce(
    (sum: number, h: { quantity: number; avgPrice: number }) => sum + h.quantity * h.avgPrice,
    0
  );
  const netWorth = (balance ?? 0) + holdingsValue;

  await db.collection('paper_trades').updateOne(
    { user_id: user.id },
    {
      $set: {
        user_id: user.id,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader',
        balance,
        usedMargin,
        netWorth,
        orders,
        holdings,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true, netWorth });
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ state: null, reason: 'MongoDB not configured' });

  const state = await db.collection('paper_trades').findOne(
    { user_id: user.id },
    { projection: { _id: 0, user_id: 0 } }
  );

  return NextResponse.json({ state: state ?? null });
}
