
'use server';
/**
 * @fileOverview An AI-based image analyzer for ocular images.
 *
 * - analyzeImage - A function that takes a user's image and returns a structured analysis.
 * - ImageAnalyzerInput - The input type for the analyzeImage function.
 * - ImageAnalyzerOutput - The return type for the analyzeImage function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// Define the input schema for the image analyzer
const ImageAnalyzerInputSchema = z.object({
  imageDataUri: z.string().describe("A data URI of an ocular image (e.g., fundus photo). It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ImageAnalyzerInput = z.infer<typeof ImageAnalyzerInputSchema>;

// Define the output schema for the image analyzer
const ImageAnalyzerOutputSchema = z.object({
  description: z.string().describe("A general overview and description of the provided ocular image."),
  opticDisc: z.string().describe("Detailed analysis of the optic disc, including cup-to-disc ratio, margins, and neuroretinal rim."),
  macula: z.string().describe("Detailed analysis of the macula, including foveal reflex and any pigmentary changes or abnormalities."),
  vessels: z.string().describe("Detailed analysis of the retinal blood vessels, including artery-to-vein ratio and any signs of tortuosity or nipping."),
  anomalies: z.string().describe("A summary of any potential anomalies, abnormalities, or noteworthy features detected in the image."),
});
export type ImageAnalyzerOutput = z.infer<typeof ImageAnalyzerOutputSchema>;

// Exported wrapper function to be called from the UI
export async function analyzeImage(input: ImageAnalyzerInput): Promise<ImageAnalyzerOutput> {
  return imageAnalyzerFlow(input);
}

// Define the Genkit prompt
const imageAnalyzerPrompt = ai.definePrompt({
  name: 'imageAnalyzerPrompt',
  input: { schema: ImageAnalyzerInputSchema },
  output: { schema: ImageAnalyzerOutputSchema },
  model: googleAI('gemini-1.5-flash-latest'),
  prompt: `You are an expert ophthalmic image analyst. A user has uploaded the following ocular image.

Your task is to:
1.  Provide a general description of the image.
2.  Analyze the key features: Optic Disc, Macula, and Vessels. Be detailed and specific in your analysis.
3.  Identify and summarize any potential anomalies or noteworthy features.
4.  Your response must be professional, educational, and structured according to the output schema. Do not provide a diagnosis.

**Ocular Image:**
{{media url=imageDataUri}}
`,
});

// Define the Genkit flow
const imageAnalyzerFlow = ai.defineFlow(
  {
    name: 'imageAnalyzerFlow',
    inputSchema: ImageAnalyzerInputSchema,
    outputSchema: ImageAnalyzerOutputSchema,
  },
  async (input) => {
    const { output } = await imageAnalyzerPrompt(input);
    return output!;
  }
);
