'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } else {
      setError(result.error || 'Invalid email or password');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Light Gradients */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md bg-white border-2 border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden relative z-10">
        <div className="p-12">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="group transition-transform hover:scale-105 duration-500">
                <Image
                  src="/tylersoft-full-logo.png"
                  alt="Tylersoft-Eclectics Technologies"
                  width={280}
                  height={100}
                  priority
                  className="h-auto w-auto max-w-[280px]"
                />
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-2 font-black uppercase tracking-[0.2em] italic">Secure Access Portal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <p className="text-rose-600 text-xs font-black uppercase tracking-widest text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.25em] ml-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="identity@tylersoft.com"
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 h-14 px-6 rounded-2xl focus:border-primary focus:ring-0 transition-all font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.25em] ml-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 h-14 px-6 rounded-2xl focus:border-primary focus:ring-0 transition-all font-bold"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black text-base h-14 rounded-2xl transition-all shadow-xl shadow-primary/20 uppercase tracking-[0.15em] italic mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : 'LOG IN'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em]">Powered by Tylersoft-Eclectics Technologies</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
