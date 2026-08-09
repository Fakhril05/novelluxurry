'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Book } from '@/types';

interface HeroSectionProps {
  featuredBook: Book | null;
  onExplore: () => void;
  onViewBook: (book: Book) => void;
}

export default function HeroSection({ featuredBook, onExplore, onViewBook }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-banner.png"
          alt="Luxury bookstore interior"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Text Side */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold-light">
                <Sparkles className="h-3.5 w-3.5" />
                Premium Novel Bookstore
              </div>

              <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
                Where Every
                <br />
                <span className="gold-text-gradient">Story Matters</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg text-white/70 leading-relaxed mx-auto lg:mx-0">
                Discover curated collections of the world&apos;s finest novels. From bestsellers to hidden gems, 
                find your next extraordinary read at Noveluxe.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={onExplore}
                  size="lg"
                  className="bg-gold hover:bg-gold-dark text-white h-12 px-8 text-base"
                >
                  Explore Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base"
                  onClick={onExplore}
                >
                  View Bestsellers
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
                <div>
                  <p className="text-2xl font-bold text-white">10K+</p>
                  <p className="text-sm text-white/50">Happy Readers</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-sm text-white/50">Premium Titles</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <p className="text-2xl font-bold text-white">4.9</p>
                  <p className="text-sm text-white/50 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-gold text-gold" /> Rating
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Featured Book Card */}
          {featuredBook && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex-shrink-0 hidden md:block"
            >
              <button
                onClick={() => onViewBook(featuredBook)}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 transition-all duration-300 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/10">
                  <div className="flex gap-4">
                    <div className="relative w-32 h-48 rounded-lg overflow-hidden shadow-xl shrink-0">
                      <img
                        src={featuredBook.coverImage}
                        alt={featuredBook.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-1 min-w-0">
                      <div>
                        <p className="text-xs text-gold font-medium uppercase tracking-wider">Featured</p>
                        <h3 className="mt-1 font-heading text-lg font-bold text-white leading-tight line-clamp-2">
                          {featuredBook.title}
                        </h3>
                        <p className="mt-1 text-sm text-white/60">by {featuredBook.author}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(featuredBook.rating)
                                  ? 'fill-gold text-gold'
                                  : 'text-white/20'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-white/50 ml-1">({featuredBook.reviewCount})</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-gold">
                            ${featuredBook.discountPrice?.toFixed(2) ?? featuredBook.price.toFixed(2)}
                          </span>
                          {featuredBook.discountPrice && (
                            <span className="text-sm text-white/40 line-through">
                              ${featuredBook.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
