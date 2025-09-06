
'use server';
/**
 * @fileOverview A Genkit tool for performing web searches and scraping content.
 *
 * - searchWeb - The main tool function that the AI can call.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { scrapeUrl } from '@/services/web-scraper';
import googleIt from 'google-it';

export const searchWeb = ai.defineTool(
  {
    name: 'searchWeb',
    description: 'Performs a web search to find up-to-date information on a given topic, scraping the top results for context.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.string().describe('A compilation of the text content from the top search results.'),
  },
  async (input) => {
    try {
      const searchResults = await googleIt({ query: input.query, disableConsole: true });

      // Scrape the top 2 results for content.
      const scrapePromises = searchResults.slice(0, 2).map(result => scrapeUrl(result.link));
      const scrapedContents = await Promise.all(scrapePromises);

      // Combine the content from all scraped pages.
      const combinedContent = scrapedContents
        .filter(content => content) // Filter out any failed scrapes
        .join('\n\n---\n\n');

      if (!combinedContent) {
        return 'No relevant content could be scraped from the web search results.';
      }

      return combinedContent;

    } catch (error) {
      console.error('Error performing web search:', error);
      return 'An error occurred while trying to search the web.';
    }
  }
);
