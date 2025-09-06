
'use server';
/**
 * @fileOverview An AI-based image analyzer for ocular images.
 *
 * - analyzeImage - A function that takes a user's image and returns a structured analysis and an annotated image.
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

// Define the output schema for the text analysis part
const TextAnalysisOutputSchema = z.object({
  description: z.string().describe("A general overview and description of the provided ocular image."),
  opticDisc: z.string().describe("Detailed analysis of the optic disc, including cup-to-disc ratio, margins, and neuroretinal rim."),
  macula: z.string().describe("Detailed analysis of the macula, including foveal reflex and any pigmentary changes or abnormalities."),
  vessels: z.string().describe("Detailed analysis of the retinal blood vessels, including artery-to-vein ratio and any signs of tortuosity or nipping."),
  anomalies: z.string().describe("A summary of any potential anomalies, abnormalities, or noteworthy features detected in the image."),
});

// Define the final combined output schema
const ImageAnalyzerOutputSchema = TextAnalysisOutputSchema.extend({
    annotatedImageDataUri: z.string().describe("A data URI of the AI-annotated ocular image. It must include a MIME type and use Base64 encoding."),
});
export type ImageAnalyzerOutput = z.infer<typeof ImageAnalyzerOutputSchema>;

// Exported wrapper function to be called from the UI
export async function analyzeImage(input: ImageAnalyzerInput): Promise<ImageAnalyzerOutput> {
  return imageAnalyzerFlow(input);
}

// Define the Genkit prompt for text analysis
const textAnalyzerPrompt = ai.definePrompt({
  name: 'textAnalyzerPrompt',
  input: { schema: ImageAnalyzerInputSchema },
  output: { schema: TextAnalysisOutputSchema },
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
    // Run text analysis and image annotation in parallel
    const [textAnalysisResponse, imageAnnotationResponse] = await Promise.all([
      textAnalyzerPrompt(input),
      ai.generate({
        model: googleAI('gemini-2.5-flash-image-preview'),
        prompt: [
          { media: { url: input.imageDataUri } },
          { text: "Analyze this ocular fundus image. Draw a clear, thin, yellow circle around the optic disc. Draw a clear, thin, light-blue circle around the macula. If you see any clear anomalies like hemorrhages or exudates, draw a thin red arrow pointing to one of them. The annotations should be precise and not obscure the underlying features. Return only the annotated image." }
        ],
        config: {
          responseModalities: ['IMAGE'],
        }
      })
    ]);

    const textOutput = textAnalysisResponse.output;
    if (!textOutput) {
        throw new Error('Text analysis failed to produce an output.');
    }

    const annotatedImage = imageAnnotationResponse.media;
    if (!annotatedImage?.url) {
        throw new Error('Image annotation failed to produce an output.');
    }

    return {
      ...textOutput,
      annotatedImageDataUri: annotatedImage.url,
    };
  }
);
