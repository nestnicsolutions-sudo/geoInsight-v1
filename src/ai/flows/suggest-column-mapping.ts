'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting column mappings for spatial data.
 *
 * - suggestColumnMapping - A function that suggests mappings for latitude, longitude, value, and category columns.
 * - SuggestColumnMappingInput - The input type for the suggestColumnMapping function.
 * - SuggestColumnMappingOutput - The return type for the suggestColumnMapping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestColumnMappingInputSchema = z.object({
  columnNames: z
    .array(z.string())
    .describe('A list of column names from the user\'s uploaded dataset.'),
});
export type SuggestColumnMappingInput = z.infer<
  typeof SuggestColumnMappingInputSchema
>;

const SuggestColumnMappingOutputSchema = z.object({
  latitude: z
    .string()
    .nullable()
    .describe(
      'The suggested column name for latitude. Should be null if no suitable column is found.'
    ),
  longitude: z
    .string()
    .nullable()
    .describe(
      'The suggested column name for longitude. Should be null if no suitable column is found.'
    ),
  value: z
    .string()
    .nullable()
    .describe(
      'The suggested column name for a numerical value/metric. Should be null if no suitable column is found.'
    ),
  category: z
    .string()
    .nullable()
    .describe(
      'The suggested column name for a categorical value. Should be null if no suitable column is found.'
    ),
});
export type SuggestColumnMappingOutput = z.infer<
  typeof SuggestColumnMappingOutputSchema
>;

export async function suggestColumnMapping(
  input: SuggestColumnMappingInput
): Promise<SuggestColumnMappingOutput> {
  return suggestColumnMappingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestColumnMappingPrompt',
  input: {schema: SuggestColumnMappingInputSchema},
  output: {schema: SuggestColumnMappingOutputSchema},
  prompt: `You are an expert data analyst specializing in geographic data. Your task is to automatically identify the most likely columns for latitude, longitude, a numerical value (metric), and a category from a given list of column names.

  Analyze the following column names:
  {{{JSON.stringify(columnNames)}}}

  Guidelines for mapping:
  - Latitude: Look for names like 'latitude', 'lat', 'y', 'y_coord', 'latitude_deg'.
  - Longitude: Look for names like 'longitude', 'lon', 'long', 'x', 'x_coord', 'longitude_deg'.
  - Value/Metric: Prefer numerical columns that are not latitude or longitude. Look for names like 'value', 'metric', 'population', 'magnitude', 'size', 'count', 'amount', 'price'.
  - Category: Prefer columns with string/text data that could be used for grouping. Look for names like 'category', 'type', 'group', 'class', 'name', 'label', 'id'.

  Return a JSON object with your suggested mappings for 'latitude', 'longitude', 'value', and 'category'. If no suitable column is found for a specific mapping, its value should be null. Do not map the same column to multiple fields. Prioritize latitude and longitude mappings.
  `,
});

const suggestColumnMappingFlow = ai.defineFlow(
  {
    name: 'suggestColumnMappingFlow',
    inputSchema: SuggestColumnMappingInputSchema,
    outputSchema: SuggestColumnMappingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
