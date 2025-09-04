import { SelectorConfig } from './types';
/**
 * Default configuration for Sherlock scraping
 */
export declare const defaultConfig: SherlockConfig;
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
export declare const sherlockUrlPatterns: {
    /** Watson profile URL pattern */
    watsonProfile: RegExp;
    /** Contest URL pattern */
    contest: RegExp;
    /** Leaderboard URL pattern */
    leaderboard: RegExp;
};
/**
 * Validates if a URL is a valid Sherlock profile URL
 */
export declare function isValidSherlockUrl(url: string): boolean;
/**
 * Extracts watson username from Sherlock URL
 */
export declare function extractWatsonUsername(url: string): string | null;
//# sourceMappingURL=config.d.ts.map