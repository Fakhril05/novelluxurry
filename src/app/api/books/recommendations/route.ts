import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const excludeParam = searchParams.get('exclude');
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const excludeIds = excludeParam
      ? excludeParam.split(',').filter(Boolean)
      : [];

    let books;

    if (categoryId) {
      // Category-based recommendations: get top-rated books from that category
      // Fetch more than needed, then randomly pick
      const candidates = await db.book.findMany({
        where: {
          categoryId,
          id: { notIn: excludeIds },
        },
        orderBy: { rating: 'desc' },
        take: Math.min(limit * 3, 30),
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });

      // Shuffle and take limit
      books = shuffleArray(candidates).slice(0, limit);
    } else {
      // Diverse recommendations: pick highest-rated books across different categories
      const categories = await db.category.findMany({
        include: {
          _count: { select: { books: true } },
        },
        where: {
          books: { some: { id: { notIn: excludeIds } } },
        },
      });

      // Sort categories by number of books (prefer categories with more books) then randomize
      const shuffledCategories = shuffleArray(categories);

      const selectedBooks: typeof books = [];
      const usedBookIds = new Set<string>(excludeIds);
      const booksPerCategory = Math.max(1, Math.ceil(limit / shuffledCategories.length));

      for (const cat of shuffledCategories) {
        if (selectedBooks.length >= limit) break;

        const catBooks = await db.book.findMany({
          where: {
            categoryId: cat.id,
            id: { notIn: Array.from(usedBookIds) },
          },
          orderBy: { rating: 'desc' },
          take: booksPerCategory + 1, // get extra for shuffle
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        });

        const shuffled = shuffleArray(catBooks);
        for (const book of shuffled) {
          if (selectedBooks.length >= limit) break;
          selectedBooks.push(book);
          usedBookIds.add(book.id);
        }
      }

      books = selectedBooks;
    }

    return NextResponse.json({ books: books || [] });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ books: [] }, { status: 500 });
  }
}

/** Simple Fisher-Yates shuffle */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
