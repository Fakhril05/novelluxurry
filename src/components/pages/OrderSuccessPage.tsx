'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Package, Clock, Truck, MapPin, ArrowRight, ShoppingBag, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#E8D48B';
const GOLD_DARK = '#B8960C';

// Confetti particle data
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotateEnd: number;
  xEnd: number;
  yEnd: number;
}

const CONFETTI_COLORS = [GOLD, GOLD_LIGHT, GOLD_DARK, '#FFF8DC', '#F5E6A3', '#C5A028'];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 40 + Math.random() * 20, // center around 50%
    y: 30 + Math.random() * 10, // start from center-ish
    size: 4 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 2,
    rotateEnd: 180 + Math.random() * 720,
    xEnd: (Math.random() - 0.5) * 120,
    yEnd: -(20 + Math.random() * 80),
  }));
}

export default function OrderSuccessPage() {
  const { locale, pageParams, setPage } = useAppStore();
  const lang = locale as Locale;
  const orderNumber = pageParams?.orderNumber || '';

  const particles = useMemo(() => generateParticles(40), []);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    { key: 'orderSuccess.steps.placed', icon: CheckCircle2, active: true, done: true },
    { key: 'orderSuccess.steps.processing', icon: Package, active: false, done: false },
    { key: 'orderSuccess.steps.shipped', icon: Truck, active: false, done: false },
    { key: 'orderSuccess.steps.delivered', icon: MapPin, active: false, done: false },
  ];

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size * 0.6,
              backgroundColor: p.color,
            }}
            initial={{ opacity: 1, scale: 0, rotate: 0, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.8],
              rotate: p.rotateEnd,
              x: p.xEnd,
              y: p.yEnd,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}15, transparent 70%)` }}
      />

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-20 w-full max-w-lg mx-auto"
          >
            <Card className="border-0 shadow-2xl shadow-black/5 overflow-hidden">
              {/* Gold top accent bar */}
              <div
                className="h-1.5 w-full"
                style={{ background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }}
              />

              <CardContent className="p-6 sm:p-10 flex flex-col items-center text-center">
                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="relative mb-6"
                >
                  <div
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD}20, ${GOLD}05)`,
                      border: `3px solid ${GOLD}`,
                    }}
                  >
                    <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14" style={{ color: GOLD }} strokeWidth={1.5} />
                  </div>
                  {/* Outer pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${GOLD}40` }}
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 1.5, delay: 0.5, repeat: 2, repeatDelay: 0.5 }}
                  />
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
                  style={{ color: GOLD_DARK }}
                >
                  {t('orderSuccess.title', lang)}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground text-sm sm:text-base mb-8 max-w-sm"
                >
                  {t('orderSuccess.subtitle', lang)}
                </motion.p>

                {/* Order number card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full rounded-xl p-4 sm:p-5 mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD}08, ${GOLD}03)`,
                    border: `1px solid ${GOLD}25`,
                  }}
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Package className="w-5 h-5" style={{ color: GOLD }} />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t('orderSuccess.orderNumber', lang)}
                    </span>
                  </div>
                  <p
                    className="text-xl sm:text-2xl font-bold tracking-widest font-mono"
                    style={{ color: GOLD_DARK }}
                  >
                    {orderNumber || '—'}
                  </p>
                </motion.div>

                {/* Email confirmation */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
                >
                  <Mail className="w-4 h-4" style={{ color: GOLD }} />
                  <span>{t('orderSuccess.emailConfirm', lang)}</span>
                </motion.div>

                <Separator className="mb-8" style={{ backgroundColor: `${GOLD}20` }} />

                {/* Estimated delivery */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-3 mb-8 px-4 py-3 rounded-lg"
                  style={{ background: `${GOLD}08` }}
                >
                  <Clock className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
                  <div className="text-left">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                      {t('orderSuccess.estimatedDelivery', lang)}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: GOLD_DARK }}>
                      {t('orderSuccess.businessDays', lang)}
                    </p>
                  </div>
                </motion.div>

                {/* Order timeline tracker */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="w-full mb-8"
                >
                  <div className="flex items-center justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
                    <div
                      className="absolute top-5 left-5 h-0.5"
                      style={{
                        width: '0%',
                        background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
                      }}
                    />

                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="relative flex flex-col items-center z-10 flex-1">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + index * 0.15, type: 'spring', stiffness: 260, damping: 20 }}
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors ${
                              step.active || step.done
                                ? 'text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                            style={
                              step.active || step.done
                                ? { background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})` }
                                : undefined
                            }
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </motion.div>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 + index * 0.15 }}
                            className={`text-[10px] sm:text-xs mt-2 font-medium text-center leading-tight ${
                              step.active ? '' : 'text-muted-foreground'
                            }`}
                            style={step.active ? { color: GOLD_DARK } : undefined}
                          >
                            {t(step.key, lang)}
                          </motion.span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="w-full flex flex-col sm:flex-row gap-3"
                >
                  <Button
                    onClick={() => setPage('order-tracking', { orderNumber })}
                    className="flex-1 gap-2 text-white font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`,
                    }}
                    size="lg"
                  >
                    <Truck className="w-4 h-4" />
                    {t('orderSuccess.trackOrder', lang)}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage('catalog')}
                    className="flex-1 gap-2 font-semibold"
                    style={{
                      borderColor: `${GOLD}40`,
                      color: GOLD_DARK,
                    }}
                    size="lg"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {t('orderSuccess.continueShopping', lang)}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
