'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  User,
  ArrowRight,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  author: string | null;
  createdAt: string;
  updatedAt: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <CardContent className="p-5">
        <Skeleton className="mb-3 h-4 w-28" />
        <Skeleton className="mb-2 h-5 w-full" />
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-4 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

function BlogDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function BlogPage() {
  const { locale, pageParams, setPage } = useAppStore();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [currentBlog, setCurrentBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const slug = pageParams.slug;

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await fetch('/api/blogs');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (slug) {
      setDetailLoading(true);
      async function fetchBlog() {
        try {
          const res = await fetch(`/api/blogs/${slug}`);
          if (res.ok) {
            const data = await res.json();
            setCurrentBlog(data);
          } else {
            setCurrentBlog(null);
          }
        } catch {
          setCurrentBlog(null);
        } finally {
          setDetailLoading(false);
        }
      }
      fetchBlog();
    } else {
      setCurrentBlog(null);
    }
  }, [slug]);

  // Blog Detail View
  if (slug) {
    if (detailLoading) {
      return (
        <main className="min-h-screen">
          <div className="mx-auto max-w-3xl px-4 pt-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setPage('home')}
                    className="cursor-pointer hover:text-[#D4AF37]"
                  >
                    {t('nav.home', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setPage('blog')}
                    className="cursor-pointer hover:text-[#D4AF37]"
                  >
                    {t('nav.blog', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <Skeleton className="h-4 w-40" />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mx-auto max-w-3xl px-4 py-8">
            <BlogDetailSkeleton />
          </div>
        </main>
      );
    }

    if (!currentBlog) {
      return (
        <main className="min-h-screen">
          <div className="mx-auto max-w-3xl px-4 pt-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setPage('home')}
                    className="cursor-pointer hover:text-[#D4AF37]"
                  >
                    {t('nav.home', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setPage('blog')}
                    className="cursor-pointer hover:text-[#D4AF37]"
                  >
                    {t('nav.blog', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mx-auto max-w-3xl px-4 py-24 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
            <h2 className="font-heading text-2xl font-bold">
              {locale === 'id' ? 'Artikel tidak ditemukan' : 'Article not found'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {locale === 'id'
                ? 'Artikel yang kamu cari tidak tersedia'
                : 'The article you are looking for is not available'}
            </p>
            <Button
              onClick={() => setPage('blog')}
              className="mt-6 bg-[#D4AF37] text-white hover:bg-[#B8960C]"
            >
              {t('general.back', locale)}
            </Button>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setPage('home')}
                    className="cursor-pointer hover:text-[#D4AF37]"
                  >
                    {t('nav.home', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setPage('blog')}
                    className="cursor-pointer hover:text-[#D4AF37]"
                  >
                    {t('nav.blog', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    {currentBlog.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        </div>

        {/* Blog Detail Content */}
        <article className="mx-auto max-w-3xl px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title */}
            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              {currentBlog.title}
            </h1>

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {currentBlog.author && (
                <div className="flex items-center gap-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <User className="h-3.5 w-3.5 text-[#D4AF37]" />
                  </div>
                  <span className="font-medium text-foreground">
                    {currentBlog.author}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(currentBlog.createdAt, locale)}</span>
              </div>
            </div>

            {/* Featured Image */}
            {currentBlog.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-8 overflow-hidden rounded-2xl"
              >
                <img
                  src={currentBlog.image}
                  alt={currentBlog.title}
                  className="h-auto w-full object-cover"
                />
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="prose prose-lg mt-8 max-w-none dark:prose-invert
                prose-headings:font-heading prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                prose-p:leading-relaxed prose-p:text-muted-foreground
                prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-ul:my-4 prose-ol:my-4
                prose-li:text-muted-foreground
                prose-blockquote:border-l-[#D4AF37] prose-blockquote:italic
                prose-img:rounded-xl
                prose-hr:border-[#D4AF37]/20"
            >
              {currentBlog.content ? (
                <div dangerouslySetInnerHTML={{ __html: currentBlog.content }} />
              ) : (
                <p className="text-muted-foreground">
                  {locale === 'id'
                    ? 'Konten artikel belum tersedia.'
                    : 'Article content is not available.'}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Back to Blog Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 border-t pt-8"
          >
            <Button
              variant="outline"
              onClick={() => setPage('blog')}
              className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              {locale === 'id' ? 'Kembali ke Blog' : 'Back to Blog'}
            </Button>
          </motion.div>
        </article>
      </main>
    );
  }

  // Blog Grid View
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/50 py-16 md:py-24">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative mx-auto max-w-6xl px-4 text-center"
        >
          <motion.div variants={fadeInUp} className="mb-4">
            <BookOpen className="mx-auto h-12 w-12 text-[#D4AF37]" />
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="font-heading text-4xl font-bold tracking-tight md:text-5xl"
          >
            {t('nav.blog', locale)}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-lg text-muted-foreground"
          >
            {locale === 'id'
              ? 'Artikel, tips, dan inspirasi seputar dunia novel'
              : 'Articles, tips, and inspiration about the world of novels'}
          </motion.p>
        </motion.div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => setPage('home')}
                className="cursor-pointer hover:text-[#D4AF37]"
              >
                {t('nav.home', locale)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{t('nav.blog', locale)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Blog Grid */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 text-center"
          >
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              {locale === 'id'
                ? 'Belum ada artikel'
                : 'No articles yet'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {blogs.map((blog) => (
                <motion.div
                  key={blog.id}
                  variants={fadeInUp}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Card
                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    onClick={() =>
                      setPage('blog-detail', { slug: blog.slug })
                    }
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {blog.image ? (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5">
                          <BookOpen className="h-12 w-12 text-[#D4AF37]/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    <CardContent className="p-5">
                      {/* Date */}
                      <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <time>{formatDate(blog.createdAt, locale)}</time>
                      </div>

                      {/* Title */}
                      <h3 className="font-heading mb-2 line-clamp-2 text-lg font-bold leading-snug transition-colors group-hover:text-[#D4AF37]">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      {blog.excerpt && (
                        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {blog.excerpt}
                        </p>
                      )}

                      {/* Read More */}
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[#D4AF37] transition-all group-hover:gap-2">
                        {locale === 'id' ? 'Baca Selengkapnya' : 'Read More'}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </main>
  );
}
