"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUtils = void 0;
/**
 * Utility class for image processing operations
 */
class ImageUtils {
    /**
     * Converts an image URL to a base64 data URL
     * @param imageUrl - The image URL to convert
     * @param timeout - Request timeout in milliseconds
     * @returns Promise resolving to conversion result
     */
    static async convertToBase64(imageUrl, timeout = 10000) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(imageUrl, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SherlockScraper/1.0)',
                },
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                return {
                    success: false,
                    error: `Failed to fetch image: HTTP ${response.status}`,
                };
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            // Convert to base64 data URL
            const base64String = buffer.toString('base64');
            const dataUrl = `data:${contentType};base64,${base64String}`;
            return {
                success: true,
                dataUrl,
                metadata: {
                    originalUrl: imageUrl,
                    contentType,
                    size: buffer.length,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Processes and normalizes image URLs from HTML
     * @param src - The src attribute from an img tag
     * @param baseUrl - The base URL for resolving relative URLs
     * @returns Normalized absolute URL or null if invalid
     */
    static processImageUrl(src, baseUrl) {
        if (!src)
            return null;
        // Handle Next.js image optimization URLs
        if (src.startsWith('/_next/image?url=')) {
            try {
                const urlParam = new URLSearchParams(src.split('?')[1]).get('url');
                if (urlParam) {
                    return decodeURIComponent(urlParam);
                }
            }
            catch {
                // Fall through to other processing
            }
        }
        // Handle relative URLs
        if (src.startsWith('/')) {
            return `${baseUrl}${src}`;
        }
        // Return absolute URLs as-is
        if (src.includes('http')) {
            return src;
        }
        return null;
    }
    /**
     * Validates if a URL points to an image
     * @param url - URL to validate
     * @returns true if URL appears to be an image
     */
    static isImageUrl(url) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const lowerUrl = url.toLowerCase();
        // Check file extension
        if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
            return true;
        }
        // Check for image-related patterns in URL
        const imagePatterns = [
            'image',
            'avatar',
            'profile',
            'photo',
            'picture',
            'twitter_images',
            'sherlock-files',
        ];
        return imagePatterns.some(pattern => lowerUrl.includes(pattern));
    }
    /**
     * Estimates the file size of a base64 data URL
     * @param dataUrl - Base64 data URL
     * @returns Estimated size in bytes
     */
    static estimateDataUrlSize(dataUrl) {
        // Remove the data URL prefix to get just the base64 string
        const base64 = dataUrl.split(',')[1] || '';
        // Base64 encoding increases size by ~33%, so divide by 1.33
        return Math.round((base64.length * 3) / 4);
    }
}
exports.ImageUtils = ImageUtils;
//# sourceMappingURL=image-utils.js.map