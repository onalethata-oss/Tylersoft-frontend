'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { User, Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-64 h-14 bg-card border-b-2 border-border flex items-center justify-between px-8 z-40 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search resources, users, or logs..."
            className="w-full bg-background border-2 border-border rounded-xl py-2 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary transition-all shadow-sm"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary bg-background border-2 border-border rounded-xl transition-all shadow-sm"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        <button className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground bg-background border-2 border-border rounded-xl transition-all shadow-sm relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card" />
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l-2 border-border/50">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black uppercase tracking-tighter italic">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{user?.role || 'SYSTEM ADMIN'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
