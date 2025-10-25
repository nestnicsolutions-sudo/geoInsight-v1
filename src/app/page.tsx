"use client";

import Header from '@/components/layout/header';
import ControlPanel from '@/components/control-panel';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MapContainer = dynamic(() => import('@/components/map-container'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});


export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-background font-body text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 overflow-y-auto border-r bg-card p-4 shadow-sm md:w-96">
           <ControlPanel />
        </aside>
        <main className="flex-1 relative">
           <MapContainer />
        </main>
      </div>
    </div>
  );
}
