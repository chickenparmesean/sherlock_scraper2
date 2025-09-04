/**
 * Result of scraping a Sherlock profile
 */
export interface ScrapingResult {
    success: boolean;
    profileImageUrl?: string;
    profileImageBase64?: string;
    error?: string;
    metadata?: {
        originalUrl: string;
        finalImageUrl?: string;
        contentType?: string;
        imageSize?: number;
        selector?: string;
    };
}
/**
 * Result of image conversion operations
 */
export interface ImageConversionResult {
    success: boolean;
    dataUrl?: string;
    error?: string;
    metadata?: {
        originalUrl: string;
        contentType: string;
        size: number;
    };
}
/**
 * Configuration options for scraping
 */
export interface ScrapingOptions {
    /** Whether to convert images to base64 automatically */
    convertToBase64?: boolean;
    /** Timeout for HTTP requests in milliseconds */
    timeout?: number;
    /** Whether to include detailed metadata in results */
    includeMetadata?: boolean;
    /** Custom user agent for requests */
    userAgent?: string;
    /** Whether to log scraping steps */
    enableLogging?: boolean;
}
/**
 * Profile data extracted from Sherlock
 */
export interface ProfileData {
    profileImageUrl?: string;
    profileImageBase64?: string;
    name?: string;
    achievements?: {
        rankings: string;
        earnings: string;
        highsFound: number;
        mediumsFound: number;
        soloHighs: number;
        soloMediums: number;
    };
    metadata?: Record<string, any>;
}
/**
 * Configuration for image selectors and URL patterns
 */
export interface SelectorConfig {
    /** CSS selectors to try for finding profile images */
    imageSelectors: string[];
    /** Base URL for resolving relative URLs */
    baseUrl: string;
    /** Pattern for detecting Next.js optimization URLs */
    nextImagePattern: RegExp;
}
//# sourceMappingURL=types.d.ts.map