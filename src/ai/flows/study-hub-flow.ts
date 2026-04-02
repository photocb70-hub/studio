
'use server';
/**
 * @fileOverview AI flow for analyzing and rewriting optical course chapters.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudyAnalysisInputSchema = z.object({
  unitTitle: z.string().describe('The title of the course chapter.'),
  content: z.string().describe('The raw text content of the chapter.'),
});
export type StudyAnalysisInput = z.infer<typeof StudyAnalysisInputSchema>;

const StudyAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key learning objectives and technical points.'),
  professionalRewrite: z.string().describe('A structured, professional rewrite of the content using clear headers and bullet points.'),
});
export type StudyAnalysisOutput = z.infer<typeof StudyAnalysisOutputSchema>;

export async function analyzeCourseChapter(input: StudyAnalysisInput): Promise<StudyAnalysisOutput> {
  return studyHubFlow(input);
}

const studyPrompt = ai.definePrompt({
  name: 'studyPrompt',
  input: { schema: StudyAnalysisInputSchema },
  output: { schema: StudyAnalysisOutputSchema },
  prompt: `You are an expert optical educator and clinical supervisor. You have been provided with text from an optical dispensing course chapter titled "{{{unitTitle}}}".

Your task is to:
1. **Summarize**: Create a concise summary of the most critical technical and clinical information a student needs to know.
2. **Rewrite**: Restructure the content into a "Professional Reference Guide" format. Use clear headings, professional terminology, and bullet points. Focus on making the information easy to apply in a clinical setting.
3. **Accuracy**: Ensure all optical formulas and clinical procedures mentioned are correctly preserved and clearly explained.

**Chapter Content:**
{{{content}}}`,
});

const studyHubFlow = ai.defineFlow(
  {
    name: 'studyHubFlow',
    inputSchema: StudyAnalysisInputSchema,
    outputSchema: StudyAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await studyPrompt(input);
    if (!output) throw new Error('AI failed to analyze the chapter.');
    return output;
  }
);
