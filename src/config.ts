import { SelectorConfig } from './types';

/**
 * Default configuration for Sherlock scraping
 */
export const defaultConfig: SherlockConfig = {
  selectors: {
    imageSelectors: [
      'img[src*="twitter_images"]',    // Twitter profile images
      'img[src*="sherlock-files"]',    // Any sherlock files
      'img[alt*="profile"]',           // Alt text contains profile
      'img:first-of-type',             // First image on page
    ],
    baseUrl: 'https://audits.sherlock.xyz',
    nextImagePattern: /^\/_next\/image\?url=/,
  },
  defaultOptions: {
    convertToBase64: true,
    timeout: 10000,
    includeMetadata: true,
    userAgent: 'Mozilla/5.0 (compatible; SherlockScraper/1.0)',
    enableLogging: false,
  },
};

/**
 * Complete configuration interface
 */
export interface SherlockConfig {
  selectors: SelectorConfig;
  defaultOptions: {
    convertToBase64: boolean;
    timeout: number;
    includeMetadata: boolean;
    userAgent: string;
    enableLogging: boolean;
  };
}

/**
 * Common Sherlock URL patterns
 */
export const sherlockUrlPatterns = {
  /** Watson profile URL pattern */
  watsonProfile: /^https:\/\/audits\.sherlock\.xyz\/watson\/([^\/]+)\/?$/,
  /** Contest URL pattern */
  contest: /^https:\/\/audits\.sherlock\.xyz\/contests\/([^\/]+)\/?$/,
  /** Leaderboard URL pattern */
  leaderboard: /^https:\/\/audits\.sherlock\.xyz\/leaderboard\/?$/,
};

/**
 * Validates if a URL is a valid Sherlock profile URL
 */
export function isValidSherlockUrl(url: string): boolean {
  return sherlockUrlPatterns.watsonProfile.test(url);
}

/**
 * Extracts watson username from Sherlock URL
 */
export function extractWatsonUsername(url: string): string | null {
  const match = url.match(sherlockUrlPatterns.watsonProfile);
  return match ? match[1] : null;
}