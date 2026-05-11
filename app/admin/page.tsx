'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiClient } from '@/lib/services/apiClient';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Package,
  TrendingUp,
  CheckCircle,
  Zap,
  Link as LinkIcon,
  Eye,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from '@/lib/utils';



interface StatCard {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color: string;
}

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

export const apiColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-gray-400 hover:text-white px-0"
        >
          API Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-4 font-bold api-name">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 shadow-sm">
          <Package size={20} className="text-primary" />
        </div>
        <span className="uppercase tracking-tighter italic">{row.original.name}</span>
      </div>
    ),

  },
  {
    accessorKey: 'version',
    header: 'Version',
    cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.version}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.category}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={
            status === 'Published'
              ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100 font-black uppercase italic tracking-widest px-3 py-1'
              : 'bg-blue-50 text-blue-700 border-2 border-blue-100 font-black uppercase italic tracking-widest px-3 py-1'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-gray-400 hover:text-white px-0"
        >
          Updated At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-gray-400 text-sm">{formatDate(row.original.createdAt)}</div>,
  },
  {
    id: 'actions',
    cell: () => (
      <div className="text-center">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          ...
        </Button>
      </div>
    ),
  },
];

// User columns are now defined inside the component to access state


export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [usersData, setUsersData] = useState<any[]>([]);
  const [apisData, setApisData] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingApis, setLoadingApis] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [apisError, setApisError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<number | null>(null);

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    setUpdatingUser(userId);
    const newStatus = !currentStatus;
    const response = await apiClient.toggleUser(userId, newStatus);

    if (response.success) {
      setUsersData(prev => prev.map(u => u.id === userId ? { ...u, active: newStatus } : u));
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } else {
      toast.error(response.error || "Failed to update status");
    }
    setUpdatingUser(null);
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingUser(userId);
    const userToUpdate = usersData.find(u => u.id === userId);
    if (!userToUpdate) return;

    const response = await apiClient.updateUser(userId, {
      name: userToUpdate.name,
      email: userToUpdate.email,
      role: newRole
    });

    if (response.success) {
      setUsersData(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, roleMock: newRole.charAt(0) + newRole.slice(1).toLowerCase() } : u));
      toast.success(`Role updated to ${newRole}`);
    } else {
      toast.error(response.error || "Failed to update role");
    }
    setUpdatingUser(null);
  };

  const userColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-gray-400 hover:text-white px-0"
          >
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-4 font-bold api-name">
            <div className="w-10 h-10 bg-slate-100 border-2 border-slate-200 rounded-full flex items-center justify-center text-primary text-xs font-black shrink-0 shadow-sm transition-all hover:scale-110">
              {u.name
                ? u.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                : '?'}
            </div>
            <div className="flex flex-col">
              <span className="uppercase tracking-tighter italic">{u.name ?? '—'}</span>
              <span className="text-[9px] text-muted-foreground/60 font-mono">{u.email}</span>
            </div>
          </div>
        );
      },

    },
    {
      accessorKey: 'role',
      header: 'System Role',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Select
            defaultValue={u.role || 'USER'}
            onValueChange={(val) => handleRoleChange(u.id, val)}
            disabled={updatingUser === u.id}
          >
            <SelectTrigger className="w-[110px] h-8 text-[10px] font-black uppercase tracking-widest border-2 border-border/50 bg-background rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-2 border-border rounded-xl">
              <SelectItem value="USER" className="text-[10px] font-black uppercase tracking-widest">User</SelectItem>
              <SelectItem value="ADMIN" className="text-[10px] font-black uppercase tracking-widest">Admin</SelectItem>
            </SelectContent>
          </Select>
        );
      }
    },
    {
      accessorKey: 'active',
      header: 'Operational Status',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={u.active}
              onCheckedChange={() => handleToggleStatus(u.id, u.active)}
              disabled={updatingUser === u.id}
            />
            <Badge
              className={cn(
                "font-black uppercase italic tracking-widest px-2 py-0.5 text-[9px]",
                u.active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              )}
            >
              {u.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'apiCount',
      header: 'API Access',
      cell: ({ row }) => <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">{row.original.apiCount} Resources</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-primary h-8 w-8 p-0 rounded-lg hover:bg-primary/5 transition-colors"
            onClick={() => router.push(`/admin/users?id=${row.original.id}`)}
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-400 h-8 w-8 p-0 rounded-lg hover:bg-red-500/5 transition-colors"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];


  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        const rawUsers = Array.isArray(response.data) ? response.data : [];
        const apiCounts = [12, 8, 5, 9, 3];

        const enrichedUsers = rawUsers.map((u: any, i: number) => ({
          ...u,
          apiCount: apiCounts[i % apiCounts.length],
          roleMock: u.role === 'ADMIN' ? 'Admin' : 'User'
        }));
        setUsersData(enrichedUsers);
      } else {
        setUsersError(response.error ?? 'Failed to load users');
      }
      setLoadingUsers(false);
    };

    const fetchApis = async () => {
      setLoadingApis(true);
      setApisError(null);
      const response = await apiClient.getAdminAPIs();
      if (response.success && response.data) {
        const rawApis = Array.isArray(response.data) ? response.data : [];
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
      } else {
        setApisError(response.error ?? 'Failed to load APIs');
      }
      setLoadingApis(false);
    };

    if (!authLoading && user?.role === 'ADMIN') {
      fetchUsers();
      fetchApis();
    } else if (!authLoading && user?.role !== 'ADMIN') {
      setUsersError('Permission denied');
      setApisError('Permission denied');
      setLoadingUsers(false);
      setLoadingApis(false);
    }
  }, [authLoading, user]);

  const totalUsers = usersData.length;
  const activeUsers = usersData.filter((u: any) => u.active === true).length;
  const totalAPIs = apisData.length;

  const stats: StatCard[] = [
    {
      label: 'Total APIs',
      value: totalAPIs,
      trend: `${totalAPIs} registered`,
      icon: <Package className="w-6 h-6" />,
      color: 'from-purple-500/20 to-purple-600/20',
    },
    {
      label: 'Total Users',
      value: totalUsers,
      trend: `${totalUsers} accounts`,
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500/20 to-blue-600/20',
    },
    {
      label: 'Active Users',
      value: activeUsers,
      trend:
        totalUsers > 0
          ? `${Math.round((activeUsers / totalUsers) * 100)}% active`
          : '0%',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-green-500/20 to-green-600/20',
    },
  ];

  const renderTableState = (
    loading: boolean,
    error: string | null,
    isEmpty: boolean,
    emptyMessage: string,
    loadingMessage: string
  ) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          <span className="ml-2 text-gray-400">{loadingMessage}</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center gap-2 p-12 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      );
    }
    if (isEmpty) {
      return <div className="p-12 text-center text-gray-400">{emptyMessage}</div>;
    }
    return null;
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground mb-1 uppercase tracking-tighter italic">Dashboard</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Welcome back, {user?.name ?? 'Admin'}! Operational overview of your API ecosystem.
          </p>
        </div>
        <Button size="xs" className="bg-primary hover:opacity-90 text-white px-3 h-8 rounded-lg shadow-lg shadow-primary/20" onClick={() => router.push('/admin/apis/new')}>
          <Plus size={16} className="mr-2" />
          Add New API
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="bg-background border-2 border-border p-5 hover:border-primary transition shadow-md rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</div>
              <div className="p-2 bg-background rounded-xl border-2 border-border/50 text-primary">{stat.icon}</div>
            </div>
            <p className="text-muted-foreground/60 text-xs font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            {stat.trend && <p className="text-emerald-600 text-xs font-black italic">✓ {stat.trend}</p>}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          {/* Recent APIs Table */}
          <Card className="bg-background border-2 border-border overflow-hidden rounded-2xl shadow-lg">
            <div className="flex items-center justify-between p-5 border-b-2 border-border/50 bg-background/50">
              <h3 className="text-lg font-black text-foreground uppercase tracking-tighter italic">Recent APIs</h3>
              <Button variant="ghost" size="xs" className="text-primary font-black uppercase text-xs tracking-widest hover:bg-primary/5" onClick={() => router.push('/admin/apis')}>
                Browse All
              </Button>
            </div>
            <div className="p-4">
              {renderTableState(
                loadingApis,
                apisError,
                apisData.length === 0,
                'No APIs discovered',
                'Accessing repositories...'
              ) ?? (
                  <DataTable columns={apiColumns} data={apisData} />
                )}
            </div>
          </Card>

          {/* User Management Table */}
          <Card className="bg-background border-2 border-border overflow-hidden rounded-2xl shadow-lg">
            <div className="flex items-center justify-between p-5 border-b-2 border-border/50 bg-background/50">
              <h3 className="text-lg font-black text-foreground uppercase tracking-tighter italic">User Management</h3>
              <Button variant="ghost" size="xs" className="text-primary font-black uppercase text-xs tracking-widest hover:bg-primary/5" onClick={() => router.push('/admin/users')}>
                View Users
              </Button>
            </div>
            <div className="p-4">
              {renderTableState(
                loadingUsers,
                usersError,
                usersData.length === 0,
                'No identities found',
                'Verifying credentials...'
              ) ?? (
                  <DataTable columns={userColumns} data={usersData} />
                )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
