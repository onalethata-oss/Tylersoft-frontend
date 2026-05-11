'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Sidebar />
      <Header />
      <main className="ml-64 mt-14 p-0 min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>
    </div>
  );
}
