'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, Tag, Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface Notification {
  id: string;
  icon: 'package' | 'tag' | 'gift';
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: 'gift', title: 'Selamat Datang!', titleEn: 'Welcome!', desc: 'Dapatkan diskon 10% dengan kode WELCOME10', descEn: 'Get 10% off with code WELCOME10', time: '2m', read: false },
  { id: '2', icon: 'tag', title: 'Flash Sale!', titleEn: 'Flash Sale!', desc: 'Diskon hingga 30% untuk semua novel bestseller', descEn: 'Up to 30% off all bestselling novels', time: '1h', read: false },
  { id: '3', icon: 'package', title: 'Pengiriman Cepat', titleEn: 'Fast Delivery', desc: 'Gratis ongkir untuk pembelian di atas Rp200.000', descEn: 'Free shipping for orders over Rp200,000', time: '3h', read: true },
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);
  const { locale } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const iconMap = { package: Package, tag: Tag, gift: Gift };

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className={`relative h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] ${isOpen ? 'text-[#D4AF37]' : ''}`} aria-label="Notifications">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unreadCount}</span>}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl border border-border bg-background shadow-xl shadow-black/10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">{locale === 'id' ? 'Notifikasi' : 'Notifications'}</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-[#D4AF37] hover:text-[#B8960C] transition-colors">
                  {locale === 'id' ? 'Tandai semua dibaca' : 'Mark all read'}
                </button>
              )}
            </div>
            <ScrollArea className="max-h-72">
              {notifications.map((n, i) => {
                const Icon = iconMap[n.icon];
                return (
                  <button key={n.id} onClick={() => setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))} className={`flex items-start gap-3 w-full p-3.5 text-left hover:bg-secondary/50 transition-colors ${!n.read ? 'bg-[#D4AF37]/5' : ''}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${!n.read ? 'bg-[#D4AF37]/15' : 'bg-muted'}`}>
                      <Icon className={`h-4 w-4 ${!n.read ? 'text-[#D4AF37]' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{locale === 'en' ? n.titleEn : n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{locale === 'en' ? n.descEn : n.desc}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time} ago</p>
                    </div>
                    {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />}
                  </button>
                );
              })}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
