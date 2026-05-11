'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block mb-6">
          <div className="w-16 h-16 bg-background/50 border-4 border-primary/20 border-t-primary rounded-2xl flex items-center justify-center animate-spin">
            <span className="text-primary text-xs font-black uppercase italic -rotate-12">API</span>
          </div>
        </div>
        <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
