'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Mail, MapPin, Phone, Instagram, Twitter, Music2, Youtube, ArrowRight, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const socialLinks = [
  { Icon: Instagram, label: 'Instagram', href: '#' },
  { Icon: Twitter, label: 'Twitter', href: '#' },
  { Icon: Music2, label: 'TikTok', href: '#' },
  { Icon: Youtube, label: 'YouTube', href: '#' },
];

export default function Footer() {
  const { locale, setPage } = useAppStore();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScroll = useCallback(() => {
    setShowBackToTop(window.scrollY > 400);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    if (email) {
      toast.success(locale === 'id' ? 'Selamat datang di Noveluxe!' : 'Welcome to Noveluxe!', {
        description: locale === 'id'
          ? 'Anda telah berlangganan newsletter kami.'
          : 'You have been subscribed to our newsletter.'
      });
      e.currentTarget.reset();
    }
  };

  return (
    <>
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`
          fixed bottom-20 right-6 z-30
          flex h-10 w-10 items-center justify-center rounded-full
          bg-gradient-to-br from-[#D4AF37] to-[#B8960C]
          text-white shadow-lg shadow-[#D4AF37]/20
          hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:scale-110
          active:scale-95
          transition-all duration-300 ease-out
          ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}
        `}
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <footer className="bg-[#111111] text-white mt-auto">
        {/* Subtle gold gradient line at the very top of footer */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

        {/* Newsletter Section */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-md">
                <h3 className="font-heading text-2xl md:text-3xl font-bold">
                  {t('newsletter.title', locale).split(' ').slice(0, -1).join(' ')}{' '}
                  <span className="text-[#E8D48B]">{t('newsletter.title', locale).split(' ').pop()}</span>
                </h3>
                <p className="mt-2 text-white/50 text-sm leading-relaxed">
                  {t('newsletter.subtitle', locale)}
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder={t('newsletter.placeholder', locale)}
                  className="h-11 w-full md:w-72 bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50"
                />
                <Button
                  type="submit"
                  className="
                    h-11 px-6 shrink-0 font-medium relative overflow-hidden
                    bg-gradient-to-r from-[#D4AF37] via-[#E8D48B] to-[#D4AF37]
                    bg-[length:200%_100%]
                    text-white
                    hover:from-[#B8960C] hover:via-[#D4AF37] hover:to-[#B8960C]
                    hover:bg-[length:200%_100%]
                    hover:shadow-lg hover:shadow-[#D4AF37]/25
                    active:shadow-md
                    transition-all duration-500 ease-out
                  "
                >
                  {t('newsletter.button', locale)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Brand & Social */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4AF37] text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-heading text-xl font-bold">
                  Novel<span className="text-[#D4AF37]">uxe</span>
                </span>
              </div>
              <p className="mt-4 text-sm text-white/40 leading-relaxed">
                {locale === 'id'
                  ? 'Destinasi premium untuk novel terbaik. Dikurasi dengan penuh cinta, dikirimkan dengan penuh perhatian.'
                  : 'Your premium destination for the finest novels. Curated with passion, delivered with care.'}
              </p>
              {/* Social Media Links */}
              <div className="flex items-center gap-2.5 mt-6">
                {socialLinks.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="
                      flex h-9 w-9 items-center justify-center rounded-full
                      bg-white/5 border border-white/10
                      text-white/50
                      hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] hover:scale-110
                      transition-all duration-300
                    "
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-[#D4AF37] mb-5">
                {locale === 'id' ? 'Tautan Cepat' : 'Quick Links'}
              </h4>
              <ul className="space-y-3">
                {[
                  { label: locale === 'id' ? 'Semua Buku' : 'All Books', page: 'catalog' as const },
                  { label: locale === 'id' ? 'Kategori' : 'Categories', page: 'categories' as const },
                  { label: locale === 'id' ? 'Blog' : 'Blog', page: 'blog' as const },
                  { label: 'FAQ', page: 'faq' as const },
                ].map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => setPage(item.page)}
                      className="text-sm text-white/40 hover:text-[#D4AF37] transition-all duration-300"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-[#D4AF37] mb-5">
                {locale === 'id' ? 'Layanan Pelanggan' : 'Customer Service'}
              </h4>
              <ul className="space-y-3">
                {[
                  locale === 'id' ? 'Info Pengiriman' : 'Shipping Info',
                  locale === 'id' ? 'Pengembalian' : 'Returns & Exchanges',
                  locale === 'id' ? 'Hubungi Kami' : 'Contact Us',
                  locale === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions',
                  locale === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy',
                ].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-white/40 hover:text-[#D4AF37] transition-all duration-300 cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-[#D4AF37] mb-5">
                {t('footer.contact', locale)}
              </h4>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-2.5 text-sm text-white/40">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#D4AF37]/60" />
                  <span>Jl. Sastra No. 123, Jakarta Selatan, 12190</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-white/40">
                  <Phone className="h-4 w-4 shrink-0 text-[#D4AF37]/60" />
                  <span>+62 21 1234 5678</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-white/40">
                  <Mail className="h-4 w-4 shrink-0 text-[#D4AF37]/60" />
                  <span>hello@noveluxe.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="border-t border-[#D4AF37]/10 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/30">
                &copy; 2024 Noveluxe. {t('footer.rights', locale)}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors cursor-pointer">
                  {t('footer.terms', locale)}
                </span>
                <span className="text-xs text-white/30 hover:text-[#D4AF37] transition-colors cursor-pointer">
                  {t('footer.privacy', locale)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
