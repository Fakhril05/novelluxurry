import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.password !== hashedPassword) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login gagal' }, { status: 500 });
  }
}
