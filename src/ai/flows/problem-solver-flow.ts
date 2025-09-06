
'use server';
/**
 * @fileOverview An AI-based problem solver for optical scenarios.
 *
 * - solveProblem - A function that takes a user's query about an optical problem and returns a structured solution.
 * - ProblemSolverInput - The input type for the solveProblem function.
 * - ProblemSolverOutput - The return type for the solveProblem function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// Define the input schema for the problem solver
const ProblemSolverInputSchema = z.object({
  query: z.string().describe('A detailed description of the optical problem or patient scenario, including current and previous prescription/frame data.'),
});
export type ProblemSolverInput = z.infer<typeof ProblemSolverInputSchema>;

// Define the output schema for the problem solver
const ProblemSolverOutputSchema = z.object({
  analysis: z.string().describe("A brief analysis of the core issue, comparing current and previous data to identify likely causes."),
  solution: z.string().describe('A step-by-step recommended solution or course of action based on the analysis.'),
  considerations: z.string().describe('Any further considerations, warnings, or alternative approaches the user should be aware of.'),
});
export type ProblemSolverOutput = z.infer<typeof ProblemSolverOutputSchema>;

// Exported wrapper function to be called from the UI
export async function solveProblem(input: ProblemSolverInput): Promise<ProblemSolverOutput> {
  return problemSolverFlow(input);
}

// Define the Genkit prompt
const problemSolverPrompt = ai.definePrompt({
  name: 'problemSolverPrompt',
  input: { schema: ProblemSolverInputSchema },
  output: { schema: ProblemSolverOutputSchema, format: 'json' },
  model: googleAI('gemini-1.5-flash-latest'),
  prompt: `You are an expert ophthalmic optician and AI problem solver. A user has presented you with the following complex optical scenario, including current and previous patient data.

Your task is to:
1.  Thoroughly analyze all the provided information.
2.  Pay close attention to the differences between the patient's **current** and **previous** prescription, measurements, and frame details. Use these differences as the primary basis for your diagnosis.
3.  Based on your analysis of the changes, identify the most likely cause(s) of the patient's complaint.
4.  Formulate a clear, actionable, step-by-step solution.
5.  List any important further considerations or alternative approaches.

Your response must be professional, accurate, and easy for an optical professional to understand. You must respond in the requested JSON format.

**Patient Data:**
{{{query}}}
`,
});

// Define the Genkit flow
const problemSolverFlow = ai.defineFlow(
  {
    name: 'problemSolverFlow',
    inputSchema: ProblemSolverInputSchema,
    outputSchema: ProblemSolverOutputSchema,
  },
  async (input) => {
    const { output } = await problemSolverPrompt(input);
    if (!output) {
      throw new Error("The AI failed to produce a valid response.");
    }
    return output;
  }
);
