'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Gift,
  AlertTriangle,
  LogIn,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface NotificationItem {
  id: string;
  type: 'book' | 'gift' | 'alert';
  titleKey: string;
  descKey: string;
  timeMinutesAgo: number;
  read: boolean;
}

function generateNotifications(): NotificationItem[] {
  return [
    {
      id: 'n1',
      type: 'book',
      titleKey: 'notif.newBooksInGenre',
      descKey: 'notif.newBooksDesc',
      timeMinutesAgo: 120,
      read: false,
    },
    {
      id: 'n2',
      type: 'gift',
      titleKey: 'notif.voucherExpiring',
      descKey: 'notif.voucherExpiringDesc',
      timeMinutesAgo: 1440,
      read: false,
    },
    {
      id: 'n3',
      type: 'alert',
      titleKey: 'notif.completeProfile',
      descKey: 'notif.completeProfileDesc',
      timeMinutesAgo: 4320,
      read: false,
    },
    {
      id: 'n4',
      type: 'gift',
      titleKey: 'notif.flashSaleEnds',
      descKey: 'notif.flashSaleDesc',
      timeMinutesAgo: 30,
      read: false,
    },
    {
      id: 'n5',
      type: 'book',
      titleKey: 'notif.newBooksInGenre',
      descKey: 'notif.newBooksDesc',
      timeMinutesAgo: 10080,
      read: true,
    },
  ];
}

const iconMap = {
  book: BookOpen,
  gift: Gift,
  alert: AlertTriangle,
};

const iconBgMap = {
  book: 'bg-[#D4AF37]/15',
  gift: 'bg-emerald-500/10',
  alert: 'bg-amber-500/10',
};

const iconColorMap = {
  book: 'text-[#D4AF37]',
  gift: 'text-emerald-500',
  alert: 'text-amber-500',
};

const iconBgReadMap = {
  book: 'bg-muted',
  gift: 'bg-muted',
  alert: 'bg-muted',
};

const iconColorReadMap = {
  book: 'text-muted-foreground',
  gift: 'text-muted-foreground',
  alert: 'text-muted-foreground',
};

function formatRelativeTime(minutesAgo: number, locale: 'id' | 'en'): string {
  if (minutesAgo < 1) return locale === 'id' ? 'baru saja' : 'just now';
  if (minutesAgo < 60) {
    const m = Math.floor(minutesAgo);
    return locale === 'id' ? `${m} menit lalu` : `${m}m ago`;
  }
  if (minutesAgo < 1440) {
    const h = Math.floor(minutesAgo / 60);
    return locale === 'id' ? `${h} jam lalu` : `${h}h ago`;
  }
  const d = Math.floor(minutesAgo / 1440);
  return locale === 'id' ? `${d} hari lalu` : `${d}d ago`;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const base = generateNotifications();
    try {
      const stored = localStorage.getItem('noveluxe-notif-read');
      if (stored) {
        const readIds: string[] = JSON.parse(stored);
        return base.map((n) => ({ ...n, read: readIds.includes(n.id) }));
      }
    } catch { /* ignore */ }
    return base;
  });
  const ref = useRef<HTMLDivElement>(null);
  const { locale, isAuthenticated, setPage } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const saveReadState = (updated: NotificationItem[]) => {
    const readIds = updated.filter((n) => n.read).map((n) => n.id);
    try {
      localStorage.setItem('noveluxe-notif-read', JSON.stringify(readIds));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveReadState(updated);
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveReadState(updated);
      return updated;
    });
  };

  // Sort: unread first, then by time
  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return a.timeMinutesAgo - b.timeMinutesAgo;
      }),
    [notifications]
  );

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] ${
          isOpen ? 'text-[#D4AF37]' : ''
        }`}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl border border-border bg-background shadow-xl shadow-black/10 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-foreground">
                  {t('notif.title', locale)}
                </h3>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:text-[#B8960C] transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  {t('notif.markAllRead', locale)}
                </button>
              )}
            </div>

            <ScrollArea className="max-h-80">
              {!isAuthenticated ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 mb-4">
                    <LogIn className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {t('notif.loginPrompt', locale)}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {t('notif.loginPromptDesc', locale)}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      setPage('login');
                    }}
                    className="bg-[#D4AF37] hover:bg-[#B8960C] text-white text-xs font-semibold rounded-lg"
                  >
                    {t('auth.login', locale)}
                  </Button>
                </div>
              ) : sortedNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {t('notif.noNotifications', locale)}
                  </p>
                </div>
              ) : (
                <div>
                  {sortedNotifications.map((n, idx) => {
                    const Icon = iconMap[n.type];
                    return (
                      <div key={n.id}>
                        {idx > 0 && <Separator className="opacity-50" />}
                        <button
                          onClick={() => markAsRead(n.id)}
                          className={`flex items-start gap-3 w-full p-3.5 text-left transition-colors duration-150 ${
                            !n.read
                              ? 'bg-[#D4AF37]/[0.04] hover:bg-[#D4AF37]/[0.08]'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              !n.read
                                ? iconBgMap[n.type]
                                : iconBgReadMap[n.type]
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${
                                !n.read
                                  ? iconColorMap[n.type]
                                  : iconColorReadMap[n.type]
                              }`}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm leading-snug ${
                                  !n.read
                                    ? 'font-semibold text-foreground'
                                    : 'font-medium text-muted-foreground'
                                }`}
                              >
                                {t(n.titleKey, locale)}
                              </p>
                              {!n.read && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37] ring-2 ring-[#D4AF37]/20" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                              {t(n.descKey, locale)}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium">
                              {formatRelativeTime(n.timeMinutesAgo, locale)}
                            </p>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {isAuthenticated && sortedNotifications.length > 0 && (
              <div className="border-t border-border px-4 py-2.5 bg-gradient-to-r from-transparent to-[#D4AF37]/5">
                <p className="text-[10px] text-center text-muted-foreground/50 font-medium">
                  {locale === 'id'
                    ? `${unreadCount} belum dibaca`
                    : `${unreadCount} unread`}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
