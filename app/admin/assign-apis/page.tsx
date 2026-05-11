'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Trash2, Download, ArrowUpDown, Link as LinkIcon, Users, Edit, Eye, Search } from 'lucide-react';
import { apiClient } from '@/lib/services/apiClient';
import { DataTable } from '@/components/ui/data-table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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

export default function AssignApisPage() {
  const [assignmentsData, setAssignmentsData] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [apisData, setApisData] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState<string>('');
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>([]);
  const [apiSearchQuery, setApiSearchQuery] = useState('');

  const [viewAssignment, setViewAssignment] = useState<any | null>(null);
  
  const [editAssignment, setEditAssignment] = useState<any | null>(null);
  const [editNewApiId, setEditNewApiId] = useState<string>('');

  const [deleteAssignment, setDeleteAssignment] = useState<any | null>(null);

  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignRes, usersRes, apisRes] = await Promise.all([
        apiClient.getAssignments(),
        apiClient.getUsers(),
        apiClient.getAdminAPIs()
      ]);

      if (assignRes.success && assignRes.data) {
        setAssignmentsData(Array.isArray(assignRes.data) ? assignRes.data : []);
      }

      if (usersRes.success && usersRes.data) {
        setUsersList(Array.isArray(usersRes.data) ? usersRes.data : []);
      }

      if (apisRes.success && apisRes.data) {
        setApisData(Array.isArray(apisRes.data) ? apisRes.data : []);
      }
    } catch (e) {
      setError('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadAssignmentsPDF = () => {
    const doc = new jsPDF();
    doc.text('API Assignments Report', 14, 15);
    
    const tableColumn = ["User Name", "Email", "API Name", "Assigned By", "Assigned At"];
    const tableRows = assignmentsData.map(a => [
      a.userName,
      a.userEmail,
      a.apiName,
      a.assignedBy,
      formatDate(a.assignedAt)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('api_assignments_report.pdf');
  };

  const handleAssignSave = async () => {
    if (!assignUserId || selectedApiIds.length === 0) return;
    setSaving(true);
    
    try {
      const results = await Promise.all(
        selectedApiIds.map(apiId => apiClient.assignApi(assignUserId, apiId))
      );
      
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        alert(`Assigned ${selectedApiIds.length - failures.length} APIs. ${failures.length} failed.`);
      }
      
      setAssignModalOpen(false);
      setAssignUserId('');
      setSelectedApiIds([]);
      setApiSearchQuery('');
      fetchData();
    } catch (err) {
      alert('An error occurred during assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async () => {
    if (!editAssignment || !editNewApiId) return;
    setSaving(true);
    // Revoke old, Assign new
    const revokeRes = await apiClient.revokeApi(editAssignment.userId, editAssignment.apiId);
    if (revokeRes.success) {
      const assignRes = await apiClient.assignApi(editAssignment.userId, editNewApiId);
      if (assignRes.success) {
        setEditAssignment(null);
        setEditNewApiId('');
        fetchData();
      } else {
        alert(assignRes.error || 'Failed to assign new API');
      }
    } else {
      alert(revokeRes.error || 'Failed to revoke old API');
    }
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAssignment) return;
    setSaving(true);
    const response = await apiClient.revokeApi(deleteAssignment.userId, deleteAssignment.apiId);
    if (response.success) {
      setDeleteAssignment(null);
      fetchData();
    } else {
      alert(response.error || 'Failed to revoke API access');
    }
    setSaving(false);
  };

  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return assignmentsData;
    const query = searchQuery.toLowerCase();
    return assignmentsData.filter((a: any) => 
      a.userName?.toLowerCase().includes(query) || 
      a.apiName?.toLowerCase().includes(query) ||
      a.userEmail?.toLowerCase().includes(query)
    );
  }, [assignmentsData, searchQuery]);

  const assignmentColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'userName',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="text-gray-400 hover:text-white px-0">
          User <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 text-foreground font-medium py-1">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-300 text-xs text-primary font-bold shrink-0">
            {row.original.userName ? row.original.userName.substring(0, 2).toUpperCase() : '?'}
          </div>
          <div className="min-w-0 py-2">
            <div className="font-black text-slate-900 uppercase tracking-tight whitespace-normal break-words leading-tight mb-1">{row.original.userName}</div>
            <div className="text-xs text-slate-500 font-medium whitespace-normal break-all leading-relaxed">{row.original.userEmail}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'apiName',
      header: 'API Access',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 py-2">
          <LinkIcon size={14} className="text-primary shrink-0" />
          <span className="text-slate-700 font-bold whitespace-normal break-words leading-tight">{row.original.apiName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'assignedBy',
      header: 'Assigned By',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.assignedBy}</div>,
    },
    {
      accessorKey: 'assignedAt',
      header: 'Assigned At',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{formatDate(row.original.assignedAt)}</div>,
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.active !== false; // Default true
        return (
          <div className="flex items-center">
            <button
              onClick={async () => {
                const res = await apiClient.toggleAssignment(row.original.id, !isActive);
                if (res.success) {
                  fetchData();
                } else {
                  alert(res.error || 'Failed to toggle status');
                }
              }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isActive ? 'bg-green-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-2 text-xs font-medium ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
              {isActive ? 'Active' : 'Suspended'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon-xs" className="text-blue-600 border-slate-300 hover:bg-slate-100" onClick={() => setViewAssignment(row.original)}>
            <Eye size={14} />
          </Button>
          <Button variant="outline" size="icon-xs" className="text-emerald-600 border-slate-300 hover:bg-slate-100" onClick={() => {
            setEditAssignment(row.original);
            setEditNewApiId(row.original.apiId.toString());
          }}>
            <Edit size={14} />
          </Button>
          <Button variant="outline" size="icon-xs" className="text-rose-600 border-slate-300 hover:bg-slate-100" onClick={() => setDeleteAssignment(row.original)}>
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
          <h1 className="text-2xl font-black text-foreground mb-1 uppercase tracking-tighter italic">API Assignments</h1>
          <p className="text-muted-foreground text-xs font-medium">Manage which users have access to specific APIs.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadAssignmentsPDF} variant="outline" size="xs" className="border-2 border-border text-muted-foreground px-3 h-8 rounded-lg">
            <Download size={14} className="mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => setAssignModalOpen(true)} size="xs" className="bg-primary hover:opacity-90 text-white px-3 h-8 rounded-lg shadow-lg shadow-primary/20">
            <Users size={16} className="mr-2" />
            Assign API
          </Button>
        </div>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground/60" />
        </div>
        <input
          type="text"
          placeholder="Search assignments by user name, email, or API name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-xl leading-5 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
        />
      </div>

      <Card className="bg-background dark:bg-background border-2 border-border overflow-hidden rounded-2xl shadow-lg">
        <div className="p-6">
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
            <DataTable columns={assignmentColumns} data={filteredAssignments} />
          )}
        </div>
      </Card>

      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="bg-card border-2 border-border text-foreground max-w-3xl w-full p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
          <div className="p-12">
            <DialogHeader className="mb-10">
              <DialogTitle className="text-3xl font-black tracking-tight text-foreground italic uppercase">Assign API to User</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">User</Label>
                <select 
                  value={assignUserId} 
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full bg-background border-2 border-border rounded-2xl px-5 py-3 text-foreground font-medium focus:outline-none focus:border-primary transition-all appearance-none"
                >
                  <option value="" disabled>Select a User</option>
                  {usersList.filter((u: any) => u.role === 'USER').map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Select APIs ({selectedApiIds.length})</Label>
                  <button 
                    type="button"
                    onClick={() => {
                      if (selectedApiIds.length === apisData.length) setSelectedApiIds([]);
                      else setSelectedApiIds(apisData.map(a => a.id.toString()));
                    }}
                    className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider"
                  >
                    {selectedApiIds.length === apisData.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    placeholder="Filter APIs..."
                    value={apiSearchQuery}
                    onChange={(e) => setApiSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-12 pr-5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar border-2 border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                  {apisData
                    .filter(a => a.name.toLowerCase().includes(apiSearchQuery.toLowerCase()) || a.endpointUrl.toLowerCase().includes(apiSearchQuery.toLowerCase()))
                    .map((a: any) => {
                      const isSelected = selectedApiIds.includes(a.id.toString());
                      return (
                        <div 
                          key={a.id}
                          onClick={() => {
                            if (isSelected) setSelectedApiIds(selectedApiIds.filter(id => id !== a.id.toString()));
                            else setSelectedApiIds([...selectedApiIds, a.id.toString()]);
                          }}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group break-words overflow-hidden ${
                            isSelected 
                              ? 'bg-primary/5 border-primary text-primary' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-slate-400'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                            <div className="text-sm font-black uppercase tracking-tight whitespace-normal break-words leading-tight mb-1">{a.name}</div>
                            <div className="text-[10px] opacity-60 font-mono whitespace-normal break-all leading-relaxed">{a.endpointUrl}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t-2 border-slate-200 gap-3">
            <Button variant="outline" onClick={() => {
              setAssignModalOpen(false);
              setSelectedApiIds([]);
              setApiSearchQuery('');
            }} className="border-2 border-slate-300 text-slate-500 font-bold px-4 h-8 rounded-lg uppercase tracking-widest text-[10px] italic">Cancel</Button>
            <Button 
              onClick={handleAssignSave} 
              disabled={saving || !assignUserId || selectedApiIds.length === 0} 
              className="bg-primary hover:opacity-90 text-white font-black px-4 h-8 rounded-lg min-w-[120px] uppercase tracking-widest italic shadow-lg shadow-primary/20"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : `Assign ${selectedApiIds.length > 0 ? `(${selectedApiIds.length})` : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewAssignment} onOpenChange={(open) => !open && setViewAssignment(null)}>
        <DialogContent className="bg-white border-2 border-slate-200 text-slate-900 max-w-xl w-full p-10 rounded-[2.5rem] shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Assignment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
              <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 block">User Information</Label>
              <div className="text-slate-900 font-bold">{viewAssignment?.userName}</div>
              <div className="text-slate-500 text-sm italic">{viewAssignment?.userEmail}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
              <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 block">API Information</Label>
              <div className="text-primary font-black uppercase tracking-tighter text-lg italic">{viewAssignment?.apiName}</div>
              <div className="text-slate-400 text-[10px] font-mono break-all mt-1">{viewAssignment?.endpointUrl}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 block">Assigned By</Label>
                <div className="text-slate-900 font-bold text-sm">{viewAssignment?.assignedBy}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                <Label className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 block">Date</Label>
                <div className="text-slate-900 font-bold text-sm">{formatDate(viewAssignment?.assignedAt)}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editAssignment} onOpenChange={(open) => !open && setEditAssignment(null)}>
        <DialogContent className="bg-white border-2 border-slate-200 text-slate-900 max-w-xl w-full p-10 rounded-[2.5rem] shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Edit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">User (Immutable)</Label>
              <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl px-5 py-3 text-slate-500 font-bold italic cursor-not-allowed">
                {editAssignment?.userName}
              </div>
            </div>
            <div>
              <Label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">API</Label>
              <select 
                value={editNewApiId} 
                onChange={(e) => setEditNewApiId(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-3 text-slate-900 font-bold focus:outline-none focus:border-primary transition-all appearance-none"
              >
                {apisData.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="mt-8 pt-6 border-t-2 border-slate-100 gap-3">
            <Button variant="outline" onClick={() => setEditAssignment(null)} className="border-2 border-slate-300 font-bold px-6 rounded-2xl">Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving || !editNewApiId} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 rounded-2xl uppercase italic tracking-widest">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteAssignment} onOpenChange={(open) => !open && setDeleteAssignment(null)}>
        <DialogContent className="bg-white border-2 border-rose-100 text-slate-900 max-w-xl w-full p-10 rounded-[2.5rem] shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-rose-600 italic">Delete Assignment?</DialogTitle>
          </DialogHeader>
          <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-2xl mb-6">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to revoke <strong className="text-slate-900">{deleteAssignment?.userName}</strong>'s access to the <strong className="text-primary uppercase italic tracking-tighter">{deleteAssignment?.apiName}</strong> API?
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setDeleteAssignment(null)} className="border-2 border-slate-300 font-bold px-6 rounded-2xl">Cancel</Button>
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white font-black px-8 rounded-2xl uppercase italic tracking-widest">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
