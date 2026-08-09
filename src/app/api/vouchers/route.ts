import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const now = new Date();
    const vouchers = await db.voucher.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now },
      },
      orderBy: { validTo: 'asc' },
    });
    return NextResponse.json({ vouchers });
  } catch (error) {
    console.error('Vouchers fetch error:', error);
    return NextResponse.json({ vouchers: [] }, { status: 500 });
  }
}
