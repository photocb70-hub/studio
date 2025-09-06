
'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes the main textual content from a given URL.
 * @param url The URL of the web page to scrape.
 * @returns The extracted text content, or an empty string if scraping fails.
 */
export async function scrapeUrl(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    // Remove elements that are typically not part of the main content
    $('nav, footer, script, style, .ads, .sidebar, .header, .footer, #nav, #footer').remove();

    // A simple heuristic to get the main content: join all the text in the body.
    // More complex logic could be added here to find the main content container.
    const mainContent = $('body').text();

    // Clean up the text: remove excessive whitespace and newlines
    const cleanedText = mainContent.replace(/\s\s+/g, ' ').trim();
    
    return cleanedText;

  } catch (error) {
    console.error(`Error scraping URL ${url}:`, error);
    return ''; // Return empty string on failure
  }
}
