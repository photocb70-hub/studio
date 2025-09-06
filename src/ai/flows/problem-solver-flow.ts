'use server';
/**
 * @fileOverview An AI-based problem solver for optical dispensing issues.
 *
 * - solveProblem - A function that takes a user's scenario and returns a structured analysis.
 * - ProblemSolverInput - The input type for the solveProblem function.
 * - ProblemSolverOutput - The return type for the solveProblem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const rxSchema = z.object({
    sphere: z.number().optional(),
    cylinder: z.number().optional(),
    axis: z.number().optional(),
    add: z.string().optional(),
    prism: z.string().optional(),
    base: z.string().optional(),
    pd: z.string().optional(),
    hts: z.string().optional(),
});

export const ProblemSolverInputSchema = z.object({
  problem: z.string().describe("The primary complaint or issue the patient is experiencing."),
  currentRx: rxSchema.optional().describe("The patient's current, new prescription details."),
  previousRx: rxSchema.optional().describe("The patient's previous prescription details, for comparison."),
  lens: z.object({
    type: z.string().optional().describe("The type or design of the lens (e.g., Single Vision, Varifocal)."),
    material: z.string().optional().describe("The lens material or refractive index."),
  }).optional(),
  isKnob: z.boolean().optional().describe("A humorous, secret flag indicating if the user believes the patient is being difficult. The AI should factor this in with a touch of wit."),
});
export type ProblemSolverInput = z.infer<typeof ProblemSolverInputSchema>;

export const ProblemSolverOutputSchema = z.object({
  analysis: z.string().describe("A detailed analysis of the potential root causes of the problem, considering all provided data."),
  solution: z.string().describe("A step-by-step recommended solution or set of actions to resolve the issue. This should be formatted with markdown for lists."),
  considerations: z.string().describe("A list of other potential factors or further considerations the user should keep in mind."),
});
export type ProblemSolverOutput = z.infer<typeof ProblemSolverOutputSchema>;

export async function solveProblem(input: ProblemSolverInput): Promise<ProblemSolverOutput> {
  return problemSolverFlow(input);
}

const formatRx = (rx: z.infer<typeof rxSchema> | undefined) => {
    if (!rx) return 'Not provided.';
    const parts = [];
    if (rx.sphere !== undefined) parts.push(`Sphere: ${rx.sphere.toFixed(2)}`);
    if (rx.cylinder !== undefined) parts.push(`Cylinder: ${rx.cylinder.toFixed(2)}`);
    if (rx.axis !== undefined) parts.push(`Axis: ${rx.axis}`);
    if (rx.add) parts.push(`Add: ${rx.add}`);
    if (rx.prism) parts.push(`Prism: ${rx.prism}`);
    if (rx.base) parts.push(`Base: ${rx.base}`);
    if (rx.pd) parts.push(`PD: ${rx.pd}`);
    if (rx.hts) parts.push(`Heights: ${rx.hts}`);
    return parts.length > 0 ? parts.join(', ') : 'Not provided.';
}

const problemSolverFlow = ai.defineFlow(
  {
    name: 'problemSolverFlow',
    inputSchema: ProblemSolverInputSchema,
    outputSchema: ProblemSolverOutputSchema,
  },
  async (input) => {
    const prompt = `You are an expert dispensing optician and AI problem solver. A user has submitted the following optical non-tolerance case.

Analyze the data provided and generate a structured response with a detailed analysis, a recommended solution, and any further considerations. Be professional, concise, and base your analysis on optical principles.

**Case Details:**

*   **Primary Complaint:**
    {{{problem}}}

*   **Current Prescription:**
    ${formatRx(input.currentRx)}

*   **Previous Prescription:**
    ${formatRx(input.previousRx)}

*   **Lens Details:**
    *   Type/Design: ${input.lens?.type || 'Not provided.'}
    *   Material/Index: ${input.lens?.material || 'Not provided.'}
    
{{#if isKnob}}
*   **Secret Diagnostic Flag:**
    The user has indicated that the patient is being particularly difficult. Acknowledge this with professional humor in your analysis and suggest strategies for patient communication and managing expectations, but still provide a thorough, evidence-based optical analysis as the primary response. For the solution, start with: "While the 'subjective refinement' phase with the patient is crucial, let's first ensure our optical foundations are solid."
{{/if}}

Provide your response in the required JSON format with fields for analysis, solution, and considerations. The solution should be a markdown list.`;

    const { output } = await ai.generate({
        prompt,
        model: 'googleai/gemini-1.5-flash-latest',
        output: { schema: ProblemSolverOutputSchema },
    });
    
    if (!output) {
      throw new Error('The AI model failed to generate a response.');
    }
    return output;
  }
);
