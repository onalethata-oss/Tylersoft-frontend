'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/services/apiClient';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewApiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    endpointUrl: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await apiClient.createApi(formData as any);
    
    if (response.success && response.data && (response.data as any).id) {
      if (file) {
        const uploadResponse = await apiClient.uploadApiDocs((response.data as any).id, file);
        if (!uploadResponse.success) {
          setError(`API created, but document upload failed: ${uploadResponse.error || 'Unknown error'}`);
          setLoading(false);
          return;
        }
      }
      router.push('/admin/apis');
      router.refresh();
    } else {
      setError(response.error || 'Failed to create API');
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <div className="mb-10 flex items-center gap-6">
        <Link href="/admin/apis">
          <Button variant="outline" className="border-2 border-slate-200 text-slate-400 hover:text-slate-900 h-12 w-12 p-0 rounded-2xl transition-all">
            <ArrowLeft size={24} />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">Add New API</h1>
          <p className="text-slate-500 font-medium">Provision a new API into the system.</p>
        </div>
      </div>

      <Card className="bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 p-10 rounded-[2.5rem] shadow-2xl">
        {error && (
          <div className="mb-8 p-5 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">API Name <span className="text-rose-500">*</span></label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. CORE_PAYMENTS_V2"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:outline-none focus:border-primary transition-all placeholder-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Endpoint URL <span className="text-rose-500">*</span></label>
              <input
                required
                name="endpointUrl"
                value={formData.endpointUrl}
                onChange={handleChange}
                placeholder="https://api.tylersoft.io/v2/payments"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-slate-900 text-sm font-mono focus:outline-none focus:border-primary transition-all placeholder-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Detail the technical parameters and business logic..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-slate-900 text-sm font-medium focus:outline-none focus:border-primary transition-all resize-none placeholder-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Documentation (Optional)</label>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-3.5 text-slate-400 text-sm focus:outline-none focus:border-primary transition-all file:bg-primary file:text-white file:font-black file:uppercase file:text-[10px] file:italic file:px-6 file:py-2 file:rounded-xl file:border-0 file:mr-4"
              />
            </div>
          </div>

          <div className="pt-8 border-t-2 border-slate-100 flex justify-end gap-4">
            <Link href="/admin/apis">
              <Button type="button" variant="outline" className="border-2 border-slate-200 text-slate-500 font-bold px-5 h-10 rounded-xl uppercase tracking-widest text-xs italic">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:opacity-90 text-white font-black px-8 h-10 rounded-xl uppercase tracking-widest italic shadow-lg shadow-primary/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : 'Create API'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
