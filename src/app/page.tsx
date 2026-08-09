'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import HomePage from '@/components/home/HomePage';
import CatalogPage from '@/components/pages/CatalogPage';
import BookDetailPage from '@/components/pages/BookDetailPage';
import CheckoutPage from '@/components/pages/CheckoutPage';
import AuthPages from '@/components/pages/AuthPages';
import UserDashboard from '@/components/pages/UserDashboard';
import AdminDashboard from '@/components/pages/AdminDashboard';
import FAQPage from '@/components/pages/FAQPage';
import BlogPage from '@/components/pages/BlogPage';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function MainApp() {
  const { page } = useAppStore();

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
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />\n      <CartDrawer />
    </div>
  );
}
