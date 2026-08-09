import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/books/[id] — Get a single book with full details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await db.book.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { orderItems: true, reviews: true, wishlists: true } },
        reviews: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

// PUT /api/admin/books/[id] — Update a book with validation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check book exists
    const existing = await db.book.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validation
    const errors: string[] = [];
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        errors.push('Title is required');
      }
    }
    if (body.author !== undefined) {
      if (typeof body.author !== 'string' || body.author.trim().length === 0) {
        errors.push('Author is required');
      }
    }
    if (body.price !== undefined) {
      if (isNaN(Number(body.price)) || Number(body.price) <= 0) {
        errors.push('Price must be a positive number');
      }
    }
    if (body.discountPrice !== undefined && body.discountPrice !== null && body.discountPrice !== '') {
      const dp = Number(body.discountPrice);
      const price = Number(body.price ?? existing.price);
      if (isNaN(dp) || dp <= 0) {
        errors.push('Discount price must be a positive number');
      } else if (dp >= price) {
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

    // Build update data
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.author !== undefined) data.author = body.author.trim();
    if (body.authorBio !== undefined) data.authorBio = body.authorBio?.trim() || null;
    if (body.isbn !== undefined) data.isbn = body.isbn?.trim() || null;
    if (body.synopsis !== undefined) data.synopsis = body.synopsis?.trim() || null;
    if (body.coverImage !== undefined) data.coverImage = body.coverImage?.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop';
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.discountPrice !== undefined) {
      data.discountPrice = (body.discountPrice !== null && body.discountPrice !== '')
        ? Number(body.discountPrice)
        : null;
    }
    if (body.stock !== undefined) {
      data.stock = (body.stock !== null && body.stock !== '') ? Number(body.stock) : 0;
    }
    if (body.format !== undefined) data.format = body.format;
    if (body.pages !== undefined) {
      data.pages = (body.pages !== null && body.pages !== '') ? Number(body.pages) : null;
    }
    if (body.publisher !== undefined) data.publisher = body.publisher?.trim() || null;
    if (body.language !== undefined) data.language = body.language?.trim() || 'Indonesia';
    if (body.publishedYear !== undefined) {
      data.publishedYear = (body.publishedYear !== null && body.publishedYear !== '')
        ? Number(body.publishedYear)
        : null;
    }
    if (body.categoryId !== undefined) data.categoryId = body.categoryId || null;
    if (body.isBestSeller !== undefined) data.isBestSeller = Boolean(body.isBestSeller);
    if (body.isNewArrival !== undefined) data.isNewArrival = Boolean(body.isNewArrival);
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);

    // If title changed, regenerate slug
    if (body.title !== undefined && body.title.trim() !== existing.title) {
      const slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-|-$)/g, '');
      const existingSlug = await db.book.findFirst({ where: { slug, NOT: { id } } });
      if (existingSlug) {
        return NextResponse.json(
          { error: 'Validation failed', details: ['A book with a similar title already exists (slug conflict)'] },
          { status: 409 }
        );
      }
      data.slug = slug;
    }

    const book = await db.book.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

// DELETE /api/admin/books/[id] — Delete a book with dependency checks
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const book = await db.book.findUnique({
      where: { id },
      include: {
        _count: { select: { orderItems: true, reviews: true, wishlists: true } },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Dependency checks
    const deps: string[] = [];
    if (book._count.orderItems > 0) {
      deps.push(`This book has ${book._count.orderItems} order item(s) associated with it`);
    }

    if (deps.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete book', details: deps },
        { status: 409 }
      );
    }

    // Delete related records first (reviews, wishlists)
    await db.review.deleteMany({ where: { bookId: id } });
    await db.wishlist.deleteMany({ where: { bookId: id } });
    await db.book.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
