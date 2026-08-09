import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/books — Fetch all books (admin view with full details)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const format = searchParams.get('format');
    const status = searchParams.get('status'); // 'bestseller' | 'newArrival' | 'featured' | 'outOfStock'
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (format) {
      where.format = format;
    }
    if (status === 'bestseller') where.isBestSeller = true;
    if (status === 'newArrival') where.isNewArrival = true;
    if (status === 'featured') where.isFeatured = true;
    if (status === 'outOfStock') where.stock = 0;

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case 'titleAsc': orderBy.title = 'asc'; break;
      case 'titleDesc': orderBy.title = 'desc'; break;
      case 'priceAsc': orderBy.price = 'asc'; break;
      case 'priceDesc': orderBy.price = 'desc'; break;
      case 'stockAsc': orderBy.stock = 'asc'; break;
      case 'stockDesc': orderBy.stock = 'desc'; break;
      case 'soldDesc': orderBy.soldCount = 'desc'; break;
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
          _count: { select: { orderItems: true, reviews: true, wishlists: true } },
        },
      }),
      db.book.count({ where }),
    ]);

    return NextResponse.json({ books, total, page, limit });
  } catch (error) {
    console.error('Error fetching admin books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

// POST /api/admin/books — Create a new book with validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const errors: string[] = [];
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('Title is required');
    }
    if (!body.author || typeof body.author !== 'string' || body.author.trim().length === 0) {
      errors.push('Author is required');
    }
    if (body.price === undefined || body.price === null || isNaN(Number(body.price)) || Number(body.price) <= 0) {
      errors.push('Price must be a positive number');
    }
    if (body.discountPrice !== undefined && body.discountPrice !== null && body.discountPrice !== '') {
      const dp = Number(body.discountPrice);
      if (isNaN(dp) || dp <= 0) {
        errors.push('Discount price must be a positive number');
      } else if (dp >= Number(body.price)) {
        errors.push('Discount price must be less than the regular price');
      }
    }
    if (body.stock !== undefined && body.stock !== null && body.stock !== '') {
      const stock = Number(body.stock);
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        errors.push('Stock must be a non-negative integer');
      }
    }
    if (body.pages !== undefined && body.pages !== null && body.pages !== '') {
      const pages = Number(body.pages);
      if (isNaN(pages) || pages <= 0 || !Number.isInteger(pages)) {
        errors.push('Pages must be a positive integer');
      }
    }
    if (body.publishedYear !== undefined && body.publishedYear !== null && body.publishedYear !== '') {
      const year = Number(body.publishedYear);
      if (isNaN(year) || year < 1900 || year > 2100 || !Number.isInteger(year)) {
        errors.push('Published year must be a valid year between 1900 and 2100');
      }
    }
    if (body.categoryId) {
      const catExists = await db.category.findUnique({ where: { id: body.categoryId } });
      if (!catExists) {
        errors.push('Selected category does not exist');
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    // Generate slug from title
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const existingSlug = await db.book.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ error: 'Validation failed', details: ['A book with a similar title already exists (slug conflict)'] }, { status: 409 });
    }

    const book = await db.book.create({
      data: {
        title: body.title.trim(),
        slug,
        author: body.author.trim(),
        authorBio: body.authorBio?.trim() || null,
        isbn: body.isbn?.trim() || null,
        synopsis: body.synopsis?.trim() || null,
        coverImage: body.coverImage?.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        price: Number(body.price),
        discountPrice: body.discountPrice !== undefined && body.discountPrice !== null && body.discountPrice !== ''
          ? Number(body.discountPrice)
          : null,
        stock: body.stock !== undefined && body.stock !== null && body.stock !== '' ? Number(body.stock) : 0,
        format: body.format || 'Paperback',
        pages: body.pages !== undefined && body.pages !== null && body.pages !== '' ? Number(body.pages) : null,
        publisher: body.publisher?.trim() || null,
        language: body.language?.trim() || 'Indonesia',
        publishedYear: body.publishedYear !== undefined && body.publishedYear !== null && body.publishedYear !== ''
          ? Number(body.publishedYear)
          : null,
        categoryId: body.categoryId || null,
        isBestSeller: Boolean(body.isBestSeller),
        isNewArrival: Boolean(body.isNewArrival),
        isFeatured: Boolean(body.isFeatured),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
