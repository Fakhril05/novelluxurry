import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, total } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Kode voucher wajib diisi' }, { status: 400 });
    }
    const voucher = await db.voucher.findUnique({ where: { code } });
    if (!voucher || !voucher.isActive) {
      return NextResponse.json({ error: 'Voucher tidak valid' }, { status: 404 });
    }
    if (new Date() < voucher.validFrom || new Date() > voucher.validTo) {
      return NextResponse.json({ error: 'Voucher sudah kadaluarsa' }, { status: 400 });
    }
    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({ error: 'Voucher sudah habis digunakan' }, { status: 400 });
    }
    if (total < voucher.minOrder) {
      return NextResponse.json({ error: `Minimum order Rp${voucher.minOrder.toLocaleString('id-ID')}` }, { status: 400 });
    }
    let disc = total * (voucher.discount / 100);
    if (voucher.maxDisc && disc > voucher.maxDisc) disc = voucher.maxDisc;
    return NextResponse.json({ valid: true, discount: disc, code: voucher.code, percentage: voucher.discount });
  } catch (error) {
    console.error('Voucher error:', error);
    return NextResponse.json({ error: 'Validasi gagal' }, { status: 500 });
  }
}
