'use server';

/**
 * @fileOverview An AI agent that analyzes lens prescription tolerance.
 *
 * - analyzeRxTolerance - A function that analyzes lens prescription tolerance and advises on refabrication.
 * - RxToleranceInput - The input type for the analyzeRxTolerance function.
 * - RxToleranceOutput - The return type for the analyzeRxTolerance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RxToleranceInputSchema = z.object({
  sphere: z
    .number()
    .describe('Sphere power of the lens in diopters (e.g., -2.50)'),
  cylinder: z
    .number()
    .describe('Cylinder power of the lens in diopters (e.g., -1.00)'),
  axis: z.number().describe('Axis of the cylinder in degrees (e.g., 180)'),
  add: z
    .number()
    .optional()
    .describe('Addition power for multifocal lenses (optional, e.g., 2.25)'),
  prism: z
    .number()
    .optional()
    .describe('Prism power in diopters (optional, e.g., 1.0)'),
  base: z
    .string()
    .optional()
    .describe('Prism base direction (optional, e.g., BU for base up)'),
});
export type RxToleranceInput = z.infer<typeof RxToleranceInputSchema>;

const RxToleranceOutputSchema = z.object({
  isInTolerance: z
    .boolean()
    .describe('Whether the lens prescription is within tolerance limits'),
  advice:
    z.string().describe('Advice on whether refabrication is needed'),
  detailedAnalysis: z
    .string()
    .describe('Detailed analysis of the prescription and tolerance'),
});
export type RxToleranceOutput = z.infer<typeof RxToleranceOutputSchema>;

export async function analyzeRxTolerance(
  input: RxToleranceInput
): Promise<RxToleranceOutput> {
  return analyzeRxToleranceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rxTolerancePrompt',
  input: {schema: RxToleranceInputSchema},
  output: {schema: RxToleranceOutputSchema},
  prompt: `You are an experienced optician who analyzes lens prescriptions to determine if they are within industry-standard tolerance limits.

  Given the following lens prescription:
  - Sphere: {{{sphere}}} D
  - Cylinder: {{{cylinder}}} D
  - Axis: {{{axis}}} degrees
  {{#if add}}
  - Add: {{{add}}} D
  {{/if}}
  {{#if prism}}
  - Prism: {{{prism}}} D
  - Base: {{{base}}}
  {{/if}}

  Analyze whether this prescription is within tolerance based on industry standards (ANSI Z80.09).
  Provide a detailed analysis explaining your determination. Then, provide advice on whether refabrication is needed.
  Set the isInTolerance field to true if the prescription is within tolerance; otherwise, set it to false.
  Ensure that the output is well-formatted and easy to understand.

  Here's an example of what your detailed analysis might look like:
  "The sphere power is -2.50 D, which is within the tolerance of +/- 0.13 D for prescriptions between -2.00 D and -4.00 D according to ANSI Z80.09. The cylinder power is -1.00 D, which is within the tolerance of +/- 0.13 D. The axis is 180 degrees, which is within the tolerance of +/- 2 degrees. Therefore, this prescription is within tolerance."

  Output the final determination in JSON format.
  `, config: {safetySettings: [{
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      }]},
});

const analyzeRxToleranceFlow = ai.defineFlow(
  {
    name: 'analyzeRxToleranceFlow',
    inputSchema: RxToleranceInputSchema,
    outputSchema: RxToleranceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
