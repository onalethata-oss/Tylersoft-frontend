'use client';

import { Card } from '@/components/ui/card';

export default function VersionsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Versions</h1>
          <p className="text-gray-400">Manage and track version lifecycles for your APIs.</p>
        </div>
      </div>

      <Card className="bg-slate-800/40 border border-purple-500/10 p-12 text-center overflow-hidden">
        <h3 className="text-xl font-bold text-white mb-2">Version Management</h3>
        <p className="text-gray-400">This feature is currently under development. Soon you will be able to manage multiple versions of the same API.</p>
      </Card>
    </div>
  );
}
