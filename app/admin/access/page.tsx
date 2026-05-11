'use client';

import { Card } from '@/components/ui/card';

export default function AccessControlPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Access Control</h1>
          <p className="text-gray-400">Manage user permissions and API key assignments.</p>
        </div>
      </div>

      <Card className="bg-slate-800/40 border border-purple-500/10 p-12 text-center overflow-hidden">
        <h3 className="text-xl font-bold text-white mb-2">Access Matrix</h3>
        <p className="text-gray-400">This feature is currently under development. Soon you will be able to graphically map users to their permitted APIs.</p>
      </Card>
    </div>
  );
}
