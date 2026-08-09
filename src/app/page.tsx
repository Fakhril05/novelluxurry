'use client';

import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

const MainApp = dynamic(() => import('@/components/MainApp'), { ssr: false });

export default function Page() {
  return <MainApp />;
}
