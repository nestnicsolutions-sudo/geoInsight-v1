import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ViewState } from 'react-map-gl';
import { SmartLayerSuggestionsOutput } from '@/ai/flows/smart-layer-suggestions';

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

export type LayerProps = {
    id: string;
    type: string;
    config: any;
};

export interface AiError {
    message: string;
    sourceFile: string;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'histogram' | 'scatter' | 'summary' | null;


export interface ChartConfig {
    type: ChartType;
    xAxis: string | null;
    yAxis: string | null;
}


interface AppState {
    projectName: string;
    setProjectName: (name: string) => void;

    rawData: RawData | null;
    setRawData: (data: RawData | null) => void;

    data: DataRecord[];
    setData: (data: DataRecord[]) => void;
    
    columns: string[];
    setColumns: (columns: string[]) => void;

    columnTypes: Record<string, string>;
    setColumnTypes: (types: Record<string, string>) => void;

    mappedColumns: MappedColumns;
    setMappedColumns: (mappedColumns: Partial<MappedColumns>) => void;

    layers: LayerProps[];
    addLayer: (layer: LayerProps) => void;
    removeLayer: (layerId: string) => void;
    updateLayerConfig: (layerId: string, newConfig: Partial<any>) => void;
    
    // map state
    viewport: ViewState;
    setViewport: (viewport: Partial<ViewState>) => void;

    // AI state
    aiError: AiError | null;
    setAiError: (error: AiError | null) => void;
    layerSuggestions: SmartLayerSuggestionsOutput;
    setLayerSuggestions: (suggestions: SmartLayerSuggestionsOutput) => void;

    // Chart state
    activeView: 'map' | 'chart';
    setActiveView: (view: 'map' | 'chart') => void;
    chartConfig: ChartConfig;
    setChartConfig: (config: Partial<ChartConfig>) => void;

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

      columnTypes: {},
      setColumnTypes: (types) => set({ columnTypes: types }),
      
      mappedColumns: {
        latitude: null,
        longitude: null,
        value: null,
        category: null,
      },
      setMappedColumns: (mappedColumns) => set(state => ({ mappedColumns: { ...state.mappedColumns, ...mappedColumns }})),

      layers: [],
      addLayer: (layer) => set(state => ({ layers: [...state.layers, layer] })),
      removeLayer: (layerId) => set(state => ({ layers: state.layers.filter(l => l.id !== layerId) })),
      updateLayerConfig: (layerId, newConfig) => set(state => ({
        layers: state.layers.map(l => 
          l.id === layerId ? { ...l, config: { ...l.config, ...newConfig } } : l
        )
      })),

      viewport: {
        longitude: 103.8198,
        latitude: 1.3521,
        zoom: 4,
        pitch: 0,
        bearing: 0,
        padding: { top: 20, bottom: 20, left: 20, right: 20 }
      },
      setViewport: (viewport) => set(state => ({ viewport: {...state.viewport, ...viewport} })),

      aiError: null,
      setAiError: (error) => set({ aiError: error }),
      layerSuggestions: [],
      setLayerSuggestions: (suggestions) => set({ layerSuggestions: suggestions }),

      activeView: 'map',
      setActiveView: (view) => set({ activeView: view }),
      chartConfig: {
          type: null,
          xAxis: null,
          yAxis: null,
      },
      setChartConfig: (config) => set(state => ({ chartConfig: { ...state.chartConfig, ...config }})),
    }),
    { name: 'GeoInsightStore' }
  )
);
