
'use server';
/**
 * @fileOverview AI flow for analyzing and rewriting optical course chapters.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import pdf from 'pdf-parse';

const StudyAnalysisInputSchema = z.object({
  unitTitle: z.string().describe('The title of the course chapter.'),
  content: z.string().describe('The raw text content of the chapter.'),
});
export type StudyAnalysisInput = z.infer<typeof StudyAnalysisInputSchema>;

const StudyAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key learning objectives and technical points.'),
  professionalRewrite: z.string().describe('A structured, professional rewrite of the content using clear headers and bullet points.'),
  suggestedFigures: z.array(z.string()).describe('A list of suggested diagrams or figures that would help illustrate the concepts.'),
  clinicalNotes: z.string().describe('Key clinical "pro-tips" or real-world application notes for the dispensing desk.'),
});
export type StudyAnalysisOutput = z.infer<typeof StudyAnalysisOutputSchema>;

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

export async function analyzeCourseChapter(input: StudyAnalysisInput): Promise<StudyAnalysisOutput> {
  try {
    return await studyHubFlow(input);
  } catch (error) {
    console.error('Error in analyzeCourseChapter:', error);
    throw error;
  }
}

const studyPrompt = ai.definePrompt({
  name: 'studyPrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: { schema: StudyAnalysisInputSchema },
  output: { schema: StudyAnalysisOutputSchema },
  prompt: `You are an expert optical educator and clinical supervisor at a high-level training academy. You have been provided with text from an optical dispensing course chapter titled "{{{unitTitle}}}".

Your task is to:
1. **Summarize**: Create a concise summary of the most critical technical and clinical information a student needs to know.
2. **Rewrite**: Restructure the content into a "Professional Reference Guide" format. Use clear headings (H2, H3), professional terminology, and bullet points. Focus on making the information easy to apply in a clinical setting.
3. **Figures**: Identify which parts of the text would benefit most from a diagram (e.g., "A ray diagram showing light passing through a meniscus lens"). Describe at least 3 essential figures.
4. **Clinical Notes**: Provide a dedicated section of "Pro-Tips" for the dispensing desk—common pitfalls, patient communication tips, or verification checks related to this specific topic.
5. **Accuracy**: Ensure all optical formulas and clinical procedures mentioned are correctly preserved and clearly explained.

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
    try {
      const { output } = await studyPrompt(input);
      if (!output) throw new Error('AI failed to analyze the chapter.');
      return output;
    } catch (error) {
      console.error('Error in studyHubFlow:', error);
      throw error;
    }
  }
);
