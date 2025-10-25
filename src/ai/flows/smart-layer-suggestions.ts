'use server';

/**
 * @fileOverview Provides smart layer suggestions based on uploaded data and column mappings.
 *
 * - suggestLayers - A function that suggests Deck.GL layer types and configurations.
 * - SmartLayerSuggestionsInput - The input type for the suggestLayers function.
 * - SmartLayerSuggestionsOutput - The return type for the suggestLayers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartLayerSuggestionsInputSchema = z.object({
  columnTypes: z
    .record(z.string(), z.string())
    .describe(
      'A map of column names to their data types (e.g., {latitude: number, longitude: number, value: number, category: string}).'
    ),
  columnNames: z
    .array(z.string())
    .describe('A list of column names in the uploaded data.'),
  mappedLatitude: z
    .string()
    .optional()
    .describe('The column name mapped to latitude.'),
  mappedLongitude: z
    .string()
    .optional()
    .describe('The column name mapped to longitude.'),
  mappedValue: z
    .string()
    .optional()
    .describe('The column name mapped to a numerical value/metric.'),
  mappedCategory: z
    .string()
    .optional()
    .describe('The column name mapped to a category/label.'),
});

export type SmartLayerSuggestionsInput = z.infer<
  typeof SmartLayerSuggestionsInputSchema
>;

const SmartLayerSuggestionsOutputSchema = z.array(z.object({
  layerType: z.string().describe('The suggested Deck.GL layer type.'),
  initialConfiguration: z
    .record(z.string(), z.any())
    .describe('Recommended initial configuration options for the layer.'),
  rationale: z
    .string()
    .describe('Explanation of why this layer type is suitable.'),
}));

export type SmartLayerSuggestionsOutput = z.infer<
  typeof SmartLayerSuggestionsOutputSchema
>;

export async function suggestLayers(
  input: SmartLayerSuggestionsInput
): Promise<SmartLayerSuggestionsOutput> {
  return suggestLayersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartLayerSuggestionsPrompt',
  input: {schema: SmartLayerSuggestionsInputSchema},
  output: {schema: SmartLayerSuggestionsOutputSchema},
  prompt: `You are an expert in data visualization using Deck.GL.

  Based on the following data column types and mappings, suggest suitable Deck.GL layer types and initial configurations. Provide a rationale for each suggestion.

  Column Types: {{{JSON.stringify(columnTypes)}}}
  Column Names: {{{JSON.stringify(columnNames)}}}
  Mapped Latitude Column: {{{mappedLatitude}}}
  Mapped Longitude Column: {{{mappedLongitude}}}
  Mapped Value Column: {{{mappedValue}}}
  Mapped Category Column: {{{mappedCategory}}}

  Consider these layer types:
  - ScatterplotLayer: Good for visualizing individual points with size and color based on values.
  - HexagonLayer: Good for aggregating data into hexagonal bins to show density.
  - HeatmapLayer: Good for showing intensity as a color gradient.
  - GeoJsonLayer: Good for visualizing geographic boundaries and polygons.
  - ArcLayer: Good for showing connections between origins and destinations.
  - ScreenGridLayer: A faster alternative to HexagonLayer for large datasets.
  - IconLayer: Use custom marker icons based on categories.
  - ColumnLayer: Good for 3D vertical bars/columns representing metric values.

  Return an array of layer suggestions, each with a layerType, initialConfiguration, and rationale. The output should be a valid JSON array.
  The initialConfiguration must include appropriate fields from the schema like latitude, longitude, and radius.
  The initialConfiguration must also include color range.
  The initialConfiguration must include opacity.
  The rationale should be short and concise, explaining why the suggested layer type is appropriate for the given data.
  `,
});

const suggestLayersFlow = ai.defineFlow(
  {
    name: 'suggestLayersFlow',
    inputSchema: SmartLayerSuggestionsInputSchema,
    outputSchema: SmartLayerSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
