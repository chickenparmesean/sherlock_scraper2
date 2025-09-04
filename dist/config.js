"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sherlockUrlPatterns = exports.defaultConfig = void 0;
exports.isValidSherlockUrl = isValidSherlockUrl;
exports.extractWatsonUsername = extractWatsonUsername;
/**
 * Default configuration for Sherlock scraping
 */
exports.defaultConfig = {
    selectors: {
        imageSelectors: [
            'img[src*="twitter_images"]', // Twitter profile images
            'img[src*="sherlock-files"]', // Any sherlock files
            'img[alt*="profile"]', // Alt text contains profile
            'img:first-of-type', // First image on page
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
 * Common Sherlock URL patterns
 */
exports.sherlockUrlPatterns = {
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
function isValidSherlockUrl(url) {
    return exports.sherlockUrlPatterns.watsonProfile.test(url);
}
/**
 * Extracts watson username from Sherlock URL
 */
function extractWatsonUsername(url) {
    const match = url.match(exports.sherlockUrlPatterns.watsonProfile);
    return match ? match[1] : null;
}
//# sourceMappingURL=config.js.map