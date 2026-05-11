'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { SiteHeader } from "@/components/site-header";
import { DocSidebar, UserApiRow } from "@/components/doc-sidebar";
import { StructuredDocViewer } from "@/components/structured-doc-viewer";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/services/apiClient";
import { Globe, Terminal, Layers, CheckCircle2 } from "lucide-react";

export default function UserDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // ── API list state ───────────────────────────────────────────────────
  const [assignedApis, setAssignedApis] = useState<UserApiRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // ── Selected document state ──────────────────────────────────────────
  const [activeApiId, setActiveApiId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Auth guard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === 'ADMIN') {
        router.replace("/admin");
      }
    }
  }, [authLoading, user, router]);

  // ── Fetch assigned APIs ──────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== 'USER') {
      setListLoading(false);
      return;
    }
    const load = async () => {
      setListLoading(true);
      setListError(null);
      const res = await apiClient.getUserAPIs();
      if (res.success && res.data) {
        setAssignedApis(Array.isArray(res.data) ? res.data : []);
      } else {
        setListError(res.error ?? 'Failed to load your assigned APIs');
      }
      setListLoading(false);
    };
    load();
  }, [user]);

  // ── Handle API selection ──────────────────────────────────────────────
  const handleNavigate = useCallback((id: number | 'getting-started') => {
    setSidebarOpen(false);
    if (id === 'getting-started' || typeof id !== 'number') {
      setActiveApiId(null);
      return;
    }
    setActiveApiId(id);
  }, []);

  if (authLoading || listLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  const selectedApi = assignedApis.find(a => a.id === activeApiId) ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <SiteHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onLogout={() => { logout(); router.replace('/login'); }}
        userName={user.name}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Left sidebar (API list) ──────────────────────────────────── */}
        <DocSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          apis={assignedApis}
          activeDocId={activeApiId ?? 'getting-started'}
          onNavigate={handleNavigate}
        />

        {/* ── Main content area ────────────────────────────────────────── */}
        <main className="flex-1 md:ml-64 overflow-hidden flex flex-col bg-background/50">

          {listError ? (
            <div className="p-6">
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm">{listError}</div>
            </div>

          ) : !activeApiId ? (
            /* ── Getting started ─────────────────────────────────────── */
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-10 py-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="text-left space-y-4">
                  <h1 className="text-4xl font-black text-foreground tracking-tighter italic lowercase">
                    Welcome to <span className="text-blue-500">Tylersoft-</span><span className="text-orange-500 lowercase">eclectics</span>
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed font-medium italic">
                    Explore, test, and integrate with our comprehensive suite of APIs. Select a service from the sidebar to view detailed technical documentation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-card border-2 border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Globe size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Live Documentation</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Access structured API references including endpoints, methods, and real-time parameters.
                    </p>
                  </div>

                  <div className="bg-card border-2 border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Terminal size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Code Samples</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Copy-paste ready examples for various programming languages to speed up your integration.
                    </p>
                  </div>

                  <div className="bg-card border-2 border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Layers size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Structured Data</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every document is automatically parsed into a structured format for easier navigation and reading.
                    </p>
                  </div>

                  <div className="bg-card border-2 border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Latest Updates</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Stay informed with the latest versions and changes to our API ecosystem.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                      📘
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Getting Started Tip</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Use the sidebar on the left to navigate between different API categories. Each category contains multiple endpoints and their technical specifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* ── Document viewer ───────────────────────────────────── */
            <div className="flex-1 overflow-hidden flex flex-col p-8">
              <div className="flex-1 bg-card border-2 border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                <div className="px-10 py-8 border-b-2 border-border/50 bg-background/30 shrink-0">
                  <div>
                    <h1 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">{selectedApi?.name}</h1>
                    {selectedApi?.description && (
                      <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mt-1 truncate max-w-lg italic">{selectedApi.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                  <StructuredDocViewer
                    jsonString={selectedApi?.parsedDocumentation}
                    fallbackText="Structured documentation is not yet available for this API."
                    apiId={activeApiId}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}