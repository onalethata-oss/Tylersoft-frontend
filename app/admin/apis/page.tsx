'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle, Edit, Trash2, Eye, Download, Package, ArrowUpDown, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/services/apiClient';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function AllApisPage() {
  const [apisData, setApisData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewApi, setViewApi] = useState<any | null>(null);
  const [editApi, setEditApi] = useState<any | null>(null);
  const [deleteApiId, setDeleteApiId] = useState<number | null>(null);
  
  const [editFormData, setEditFormData] = useState({ name: '', endpointUrl: '', description: '' });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { user, loading: authLoading } = useAuth();

  const fetchData = async () => {
    if (authLoading || user?.role !== 'ADMIN') return;
    setLoading(true);
    setError(null);
    try {
      const apisRes = await apiClient.getAdminAPIs();

      if (apisRes.success && apisRes.data) {
        const rawApis = Array.isArray(apisRes.data) ? apisRes.data : [];
        const versions = ['v2.1', 'v1.4', 'v2.0', 'v1.3', 'v1.0'];
        const categories = ['Users', 'Payments', 'Orders', 'Inventory', 'System'];
        const statuses = ['Published', 'Published', 'Published', 'Draft', 'Published'];

        const enrichedApis = rawApis.map((api: any, i: number) => ({
          ...api,
          version: versions[i % versions.length],
          category: categories[i % categories.length],
          status: statuses[i % statuses.length],
        }));
        setApisData(enrichedApis);
      }
    } catch (e) {
      setError('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      fetchData();
    } else if (!authLoading && user?.role !== 'ADMIN') {
      setError('You do not have permission to view this page.');
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('API Management Report', 14, 15);
    
    const tableColumn = ["API Name", "Endpoint URL", "Status", "Updated At"];
    const tableRows = apisData.map(api => [
      api.name,
      api.endpointUrl,
      api.status,
      formatDate(api.createdAt)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('api_report.pdf');
  };

  const handleEditSave = async () => {
    if (!editApi) return;
    setSaving(true);
    const response = await apiClient.updateApi(editApi.id, editFormData);
    if (response.success) {
      if (editFile) {
        await apiClient.uploadApiDocs(editApi.id, editFile);
      }
      setEditApi(null);
      fetchData();
    } else {
      alert(response.error || 'Failed to update API');
    }
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteApiId) return;
    setSaving(true);
    const response = await apiClient.deleteApi(deleteApiId);
    if (response.success) {
      setDeleteApiId(null);
      fetchData();
    } else {
      alert(response.error || 'Failed to delete API');
    }
    setSaving(false);
  };

  const apiColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="text-gray-400 hover:text-white px-0">
          API Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4 text-slate-900 font-bold">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 shadow-sm">
            <Package size={20} className="text-primary" />
          </div>
          <span className="uppercase tracking-tighter italic">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'endpointUrl',
      header: 'Endpoint URL',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.endpointUrl}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.status === 'Published' 
          ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100 font-black uppercase italic tracking-widest px-3 py-1' 
          : 'bg-blue-50 text-blue-700 border-2 border-blue-100 font-black uppercase italic tracking-widest px-3 py-1'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Updated At',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{formatDate(row.original.createdAt)}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon-xs" className="text-blue-600 border-slate-300 hover:bg-slate-100" onClick={() => setViewApi(row.original)}>
            <Eye size={14} />
          </Button>
          <Button variant="outline" size="icon-xs" className="text-emerald-600 border-slate-300 hover:bg-slate-100" onClick={() => {
            setEditApi(row.original);
            setEditFormData({ name: row.original.name, endpointUrl: row.original.endpointUrl, description: row.original.description || '' });
            setEditFile(null);
          }}>
            <Edit size={14} />
          </Button>
          <Button variant="outline" size="icon-xs" className="text-rose-600 border-slate-300 hover:bg-slate-100" onClick={() => setDeleteApiId(row.original.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tighter italic">API Management</h1>
          <p className="text-slate-500 text-xs font-medium">Verify and reconfigure registered enterprise endpoints.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="outline" size="xs" className="border-2 border-slate-200 text-slate-600 px-3 h-8 rounded-lg">
            <Download size={14} className="mr-2" />
            Download PDF
          </Button>
          <Link href="/admin/apis/new">
            <Button size="xs" className="bg-primary hover:opacity-90 text-white px-3 h-8 rounded-lg shadow-lg shadow-primary/20">
              <Plus size={16} className="mr-2" />
              Add API
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-card border-2 border-border overflow-hidden rounded-2xl shadow-lg">
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 p-12 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : (
            <DataTable columns={apiColumns} data={apisData} />
          )}
        </div>
      </Card>

      {/* View Modal */}
      <Dialog open={!!viewApi} onOpenChange={(open) => !open && setViewApi(null)}>
        <DialogContent className="bg-card border-2 border-border text-foreground max-w-md w-full p-8 rounded-3xl shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic text-primary">{viewApi?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-background p-5 rounded-2xl border-2 border-border/50">
              <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 block">Endpoint URL</Label>
              <div className="text-foreground font-mono text-xs break-all">{viewApi?.endpointUrl}</div>
            </div>
            <div className="bg-background p-5 rounded-2xl border-2 border-border/50">
              <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 block">Description</Label>
              <div className="text-foreground/80 font-medium text-sm leading-relaxed">{viewApi?.description || 'No description provided.'}</div>
            </div>
            {viewApi?.documentation && (
              <div className="bg-background p-5 rounded-2xl border-2 border-border/50">
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 block">Specification File</Label>
                <div className="mt-2">
                  <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080/api'}/admin/apis/${viewApi.id}/docs`} target="_blank" className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] italic hover:underline" rel="noreferrer">
                    Download as PDF <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editApi} onOpenChange={(open) => !open && setEditApi(null)}>
        <DialogContent className="bg-card border-2 border-border text-foreground max-w-md w-full p-0 overflow-hidden rounded-[2.5rem]">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Edit API</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">API Name</Label>
                <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="bg-background border-2 border-border text-foreground h-12 rounded-xl focus:border-primary" />
              </div>
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">Endpoint URL</Label>
                <Input value={editFormData.endpointUrl} onChange={(e) => setEditFormData({ ...editFormData, endpointUrl: e.target.value })} className="bg-background border-2 border-border text-foreground h-12 rounded-xl focus:border-primary font-mono text-xs" />
              </div>
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">Description</Label>
                <Textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="bg-background border-2 border-border text-foreground min-h-[100px] rounded-xl focus:border-primary" />
              </div>
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">Documentation (Optional)</Label>
                <Input type="file" onChange={(e) => setEditFile(e.target.files?.[0] || null)} className="bg-background border-2 border-border text-muted-foreground/60 file:bg-primary file:text-white file:font-black file:uppercase file:text-[10px] file:italic file:px-4 file:h-full file:border-0 rounded-xl overflow-hidden" />
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-background border-t-2 border-border gap-3">
            <Button variant="outline" onClick={() => setEditApi(null)} className="border-2 border-border font-bold px-4 h-8 rounded-lg hover:bg-card">Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 h-8 rounded-lg uppercase italic tracking-widest">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteApiId} onOpenChange={(open) => !open && setDeleteApiId(null)}>
        <DialogContent className="bg-card border-2 border-rose-500/20 text-foreground max-w-md w-full p-8 rounded-3xl shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-rose-600 italic">Delete API?</DialogTitle>
          </DialogHeader>
          <div className="bg-rose-500/5 border-2 border-rose-500/10 p-6 rounded-2xl mb-8">
            <p className="text-foreground/80 leading-relaxed font-medium">
              Are you sure you want to delete this API? This action is <strong className="text-rose-600 uppercase italic">irreversible</strong>. All user assignments will be revoked immediately.
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setDeleteApiId(null)} className="border-2 border-border font-bold px-4 h-8 rounded-lg hover:bg-background">Cancel</Button>
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4 h-8 rounded-lg uppercase italic tracking-widest shadow-lg shadow-rose-600/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete API'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
