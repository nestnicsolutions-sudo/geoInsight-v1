'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a textual summary of key insights and trends from spatial data visualizations.
 *
 * - explainDataInsights - A function that generates a summary of data insights.
 * - ExplainDataInsightsInput - The input type for the explainDataInsights function.
 * - ExplainDataInsightsOutput - The return type for the explainDataInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainDataInsightsInputSchema = z.object({
  datasetDescription: z
    .string()
    .describe(
      'A detailed description of the dataset, including its origin, purpose, and key fields.'
    ),
  visualizationDescription: z
    .string()
    .describe(
      'A description of the visualization created, including the layer types used, color schemes, and any filters applied.'
    ),
  chartSummaries: z
    .string()
    .describe(
      'Summaries of the key trends and insights observed in the charts associated with the visualization.'
    ),
});
export type ExplainDataInsightsInput = z.infer<
  typeof ExplainDataInsightsInputSchema
>;

const ExplainDataInsightsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise textual summary of the key insights and trends present in the data visualization and associated charts.'
    ),
});
export type ExplainDataInsightsOutput = z.infer<
  typeof ExplainDataInsightsOutputSchema
>;

export async function explainDataInsights(
  input: ExplainDataInsightsInput
): Promise<ExplainDataInsightsOutput> {
  return explainDataInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainDataInsightsPrompt',
  input: {schema: ExplainDataInsightsInputSchema},
  output: {schema: ExplainDataInsightsOutputSchema},
  prompt: `You are an expert data analyst tasked with summarizing the key insights from a spatial data visualization.

  Based on the provided dataset description, visualization details, and chart summaries, generate a concise textual summary of the most important trends and findings.

  Dataset Description: {{{datasetDescription}}}
  Visualization Description: {{{visualizationDescription}}}
  Chart Summaries: {{{chartSummaries}}}

  Summary:`,
});

const explainDataInsightsFlow = ai.defineFlow(
  {
    name: 'explainDataInsightsFlow',
    inputSchema: ExplainDataInsightsInputSchema,
    outputSchema: ExplainDataInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
