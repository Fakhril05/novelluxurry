'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import LiveChat from '@/components/LiveChat';
import ScrollToTop from '@/components/ScrollToTop';
import CookieConsent from '@/components/CookieConsent';
import HomePage from '@/components/home/HomePage';
import CatalogPage from '@/components/pages/CatalogPage';
import BookDetailPage from '@/components/pages/BookDetailPage';
import CheckoutPage from '@/components/pages/CheckoutPage';
import AuthPages from '@/components/pages/AuthPages';
import UserDashboard from '@/components/pages/UserDashboard';
import AdminDashboard from '@/components/pages/AdminDashboard';
import FAQPage from '@/components/pages/FAQPage';
import BlogPage from '@/components/pages/BlogPage';
import OrderTrackingPage from '@/components/pages/OrderTrackingPage';
import WishlistPage from '@/components/pages/WishlistPage';

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.995 },
};

export default function MainApp() {
  const { page } = useAppStore();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (page !== 'book-detail') {
      setScrollProgress(0);
    } else {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(1, scrollTop / docHeight));
      }
    }
    setShowFloatingChat(true);
  }, [page]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to top when page changes
  const prevPageRef = useRef(page);
  useEffect(() => {
    if (prevPageRef.current !== page) {
      prevPageRef.current = page;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [page]);

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage />;
      case 'catalog': return <CatalogPage />;
      case 'book-detail': return <BookDetailPage />;
      case 'checkout': return <CheckoutPage />;
      case 'login':
      case 'register': return <AuthPages />;
      case 'dashboard': return <UserDashboard />;
      case 'admin': return <AdminDashboard />;
      case 'faq': return <FAQPage />;
      case 'blog':
      case 'blog-detail': return <BlogPage />;
      case 'categories': return <CatalogPage />;
      case 'order-tracking': return <OrderTrackingPage />;
      case 'wishlist': return <WishlistPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div
        className="scroll-progress-bar fixed top-16 md:top-20 left-0 right-0 h-[3px] z-[60]"
        style={{
          width: page === 'book-detail' ? `${scrollProgress * 100}%` : '0%',
          background: 'linear-gradient(to right, #D4AF37, #E8D48B, #D4AF37)',
          opacity: scrollProgress > 0 ? 1 : 0,
          transition: scrollProgress === 0 ? 'opacity 0.3s' : 'width 0.1s linear',
        }}
        aria-hidden="true"
      />
      <main ref={mainRef} className="flex-1 pt-16 md:pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer />
      <LiveChat />
      <ScrollToTop />
      <CookieConsent />
      <AnimatePresence>
        {showFloatingChat && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-live-chat'))}
            className="chat-float-btn fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30 hover:bg-[#B8960C] transition-colors"
            aria-label="Quick Chat"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
