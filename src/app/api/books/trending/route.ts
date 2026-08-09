import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const books = await db.book.findMany({
      where: { isBestSeller: true },
      orderBy: { soldCount: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, author: true, coverImage: true, rating: true, soldCount: true, discountPrice: true, price: true },
    });
    if (books.length < 5) {
      const existingIds = books.map((b) => b.id);
      const more = await db.book.findMany({
        where: { id: { notIn: existingIds } },
        orderBy: { rating: 'desc' },
        take: 5 - books.length,
        select: { id: true, title: true, slug: true, author: true, coverImage: true, rating: true, soldCount: true, discountPrice: true, price: true },
      });
      books.push(...more);
    }
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching trending books:', error);
    return NextResponse.json({ error: 'Failed to fetch trending books' }, { status: 500 });
  }
}
