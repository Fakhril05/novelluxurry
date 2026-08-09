import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const bestseller = searchParams.get('bestseller');
    const newArrival = searchParams.get('newArrival');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const ids = searchParams.get('ids');

    const where: Record<string, unknown> = {};

    if (genre) {
      where.category = { slug: genre };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ];
    }
    if (bestseller === 'true') where.isBestSeller = true;
    if (newArrival === 'true') where.isNewArrival = true;
    if (featured === 'true') where.isFeatured = true;
    if (minPrice) where.price = { ...(where.price as Record<string, unknown> || {}), gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...(where.price as Record<string, unknown> || {}), lte: parseFloat(maxPrice) };
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    if (ids) {
      where.id = { in: ids.split(',') };
    }

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case 'price-asc': orderBy.price = 'asc'; break;
      case 'price-desc': orderBy.price = 'desc'; break;
      case 'rating': orderBy.rating = 'desc'; break;
      case 'bestseller': orderBy.soldCount = 'desc'; break;
      case 'newest':
      default: orderBy.createdAt = 'desc'; break;
    }

    const [books, total] = await Promise.all([
      db.book.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      db.book.count({ where }),
    ]);

    return NextResponse.json({ books, total, page, limit });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const book = await db.book.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        author: body.author,
        authorBio: body.authorBio || null,
        isbn: body.isbn || null,
        synopsis: body.synopsis || null,
        coverImage: body.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        galleryImages: body.galleryImages || null,
        price: parseFloat(body.price) || 0,
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        stock: parseInt(body.stock) || 0,
        format: body.format || 'Paperback',
        pages: body.pages ? parseInt(body.pages) : null,
        publisher: body.publisher || null,
        language: body.language || 'Indonesia',
        publishedYear: body.publishedYear ? parseInt(body.publishedYear) : null,
        categoryId: body.categoryId || null,
        isBestSeller: body.isBestSeller || false,
        isNewArrival: body.isNewArrival || false,
        isFeatured: body.isFeatured || false,
      },
    });
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }
    const body = await request.json();
    const book = await db.book.update({
      where: { id },
      data: body,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }
    await db.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
