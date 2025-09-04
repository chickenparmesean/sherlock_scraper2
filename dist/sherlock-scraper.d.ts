import { ScrapingResult, ScrapingOptions, ProfileData } from './types';
import { SherlockConfig } from './config';
/**
 * Main class for scraping Sherlock protocol auditor profiles
 */
export declare class SherlockScraper {
    private config;
    private options;
    constructor(config?: Partial<SherlockConfig>, options?: ScrapingOptions);
    /**
     * Scrapes profile image from a Sherlock profile URL
     * @param sherlockUrl - The Sherlock profile URL to scrape
     * @param options - Optional scraping options to override defaults
     * @returns Promise resolving to scraping result
     */
    scrapeProfileImage(sherlockUrl: string, options?: ScrapingOptions): Promise<ScrapingResult>;
    /**
     * Extracts image URL from HTML content
     * @private
     */
    private extractImageFromHtml;
    /**
     * Scrapes complete profile data from a Sherlock profile URL
     * @param sherlockUrl - The Sherlock profile URL to scrape
     * @param options - Optional scraping options
     * @returns Promise resolving to profile data
     */
    scrapeProfile(sherlockUrl: string, options?: ScrapingOptions): Promise<ProfileData>;
    /**
     * Extracts achievements data from HTML content
     * @private
     */
    private extractAchievementsFromHtml;
    /**
     * Batch scraping for multiple Sherlock URLs
     * @param urls - Array of Sherlock URLs to scrape
     * @param options - Optional scraping options
     * @param concurrency - Number of concurrent requests (default: 3)
     * @returns Promise resolving to array of scraping results
     */
    scrapeMultiple(urls: string[], options?: ScrapingOptions, concurrency?: number): Promise<ScrapingResult[]>;
    /**
     * Updates the scraper configuration
     * @param config - Partial configuration to merge with existing config
     */
    updateConfig(config: Partial<SherlockConfig>): void;
    /**
     * Updates the default scraping options
     * @param options - Partial options to merge with existing options
     */
    updateOptions(options: Partial<ScrapingOptions>): void;
}
//# sourceMappingURL=sherlock-scraper.d.ts.map