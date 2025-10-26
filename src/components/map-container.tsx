'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { ViewState } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { useStore, DataRecord } from '@/lib/store';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo } from 'react';
import { ScatterplotLayer, ColumnLayer } from '@deck.gl/layers';
import { HeatmapLayer, HexagonLayer, ScreenGridLayer } from '@deck.gl/aggregation-layers';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const layerMap: any = {
  ScatterplotLayer,
  HeatmapLayer,
  HexagonLayer,
  ScreenGridLayer,
  ColumnLayer,
};

export default function MapContainer() {
  const { viewport, setViewport, layers: layerProps, data, mappedColumns } = useStore();
  const { resolvedTheme } = useTheme();
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');

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
  
  const layers = useMemo(() => {
    if (!mappedColumns.latitude || !mappedColumns.longitude) return [];

    return layerProps.map(props => {
      const LayerComponent = layerMap[props.type];
      if (!LayerComponent) return null;

      const baseProps = {
        ...props.config,
        id: props.id,
        data,
        pickable: true,
        getPosition: (d: DataRecord) => [
          Number(d[mappedColumns.longitude!]),
          Number(d[mappedColumns.latitude!]),
        ],
      };

      const getValue = (d: DataRecord) => mappedColumns.value ? Number(d[mappedColumns.value]) : 1;

      let valueProps = {};
      switch (props.type) {
        case "ScatterplotLayer":
          valueProps = { getRadius: getValue };
          break;
        case "HeatmapLayer":
          valueProps = { getWeight: getValue };
          break;
        case "HexagonLayer":
          valueProps = { getElevationValue: (points: any[]) => points.reduce((sum, point) => sum + (mappedColumns.value ? Number(point.source[mappedColumns.value]) : 1), 0) };
          break;
        case "ScreenGridLayer":
           valueProps = { getWeight: getValue };
          break;
        case "ColumnLayer":
          valueProps = { getElevation: getValue };
          break;
      }
      
      return new LayerComponent({ ...baseProps, ...valueProps });
    }).filter(Boolean);
  }, [layerProps, data, mappedColumns]);

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
            getTooltip={({object}) => {
                if (!object) return null;
                
                const entries = Object.entries(object);
                const maxVisible = 7;
                const visibleEntries = entries.slice(0, maxVisible);

                const html = `
                  <div style="background: hsl(var(--card)); color: hsl(var(--card-foreground)); padding: 0.5rem 0.75rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 280px; font-family: sans-serif; font-size: 0.8rem; line-height: 1.4;">
                    <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 0.75rem;">
                      ${visibleEntries.map(([key, value]) => {
                        let displayValue = value;
                        if (typeof value === 'object' && value !== null) {
                          displayValue = JSON.stringify(value);
                        } else if (typeof value === 'string' && value.length > 30) {
                            displayValue = value.substring(0, 30) + '...';
                        }
                        return `
                          <div style="font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${key}</div>
                          <div style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden; opacity: 0.8;">${displayValue}</div>
                        `;
                      }).join('')}
                    </div>
                    ${entries.length > maxVisible ? `<div style="margin-top: 0.5rem; border-top: 1px solid hsl(var(--border)); padding-top: 0.5rem; font-size: 0.7rem; opacity: 0.6;">+${entries.length - maxVisible} more properties</div>` : ''}
                  </div>
                `;

                return {
                  html,
                  style: {
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                  }
                };
            }}
        >
            <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={mapStyle}
            />
        </DeckGL>
    </div>
  );
}
