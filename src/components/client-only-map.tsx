"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MapContainer = dynamic(() => import('@/components/map-container'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function ClientOnlyMap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <MapContainer /> : <Skeleton className="h-full w-full" />;
}
