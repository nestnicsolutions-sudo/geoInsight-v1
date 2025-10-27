'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { ViewState } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { useStore, DataRecord } from '@/lib/store';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo, useRef } from 'react';
import { ScatterplotLayer, ColumnLayer } from '@deck.gl/layers';
import { HeatmapLayer, HexagonLayer, ScreenGridLayer } from '@deck.gl/aggregation-layers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { WebMercatorViewport } from '@deck.gl/core';


const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const layerMap: any = {
  ScatterplotLayer,
  HeatmapLayer,
  HexagonLayer,
  ScreenGridLayer,
  ColumnLayer,
};

const INITIAL_VIEWPORT: ViewState = {
  longitude: 103.8198,
  latitude: 1.3521,
  zoom: 4,
  pitch: 0,
  bearing: 0,
  padding: { top: 20, bottom: 20, left: 20, right: 20 }
};

export default function MapContainer() {
  const { viewport, setViewport, layers: layerProps, data, mappedColumns } = useStore();
  const { resolvedTheme } = useTheme();
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');
  const [selectedObject, setSelectedObject] = useState<DataRecord | null>(null);
  const deckRef = useRef<DeckGL>(null);

  useEffect(() => {
    if (resolvedTheme) {
      setMapStyle(
        resolvedTheme === 'dark'
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11'
      );
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (data.length > 0 && mappedColumns.latitude && mappedColumns.longitude) {
      const points = data.map(d => [Number(d[mappedColumns.longitude!]), Number(d[mappedColumns.latitude!])]);
      
      const bounds: [[number, number], [number, number]] = points.reduce(
        (acc, point) => {
          return [
            [Math.min(acc[0][0], point[0]), Math.min(acc[0][1], point[1])],
            [Math.max(acc[1][0], point[0]), Math.max(acc[1][1], point[1])],
          ];
        },
        [[Infinity, Infinity], [-Infinity, -Infinity]]
      );

      // Check if bounds are valid
      if (bounds[0][0] !== Infinity && deckRef.current?.deck) {
        const { width, height } = deckRef.current.deck.canvas;
        const viewport = new WebMercatorViewport({ width, height });
        const newViewport = viewport.fitBounds(bounds, {
          padding: 80, 
        });

        setViewport({
          ...viewport,
          ...newViewport,
          transitionDuration: 1000
        });
      }
    } else {
        setViewport(INITIAL_VIEWPORT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mappedColumns.latitude, mappedColumns.longitude, setViewport]);

  const handleViewportChange = (viewState: ViewState) => {
    setViewport(viewState);
  };

  const handleClick = ({ object }: { object?: DataRecord }) => {
    if (object) {
      setSelectedObject(object);
    }
  };
  
  const layers = useMemo(() => {
    if (!mappedColumns.latitude || !mappedColumns.longitude) return [];

    return layerProps.map(props => {
      const LayerComponent = layerMap[props.type];
      if (!LayerComponent) return null;

      const baseProps: any = {
        ...props.config,
        id: props.id,
        data,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 200],
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
            ref={deckRef}
            initialViewState={viewport}
            controller={true}
            layers={layers}
            onClick={handleClick}
            onViewStateChange={e => handleViewportChange(e.viewState)}
            getTooltip={({object}) => {
                if (!object) return null;
                
                const entries = Object.entries(object).filter(([key]) => key !== 'geometry');
                const maxVisible = 5;
                const visibleEntries = entries.slice(0, maxVisible);

                const html = `
                  <div style="background: hsl(var(--card)); color: hsl(var(--card-foreground)); padding: 0.5rem 0.75rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 250px; font-family: sans-serif; font-size: 0.75rem; line-height: 1.3;">
                    <div style="font-weight: 700; margin-bottom: 0.3rem; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 0.3rem; font-size: 0.8rem;">
                      Location Details
                    </div>
                    <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.2rem 0.6rem;">
                      ${visibleEntries.map(([key, value]) => {
                        let displayValue = value;
                        if (typeof value === 'object' && value !== null) {
                          displayValue = '...';
                        } else if (typeof value === 'string' && value.length > 25) {
                            displayValue = value.substring(0, 25) + '...';
                        }
                        return `
                          <div style="font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; opacity: 0.7;">${key}</div>
                          <div style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${String(displayValue)}</div>
                        `;
                      }).join('')}
                    </div>
                    ${entries.length > maxVisible ? `<div style="margin-top: 0.4rem; font-size: 0.65rem; opacity: 0.6;">+${entries.length - maxVisible} more (click to view)</div>` : ''}
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
                {...viewport}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={mapStyle}
            />
        </DeckGL>

        <Dialog open={!!selectedObject} onOpenChange={() => setSelectedObject(null)}>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Location Details</DialogTitle>
                    <DialogDescription>
                        Full data for the selected point.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96 w-full">
                    {selectedObject && (
                        <Table>
                            <TableBody>
                                {Object.entries(selectedObject).map(([key, value]) => {
                                    if (typeof value === 'object' && value !== null) {
                                      return null;
                                    }
                                    return (
                                        <TableRow key={key}>
                                            <TableCell className="font-medium">{key}</TableCell>
                                            <TableCell>{String(value)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    </div>
  );
}
