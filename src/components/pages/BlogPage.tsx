'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  Tag,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t, type Locale } from '@/lib/i18n';

const GOLD = '#D4AF37';
const GOLD_DARK = '#B8960C';
const POSTS_PER_PAGE = 3;

interface BlogPost {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  excerpt: string | null;
  excerptEn: string | null;
  content: string | null;
  contentEn: string | null;
  category: string | null;
  categoryEn: string | null;
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

function estimateReadTime(content: string | null): number {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function formatDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getLocalizedField<T extends string | null>(
  idValue: T,
  enValue: T,
  locale: Locale
): T {
  if (locale === 'en' && enValue) return enValue;
  return idValue;
}

function getAuthorInitials(author: string): string {
  return author
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const FALLBACK_IMAGES: Record<string, string> = {
  'novel-indonesia-terbaik-2024': 'https://picsum.photos/seed/blog-indonesia-novels/800/400',
  'panduan-memilih-genre-novel': 'https://picsum.photos/seed/blog-genre-guide/800/400',
  'tips-kebiasaan-membaca': 'https://picsum.photos/seed/blog-reading-habit/800/400',
  'sejarah-novel-indonesia': 'https://picsum.photos/seed/blog-history-novel/800/400',
  'review-5-novel-viral': 'https://picsum.photos/seed/blog-viral-novels/800/400',
  'novel-dan-empati': 'https://picsum.photos/seed/blog-empathy-reading/800/400',
};

function getBlogImage(blog: BlogPost): string {
  if (blog.image) return blog.image;
  return (
    FALLBACK_IMAGES[blog.slug] ||
    `https://picsum.photos/seed/${blog.slug}/800/400`
  );
}

/* ─── Skeletons ─── */

function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50">
      <Skeleton className="aspect-[2/1] w-full" />
      <CardContent className="p-5">
        <Skeleton className="mb-3 h-5 w-20" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="mb-2 h-6 w-4/5" />
        <Skeleton className="mb-4 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <Skeleton className="h-3.5 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function BlogDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="aspect-[2/1] w-full rounded-2xl" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-3/4" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

/* ─── Blog Card ─── */

function BlogCard({
  blog,
  locale,
  onView,
}: {
  blog: BlogPost;
  locale: Locale;
  onView: () => void;
}) {
  const title = getLocalizedField(blog.title, blog.titleEn, locale);
  const excerpt = getLocalizedField(blog.excerpt, blog.excerptEn, locale);
  const category = getLocalizedField(blog.category, blog.categoryEn, locale);
  const image = getBlogImage(blog);
  const readTime = estimateReadTime(
    getLocalizedField(blog.content, blog.contentEn, locale)
  );
  const authorName = blog.author || '';

  return (
    <motion.div
      variants={fadeInUp}
      layout
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Card
        className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D4AF37]/5"
        onClick={onView}
      >
        {/* Image */}
        <div className="relative aspect-[2/1] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Category Badge */}
          {category && (
            <Badge
              className="absolute left-4 top-4 border-0 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase"
              style={{
                backgroundColor: GOLD,
                color: '#1a1a1a',
              }}
            >
              <Tag className="mr-1 h-3 w-3" />
              {category}
            </Badge>
          )}

          {/* Read Time Overlay */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {readTime} {t('blog.readTime', locale)}
          </div>
        </div>

        <CardContent className="p-5">
          {/* Title */}
          <h3 className="font-heading mb-2 line-clamp-2 text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-[#D4AF37]">
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
          )}

          <Separator className="mb-4 opacity-50" />

          {/* Footer: Author + Date + Read More */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback
                  className="text-[10px] font-bold"
                  style={{ backgroundColor: `${GOLD}20`, color: GOLD }}
                >
                  {authorName ? getAuthorInitials(authorName) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {authorName}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {formatDate(blog.createdAt, locale)}
                </p>
              </div>
            </div>

            <span
              className="flex flex-shrink-0 items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2"
              style={{ color: GOLD }}
            >
              {t('blog.readMore', locale)}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Featured Card (first post) ─── */

function FeaturedCard({
  blog,
  locale,
  onView,
}: {
  blog: BlogPost;
  locale: Locale;
  onView: () => void;
}) {
  const title = getLocalizedField(blog.title, blog.titleEn, locale);
  const excerpt = getLocalizedField(blog.excerpt, blog.excerptEn, locale);
  const category = getLocalizedField(blog.category, blog.categoryEn, locale);
  const image = getBlogImage(blog);
  const readTime = estimateReadTime(
    getLocalizedField(blog.content, blog.contentEn, locale)
  );
  const authorName = blog.author || '';

  return (
    <motion.div variants={fadeInUp} layout initial="hidden" animate="visible">
      <Card
        className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D4AF37]/5"
        onClick={onView}
      >
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[2/1] overflow-hidden md:aspect-auto md:min-h-[320px]">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 md:bg-gradient-to-l md:from-black/30 md:to-transparent" />
            {category && (
              <Badge
                className="absolute left-4 top-4 border-0 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase"
                style={{ backgroundColor: GOLD, color: '#1a1a1a' }}
              >
                <Tag className="mr-1 h-3 w-3" />
                {category}
              </Badge>
            )}
          </div>

          {/* Content */}
          <CardContent className="flex flex-col justify-center p-6 md:p-8">
            <h2 className="font-heading mb-3 text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-[#D4AF37] md:text-3xl">
              {title}
            </h2>
            {excerpt && (
              <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {excerpt}
              </p>
            )}

            <div className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback
                  className="text-xs font-bold"
                  style={{ backgroundColor: `${GOLD}20`, color: GOLD }}
                >
                  {authorName ? getAuthorInitials(authorName) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {authorName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(blog.createdAt, locale)}
                  <span>·</span>
                  <Clock className="h-3 w-3" />
                  {readTime} {t('blog.readTime', locale)}
                </div>
              </div>
            </div>

            <Button
              className="mt-6 w-fit border-0 bg-[#D4AF37] font-semibold text-white hover:bg-[#B8960C]"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              {t('blog.readMore', locale)}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

/* ─── Main Component ─── */

export default function BlogPage() {
  const { locale, pageParams, setPage } = useAppStore();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [currentBlog, setCurrentBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const slug = pageParams.slug as string | undefined;

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await fetch('/api/blogs');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || data);
        setTotal(data.total ?? data.length ?? 0);
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

  const hasMore = visibleCount < blogs.length;

  const handleLoadMore = () => {
 setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + POSTS_PER_PAGE);
      setLoadingMore(false);
    }, 400);
  };

  const visibleBlogs = useMemo(
    () => blogs.slice(0, visibleCount),
    [blogs, visibleCount]
  );

  const featuredBlog = visibleBlogs[0];
  const restBlogs = visibleBlogs.slice(1);

  // ─── Blog Detail View ───

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
              {t('blog.articleNotFound', locale)}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t('blog.articleNotAvailable', locale)}
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

    const detailTitle = getLocalizedField(
      currentBlog.title,
      currentBlog.titleEn,
      locale
    );
    const detailContent = getLocalizedField(
      currentBlog.content,
      currentBlog.contentEn,
      locale
    );
    const detailCategory = getLocalizedField(
      currentBlog.category,
      currentBlog.categoryEn,
      locale
    );
    const detailImage = getBlogImage(currentBlog);
    const detailReadTime = estimateReadTime(detailContent);
    const detailAuthorName = currentBlog.author || '';

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
                    {detailTitle}
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
            {/* Category Badge */}
            {detailCategory && (
              <Badge
                className="mb-4 border-0 px-3 py-1 text-xs font-semibold tracking-wide uppercase"
                style={{ backgroundColor: GOLD, color: '#1a1a1a' }}
              >
                <Tag className="mr-1 h-3 w-3" />
                {detailCategory}
              </Badge>
            )}

            {/* Title */}
            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]">
              {detailTitle}
            </h1>

            {/* Meta: Author + Date + Read Time */}
            <div className="mt-5 flex flex-wrap items-center gap-4">
              {detailAuthorName && (
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className="text-xs font-bold"
                      style={{
                        backgroundColor: `${GOLD}20`,
                        color: GOLD,
                      }}
                    >
                      {getAuthorInitials(detailAuthorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {detailAuthorName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(currentBlog.createdAt, locale)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {detailReadTime} {t('blog.readTime', locale)}
              </div>
            </div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 overflow-hidden rounded-2xl"
            >
              <img
                src={detailImage}
                alt={detailTitle}
                className="h-auto w-full object-cover"
              />
            </motion.div>

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
              {detailContent ? (
                <div dangerouslySetInnerHTML={{ __html: detailContent }} />
              ) : (
                <p className="text-muted-foreground">
                  {t('blog.contentNotAvailable', locale)}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Related Articles */}
          {blogs.filter((b) => b.id !== currentBlog.id).length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12 border-t border-border/50 pt-10"
            >
              <h2 className="mb-6 font-heading text-2xl font-bold">
                {t('blog.relatedArticles', locale)}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {blogs
                  .filter((b) => b.id !== currentBlog.id)
                  .slice(0, 3)
                  .map((related) => (
                    <motion.div
                      key={related.id}
                      whileHover={{ y: -4 }}
                      className="group cursor-pointer"
                      onClick={() =>
                        setPage('blog-detail', { slug: related.slug })
                      }
                    >
                      <Card className="overflow-hidden border-border/50 transition-shadow duration-300 group-hover:shadow-lg">
                        <div className="relative aspect-[2/1] overflow-hidden">
                          <img
                            src={getBlogImage(related)}
                            alt={
                              getLocalizedField(
                                related.title,
                                related.titleEn,
                                locale
                              )
                            }
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          {getLocalizedField(
                            related.category,
                            related.categoryEn,
                            locale
                          ) && (
                            <Badge
                              className="absolute left-3 top-3 border-0 px-2 py-0.5 text-[10px] font-semibold uppercase"
                              style={{
                                backgroundColor: GOLD,
                                color: '#1a1a1a',
                              }}
                            >
                              {getLocalizedField(
                                related.category,
                                related.categoryEn,
                                locale
                              )}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <time>
                              {formatDate(related.createdAt, locale)}
                            </time>
                            <span className="mx-0.5">·</span>
                            <Clock className="h-3 w-3" />
                            <span>
                              {estimateReadTime(
                                getLocalizedField(
                                  related.content,
                                  related.contentEn,
                                  locale
                                )
                              )}{' '}
                              {t('blog.readTime', locale)}
                            </span>
                          </div>
                          <h3 className="line-clamp-2 font-heading text-sm font-bold transition-colors group-hover:text-[#D4AF37]">
                            {getLocalizedField(
                              related.title,
                              related.titleEn,
                              locale
                            )}
                          </h3>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </motion.section>
          )}

          {/* Back to Blog Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 border-t border-border/50 pt-8"
          >
            <Button
              variant="outline"
              onClick={() => setPage('blog')}
              className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              {t('blog.backToBlog', locale)}
            </Button>
          </motion.div>
        </article>
      </main>
    );
  }

  // ─── Blog Grid View ───
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/50 py-16 md:py-24">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${GOLD} 1px, transparent 0)`,
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
            <BookOpen className="mx-auto h-12 w-12" style={{ color: GOLD }} />
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
            {t('blog.subtitle', locale)}
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
          <>
            <div className="mb-6">
              <BlogCardSkeleton />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : blogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 text-center"
          >
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              {t('blog.noArticles', locale)}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <AnimatePresence mode="popLayout">
                {/* Featured Card for the first post */}
                {featuredBlog && (
                  <FeaturedCard
                    blog={featuredBlog}
                    locale={locale}
                    onView={() =>
                      setPage('blog-detail', { slug: featuredBlog.slug })
                    }
                  />
                )}

                {/* Grid of remaining posts */}
                {restBlogs.length > 0 && (
                  <motion.div variants={fadeInUp}>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {restBlogs.map((blog) => (
                        <BlogCard
                          key={blog.id}
                          blog={blog}
                          locale={locale}
                          onView={() =>
                            setPage('blog-detail', { slug: blog.slug })
                          }
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-12 flex justify-center"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="min-w-[200px] border-[#D4AF37]/30 font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                >
                  {loadingMore ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t('blog.loadMore', locale)}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
