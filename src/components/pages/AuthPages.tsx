'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPages() {
  const page = useAppStore((s) => s.page);
  const locale = useAppStore((s) => s.locale);
  const setUser = useAppStore((s) => s.setUser);
  const setPage = useAppStore((s) => s.setPage);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background subtle gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(212,175,55,0.06) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(212,175,55,0.04) 0%, transparent 50%), linear-gradient(180deg, var(--background) 0%, var(--background) 100%)',
        }}
      />
      {/* Decorative subtle pattern */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {page === 'login' ? (
        <LoginPage
          locale={locale}
          setPage={setPage}
          setUser={setUser}
        />
      ) : page === 'register' ? (
        <RegisterPage
          locale={locale}
          setPage={setPage}
          setUser={setUser}
        />
      ) : null}
    </main>
  );
}

/* ---------- LOGIN ---------- */

interface AuthPageProps {
  locale: 'id' | 'en';
  setPage: (page: 'home' | 'login' | 'register', params?: Record<string, string>) => void;
  setUser: (user: import('@/lib/store').User | null) => void;
}

function LoginPage({ locale, setPage, setUser }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        toast.success(locale === 'id' ? 'Berhasil masuk!' : 'Login successful!');
        setPage('home');
      } else {
        toast.error(data.error || (locale === 'id' ? 'Email atau password salah' : 'Invalid email or password'));
      }
    } catch {
      toast.error(locale === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 pb-2 pt-8 text-center">
          {/* Book icon with gold background */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-md"
            style={{ backgroundColor: '#D4AF37' }}
          >
            <BookOpen className="h-8 w-8 text-white" />
          </div>

          <div className="space-y-1.5">
            <CardTitle className="font-heading text-2xl">
              {locale === 'id' ? 'Masuk ke Noveluxe' : 'Sign In to Noveluxe'}
            </CardTitle>
            <CardDescription>
              {locale === 'id'
                ? 'Selamat datang kembali. Masuk untuk melanjutkan.'
                : 'Welcome back. Sign in to continue.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email">
                {t('auth.email', locale)}
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">
                  {t('auth.password', locale)}
                </Label>
                <button
                  type="button"
                  className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: '#D4AF37' }}
                  onClick={() => toast('Coming soon')}
                >
                  {t('auth.forgotPassword', locale)}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="h-11 w-full font-semibold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: '#D4AF37' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  {t('general.loading', locale)}
                </span>
              ) : (
                t('auth.login', locale)
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              {t('auth.orLogin', locale)}
            </span>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-3 transition-colors"
            onClick={() => toast('Coming soon')}
          >
            {/* Simple colored G SVG */}
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t('auth.google', locale)}
          </Button>

          {/* Link to register */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.noAccount', locale)}{' '}
            <button
              type="button"
              className="font-semibold transition-colors hover:underline"
              style={{ color: '#D4AF37' }}
              onClick={() => setPage('register')}
            >
              {t('auth.register', locale)}
            </button>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ---------- REGISTER ---------- */

function RegisterPage({ locale, setPage, setUser }: AuthPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(
        locale === 'id' ? 'Password tidak cocok' : 'Passwords do not match'
      );
      return;
    }

    if (!agreedTerms) {
      toast.error(
        locale === 'id'
          ? 'Anda harus menyetujui syarat dan ketentuan'
          : 'You must agree to the terms and conditions'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        toast.success(
          locale === 'id'
            ? 'Akun berhasil dibuat!'
            : 'Account created successfully!'
        );
        setPage('home');
      } else {
        toast.error(
          data.error ||
            (locale === 'id'
              ? 'Gagal membuat akun'
              : 'Failed to create account')
        );
      }
    } catch {
      toast.error(locale === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 pb-2 pt-8 text-center">
          {/* Book icon with gold background */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-md"
            style={{ backgroundColor: '#D4AF37' }}
          >
            <BookOpen className="h-8 w-8 text-white" />
          </div>

          <div className="space-y-1.5">
            <CardTitle className="font-heading text-2xl">
              {locale === 'id' ? 'Buat Akun Baru' : 'Create New Account'}
            </CardTitle>
            <CardDescription>
              {locale === 'id'
                ? 'Bergabunglah dengan komunitas pembaca Noveluxe.'
                : 'Join the Noveluxe reader community.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="register-name">
                {t('auth.name', locale)}
              </Label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-name"
                  type="text"
                  placeholder={
                    locale === 'id' ? 'Nama lengkap' : 'Full name'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="register-email">
                {t('auth.email', locale)}
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="register-password">
                {t('auth.password', locale)}
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="register-confirm">
                {locale === 'id'
                  ? 'Konfirmasi Password'
                  : 'Confirm Password'}
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={
                    showConfirm ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="terms"
                checked={agreedTerms}
                onCheckedChange={(checked) =>
                  setAgreedTerms(checked === true)
                }
                className="mt-0.5"
                style={
                  agreedTerms
                    ? { backgroundColor: '#D4AF37', borderColor: '#D4AF37' }
                    : undefined
                }
              />
              <Label
                htmlFor="terms"
                className="cursor-pointer text-sm leading-snug text-muted-foreground"
              >
                {locale === 'id' ? (
                  <>
                    Saya setuju dengan{' '}
                    <span
                      className="font-medium hover:underline"
                      style={{ color: '#D4AF37' }}
                    >
                      Syarat &amp; Ketentuan
                    </span>{' '}
                    dan{' '}
                    <span
                      className="font-medium hover:underline"
                      style={{ color: '#D4AF37' }}
                    >
                      Kebijakan Privasi
                    </span>{' '}
                    Noveluxe.
                  </>
                ) : (
                  <>
                    I agree to the{' '}
                    <span
                      className="font-medium hover:underline"
                      style={{ color: '#D4AF37' }}
                    >
                      Terms &amp; Conditions
                    </span>{' '}
                    and{' '}
                    <span
                      className="font-medium hover:underline"
                      style={{ color: '#D4AF37' }}
                    >
                      Privacy Policy
                    </span>{' '}
                    of Noveluxe.
                  </>
                )}
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="h-11 w-full font-semibold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: '#D4AF37' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  {t('general.loading', locale)}
                </span>
              ) : (
                t('auth.register', locale)
              )}
            </Button>
          </form>

          {/* Link to login */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.hasAccount', locale)}{' '}
            <button
              type="button"
              className="font-semibold transition-colors hover:underline"
              style={{ color: '#D4AF37' }}
              onClick={() => setPage('login')}
            >
              {t('auth.login', locale)}
            </button>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
