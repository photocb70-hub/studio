
'use server';
/**
 * @fileOverview A service to scrape the main content from a given URL.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetches the HTML from a URL and extracts the main text content,
 * attempting to remove boilerplate like navbars, footers, and ads.
 * @param url The URL of the web page to scrape.
 * @returns The cleaned text content of the page, or an error message.
 */
export async function scrapeUrl(url: string): Promise<string> {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);

    // Remove common non-content elements
    $('nav, footer, script, style, aside, [role="navigation"], [role="banner"], [role="contentinfo"], .ads, #ad, .advert').remove();

    // Select common main content containers
    let mainContent = $('main').text() || $('article').text() || $('.post').text() || $('#content').text();

    // If specific containers aren't found, fall back to the body
    if (!mainContent) {
      mainContent = $('body').text();
    }

    // Clean up the text: remove excess whitespace and newlines
    const cleanedText = mainContent
      .replace(/\s\s+/g, ' ') // Replace multiple whitespace chars with a single space
      .replace(/\n\n+/g, '\n') // Replace multiple newlines with a single one
      .trim();

    // Return a snippet to avoid excessive length
    return cleanedText.substring(0, 3000);

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    if (axios.isAxiosError(error)) {
        return `Error: Could not fetch content from the URL. Status: ${error.response?.status}`;
    }
    return 'Error: An unknown error occurred during web scraping.';
  }
}
