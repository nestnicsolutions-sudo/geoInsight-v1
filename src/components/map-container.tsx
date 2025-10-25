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
