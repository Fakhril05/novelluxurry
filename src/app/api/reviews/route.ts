import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, rating, comment, userId } = body;

    // Validate required fields
    if (!bookId || !userId || !rating) {
      return NextResponse.json(
        { error: 'bookId, rating, and userId are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment if provided
    if (comment && (typeof comment !== 'string' || comment.trim().length > 1000)) {
      return NextResponse.json(
        { error: 'Comment must be at most 1000 characters' },
        { status: 400 }
      );
    }

    // Verify book exists
    const book = await db.book.findUnique({
      where: { id: bookId },
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
        { status: 404 }
      );
    }

    // Create review and update book rating in a transaction
    const review = await db.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          bookId,
          userId,
          rating,
          comment: comment.trim(),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Calculate new average rating
      const allReviews = await tx.review.findMany({
        where: { bookId },
        select: { rating: true },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalRating / allReviews.length) * 10) / 10;
      const reviewCount = allReviews.length;

      // Update book's rating and review count
      await tx.book.update({
        where: { id: bookId },
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
          rating: review.rating,
          comment: review.comment,
          userId: review.userId,
          userName: review.user.name || review.user.email,
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
