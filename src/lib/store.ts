import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ViewState } from 'react-map-gl';
import { ScatterplotLayer } from '@deck.gl/layers';
import type { Layer } from '@deck.gl/core';

// Define the structure for raw data
interface RawData {
    name: string;
    content: string; 
}

export interface MappedColumns {
    latitude: string | null;
    longitude: string | null;
    value: string | null;
    category: string | null;
}

export type DataRecord = Record<string, any>;

interface AppState {
    projectName: string;
    setProjectName: (name: string) => void;

    rawData: RawData | null;
    setRawData: (data: RawData | null) => void;

    data: DataRecord[];
    setData: (data: DataRecord[]) => void;
    
    columns: string[];
    setColumns: (columns: string[]) => void;

    mappedColumns: MappedColumns;
    setMappedColumns: (mappedColumns: Partial<MappedColumns>) => void;

    layers: Layer[];
    addLayer: (layer: Layer) => void;
    
    // map state
    viewport: ViewState;
    setViewport: (viewport: ViewState) => void;
}

export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      projectName: 'Untitled Project',
      setProjectName: (name) => set({ projectName: name }),

      rawData: null,
      setRawData: (data) => set({ rawData: data }),

      data: [],
      setData: (data) => set({ data }),

      columns: [],
      setColumns: (columns) => set({ columns }),
      
      mappedColumns: {
        latitude: null,
        longitude: null,
        value: null,
        category: null,
      },
      setMappedColumns: (mappedColumns) => set(state => ({ mappedColumns: { ...state.mappedColumns, ...mappedColumns }})),

      layers: [],
      addLayer: (layer) => set(state => ({ layers: [...state.layers, layer] })),

      viewport: {
        longitude: 103.8198,
        latitude: 1.3521,
        zoom: 4,
        pitch: 0,
        bearing: 0,
        padding: { top: 20, bottom: 20, left: 20, right: 20 }
      },
      setViewport: (viewport) => set({ viewport }),
    }),
    { name: 'GeoInsightStore' }
  )
);
