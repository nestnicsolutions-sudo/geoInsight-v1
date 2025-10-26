"use client";

import Header from '@/components/layout/header';
import ControlPanel from '@/components/control-panel';
import ClientOnlyMap from '@/components/client-only-map';


export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-background font-body text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 overflow-y-auto border-r bg-card p-4 shadow-sm md:w-96">
           <ControlPanel />
        </aside>
        <main className="flex-1 relative">
           <ClientOnlyMap />
        </main>
      </div>
    </div>
  );
}
