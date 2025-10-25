'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { ViewState } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { useStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const MAPBOX_TOKEN = "pk.eyJ1IjoiZ2FidWJha2FyIiwiYSI6ImNtZmszc3k3OTE4Y3Mya29saWhyeDFqYm8ifQ.YoJGe63qRUXBmoAnQq2Sxw";

export default function MapContainer() {
  const { viewport, setViewport, layers } = useStore();
  const { resolvedTheme } = useTheme();
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (resolvedTheme) {
      setMapStyle(
        resolvedTheme === 'dark'
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11'
      );
    }
  }, [resolvedTheme]);

  const handleViewportChange = (viewState: ViewState) => {
    setViewport(viewState);
  };
  
  if (!isClient) {
    return null;
  }

  if (!MAPBOX_TOKEN) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="text-center p-4 rounded-md bg-card border border-destructive">
                <h2 className="text-lg font-semibold text-destructive-foreground">Configuration Error</h2>
                <p className="text-muted-foreground mt-2">
                    Mapbox Access Token is not configured. Please set <code className="font-code bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in your environment variables.
                </p>
            </div>
        </div>
    )
  }

  return (
    <div className="relative h-full w-full">
        <DeckGL
            initialViewState={viewport}
            controller={true}
            layers={layers} 
            onViewStateChange={e => handleViewportChange(e.viewState)}
            getTooltip={({object}) => object && `
              <div class="bg-card text-card-foreground p-2 rounded-md shadow-lg max-w-xs break-words">
                ${Object.entries(object).map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`).join('')}
              </div>
            `}
        >
            <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={mapStyle}
            />
        </DeckGL>
    </div>
  );
}
