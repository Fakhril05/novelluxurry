import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/categories — Fetch all categories with book counts
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { books: true } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories — Create a new category with validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const errors: string[] = [];
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Name is required');
    }
    if (!body.slug || typeof body.slug !== 'string' || body.slug.trim().length === 0) {
      errors.push('Slug is required');
    } else {
      const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
      const existingSlug = await db.category.findUnique({ where: { slug } });
      if (existingSlug) {
        errors.push('A category with this slug already exists');
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/(^-|-$)/g, '');

    const category = await db.category.create({
      data: {
        name: body.name.trim(),
        nameEn: body.nameEn?.trim() || null,
        slug,
        description: body.description?.trim() || null,
        image: body.image?.trim() || null,
      },
      include: { _count: { select: { books: true } } },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
