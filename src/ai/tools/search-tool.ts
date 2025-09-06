
'use server';
/**
 * @fileOverview Defines a Genkit tool for searching the web.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import googleIt from 'google-it';
import { scrapeUrl } from '@/services/web-scraper';

const SearchWebInputSchema = z.object({
  query: z.string().describe('A specific, targeted search query.'),
});

export const searchWeb = ai.defineTool(
  {
    name: 'searchWeb',
    description: 'Searches the web for information on a given query, scrapes the top results, and returns the combined text content. Use for very specific, new, or rare topics.',
    input: { schema: SearchWebInputSchema },
    output: { schema: z.string() },
  },
  async ({ query }) => {
    try {
      console.log(`AI is searching the web for: "${query}"`);
      const searchResults = await googleIt({ query, limit: 3, 'no-display': true });

      if (!searchResults || searchResults.length === 0) {
        return 'No search results found.';
      }

      // Scrape the top 2-3 results in parallel
      const scrapePromises = searchResults
        .slice(0, 3)
        .map(result => scrapeUrl(result.link));

      const scrapedContents = await Promise.all(scrapePromises);
      
      const combinedContent = scrapedContents
        .map((content, index) => `Source ${index + 1}: ${searchResults[index].title}\n${content}`)
        .join('\n\n---\n\n');

      return combinedContent || 'Could not extract any content from the search results.';
    } catch (error) {
      console.error('Error in searchWeb tool:', error);
      return 'An error occurred while searching the web.';
    }
  }
);
