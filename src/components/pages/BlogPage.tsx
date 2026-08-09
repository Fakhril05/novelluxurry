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
  SearchX,
  Sparkles,
  Eye,
  Link as LinkIcon,
  Twitter,
  Facebook,
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
import { toast } from 'sonner';

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

/* Gradient color palettes for category-based placeholders */
const CATEGORY_GRADIENTS: string[] = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #2d1b2e 0%, #44203a 50%, #6b2d5b 100%)',
  'linear-gradient(135deg, #1b2d1b 0%, #1e3a20 50%, #2d5a3f 100%)',
  'linear-gradient(135deg, #2e2b1b 0%, #3a3520 50%, #5a5030 100%)',
  'linear-gradient(135deg, #1b282e 0%, #20353a 50%, #30525a 100%)',
];

function getCategoryGradient(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_GRADIENTS[Math.abs(hash) % CATEGORY_GRADIENTS.length];
}

function BlogImagePlaceholder({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const initials = category
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div
      className={`flex items-center justify-center ${className ?? ''}`}
      style={{ background: getCategoryGradient(category) }}
    >
      <span className="text-4xl font-bold tracking-widest" style={{ color: `${GOLD}60` }}>
        {initials}
      </span>
    </div>
  );
}

function getBlogImageOrPlaceholder(blog: BlogPost, category: string, className?: string) {
  if (blog.image) {
    return (
      <img
        src={blog.image}
        alt={category}
        className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${className ?? ''}`}
        loading="lazy"
      />
    );
  }
  return <BlogImagePlaceholder category={category} className={className} />;
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

/* ─── Blog Card (standard grid card) ─── */

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
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#D4AF37]/8 hover:-translate-y-1"
        onClick={onView}
      >
        {/* Image / Placeholder */}
        <div className="relative aspect-[2/1] overflow-hidden">
          {getBlogImageOrPlaceholder(blog, category || 'Blog')}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Category Badge */}
          {category && (
            <Badge
              className="absolute left-4 top-4 border-0 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
                color: '#1a1a1a',
              }}
            >
              <Tag className="mr-1 h-3 w-3" />
              {category}
            </Badge>
          )}

          {/* Read Time Badge */}
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

/* ─── Featured Card (first post, spans 2 cols) ─── */

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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35 }}
      className="col-span-1 sm:col-span-2"
    >
      <Card
        className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#D4AF37]/8"
        onClick={onView}
      >
        <div className="grid md:grid-cols-2">
          {/* Image / Placeholder */}
          <div className="relative aspect-[2/1] overflow-hidden md:aspect-auto md:min-h-[320px]">
            {blog.image ? (
              <img
                src={blog.image}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
            ) : (
              <BlogImagePlaceholder
                category={category || 'Blog'}
                className="h-full w-full"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 md:bg-gradient-to-l md:from-black/30 md:to-transparent" />
            {/* Gold gradient overlay on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent pointer-events-none" />

            {/* Featured Badge - Larger with Sparkles */}
            <div className="absolute left-4 top-4">
              <div
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold tracking-widest uppercase shadow-lg shadow-[#D4AF37]/30"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK}, ${GOLD})`,
                  color: '#1a1a1a',
                }}
              >
                <Sparkles className="h-4 w-4" />
                {t('blog.featured', locale)}
              </div>
            </div>

            {/* Category Badge */}
            {category && (
              <Badge
                className="absolute bottom-4 left-4 border-0 px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', backdropFilter: 'blur(8px)' }}
              >
                <Tag className="mr-1 h-3 w-3" />
                {category}
              </Badge>
            )}
          </div>

          {/* Content */}
          <CardContent className="flex flex-col justify-center p-6 md:p-8">
            {/* Read Time Badge */}
            <div className="mb-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-[#D4AF37]/10 px-3 py-1 text-xs font-semibold" style={{ color: GOLD }}>
                <Clock className="h-3.5 w-3.5" />
                {readTime} {t('blog.readTime', locale)}
              </div>
            </div>

            <h2 className="font-heading mb-3 text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-[#D4AF37] md:text-3xl">
              {title}
            </h2>
            {excerpt && (
              <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {excerpt}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-[#D4AF37]/20">
                <AvatarFallback
                  className="text-xs font-bold"
                  style={{ backgroundColor: `${GOLD}20`, color: GOLD }}
                >
                  {authorName ? getAuthorInitials(authorName) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {authorName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <time>{formatDate(blog.createdAt, locale)}</time>
                </div>
              </div>
            </div>

            <Button
              className="mt-6 w-fit border-0 bg-[#D4AF37] font-semibold text-white shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 hover:bg-[#B8960C] hover:shadow-xl hover:shadow-[#D4AF37]/30"
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

/* ─── Empty Filter State ─── */

function EmptyFilterState({
  locale,
  selectedCategory,
  onClearFilter,
}: {
  locale: Locale;
  selectedCategory: string;
  onClearFilter: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/60">
          <SearchX className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-[#D4AF37]">
          <Tag className="h-3.5 w-3.5 text-black" />
        </div>
      </div>
      <p className="text-lg font-semibold text-foreground">
        {t('blog.noArticlesInCategory', locale)}
      </p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {t('blog.noArticlesInCategoryDesc', locale)}
      </p>
      <Button
        onClick={onClearFilter}
        variant="outline"
        className="mt-6 border-[#D4AF37]/30 font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
      >
        <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
        {t('blog.clearFilter', locale)}
      </Button>
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
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Collect all unique categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    blogs.forEach((b) => {
      const cat = getLocalizedField(b.category, b.categoryEn, locale);
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [blogs, locale]);

  // Filter blogs by category
  const filteredBlogs = useMemo(() => {
    if (selectedCategory === 'all') return blogs;
    return blogs.filter((b) => {
      const cat = getLocalizedField(b.category, b.categoryEn, locale);
      return cat === selectedCategory;
    });
  }, [blogs, selectedCategory, locale]);

  const hasMore = visibleCount < filteredBlogs.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + POSTS_PER_PAGE);
      setLoadingMore(false);
    }, 400);
  };

  const visibleBlogs = useMemo(
    () => filteredBlogs.slice(0, visibleCount),
    [filteredBlogs, visibleCount]
  );

  const featuredBlog = visibleBlogs[0];
  const restBlogs = visibleBlogs.slice(1);

  const isFiltered = selectedCategory !== 'all';

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
          {/* Gold top decorative bar */}
          <div className="h-[3px] w-full rounded-full mb-8" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, #F5E6A3, #D4AF37, transparent)' }} />

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

            {/* Meta: Author + Date + Read Time — gold-bordered card */}
            <div className="mt-6 rounded-xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/[0.03] to-transparent p-5">
              <div className="flex flex-wrap items-center gap-4">
                {detailAuthorName && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F5E6A3] to-[#B8960C] opacity-60 blur-[1px]" />
                      <Avatar className="relative h-12 w-12 ring-2 ring-[#D4AF37]/30">
                        <AvatarFallback
                          className="text-sm font-bold"
                          style={{
                            backgroundColor: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
                            color: '#1a1a1a',
                          }}
                        >
                          {getAuthorInitials(detailAuthorName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {detailAuthorName}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <time>{formatDate(currentBlog.createdAt, locale)}</time>
                      </div>
                    </div>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold" style={{ color: GOLD }}>
                    <Clock className="h-3.5 w-3.5" />
                    {detailReadTime} {t('blog.readTime', locale)}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    {Math.floor(Math.random() * 500 + 100)} {locale === 'id' ? 'kunjungan' : 'views'}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 overflow-hidden rounded-2xl"
            >
              {currentBlog.image ? (
                <img
                  src={currentBlog.image}
                  alt={detailTitle}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <BlogImagePlaceholder
                  category={detailCategory || 'Blog'}
                  className="aspect-[2/1] w-full"
                />
              )}
            </motion.div>

            {/* Content - Premium typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="prose prose-lg mt-8 max-w-none dark:prose-invert
                prose-headings:font-heading prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                prose-p:leading-[1.85] prose-p:text-muted-foreground prose-p:tracking-wide
                prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-ul:my-4 prose-ol:my-4
                prose-li:text-muted-foreground prose-li:leading-relaxed
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

            {/* Share Buttons Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-10 flex items-center gap-3"
            >
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {locale === 'id' ? 'Bagikan' : 'Share'}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(locale === 'id' ? 'Tautan disalin!' : 'Link copied!');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background transition-all duration-200 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:shadow-md hover:shadow-[#D4AF37]/10"
                aria-label="Copy link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(detailTitle)}`, '_blank');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background transition-all duration-200 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:shadow-md hover:shadow-[#D4AF37]/10"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background transition-all duration-200 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:shadow-md hover:shadow-[#D4AF37]/10"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </button>
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
                  .map((related, idx) => {
                    const relCategory = getLocalizedField(
                      related.category,
                      related.categoryEn,
                      locale
                    );
                    return (
                      <motion.div
                        key={related.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="group cursor-pointer"
                        onClick={() =>
                          setPage('blog-detail', { slug: related.slug })
                        }
                      >
                        <Card className="overflow-hidden border-border/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#D4AF37]/5">
                          <div className="relative aspect-[2/1] overflow-hidden">
                            {related.image ? (
                              <img
                                src={related.image}
                                alt={getLocalizedField(
                                  related.title,
                                  related.titleEn,
                                  locale
                                )}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <BlogImagePlaceholder
                                category={relCategory || 'Blog'}
                                className="h-full w-full"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            {relCategory && (
                              <Badge
                                className="absolute left-3 top-3 border-0 px-2 py-0.5 text-[10px] font-semibold uppercase"
                                style={{
                                  backgroundColor: GOLD,
                                  color: '#1a1a1a',
                                }}
                              >
                                {relCategory}
                              </Badge>
                            )}
                            {/* Read time on card */}
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                              <Clock className="h-2.5 w-2.5" />
                              {estimateReadTime(
                                getLocalizedField(
                                  related.content,
                                  related.contentEn,
                                  locale
                                )
                              )}{" "}
                              {t('blog.readTime', locale)}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <time>
                                {formatDate(related.createdAt, locale)}
                              </time>
                            </div>
                            <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug transition-colors group-hover:text-[#D4AF37]">
                              {getLocalizedField(
                                related.title,
                                related.titleEn,
                                locale
                              )}
                            </h3>
                            <div className="mt-3 flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback
                                  className="text-[8px] font-bold"
                                  style={{
                                    backgroundColor: `${GOLD}15`,
                                    color: GOLD,
                                  }}
                                >
                                  {related.author
                                    ? getAuthorInitials(related.author)
                                    : '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] text-muted-foreground">
                                {related.author}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.section>
          )}

          {/* Back to Blog Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 border-t border-[#D4AF37]/10 pt-8"
          >
            <Button
              variant="outline"
              onClick={() => setPage('blog')}
              className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all duration-200"
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
              <BookOpen className="h-8 w-8" style={{ color: GOLD }} />
            </div>
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

      {/* Category Filter Pills */}
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          <button
            onClick={() => { setSelectedCategory('all'); setVisibleCount(POSTS_PER_PAGE); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              selectedCategory === 'all'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm shadow-[#D4AF37]/25'
                : 'bg-background text-muted-foreground border-border hover:border-[#D4AF37]/40 hover:text-foreground'
            }`}
          >
            {t('blog.allCategories', locale)}
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setVisibleCount(POSTS_PER_PAGE); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                selectedCategory === cat
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm shadow-[#D4AF37]/25'
                  : 'bg-background text-muted-foreground border-border hover:border-[#D4AF37]/40 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Blog Grid */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <>
            <div className="mb-6 sm:col-span-2">
              <BlogCardSkeleton />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : filteredBlogs.length === 0 ? (
          isFiltered ? (
            <EmptyFilterState
              locale={locale}
              selectedCategory={selectedCategory}
              onClearFilter={() => {
                setSelectedCategory('all');
                setVisibleCount(POSTS_PER_PAGE);
              }}
            />
          ) : (
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
          )
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <AnimatePresence mode="popLayout">
                {/* Featured Card for the first post - spans 2 cols */}
                {featuredBlog && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <FeaturedCard
                      blog={featuredBlog}
                      locale={locale}
                      onView={() =>
                        setPage('blog-detail', { slug: featuredBlog.slug })
                      }
                    />
                  </div>
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

            {/* Load More Button - Gold themed */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-12 flex justify-center"
              >
                <Button
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="min-w-[220px] border-0 bg-[#D4AF37] font-semibold text-black shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 hover:bg-[#B8960C] hover:shadow-xl hover:shadow-[#D4AF37]/30"
                >
                  {loadingMore ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="mr-2 h-4 w-4" />
                  )}
                  {t('blog.loadMore', locale)}
                  {!loadingMore && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
