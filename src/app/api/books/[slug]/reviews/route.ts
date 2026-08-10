import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { userId, rating, comment, title } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment (required, 10-1000 chars)
    if (!comment || typeof comment !== 'string' || comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'Comment is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (comment.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be at most 1000 characters' },
        { status: 400 }
      );
    }

    // Validate title if provided (5-200 chars)
    if (title !== undefined && title !== null && title !== '') {
      if (typeof title !== 'string' || title.trim().length < 5 || title.trim().length > 200) {
        return NextResponse.json(
          { error: 'Title must be between 5 and 200 characters' },
          { status: 400 }
        );
      }
    }

    // Verify book exists
    const book = await db.book.findUnique({
      where: { slug },
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Check if user already reviewed this book
    const existingReview = await db.review.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: book.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this book', alreadyReviewed: true, review: existingReview },
        { status: 409 }
      );
    }

    // Create review and update book rating in a transaction
    const review = await db.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          bookId: book.id,
          userId,
          rating,
          comment: comment.trim(),
          title: title?.trim() || null,
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true, email: true },
          },
        },
      });

      // Calculate new average rating
      const allReviews = await tx.review.findMany({
        where: { bookId: book.id },
        select: { rating: true },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalRating / allReviews.length) * 10) / 10;
      const reviewCount = allReviews.length;

      // Update book's rating and review count
      await tx.book.update({
        where: { id: book.id },
        data: {
          rating: avgRating,
          reviewCount,
        },
      });

      return newReview;
    });

    return NextResponse.json(
      {
        success: true,
        review: {
          id: review.id,
          title: review.title,
          rating: review.rating,
          comment: review.comment,
          userId: review.userId,
          user: {
            id: review.user.id,
            name: review.user.name,
            avatar: review.user.avatar,
          },
          createdAt: review.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
