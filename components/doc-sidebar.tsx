import { X, Book, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UserApiRow {
  id: number;
  name: string;
  description?: string;
  endpointUrl?: string;
  documentation?: string;
  parsedDocumentation?: string;
}

interface DocSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  apis: UserApiRow[];
  activeDocId: number | 'getting-started' | null;
  onNavigate: (id: number | 'getting-started') => void;
}

export function DocSidebar({ isOpen, onClose, apis, activeDocId, onNavigate }: DocSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        "fixed top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] bg-card dark:bg-slate-900 border-r-2 border-border dark:border-slate-800 transition-transform duration-200 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
          <span className="font-semibold text-foreground">Documentation</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-1.5 mb-8">
            <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 px-2">Overview</div>
            <button
              onClick={() => onNavigate('getting-started')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all",
                activeDocId === 'getting-started' 
                  ? "bg-primary text-white shadow-lg shadow-primary/30 border-2 border-primary" 
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground border-2 border-transparent"
              )}
            >
              <Book size={16} />
              Getting Started
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 px-2">My Assigned APIs</div>
            {apis.length === 0 ? (
              <div className="px-4 py-2 text-xs text-muted-foreground/60 font-bold italic uppercase tracking-widest">No APIs assigned yet.</div>
            ) : (
              apis.map(api => (
                <button
                  key={api.id}
                  onClick={() => onNavigate(api.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all text-left group",
                    activeDocId === api.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/30 border-2 border-primary" 
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground border-2 border-transparent"
                  )}
                >
                  <Package size={16} className={activeDocId === api.id ? "text-white" : "text-muted-foreground/60 group-hover:text-foreground"} />
                  <span className="truncate">{api.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
