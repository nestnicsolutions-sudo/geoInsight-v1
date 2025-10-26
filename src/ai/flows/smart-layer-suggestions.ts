
'use server';
/**
 * @fileOverview Suggests map layers based on data schema.
 * 
 * - suggestLayers - A function that suggests deck.gl layers.
 * - SmartLayerSuggestionsInput - The input type for the suggestLayers function.
 * - SmartLayerSuggestionsOutput - The return type for the suggestLayers function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const SmartLayerSuggestionsInputSchema = z.object({
  dataSample: z.string().describe("A stringified sample of the first few rows of the user's data (e.g., CSV or JSON format)."),
  columnTypes: z.object({}).catchall(z.string()).describe("A map of column names to their data types (e.g., {latitude: 'number', city: 'string'})."),
  columnNames: z.array(z.string()).describe("A list of all column names in the uploaded data."),
  mappedLatitude: z.string().nullable().describe("The column name mapped to latitude."),
  mappedLongitude: z.string().nullable().describe("The column name mapped to longitude."),
  mappedValue: z.string().nullable().describe("The column name mapped to a numerical value/metric, if any."),
  mappedCategory: z.string().nullable().describe("The column name mapped to a category/label, if any."),
});
export type SmartLayerSuggestionsInput = z.infer<typeof SmartLayerSuggestionsInputSchema>;

const SmartLayerSuggestionsOutputSchema = z.array(z.object({
    layerType: z.enum([
      "ScatterplotLayer",
      "HeatmapLayer",
      "HexagonLayer",
      "ScreenGridLayer",
      "ColumnLayer"
    ]).describe("The type of deck.gl layer being suggested."),
    rationale: z.string().describe("A concise, user-friendly explanation of why this layer is a good choice for the given data schema. Explain what the layer is good for (e.g., 'visualizing individual data points', 'showing density', etc.)."),
    initialConfiguration: z.object({}).catchall(z.any()).describe("A valid deck.gl layer configuration object for the suggested layerType."),
}));
export type SmartLayerSuggestionsOutput = z.infer<typeof SmartLayerSuggestionsOutputSchema>;

const smartLayersPrompt = ai.definePrompt({
    name: 'smartLayersPrompt',
    model: googleAI.model('gemini-pro'),
    input: { schema: SmartLayerSuggestionsInputSchema },
    output: { schema: SmartLayerSuggestionsOutputSchema },
    prompt: `You are a GIS (Geographic Information System) expert specializing in data visualization with deck.gl. Your task is to suggest the best deck.gl layers for a given dataset.

Analyze the user's data based on the provided data sample, column names, data types, and how they've been mapped.

Here is the data schema and a sample:
- Data Sample (first few rows):
\`\`\`
{{{dataSample}}}
\`\`\`
- All Column Names: {{{JSON.stringify(columnNames)}}}
- Column Data Types: {{{JSON.stringify(columnTypes)}}}
- Mapped Latitude Column: {{mappedLatitude}}
- Mapped Longitude Column: {{mappedLongitude}}
- Mapped Value/Metric Column: {{mappedValue}}
- Mapped Category Column: {{mappedCategory}}

Based on this schema and data sample, provide up to 3 relevant layer suggestions from the following list: ["ScatterplotLayer", "HeatmapLayer", "HexagonLayer", "ScreenGridLayer", "ColumnLayer"].

Your suggestions MUST follow these rules:
1.  **Guarantee a ScatterplotLayer**: You MUST ALWAYS suggest "ScatterplotLayer" as the first option. This layer is the most fundamental way to visualize individual data points and should always be available.
2.  **Suggest Density Layers**: If the dataset appears to represent point data (not polygons or lines), suggest "HeatmapLayer", "HexagonLayer", or "ScreenGridLayer" for showing density.
    -   HeatmapLayer: Good for showing general density hotspots without aggregation.
    -   HexagonLayer/ScreenGridLayer: Good for aggregating points into bins to see density patterns. Suggest HexagonLayer if a 'mappedValue' is available and appears to be a good candidate for aggregation (e.g., sales, population).
3.  **Suggest Magnitude Layer**: If a 'mappedValue' column is present and its values in the data sample are numeric and seem to represent magnitude (e.g., height, price, count), suggest "ColumnLayer". This is excellent for visualizing magnitude at specific locations using 3D columns.
4.  **Provide Rationale and Config**: For each suggestion, provide a concise 'rationale' explaining its purpose and a valid 'initialConfiguration' object. Do not include 'id' or 'data' properties in the configuration. Ensure color values are RGBA arrays (e.g., [255, 140, 0, 180]).

Example Output:
[
  {
    "layerType": "ScatterplotLayer",
    "rationale": "Ideal for visualizing individual locations. Each point on the map represents a row in your data.",
    "initialConfiguration": {
      "opacity": 0.8,
      "filled": true,
      "radiusMinPixels": 3,
      "radiusMaxPixels": 100,
      "getFillColor": [255, 140, 0, 180]
    }
  },
  {
    "layerType": "HeatmapLayer",
    "rationale": "Shows the density of data points as a smooth, colored surface. Great for identifying hotspots in your data.",
    "initialConfiguration": {
      "opacity": 0.8,
      "intensity": 1,
      "threshold": 0.03,
      "radiusPixels": 30
    }
  }
]
`,
});


const suggestLayersFlow = ai.defineFlow(
  {
    name: 'suggestLayersFlow',
    inputSchema: SmartLayerSuggestionsInputSchema,
    outputSchema: SmartLayerSuggestionsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await smartLayersPrompt(input);

      // If the AI fails or returns an empty list, ensure at least ScatterplotLayer is suggested.
      if (!output || output.length === 0) {
        throw new Error("AI returned no suggestions.");
      }
      
      // Ensure ScatterplotLayer is always first if the AI provided multiple suggestions but forgot the order.
      const scatterplotIndex = output.findIndex(s => s.layerType === 'ScatterplotLayer');
      if (scatterplotIndex > 0) {
        const scatterplotSuggestion = output.splice(scatterplotIndex, 1)[0];
        output.unshift(scatterplotSuggestion);
      } else if (scatterplotIndex === -1) {
        // If the AI completely forgot to add Scatterplot, add it manually.
         output.unshift({
            layerType: "ScatterplotLayer",
            rationale: "Ideal for visualizing individual locations. Each point on the map represents a row in your data.",
            initialConfiguration: {
                opacity: 0.8,
                filled: true,
                radiusMinPixels: 3,
                radiusMaxPixels: 100,
                getFillColor: [255, 140, 0, 180]
            }
        });
      }
      
      return output;

    } catch (error) {
        console.error("Error in suggestLayersFlow, returning default.", error);
        // As a final fallback, if any error occurs, return the default ScatterplotLayer.
        return [
            {
                layerType: "ScatterplotLayer",
                rationale: "Ideal for visualizing individual locations. Each point on the map represents a row in your data.",
                initialConfiguration: {
                    opacity: 0.8,
                    filled: true,
                    radiusMinPixels: 3,
                    radiusMaxPixels: 100,
                    getFillColor: [255, 140, 0, 180]
                }
            }
        ];
    }
  }
);


export async function suggestLayers(input: SmartLayerSuggestionsInput): Promise<SmartLayerSuggestionsOutput> {
  return suggestLayersFlow(input);
}
