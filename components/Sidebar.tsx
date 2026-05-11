'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { LogOut, LayoutDashboard, Plug, PlusCircle, Tag, Users, KeyRound, ShieldCheck, Activity } from 'lucide-react';
import Image from 'next/image';

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: '',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    title: 'API Management',
    items: [
      { id: 'apis', label: 'All APIs', href: '/admin/apis', icon: <Plug size={16} /> },
      { id: 'addapi', label: 'Add New API', href: '/admin/apis/new', icon: <PlusCircle size={16} /> },
      { id: 'assign-apis', label: 'Assign API', href: '/admin/assign-apis', icon: <Tag size={16} /> },
      { id: 'audit-logs', label: 'Audit Logs', href: '/admin/audit', icon: <Activity size={16} /> },
    ],
  },
  {
    title: 'User Management',
    items: [
      { id: 'users', label: 'User Management', href: '/admin/users', icon: <Users size={16} />, adminOnly: true },
    ],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isAdmin = user?.role === 'ADMIN';
  const initials = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r-2 border-border flex flex-col overflow-hidden transition-colors duration-300">
      {/* Logo */}
      <div className="p-3 border-b border-border/50 flex-shrink-0 bg-background/50 flex justify-center items-center">
        <Image
          src="/tylersoft-full-logo.png"
          alt="Tylersoft Technologies"
          width={110}
          height={35}
          priority
          className="h-auto w-auto max-w-full"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || isAdmin
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title || 'main'}>
              {section.title && (
                <p className="text-xs font-black text-muted-foreground/60 uppercase mb-4 tracking-[0.2em] px-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all text-base font-semibold ${isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 border-2 border-primary'
                        : 'text-muted-foreground hover:bg-background/80 hover:text-foreground border-2 border-transparent'
                        }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-muted-foreground/60'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 bg-background border-t-2 border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-card hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 rounded-2xl transition-all font-black border-2 border-border hover:border-rose-500/20 text-xs uppercase tracking-widest italic"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}