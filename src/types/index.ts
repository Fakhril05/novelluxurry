export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorBio: string | null;
  isbn: string | null;
  synopsis: string | null;
  coverImage: string;
  galleryImages: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  format: string;
  pages: number | null;
  publisher: string | null;
  language: string;
  publishedYear: number | null;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { books: number };
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}
