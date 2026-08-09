'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { locale } = useAppStore();

  useEffect(() => {
    const consent = localStorage.getItem('noveluxe-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('noveluxe-cookie-consent', 'accepted');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 80, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/15"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10">
              <Cookie className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading text-sm font-semibold mb-1">
                {locale === 'id' ? 'Nikmati Pengalaman Terbaik' : 'Enjoy the Best Experience'}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === 'id'
                  ? 'Kami menggunakan cookie untuk memberikan pengalaman browsing yang personal dan menganalisis traffic. Dengan melanjutkan, Anda menyetujui kebijakan cookie kami.'
                  : 'We use cookies to provide a personalized browsing experience and analyze traffic. By continuing, you agree to our cookie policy.'}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Button onClick={accept} size="sm" className="h-8 bg-[#D4AF37] hover:bg-[#B8960C] text-white text-xs font-medium px-4">
                  {locale === 'id' ? 'Terima Semua' : 'Accept All'}
                </Button>
                <button onClick={accept} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2">
                  {locale === 'id' ? 'Hanya yang diperlukan' : 'Essential only'}
                </button>
              </div>
            </div>
            <button onClick={accept} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors -mt-1 -mr-1">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
