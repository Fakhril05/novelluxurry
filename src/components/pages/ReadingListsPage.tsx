'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library,
  Plus,
  Trash2,
  Eye,
  Pencil,
  Check,
  X,
  Search,
  ArrowLeft,
  BookPlus,
  ImageOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import BookCard from '@/components/BookCard';
import type { Book } from '@/types';
import { toast } from 'sonner';

export default function ReadingListsPage() {
  const {
    locale,
    readingLists,
    createReadingList,
    deleteReadingList,
    renameReadingList,
    addBookToReadingList,
    removeBookFromReadingList,
    setPage,
  } = useAppStore();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewingListId, setViewingListId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerLoading, setPickerLoading] = useState(false);
  const [booksMap, setBooksMap] = useState<Record<string, Book>>({});
  const [booksLoading, setBooksLoading] = useState(true);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Fetch all books for covers and expanded view
  const fetchBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      const res = await fetch('/api/books?limit=50');
      const data = await res.json();
      const books: Book[] = data.books || [];
      const map: Record<string, Book> = {};
      books.forEach((b) => { map[b.id] = b; });
      setBooksMap(map);
      setAllBooks(books);
    } catch {
      setBooksMap({});
      setAllBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Focus rename input when renaming
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Book picker search
  useEffect(() => {
    if (!bookPickerOpen) return;
    if (pickerSearch.trim()) {
      setPickerLoading(true);
      const timeout = setTimeout(async () => {
        try {
          const res = await fetch(`/api/books?search=${encodeURIComponent(pickerSearch)}&limit=30`);
          const data = await res.json();
          setAllBooks(data.books || []);
        } catch { /* keep existing */ }
        setPickerLoading(false);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      fetchBooks();
    }
  }, [pickerSearch, bookPickerOpen, fetchBooks]);

  const viewingList = viewingListId
    ? readingLists.find((l) => l.id === viewingListId)
    : null;

  const viewingListBooks = viewingList
    ? viewingList.bookIds
        .map((id) => booksMap[id])
        .filter((b): b is Book => !!b)
    : [];

  const handleCreate = () => {
    const name = newListName.trim();
    if (!name) {
      toast.error(t('readingLists.nameRequired', locale));
      return;
    }
    createReadingList(name);
    setNewListName('');
    setCreateDialogOpen(false);
    toast.success(t('readingLists.listCreated', locale));
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteReadingList(deleteTarget);
      if (viewingListId === deleteTarget) setViewingListId(null);
      setDeleteTarget(null);
      toast.success(t('readingLists.listDeleted', locale));
    }
  };

  const handleRename = (id: string) => {
    const name = renameValue.trim();
    if (!name) return;
    renameReadingList(id, name);
    setRenamingId(null);
    setRenameValue('');
    toast.success(t('readingLists.listRenamed', locale));
  };

  const handleAddBook = (bookId: string, bookTitle: string) => {
    if (!viewingList) return;
    if (viewingList.bookIds.includes(bookId)) {
      toast.info(t('readingLists.alreadyInList', locale), {
        description: bookTitle,
      });
      return;
    }
    addBookToReadingList(viewingList.id, bookId);
    toast.success(t('readingLists.addedToList', locale), {
      description: bookTitle,
    });
  };

  const handleRemoveBook = (bookId: string, bookTitle: string) => {
    if (!viewingList) return;
    removeBookFromReadingList(viewingList.id, bookId);
    toast.success(t('readingLists.removedFromList', locale), {
      description: bookTitle,
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredPickerBooks = pickerSearch.trim()
    ? allBooks
    : allBooks;

  // --- Expanded list view ---
  if (viewingList) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }}>
                    {t('nav.home', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); setViewingListId(null); }}>
                    {t('readingLists.title', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{viewingList.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewingListId(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors"
                  aria-label={t('general.back', locale)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                    {viewingList.name}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {viewingList.bookIds.length} {t('readingLists.bookCount', locale)} · {t('readingLists.createdAt', locale)} {formatDate(viewingList.createdAt)}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setBookPickerOpen(true)}
                className="bg-[#D4AF37] hover:bg-[#B8960C] text-white rounded-full px-5 shadow-lg shadow-[#D4AF37]/25 hover:shadow-xl hover:shadow-[#D4AF37]/30 transition-all duration-300 group"
              >
                <BookPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                {t('readingLists.addBook', locale)}
              </Button>
            </div>

            <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          </motion.div>

          {/* Loading */}
          {booksLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-3 w-1/2 mx-auto" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Empty books in list */}
          {!booksLoading && viewingListBooks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16 sm:py-24"
            >
              <div className="relative mb-8">
                <div className="absolute -inset-8 rounded-full bg-[#D4AF37]/5 animate-pulse" />
                <div className="absolute -inset-4 rounded-full bg-[#D4AF37]/10" />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/20 border border-[#D4AF37]/20">
                  <Library className="h-14 w-14 text-[#D4AF37]/40" />
                </div>
              </div>
              <h2 className="font-heading text-xl font-bold mb-2">
                {t('readingLists.noBooks', locale)}
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                {t('readingLists.noBooksDesc', locale)}
              </p>
              <Button
                onClick={() => setBookPickerOpen(true)}
                className="bg-[#D4AF37] hover:bg-[#B8960C] text-white rounded-full px-6 shadow-lg shadow-[#D4AF37]/25 transition-all duration-300 group"
              >
                <BookPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                {t('readingLists.addBook', locale)}
              </Button>
            </motion.div>
          )}

          {/* Books Grid */}
          {!booksLoading && viewingListBooks.length > 0 && (
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
              >
                {viewingListBooks.map((book, index) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="relative group"
                  >
                    <BookCard book={book} index={index} />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.04 }}
                      className="absolute top-3 right-3 z-20"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBook(book.id, book.title);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm text-muted-foreground shadow-md hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110"
                        aria-label={t('readingLists.removeBook', locale)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Book Picker Dialog */}
        <Dialog open={bookPickerOpen} onOpenChange={setBookPickerOpen}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <BookPlus className="h-5 w-5 text-[#D4AF37]" />
                {t('readingLists.bookPicker', locale)}
              </DialogTitle>
              <DialogDescription>
                {viewingList.name}
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder={t('readingLists.searchBooks', locale)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1 px-6 pb-4 max-h-[50vh]">
              {pickerLoading ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-9 rounded" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPickerBooks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('readingLists.noResults', locale)}
                </p>
              ) : (
                <div className="space-y-1 py-2">
                  {filteredPickerBooks.map((book) => {
                    const inList = viewingList.bookIds.includes(book.id);
                    return (
                      <button
                        key={book.id}
                        onClick={() => handleAddBook(book.id, book.title)}
                        disabled={inList}
                        className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-colors ${
                          inList
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-secondary'
                        }`}
                      >
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-12 w-9 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="flex h-12 w-9 items-center justify-center rounded bg-muted flex-shrink-0">
                            <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                        </div>
                        {inList ? (
                          <Badge variant="secondary" className="text-xs shrink-0">✓</Badge>
                        ) : (
                          <Plus className="h-4 w-4 text-[#D4AF37] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- All lists view ---
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }}>
                  {t('nav.home', locale)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('readingLists.title', locale)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8960C] text-white shadow-lg shadow-[#D4AF37]/25">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                  {t('readingLists.title', locale)}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('readingLists.subtitle', locale)}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-[#D4AF37] hover:bg-[#B8960C] text-white rounded-full px-5 shadow-lg shadow-[#D4AF37]/25 hover:shadow-xl hover:shadow-[#D4AF37]/30 transition-all duration-300 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('readingLists.create', locale)}
            </Button>
          </div>

          <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
        </motion.div>

        {/* Empty state */}
        {readingLists.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24"
          >
            <div className="relative mb-8">
              <div className="absolute -inset-8 rounded-full bg-[#D4AF37]/5 animate-pulse" />
              <div className="absolute -inset-4 rounded-full bg-[#D4AF37]/10" />
              <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/20 border border-[#D4AF37]/20">
                <Library className="h-14 w-14 sm:h-16 sm:w-16 text-[#D4AF37]/40" />
              </div>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-2 text-center">
              {t('readingLists.empty', locale)}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
              {t('readingLists.emptyDesc', locale)}
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#B8960C] text-white rounded-full px-8 shadow-lg shadow-[#D4AF37]/25 hover:shadow-xl hover:shadow-[#D4AF37]/30 transition-all duration-300 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('readingLists.createFirst', locale)}
            </Button>
          </motion.div>
        )}

        {/* List cards grid */}
        {readingLists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {readingLists.map((list, index) => {
                const coverBooks = list.bookIds
                  .slice(0, 3)
                  .map((id) => booksMap[id])
                  .filter((b): b is Book => !!b && b.coverImage);

                return (
                  <motion.div
                    key={list.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative rounded-2xl border border-border bg-card p-5 hover:shadow-lg hover:shadow-[#D4AF37]/5 hover:border-[#D4AF37]/20 transition-all duration-300"
                  >
                    {/* Top row: name + actions */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      {renamingId === list.id ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(list.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            className="h-8 text-sm"
                          />
                          <button
                            onClick={() => handleRename(list.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors flex-shrink-0"
                            aria-label={t('general.save', locale)}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setRenamingId(null); setRenameValue(''); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
                            aria-label={t('general.cancel', locale)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-lg truncate">{list.name}</h3>
                      )}

                      {renamingId !== list.id && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => { setRenamingId(list.id); setRenameValue(list.name); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            aria-label={t('readingLists.rename', locale)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(list.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            aria-label={t('readingLists.delete', locale)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stacked book covers */}
                    {coverBooks.length > 0 && (
                      <div className="relative h-36 mb-4 flex items-end justify-center">
                        {coverBooks.map((book, i) => (
                          <img
                            key={book.id}
                            src={book.coverImage}
                            alt={book.title}
                            className="absolute bottom-0 rounded-lg shadow-md object-cover transition-transform duration-300 group-hover:-translate-y-1"
                            style={{
                              width: '80px',
                              height: '120px',
                              left: `calc(50% + ${i * 28 - (coverBooks.length - 1) * 14}px - 40px)`,
                              zIndex: i,
                              opacity: 1 - i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Footer row: count + date + view */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/15 border-0 text-xs font-semibold"
                          >
                            {list.bookIds.length} {t('readingLists.bookCount', locale)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('readingLists.createdAt', locale)} {formatDate(list.createdAt)}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingListId(list.id)}
                        className="rounded-full border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        {t('readingLists.viewList', locale)}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Create List Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#D4AF37]" />
              {t('readingLists.create', locale)}
            </DialogTitle>
            <DialogDescription>
              {t('readingLists.subtitle', locale)}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            placeholder={t('readingLists.createPlaceholder', locale)}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t('general.cancel', locale)}
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-[#D4AF37] hover:bg-[#B8960C] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('readingLists.create', locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              {t('readingLists.delete', locale)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('readingLists.deleteConfirm', locale)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>{t('general.cancel', locale)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('readingLists.delete', locale)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
