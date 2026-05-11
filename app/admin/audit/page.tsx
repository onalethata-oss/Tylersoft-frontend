'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/services/apiClient';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Activity, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  User, 
  Box, 
  Info,
  ShieldAlert,
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const formatDateFull = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  } catch { return dateStr; }
};

const auditColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'performedAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-gray-400 hover:text-white px-0"
      >
        Timestamp
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium">
        <Clock size={12} className="text-blue-500" />
        {formatDateFull(row.original.performedAt)}
      </div>
    ),
  },
  {
    accessorKey: 'actorEmail',
    header: 'Actor',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
          <User size={14} className="text-blue-400" />
        </div>
        <span className="truncate max-w-[150px]">{row.original.actorEmail}</span>
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const action = row.original.action || '';
      let color = "bg-blue-500/10 text-blue-400 border-blue-500/20";
      if (action.includes("DELETE")) color = "bg-red-500/10 text-red-400 border-red-500/20";
      if (action.includes("CREATE") || action.includes("UPLOAD")) color = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      if (action.includes("UPDATE") || action.includes("TOGGLE")) color = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      
      return (
        <Badge className={cn("text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm", color)}>
          {action}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'entityType',
    header: 'Module',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-foreground text-xs font-mono uppercase tracking-tighter bg-muted/50 px-2 py-1 rounded border border-border">
        <Box size={12} className="text-purple-400" />
        {row.original.entityType || 'SYSTEM'}
      </div>
    ),
  },
  {
    accessorKey: 'detail',
    header: 'Full Track Details',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="text-gray-400 text-[10px] max-w-[200px] truncate font-mono bg-black/40 p-2 rounded-lg border border-white/5 group-hover:border-blue-500/30 transition-all">
          <Terminal size={10} className="inline mr-1.5 opacity-50" />
          {row.original.detail}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP / Connection Info',
    cell: ({ row }) => (
      <code className="text-[10px] text-gray-500 font-mono tracking-tighter">
        {row.original.ipAddress || '127.0.0.1'}
      </code>
    ),
  },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const response = await apiClient.getAuditLogs(0, 50); // Fetching top 50 for local search/sort
      if (response.success && response.data) {
        setLogs(Array.isArray(response.data.content) ? response.data.content : []);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.actorEmail?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.entityType?.toLowerCase().includes(search.toLowerCase()) ||
    log.detail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-blue-900/10">
              <Activity className="text-primary" size={28} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Audit Logs</h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">tylersoft-eclectics Technologies</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
         <Card className="bg-card/50 backdrop-blur-2xl border border-border p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl rounded-3xl">
            <div className="relative flex-1 w-full group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
               <Input 
                 placeholder="Search by actor, action, module or details..." 
                 className="pl-12 bg-muted/30 border-border text-foreground placeholder-muted-foreground w-full h-12 rounded-xl focus:ring-primary/50 focus:border-primary transition-all"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground h-12 px-6 rounded-xl gap-3">
                  <Filter size={18} />
                  Filter
               </Button>
               <Button variant="ghost" className="text-muted-foreground hover:text-primary h-12 px-6">
                  Export CSV
               </Button>
            </div>
         </Card>

         <Card className="bg-card/50 backdrop-blur-2xl border border-border overflow-hidden shadow-2xl rounded-3xl transition-colors duration-500">
            <div className="p-0">
               <DataTable columns={auditColumns} data={filteredLogs} />
            </div>
         </Card>
      </div>

      <footer className="pt-12 pb-24 opacity-30 flex flex-col items-center gap-4">
         <ShieldAlert className="text-blue-500" size={20} />
         <p className="text-[10px] font-black text-gray-500 tracking-[0.4em] uppercase">tylersoft-eclectics Security Active</p>
      </footer>
    </div>
  );
}
