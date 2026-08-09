import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/categories/[id] — Update a category with validation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check category exists
    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validation
    const errors: string[] = [];
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        errors.push('Name is required');
      }
    }
    if (body.slug !== undefined) {
      if (typeof body.slug !== 'string' || body.slug.trim().length === 0) {
        errors.push('Slug is required');
      } else {
        const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
        const existingSlug = await db.category.findFirst({ where: { slug, NOT: { id } } });
        if (existingSlug) {
          errors.push('A category with this slug already exists');
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    // Build update data
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.nameEn !== undefined) data.nameEn = body.nameEn?.trim() || null;
    if (body.slug !== undefined) {
      data.slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.image !== undefined) data.image = body.image?.trim() || null;

    const category = await db.category.update({
      where: { id },
      data,
      include: { _count: { select: { books: true } } },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] — Delete a category with dependency checks
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Dependency check: books in this category
    if (category._count.books > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category',
          details: [`This category has ${category._count.books} book(s). Please reassign or delete them first.`],
        },
        { status: 409 }
      );
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
