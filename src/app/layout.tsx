import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Noveluxe - Premium Novel Bookstore',
  description: 'Temukan koleksi novel premium terlengkap dengan harga terbaik. Toko buku digital modern dengan pengalaman belanja eksklusif.',
  keywords: ['novel', 'buku', 'toko buku', 'bookstore', 'novel Indonesia', 'bestseller', 'premium'],
  authors: [{ name: 'Noveluxe' }],
  icons: {
    icon: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=64&h=64&fit=crop',
  },
  openGraph: {
    title: 'Noveluxe - Premium Novel Bookstore',
    description: 'Koleksi novel premium terlengkap dengan pengalaman belanja eksklusif.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
